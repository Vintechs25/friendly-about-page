import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { DataTable, type Column } from "@/components/DataTable";
import { useStore } from "@/lib/store";
import { formatKES, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { Eye, Printer, CreditCard } from "lucide-react";
import { toast } from "sonner";
import type { Invoice, PaymentMethod } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/invoices")({
  component: Invoices,
  head: () => ({ meta: [{ title: "Invoices — Travotech ERP" }] }),
});

function Invoices() {
  const { invoices, recordPayment } = useStore();
  const [view, setView] = useState<Invoice | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState<PaymentMethod>("M-Pesa");
  const [reference, setReference] = useState("");

  const cols: Column<Invoice>[] = [
    { key: "id", header: "Invoice #", cell: (i) => <span className="font-mono font-medium text-navy">{i.id}</span> },
    { key: "cust", header: "Customer", cell: (i) => i.customerName },
    { key: "date", header: "Date", cell: (i) => formatDate(i.createdAt) },
    { key: "due", header: "Due", cell: (i) => formatDate(i.dueDate) },
    { key: "amt", header: "Amount", cell: (i) => formatKES(i.total) },
    { key: "paid", header: "Paid", cell: (i) => formatKES(i.paid) },
    { key: "status", header: "Status", cell: (i) => <StatusBadge status={i.status} /> },
    {
      key: "act", header: "", className: "text-right", cell: (i) => (
        <div className="flex gap-1 justify-end">
          <Button size="sm" variant="outline" onClick={() => setView(i)}><Eye className="h-3 w-3" /></Button>
          {i.status !== "Paid" && (
            <Button size="sm" onClick={() => { setView(i); setAmount(i.total - i.paid); setPayOpen(true); }}>
              <CreditCard className="h-3 w-3 mr-1" /> Pay
            </Button>
          )}
        </div>
      ),
    },
  ];

  const handlePay = () => {
    if (!view) return;
    if (amount <= 0 || amount > (view.total - view.paid)) return toast.error("Invalid amount");
    recordPayment(view.id, amount, method, reference);
    toast.success(`Payment recorded: ${formatKES(amount)}`);
    setPayOpen(false); setAmount(0); setReference("");
  };

  return (
    <div>
      <PageHeader title="Invoices" description="Track billing, payments and outstanding balances." />
      <DataTable columns={cols} rows={invoices} empty="No invoices yet" />

      <Dialog open={!!view && !payOpen} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Invoice {view?.id}</DialogTitle></DialogHeader>
          {view && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground uppercase">Bill To</div>
                  <div className="font-medium">{view.customerName}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground uppercase">Due</div>
                  <div className="font-medium">{formatDate(view.dueDate)}</div>
                  <StatusBadge status={view.status} />
                </div>
              </div>
              <Card>
                <CardHeader className="py-2"><CardTitle className="text-sm">Items</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b"><th className="text-left p-2">Item</th><th className="text-right p-2">Qty</th><th className="text-right p-2">Price</th><th className="text-right p-2">Total</th></tr></thead>
                    <tbody>
                      {view.items.map((i) => (
                        <tr key={i.productId} className="border-b last:border-0">
                          <td className="p-2">{i.name}</td>
                          <td className="text-right p-2">{i.quantity}</td>
                          <td className="text-right p-2">{formatKES(i.price)}</td>
                          <td className="text-right p-2">{formatKES(i.price * i.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
              <div className="space-y-1 text-sm border-t pt-2">
                <div className="flex justify-between"><span>Total</span><span className="font-bold">{formatKES(view.total)}</span></div>
                <div className="flex justify-between text-success"><span>Paid</span><span>{formatKES(view.paid)}</span></div>
                <div className="flex justify-between text-destructive font-bold"><span>Balance</span><span>{formatKES(view.total - view.paid)}</span></div>
              </div>
              {view.payments.length > 0 && (
                <div>
                  <div className="text-xs text-muted-foreground uppercase mb-1">Payments</div>
                  {view.payments.map((p) => (
                    <div key={p.id} className="flex justify-between text-sm border-b last:border-0 py-1">
                      <span>{formatDate(p.date)} · {p.method} {p.reference && `· ${p.reference}`}</span>
                      <span className="font-medium">{formatKES(p.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4 mr-1" /> Print</Button>
                {view.status !== "Paid" && (
                  <Button onClick={() => { setAmount(view.total - view.paid); setPayOpen(true); }}>Record Payment</Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record Payment — {view?.id}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Amount (KES)</Label><Input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value) || 0)} /></div>
            <div><Label>Method</Label>
              <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="M-Pesa">M-Pesa</SelectItem>
                  <SelectItem value="Bank">Bank</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Reference (optional)</Label><Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="M-Pesa code or bank ref" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayOpen(false)}>Cancel</Button>
            <Button onClick={handlePay}>Save Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}