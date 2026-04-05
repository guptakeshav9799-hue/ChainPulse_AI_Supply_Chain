import { useEffect, useState } from 'react'
import { RefreshCw as RefreshCwIcon, Zap as ZapIcon } from 'lucide-react'
import { supabase, type Shipment, type Disruption } from '@/lib/supabase'
import { mockShipments, mockDisruptions } from '@/lib/mock-data'
import { MapView } from '@/components/map-view'
import { ShipmentCard } from '@/components/shipment-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'

export function DashboardPage() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [disruptions, setDisruptions] = useState<Disruption[]>([])
  const [loading, setLoading] = useState(true)
  const [simulating, setSimulating] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)

      const { data: shipmentsData, error: shipmentsError } = await supabase
        .from('shipments')
        .select('*')
        .order('created_at', { ascending: false })

      const { data: disruptionsData, error: disruptionsError } = await supabase
        .from('disruptions')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })

      if (shipmentsError || disruptionsError) {
        console.warn('Using mock data:', shipmentsError || disruptionsError)
        setShipments(mockShipments)
        setDisruptions(mockDisruptions)
      } else {
        setShipments(shipmentsData || mockShipments)
        setDisruptions(disruptionsData || mockDisruptions)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      setShipments(mockShipments)
      setDisruptions(mockDisruptions)
    } finally {
      setLoading(false)
    }
  }

  const simulateDisruption = async () => {
    setSimulating(true)
    toast.info('Simulating disruption...')

    const randomLocations = [
      { lat: 35.2271, lng: -80.8431, address: 'Charlotte, NC' },
      { lat: 38.5767, lng: -121.4944, address: 'Sacramento, CA' },
      { lat: 42.3314, lng: -83.0458, address: 'Detroit, MI' },
    ]

    const randomLocation = randomLocations[Math.floor(Math.random() * randomLocations.length)]

    const types: Array<'weather' | 'traffic' | 'strike' | 'accident'> = ['weather', 'traffic', 'strike', 'accident']
    const severities: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical']

    const newDisruption: Partial<Disruption> = {
      location: randomLocation,
      type: types[Math.floor(Math.random() * types.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      description: `Simulated ${types[Math.floor(Math.random() * types.length)]} disruption at ${randomLocation.address}`,
      active: true,
    }

    try {
      const { data, error } = await supabase
        .from('disruptions')
        .insert([newDisruption])
        .select()
        .single()

      if (error) {
        console.warn('Supabase error, adding to local state:', error)
        const mockDisruption: Disruption = {
          id: `sim-${Date.now()}`,
          location: randomLocation,
          type: newDisruption.type!,
          severity: newDisruption.severity!,
          description: newDisruption.description!,
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        setDisruptions((prev) => [mockDisruption, ...prev])
        toast.success('Disruption simulated successfully!')

        setTimeout(() => {
          recalculateRisks([mockDisruption, ...disruptions])
        }, 500)
      } else {
        setDisruptions((prev) => [data, ...prev])
        toast.success('Disruption simulated successfully!')

        setTimeout(() => {
          recalculateRisks([data, ...disruptions])
        }, 500)
      }
    } catch (error) {
      console.error('Error simulating disruption:', error)
      toast.error('Failed to simulate disruption')
    } finally {
      setSimulating(false)
    }
  }

  const recalculateRisks = async (currentDisruptions: Disruption[]) => {
    const updatedShipments = shipments.map((shipment) => {
      if (shipment.status === 'delivered') return shipment

      let newRiskScore = shipment.risk_score
      let newDelayHours = shipment.delay_hours

      currentDisruptions.forEach((disruption) => {
        if (!disruption.active) return

        const isNearRoute = shipment.route.some((point) => {
          const distance = calculateDistance(point, disruption.location)
          return distance < 100
        })

        if (isNearRoute) {
          const severityImpact = {
            low: 10,
            medium: 20,
            high: 30,
            critical: 40,
          }
          newRiskScore = Math.min(100, newRiskScore + severityImpact[disruption.severity])
          newDelayHours = Math.min(24, newDelayHours + severityImpact[disruption.severity] / 5)
        }
      })

      if (newRiskScore !== shipment.risk_score || newDelayHours !== shipment.delay_hours) {
        if (newRiskScore > 70) {
          toast.warning(`High risk detected for ${shipment.shipment_id}`)
        }

        return {
          ...shipment,
          risk_score: Math.round(newRiskScore),
          delay_hours: Math.round(newDelayHours),
          status: newRiskScore > 70 ? 'delayed' as const : shipment.status,
        }
      }

      return shipment
    })

    setShipments(updatedShipments)

    try {
      await Promise.all(
        updatedShipments.map((shipment) =>
          supabase
            .from('shipments')
            .update({
              risk_score: shipment.risk_score,
              delay_hours: shipment.delay_hours,
              status: shipment.status,
            })
            .eq('id', shipment.id)
        )
      )
    } catch (error) {
      console.warn('Error updating shipments in database:', error)
    }
  }

  const calculateDistance = (
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number }
  ): number => {
    const R = 6371
    const dLat = ((point2.lat - point1.lat) * Math.PI) / 180
    const dLon = ((point2.lng - point1.lng) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((point1.lat * Math.PI) / 180) *
        Math.cos((point2.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  useEffect(() => {
    loadData()

    const shipmentsChannel = supabase
      .channel('shipments-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shipments' },
        () => {
          loadData()
        }
      )
      .subscribe()

    const disruptionsChannel = supabase
      .channel('disruptions-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'disruptions' },
        () => {
          loadData()
        }
      )
      .subscribe()

    return () => {
      shipmentsChannel.unsubscribe()
      disruptionsChannel.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Spinner className="size-8" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const stats = [
    {
      label: 'Total Shipments',
      value: shipments.length,
      color: 'text-primary',
    },
    {
      label: 'In Transit',
      value: shipments.filter((s) => s.status === 'in_transit').length,
      color: 'text-primary',
    },
    {
      label: 'High Risk',
      value: shipments.filter((s) => s.risk_score > 70).length,
      color: 'text-destructive',
    },
    {
      label: 'Active Disruptions',
      value: disruptions.filter((d) => d.active).length,
      color: 'text-yellow-600 dark:text-yellow-500',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Real-time supply chain monitoring and optimization
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCwIcon className="size-4" />
            Refresh
          </Button>
          <Button onClick={simulateDisruption} disabled={simulating}>
            <ZapIcon className="size-4" />
            {simulating ? 'Simulating...' : 'Simulate Disruption'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardDescription>{stat.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="h-[600px]">
            <MapView shipments={shipments} disruptions={disruptions} />
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Shipments</CardTitle>
              <CardDescription>
                {shipments.filter((s) => s.status !== 'delivered').length} shipments in progress
              </CardDescription>
            </CardHeader>
          </Card>
          <div className="space-y-4 overflow-y-auto" style={{ maxHeight: '520px' }}>
            {shipments
              .filter((s) => s.status !== 'delivered')
              .map((shipment) => (
                <ShipmentCard key={shipment.id} shipment={shipment} />
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
