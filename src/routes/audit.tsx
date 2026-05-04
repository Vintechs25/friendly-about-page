import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { useStore } from "@/lib/store";
import { formatDate } from "@/lib/format";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/audit")({
  component: Audit,
  head: () => ({ meta: [{ title: "Audit Trail — Travotech ERP" }] }),
});

function Audit() {
  const { audit } = useStore();
  return (
    <div>
      <PageHeader title="Audit Trail" description="Immutable log of key actions across the system." />
      <Card className="p-4">
        <div className="space-y-3">
          {audit.map((a) => (
            <div key={a.id} className="flex gap-3 border-l-2 border-primary/40 pl-4 pb-3 last:pb-0 last:border-l-transparent">
              <div className="text-xs text-muted-foreground w-28 shrink-0 pt-0.5">
                {formatDate(a.at)}<br />
                {new Date(a.at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm">
                  <span className="font-medium text-navy">{a.user}</span>{" "}
                  <span className="text-muted-foreground">— {a.action}</span>{" "}
                  <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{a.entity}</span>
                </div>
                {a.details && <div className="text-xs text-muted-foreground mt-1">{a.details}</div>}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}