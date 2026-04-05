import { useEffect, useState } from 'react'
import { supabase, type Shipment, type Disruption } from '@/lib/supabase'
import { mockShipments, mockDisruptions } from '@/lib/mock-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { ChartBar as BarChartIcon, TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon, CircleAlert as AlertCircleIcon } from 'lucide-react'

export function AnalyticsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [disruptions, setDisruptions] = useState<Disruption[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      setLoading(true)
      const { data: shipmentsData, error: shipmentsError } = await supabase
        .from('shipments')
        .select('*')

      const { data: disruptionsData, error: disruptionsError } = await supabase
        .from('disruptions')
        .select('*')

      if (shipmentsError || disruptionsError) {
        console.warn('Using mock data')
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

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Spinner className="size-8" />
          <p className="text-sm text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  const totalShipments = shipments.length
  const inTransit = shipments.filter((s) => s.status === 'in_transit').length
  const delayed = shipments.filter((s) => s.status === 'delayed').length
  const delivered = shipments.filter((s) => s.status === 'delivered').length
  const avgRiskScore =
    shipments.reduce((sum, s) => sum + s.risk_score, 0) / shipments.length || 0
  const totalDelayHours = shipments.reduce((sum, s) => sum + s.delay_hours, 0)
  const activeDisruptions = disruptions.filter((d) => d.active).length

  const analytics = [
    {
      label: 'Total Shipments',
      value: totalShipments,
      icon: BarChartIcon,
      description: `${delivered} delivered, ${inTransit} in transit`,
      color: 'text-primary',
    },
    {
      label: 'Average Risk Score',
      value: Math.round(avgRiskScore),
      icon: avgRiskScore > 50 ? TrendingUpIcon : TrendingDownIcon,
      description: avgRiskScore > 50 ? 'Above average' : 'Below average',
      color: avgRiskScore > 50 ? 'text-destructive' : 'text-green-600 dark:text-green-500',
    },
    {
      label: 'Delayed Shipments',
      value: delayed,
      icon: AlertCircleIcon,
      description: `${totalDelayHours} total delay hours`,
      color: 'text-yellow-600 dark:text-yellow-500',
    },
    {
      label: 'Active Disruptions',
      value: activeDisruptions,
      icon: AlertCircleIcon,
      description: `${disruptions.length} total reported`,
      color: 'text-destructive',
    },
  ]

  const statusBreakdown = [
    { status: 'Pending', count: shipments.filter((s) => s.status === 'pending').length },
    { status: 'In Transit', count: inTransit },
    { status: 'Delayed', count: delayed },
    { status: 'Delivered', count: delivered },
  ]

  const riskBreakdown = [
    { level: 'Low Risk (0-30)', count: shipments.filter((s) => s.risk_score <= 30).length },
    { level: 'Medium Risk (31-70)', count: shipments.filter((s) => s.risk_score > 30 && s.risk_score <= 70).length },
    { level: 'High Risk (71-100)', count: shipments.filter((s) => s.risk_score > 70).length },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Supply chain performance metrics and insights
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {analytics.map((item) => (
          <Card key={item.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
              <item.icon className={`size-4 ${item.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Shipment Status Breakdown</CardTitle>
            <CardDescription>Distribution of shipment statuses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {statusBreakdown.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-sm">{item.status}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${totalShipments > 0 ? (item.count / totalShipments) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium">{item.count}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
            <CardDescription>Shipments grouped by risk level</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {riskBreakdown.map((item) => (
              <div key={item.level} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      item.level.includes('Low')
                        ? 'bg-green-500'
                        : item.level.includes('Medium')
                          ? 'bg-yellow-500'
                          : 'bg-destructive'
                    }`}
                  />
                  <span className="text-sm">{item.level}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full ${
                        item.level.includes('Low')
                          ? 'bg-green-500'
                          : item.level.includes('Medium')
                            ? 'bg-yellow-500'
                            : 'bg-destructive'
                      }`}
                      style={{
                        width: `${totalShipments > 0 ? (item.count / totalShipments) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium">{item.count}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
