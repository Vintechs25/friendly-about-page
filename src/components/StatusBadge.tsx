import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const map: Record<string, string> = {
  Paid: "bg-success/15 text-success border-success/30",
  Approved: "bg-success/15 text-success border-success/30",
  Accepted: "bg-success/15 text-success border-success/30",
  Received: "bg-success/15 text-success border-success/30",
  Sent: "bg-info/15 text-info border-info/30",
  Partial: "bg-warning/20 text-warning-foreground border-warning/40",
  "Pending Approval": "bg-warning/20 text-warning-foreground border-warning/40",
  Pending: "bg-warning/20 text-warning-foreground border-warning/40",
  Draft: "bg-muted text-muted-foreground border",
  Unpaid: "bg-muted text-foreground border",
  Overdue: "bg-destructive/15 text-destructive border-destructive/30",
  Expired: "bg-destructive/15 text-destructive border-destructive/30",
  Rejected: "bg-destructive/15 text-destructive border-destructive/30",
  None: "bg-muted text-muted-foreground border",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={cn("font-medium", map[status] || "bg-muted")}>
      {status}
    </Badge>
  );
}