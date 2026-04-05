import type { Shipment, Disruption } from './supabase'

export const mockShipments: Shipment[] = [
  {
    id: '1',
    shipment_id: 'SHP-001',
    source: 'New York, NY',
    destination: 'Los Angeles, CA',
    current_location: {
      lat: 40.7128,
      lng: -74.0060,
      address: 'New York, NY'
    },
    status: 'in_transit',
    estimated_delivery: new Date(Date.now() + 86400000 * 3).toISOString(),
    route: [
      { lat: 40.7128, lng: -74.0060 },
      { lat: 39.9526, lng: -75.1652 },
      { lat: 39.2904, lng: -76.6122 },
      { lat: 35.2271, lng: -80.8431 },
      { lat: 33.7490, lng: -84.3880 },
      { lat: 32.7767, lng: -96.7970 },
      { lat: 34.0522, lng: -118.2437 }
    ],
    risk_score: 25,
    delay_hours: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    shipment_id: 'SHP-002',
    source: 'Chicago, IL',
    destination: 'Miami, FL',
    current_location: {
      lat: 41.8781,
      lng: -87.6298,
      address: 'Chicago, IL'
    },
    status: 'in_transit',
    estimated_delivery: new Date(Date.now() + 86400000 * 2).toISOString(),
    route: [
      { lat: 41.8781, lng: -87.6298 },
      { lat: 39.7684, lng: -86.1581 },
      { lat: 36.1627, lng: -86.7816 },
      { lat: 33.7490, lng: -84.3880 },
      { lat: 28.5383, lng: -81.3792 },
      { lat: 25.7617, lng: -80.1918 }
    ],
    risk_score: 65,
    delay_hours: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    shipment_id: 'SHP-003',
    source: 'Seattle, WA',
    destination: 'Denver, CO',
    current_location: {
      lat: 47.6062,
      lng: -122.3321,
      address: 'Seattle, WA'
    },
    status: 'pending',
    estimated_delivery: new Date(Date.now() + 86400000 * 5).toISOString(),
    route: [
      { lat: 47.6062, lng: -122.3321 },
      { lat: 45.5152, lng: -122.6784 },
      { lat: 43.6150, lng: -116.2023 },
      { lat: 41.1455, lng: -104.8019 },
      { lat: 39.7392, lng: -104.9903 }
    ],
    risk_score: 10,
    delay_hours: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    shipment_id: 'SHP-004',
    source: 'Boston, MA',
    destination: 'Houston, TX',
    current_location: {
      lat: 42.3601,
      lng: -71.0589,
      address: 'Boston, MA'
    },
    status: 'delayed',
    estimated_delivery: new Date(Date.now() + 86400000 * 4).toISOString(),
    route: [
      { lat: 42.3601, lng: -71.0589 },
      { lat: 40.7128, lng: -74.0060 },
      { lat: 38.9072, lng: -77.0369 },
      { lat: 35.2271, lng: -80.8431 },
      { lat: 32.7767, lng: -96.7970 },
      { lat: 29.7604, lng: -95.3698 }
    ],
    risk_score: 85,
    delay_hours: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export const mockDisruptions: Disruption[] = [
  {
    id: '1',
    location: {
      lat: 33.7490,
      lng: -84.3880,
      address: 'Atlanta, GA'
    },
    type: 'weather',
    severity: 'high',
    description: 'Severe thunderstorms causing road closures',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    location: {
      lat: 32.7767,
      lng: -96.7970,
      address: 'Dallas, TX'
    },
    type: 'traffic',
    severity: 'medium',
    description: 'Heavy traffic congestion on I-35',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    location: {
      lat: 36.1627,
      lng: -86.7816,
      address: 'Nashville, TN'
    },
    type: 'strike',
    severity: 'critical',
    description: 'Warehouse workers strike affecting logistics hub',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]
