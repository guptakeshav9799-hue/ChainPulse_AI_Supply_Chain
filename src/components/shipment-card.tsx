import { format } from 'date-fns'
import { ArrowRight as ArrowRightIcon, Clock as ClockIcon, MapPin as MapPinIcon, Package as PackageIcon } from 'lucide-react'
import type { Shipment } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ShipmentCardProps {
  shipment: Shipment
  onClick?: () => void
}

export function ShipmentCard({ shipment, onClick }: ShipmentCardProps) {
  const statusColors = {
    pending: 'bg-muted text-muted-foreground',
    in_transit: 'bg-primary/10 text-primary',
    delayed: 'bg-destructive/10 text-destructive',
    delivered: 'bg-green-500/10 text-green-700 dark:text-green-400',
  }

  const riskColor =
    shipment.risk_score > 70
      ? 'text-destructive'
      : shipment.risk_score > 40
        ? 'text-yellow-600 dark:text-yellow-500'
        : 'text-green-600 dark:text-green-500'

  const riskBgColor =
    shipment.risk_score > 70
      ? 'bg-destructive/10'
      : shipment.risk_score > 40
        ? 'bg-yellow-500/10'
        : 'bg-green-500/10'

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <PackageIcon className="size-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{shipment.shipment_id}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {format(new Date(shipment.created_at), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
          <Badge variant="outline" className={statusColors[shipment.status]}>
            {shipment.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <MapPinIcon className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{shipment.source}</span>
          <ArrowRightIcon className="size-3 shrink-0 text-muted-foreground" />
          <span className="truncate">{shipment.destination}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <ClockIcon className="size-4 shrink-0 text-muted-foreground" />
          <span className="text-muted-foreground">
            ETA: {format(new Date(shipment.estimated_delivery), 'MMM dd, HH:mm')}
          </span>
          {shipment.delay_hours > 0 && (
            <Badge variant="destructive" className="text-xs">
              +{shipment.delay_hours}h delay
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs font-medium text-muted-foreground">
            Risk Score
          </span>
          <div className="flex items-center gap-2">
            <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
              <div
                className={cn('h-full transition-all', riskBgColor)}
                style={{ width: `${shipment.risk_score}%` }}
              />
            </div>
            <span className={cn('text-sm font-semibold', riskColor)}>
              {shipment.risk_score}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
