import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStore } from "@/lib/store";
import { formatKES, formatDate } from "@/lib/format";
import { DocActions } from "@/components/DocActions";
import { BulkIO } from "@/components/BulkIO";
import { Truck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/procurement")({
  component: Procurement,
  head: () => ({ meta: [{ title: "Procurement — Travotech ERP" }] }),
});

function Procurement() {
  const { purchaseOrders, receivePO } = useStore();

  const poDoc = (po: typeof purchaseOrders[number]) => `<h1>Local Purchase Order — ${po.id}</h1>
    <div class="meta">Supplier: ${po.supplierName} · Created ${formatDate(po.createdAt)} · Expected ${formatDate(po.expectedDate)}</div>
    <table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
    <tbody>${po.items.map((i) => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>${formatKES(i.price)}</td><td>${formatKES(i.price * i.quantity)}</td></tr>`).join("")}</tbody></table>
    <div class="total">Total: ${formatKES(po.total)}</div>`;

  return (
    <div>
      <PageHeader
        title="Procurement & LPOs"
        description="Local Purchase Orders, GRN receipts and supplier deliveries."
        actions={<BulkIO entity="purchase-orders" rows={purchaseOrders as unknown as Record<string, unknown>[]} />}
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>LPO #</TableHead><TableHead>Supplier</TableHead>
              <TableHead>Created</TableHead><TableHead>Expected</TableHead>
              <TableHead className="text-right">Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead><TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchaseOrders.map((po) => (
              <TableRow key={po.id}>
                <TableCell className="font-mono text-xs text-navy font-medium">{po.id}</TableCell>
                <TableCell>{po.supplierName}</TableCell>
                <TableCell>{formatDate(po.createdAt)}</TableCell>
                <TableCell>{formatDate(po.expectedDate)}</TableCell>
                <TableCell className="text-right">{po.items.length}</TableCell>
                <TableCell className="text-right font-mono">{formatKES(po.total)}</TableCell>
                <TableCell>
                  <Badge className={po.status === "Received" ? "bg-green-100 text-green-700" : po.status === "Sent" ? "bg-blue-100 text-blue-700" : "bg-muted"}>
                    {po.status === "Received" ? <><CheckCircle2 className="h-3 w-3 mr-1" />{po.status}</> : <><Truck className="h-3 w-3 mr-1" />{po.status}</>}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <DocActions title={po.id} html={poDoc(po)} emailTo={po.supplierName} />
                    {po.status !== "Received" && (
                      <Button size="sm" onClick={() => { receivePO(po.id); toast.success(`GRN recorded for ${po.id}`); }}>
                        Receive (GRN)
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
