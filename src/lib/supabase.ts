import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Using mock data mode.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

export interface Location {
  lat: number
  lng: number
  address: string
}

export interface Shipment {
  id: string
  shipment_id: string
  source: string
  destination: string
  current_location: Location
  status: 'pending' | 'in_transit' | 'delayed' | 'delivered'
  estimated_delivery: string
  route: Array<{ lat: number; lng: number }>
  risk_score: number
  delay_hours: number
  created_at: string
  updated_at: string
}

export interface Disruption {
  id: string
  location: Location
  type: 'weather' | 'traffic' | 'strike' | 'accident' | 'other'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  active: boolean
  created_at: string
  updated_at: string
}
