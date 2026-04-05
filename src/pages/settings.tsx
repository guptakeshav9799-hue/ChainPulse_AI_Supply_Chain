import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Bell as BellIcon, Map as MapIcon, Shield as ShieldIcon, User as UserIcon } from 'lucide-react'

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your application settings and preferences
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserIcon className="size-5" />
              <CardTitle>Profile Settings</CardTitle>
            </div>
            <CardDescription>Update your profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" defaultValue="Admin User" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="admin@example.com" defaultValue="admin@chainpulse.ai" />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BellIcon className="size-5" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>Configure your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>High Risk Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when shipments exceed risk threshold
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Disruption Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Receive alerts for new disruptions
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Daily Summary</Label>
                <p className="text-sm text-muted-foreground">
                  Get a daily summary of supply chain activities
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapIcon className="size-5" />
              <CardTitle>Map Settings</CardTitle>
            </div>
            <CardDescription>Configure map display preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Risk Heatmap</Label>
                <p className="text-sm text-muted-foreground">
                  Display risk zones on the map
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Route Lines</Label>
                <p className="text-sm text-muted-foreground">
                  Display shipment routes on the map
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-center Map</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically center map on active shipments
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldIcon className="size-5" />
              <CardTitle>API Configuration</CardTitle>
            </div>
            <CardDescription>Manage your API keys and integrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="google-maps">Google Maps API Key</Label>
              <Input
                id="google-maps"
                type="password"
                placeholder="Enter your Google Maps API key"
                defaultValue={import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? '••••••••••••' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="openai">OpenAI API Key</Label>
              <Input
                id="openai"
                type="password"
                placeholder="Enter your OpenAI API key"
                defaultValue={import.meta.env.VITE_OPENAI_API_KEY ? '••••••••••••' : ''}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Note: API keys are stored in environment variables. Update your .env file to change them.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
