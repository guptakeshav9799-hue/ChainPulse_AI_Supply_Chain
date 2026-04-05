import { useEffect, useState } from 'react'
import { Plus as PlusIcon, Search as SearchIcon } from 'lucide-react'
import { supabase, type Shipment } from '@/lib/supabase'
import { mockShipments } from '@/lib/mock-data'
import { ShipmentCard } from '@/components/shipment-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null)

  const loadShipments = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('Using mock data:', error)
        setShipments(mockShipments)
      } else {
        setShipments(data || mockShipments)
      }
    } catch (error) {
      console.error('Error loading shipments:', error)
      setShipments(mockShipments)
    } finally {
      setLoading(false)
    }
  }

  const createShipment = async (formData: FormData) => {
    const shipmentId = `SHP-${String(shipments.length + 1).padStart(3, '0')}`
    const source = formData.get('source') as string
    const destination = formData.get('destination') as string

    const newShipment: Partial<Shipment> = {
      shipment_id: shipmentId,
      source,
      destination,
      current_location: { lat: 0, lng: 0, address: source },
      status: 'pending',
      estimated_delivery: new Date(Date.now() + 86400000 * 3).toISOString(),
      route: [],
      risk_score: 0,
      delay_hours: 0,
    }

    try {
      const { data, error } = await supabase
        .from('shipments')
        .insert([newShipment])
        .select()
        .single()

      if (error) {
        console.warn('Supabase error:', error)
        const mockShipment: Shipment = {
          ...newShipment,
          id: `mock-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Shipment
        setShipments((prev) => [mockShipment, ...prev])
        toast.success('Shipment created successfully!')
      } else {
        setShipments((prev) => [data, ...prev])
        toast.success('Shipment created successfully!')
      }

      setCreateDialogOpen(false)
    } catch (error) {
      console.error('Error creating shipment:', error)
      toast.error('Failed to create shipment')
    }
  }

  useEffect(() => {
    loadShipments()

    const channel = supabase
      .channel('shipments-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shipments' },
        () => {
          loadShipments()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  const filteredShipments = shipments.filter((shipment) => {
    const matchesSearch =
      shipment.shipment_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.destination.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter

    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Spinner className="size-8" />
          <p className="text-sm text-muted-foreground">Loading shipments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Shipments</h1>
          <p className="text-sm text-muted-foreground">
            Manage and track all shipments
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <PlusIcon className="size-4" />
          Create Shipment
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search shipments..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_transit">In Transit</SelectItem>
            <SelectItem value="delayed">Delayed</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredShipments.map((shipment) => (
          <ShipmentCard
            key={shipment.id}
            shipment={shipment}
            onClick={() => setSelectedShipment(shipment)}
          />
        ))}
      </div>

      {filteredShipments.length === 0 && (
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-muted-foreground">No shipments found</p>
        </div>
      )}

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Shipment</DialogTitle>
            <DialogDescription>
              Add a new shipment to the tracking system
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              createShipment(new FormData(e.currentTarget))
            }}
          >
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <Input
                  id="source"
                  name="source"
                  placeholder="e.g., New York, NY"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  name="destination"
                  placeholder="e.g., Los Angeles, CA"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Shipment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {selectedShipment && (
        <Dialog open={!!selectedShipment} onOpenChange={() => setSelectedShipment(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedShipment.shipment_id}</DialogTitle>
              <DialogDescription>Shipment details and tracking information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Source</p>
                  <p className="text-sm text-muted-foreground">{selectedShipment.source}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Destination</p>
                  <p className="text-sm text-muted-foreground">{selectedShipment.destination}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-sm text-muted-foreground">{selectedShipment.status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Risk Score</p>
                  <p className="text-sm text-muted-foreground">{selectedShipment.risk_score}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
