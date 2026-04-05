/*
  # ChainPulse AI - Core Schema

  1. New Tables
    - `shipments`
      - `id` (uuid, primary key)
      - `shipment_id` (text, unique identifier for display)
      - `source` (text, origin location)
      - `destination` (text, destination location)
      - `current_location` (jsonb, {lat, lng, address})
      - `status` (text, enum: pending, in_transit, delayed, delivered)
      - `estimated_delivery` (timestamptz)
      - `route` (jsonb, array of coordinates)
      - `risk_score` (integer, 0-100)
      - `delay_hours` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `disruptions`
      - `id` (uuid, primary key)
      - `location` (jsonb, {lat, lng, address})
      - `type` (text, enum: weather, traffic, strike, accident, other)
      - `severity` (text, enum: low, medium, high, critical)
      - `description` (text)
      - `active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read/write their data
*/

-- Create shipments table
CREATE TABLE IF NOT EXISTS shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id text UNIQUE NOT NULL,
  source text NOT NULL,
  destination text NOT NULL,
  current_location jsonb NOT NULL DEFAULT '{"lat": 0, "lng": 0, "address": ""}'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'delayed', 'delivered')),
  estimated_delivery timestamptz NOT NULL,
  route jsonb NOT NULL DEFAULT '[]'::jsonb,
  risk_score integer DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  delay_hours integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create disruptions table
CREATE TABLE IF NOT EXISTS disruptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location jsonb NOT NULL,
  type text NOT NULL DEFAULT 'other' CHECK (type IN ('weather', 'traffic', 'strike', 'accident', 'other')),
  severity text NOT NULL DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE disruptions ENABLE ROW LEVEL SECURITY;

-- Policies for shipments
CREATE POLICY "Anyone can view shipments"
  ON shipments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can create shipments"
  ON shipments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update shipments"
  ON shipments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete shipments"
  ON shipments FOR DELETE
  TO authenticated
  USING (true);

-- Policies for disruptions
CREATE POLICY "Anyone can view disruptions"
  ON disruptions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can create disruptions"
  ON disruptions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update disruptions"
  ON disruptions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete disruptions"
  ON disruptions FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_created ON shipments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_disruptions_active ON disruptions(active);
CREATE INDEX IF NOT EXISTS idx_disruptions_severity ON disruptions(severity);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_shipments_updated_at'
  ) THEN
    CREATE TRIGGER update_shipments_updated_at
      BEFORE UPDATE ON shipments
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_disruptions_updated_at'
  ) THEN
    CREATE TRIGGER update_disruptions_updated_at
      BEFORE UPDATE ON disruptions
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;