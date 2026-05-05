import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { formatDate } from "@/lib/format";
import { Bell, Check, AlertTriangle, Clock, Info } from "lucide-react";

export const Route = createFileRoute("/notifications")({
  component: Notifications,
  head: () => ({ meta: [{ title: "Notifications — Travotech ERP" }] }),
});

function Notifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useStore();

  const icon = (t: string) => {
    if (t === "approval") return <Check className="h-4 w-4 text-blue-600" />;
    if (t === "stock") return <AlertTriangle className="h-4 w-4 text-destructive" />;
    if (t === "expiry") return <Clock className="h-4 w-4 text-orange-600" />;
    return <Info className="h-4 w-4 text-muted-foreground" />;
  };

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div>
      <PageHeader
        title="Notifications"
        description={`${unread} unread · in-app + email + SMS demo channel`}
        actions={<Button size="sm" variant="outline" onClick={markAllNotificationsRead}>Mark all read</Button>}
      />

      <div className="space-y-2">
        {notifications.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground"><Bell className="h-8 w-8 mx-auto mb-2 opacity-40" />No notifications</Card>
        )}
        {notifications.map((n) => (
          <Card key={n.id} className={`p-4 flex items-start gap-3 ${!n.read ? "border-primary/40 bg-primary/5" : ""}`}>
            <div className="mt-0.5">{icon(n.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="font-medium text-navy">{n.title}</div>
                {!n.read && <Badge className="bg-primary/15 text-primary text-[10px]">NEW</Badge>}
              </div>
              <div className="text-sm text-muted-foreground">{n.message}</div>
              <div className="text-xs text-muted-foreground mt-1">{formatDate(n.at)}</div>
            </div>
            {!n.read && <Button size="sm" variant="ghost" onClick={() => markNotificationRead(n.id)}>Mark read</Button>}
          </Card>
        ))}
      </div>
    </div>
  );
}
