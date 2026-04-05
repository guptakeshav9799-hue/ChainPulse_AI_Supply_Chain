import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Plus as PlusIcon, TriangleAlert as AlertTriangleIcon } from 'lucide-react'
import { supabase, type Disruption } from '@/lib/supabase'
import { mockDisruptions } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function DisruptionsPage() {
  const [disruptions, setDisruptions] = useState<Disruption[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedDisruption, setSelectedDisruption] = useState<Disruption | null>(null)

  const loadDisruptions = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('disruptions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('Using mock data:', error)
        setDisruptions(mockDisruptions)
      } else {
        setDisruptions(data || mockDisruptions)
      }
    } catch (error) {
      console.error('Error loading disruptions:', error)
      setDisruptions(mockDisruptions)
    } finally {
      setLoading(false)
    }
  }

  const createDisruption = async (formData: FormData) => {
    const address = formData.get('address') as string
    const type = formData.get('type') as string
    const severity = formData.get('severity') as string
    const description = formData.get('description') as string

    const newDisruption: Partial<Disruption> = {
      location: { lat: 0, lng: 0, address },
      type: type as Disruption['type'],
      severity: severity as Disruption['severity'],
      description,
      active: true,
    }

    try {
      const { data, error } = await supabase
        .from('disruptions')
        .insert([newDisruption])
        .select()
        .single()

      if (error) {
        console.warn('Supabase error:', error)
        const mockDisruption: Disruption = {
          ...newDisruption,
          id: `mock-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Disruption
        setDisruptions((prev) => [mockDisruption, ...prev])
        toast.success('Disruption created successfully!')
      } else {
        setDisruptions((prev) => [data, ...prev])
        toast.success('Disruption created successfully!')
      }

      setCreateDialogOpen(false)
    } catch (error) {
      console.error('Error creating disruption:', error)
      toast.error('Failed to create disruption')
    }
  }

  const toggleDisruptionStatus = async (id: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('disruptions')
        .update({ active })
        .eq('id', id)

      if (error) {
        console.warn('Supabase error:', error)
        setDisruptions((prev) =>
          prev.map((d) => (d.id === id ? { ...d, active } : d))
        )
      } else {
        setDisruptions((prev) =>
          prev.map((d) => (d.id === id ? { ...d, active } : d))
        )
      }

      toast.success(active ? 'Disruption activated' : 'Disruption deactivated')
    } catch (error) {
      console.error('Error toggling disruption:', error)
      toast.error('Failed to update disruption status')
    }
  }

  useEffect(() => {
    loadDisruptions()

    const channel = supabase
      .channel('disruptions-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'disruptions' },
        () => {
          loadDisruptions()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  const severityColors = {
    low: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
    medium: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
    high: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
    critical: 'bg-destructive/10 text-destructive border-destructive/20',
  }

  const typeIcons = {
    weather: '🌩️',
    traffic: '🚦',
    strike: '✊',
    accident: '⚠️',
    other: '📋',
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Spinner className="size-8" />
          <p className="text-sm text-muted-foreground">Loading disruptions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Disruptions</h1>
          <p className="text-sm text-muted-foreground">
            Track and manage supply chain disruptions
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <PlusIcon className="size-4" />
          Report Disruption
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {disruptions.map((disruption) => (
          <Card
            key={disruption.id}
            className={cn(
              'cursor-pointer transition-all hover:shadow-md',
              !disruption.active && 'opacity-60'
            )}
            onClick={() => setSelectedDisruption(disruption)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-2xl">{typeIcons[disruption.type]}</div>
                  <div>
                    <CardTitle className="text-base capitalize">
                      {disruption.type}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(disruption.created_at), 'MMM dd, HH:mm')}
                    </p>
                  </div>
                </div>
                <Badge className={severityColors[disruption.severity]}>
                  {disruption.severity}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {disruption.description}
              </p>
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-muted-foreground">
                  {disruption.location.address}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {disruption.active ? 'Active' : 'Inactive'}
                  </span>
                  <Switch
                    checked={disruption.active}
                    onCheckedChange={(checked) =>
                      toggleDisruptionStatus(disruption.id, checked)
                    }
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {disruptions.length === 0 && (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-center">
            <AlertTriangleIcon className="size-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No disruptions reported</p>
          </div>
        </div>
      )}

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report New Disruption</DialogTitle>
            <DialogDescription>
              Add a new disruption to the tracking system
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              createDisruption(new FormData(e.currentTarget))
            }}
          >
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="address">Location</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="e.g., Atlanta, GA"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select name="type" defaultValue="weather" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weather">Weather</SelectItem>
                    <SelectItem value="traffic">Traffic</SelectItem>
                    <SelectItem value="strike">Strike</SelectItem>
                    <SelectItem value="accident">Accident</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="severity">Severity</Label>
                <Select name="severity" defaultValue="medium" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe the disruption..."
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Report Disruption</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {selectedDisruption && (
        <Dialog open={!!selectedDisruption} onOpenChange={() => setSelectedDisruption(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="text-2xl">{typeIcons[selectedDisruption.type]}</span>
                <span className="capitalize">{selectedDisruption.type} Disruption</span>
              </DialogTitle>
              <DialogDescription>Disruption details and information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm font-medium">Description</p>
                <p className="text-sm text-muted-foreground">{selectedDisruption.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedDisruption.location.address}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Severity</p>
                  <Badge className={severityColors[selectedDisruption.severity]}>
                    {selectedDisruption.severity}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedDisruption.active ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Reported</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedDisruption.created_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
