import { Bell as BellIcon, Search as SearchIcon, User as UserIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'
import { ModeToggle } from '@/components/mode-toggle'

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
      <SidebarTrigger />
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-full max-w-md">
          <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search shipments, disruptions..."
            className="w-full pl-9"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ModeToggle />
        <Button variant="ghost" size="icon" className="relative">
          <BellIcon className="size-5" />
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 size-5 rounded-full p-0 text-[10px]"
          >
            3
          </Badge>
        </Button>
        <Button variant="ghost" size="icon">
          <UserIcon className="size-5" />
        </Button>
      </div>
    </header>
  )
}
