import { Bell, MapPin, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { useStore } from "@/lib/store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function TopBar() {
  const { branch, currentUser, users, setCurrentUser, notifications, markAllNotificationsRead, markNotificationRead } = useStore();
  const unread = notifications.filter((n) => !n.read).length;
  const initials = currentUser.name.split(" ").map((p) => p[0]).join("").slice(0, 2);

  return (
    <div className="flex items-center justify-between flex-1 gap-3">
      <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4 text-primary" />
        <span className="font-medium text-foreground">{branch}</span>
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-semibold">
                  {unread}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex items-center justify-between p-3 border-b">
              <div className="font-semibold text-sm">Notifications</div>
              {unread > 0 && (
                <button onClick={markAllNotificationsRead} className="text-xs text-primary hover:underline">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-auto">
              {notifications.length === 0 && (
                <div className="p-6 text-center text-sm text-muted-foreground">No notifications</div>
              )}
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markNotificationRead(n.id)}
                  className={`w-full text-left p-3 border-b last:border-0 hover:bg-accent transition-colors ${!n.read ? "bg-accent/40" : ""}`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                      n.type === "approval" ? "bg-warning" :
                      n.type === "stock" ? "bg-destructive" :
                      n.type === "expiry" ? "bg-info" : "bg-muted-foreground"
                    }`} />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{n.title}</div>
                      <div className="text-xs text-muted-foreground">{n.message}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 h-9 px-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start leading-tight">
                <span className="text-sm font-medium">{currentUser.name}</span>
                <span className="text-[10px] text-muted-foreground">{currentUser.role}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Switch demo user</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {users.map((u) => (
              <DropdownMenuItem key={u.id} onClick={() => setCurrentUser(u)}>
                <div className="flex flex-col">
                  <span className="text-sm">{u.name}</span>
                  <span className="text-[10px] text-muted-foreground">{u.role}</span>
                </div>
                {u.id === currentUser.id && <Badge className="ml-auto" variant="secondary">Active</Badge>}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}