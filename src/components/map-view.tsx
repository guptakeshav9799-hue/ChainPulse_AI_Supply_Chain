import { useEffect, useRef, useState } from 'react'
import type { Shipment, Disruption } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

interface MapViewProps {
  shipments: Shipment[]
  disruptions: Disruption[]
}

export function MapView({ shipments, disruptions }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [loading, setLoading] = useState(true)
  const markersRef = useRef<google.maps.Marker[]>([])
  const polylinesRef = useRef<google.maps.Polyline[]>([])
  const circlesRef = useRef<google.maps.Circle[]>([])

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      console.warn('Google Maps API key not found')
      setLoading(false)
      return
    }

    if (typeof google !== 'undefined' && google.maps) {
      if (mapRef.current) {
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: 39.8283, lng: -98.5795 },
          zoom: 4,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        })
        setMap(mapInstance)
        setLoading(false)
      }
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`
    script.async = true
    script.defer = true
    script.onload = () => {
      if (mapRef.current && typeof google !== 'undefined') {
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: 39.8283, lng: -98.5795 },
          zoom: 4,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        })
        setMap(mapInstance)
        setLoading(false)
      }
    }
    script.onerror = () => {
      console.error('Error loading Google Maps')
      setLoading(false)
    }
    document.head.appendChild(script)

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  useEffect(() => {
    if (!map) return

    markersRef.current.forEach((marker) => marker.setMap(null))
    polylinesRef.current.forEach((polyline) => polyline.setMap(null))
    circlesRef.current.forEach((circle) => circle.setMap(null))
    markersRef.current = []
    polylinesRef.current = []
    circlesRef.current = []

    shipments.forEach((shipment) => {
      if (shipment.route && shipment.route.length > 0) {
        const polyline = new google.maps.Polyline({
          path: shipment.route,
          geodesic: true,
          strokeColor: shipment.risk_score > 70 ? '#ef4444' : shipment.risk_score > 40 ? '#f59e0b' : '#22c55e',
          strokeOpacity: 0.8,
          strokeWeight: 3,
          map,
        })
        polylinesRef.current.push(polyline)

        const marker = new google.maps.Marker({
          position: shipment.current_location,
          map,
          title: shipment.shipment_id,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: shipment.risk_score > 70 ? '#ef4444' : shipment.risk_score > 40 ? '#f59e0b' : '#22c55e',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 2,
          },
        })

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <h3 style="font-weight: 600; margin-bottom: 4px;">${shipment.shipment_id}</h3>
              <p style="font-size: 12px; color: #666; margin-bottom: 2px;">${shipment.source} → ${shipment.destination}</p>
              <p style="font-size: 12px; margin-bottom: 2px;">Status: <span style="font-weight: 500;">${shipment.status}</span></p>
              <p style="font-size: 12px;">Risk: <span style="font-weight: 500; color: ${shipment.risk_score > 70 ? '#ef4444' : shipment.risk_score > 40 ? '#f59e0b' : '#22c55e'};">${shipment.risk_score}</span></p>
            </div>
          `,
        })

        marker.addListener('click', () => {
          infoWindow.open(map, marker)
        })

        markersRef.current.push(marker)
      }
    })

    disruptions
      .filter((d) => d.active)
      .forEach((disruption) => {
        const color =
          disruption.severity === 'critical'
            ? '#dc2626'
            : disruption.severity === 'high'
              ? '#ea580c'
              : disruption.severity === 'medium'
                ? '#f59e0b'
                : '#84cc16'

        const circle = new google.maps.Circle({
          strokeColor: color,
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: color,
          fillOpacity: 0.2,
          map,
          center: disruption.location,
          radius: 50000,
        })

        const marker = new google.maps.Marker({
          position: disruption.location,
          map,
          icon: {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 5,
            fillColor: color,
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 2,
            rotation: 180,
          },
        })

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <h3 style="font-weight: 600; margin-bottom: 4px;">${disruption.type.toUpperCase()}</h3>
              <p style="font-size: 12px; color: #666; margin-bottom: 2px;">${disruption.description}</p>
              <p style="font-size: 12px;">Severity: <span style="font-weight: 500; color: ${color};">${disruption.severity}</span></p>
            </div>
          `,
        })

        marker.addListener('click', () => {
          infoWindow.open(map, marker)
        })

        circlesRef.current.push(circle)
        markersRef.current.push(marker)
      })
  }, [map, shipments, disruptions])

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Spinner className="size-8" />
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    return (
      <Card className="h-full">
        <CardContent className="flex h-full items-center justify-center">
          <div className="text-center">
            <p className="text-sm font-medium">Google Maps API key not configured</p>
            <p className="text-xs text-muted-foreground mt-1">
              Add VITE_GOOGLE_MAPS_API_KEY to your .env file
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full overflow-hidden">
      <div ref={mapRef} className="h-full w-full" />
    </Card>
  )
}
