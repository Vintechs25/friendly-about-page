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
import { Plus, Send, Mail, MessageSquare, ArrowRightCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Quotation, LineItem } from "@/lib/types";

export const Route = createFileRoute("/quotations")({
  component: Quotations,
  head: () => ({ meta: [{ title: "Quotations — Travotech ERP" }] }),
});

function Quotations() {
  const { quotations, customers, products, addQuotation, updateQuotationStatus, convertQuotationToInvoice } = useStore();
  const [open, setOpen] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [validity, setValidity] = useState(14);
  const [items, setItems] = useState<LineItem[]>([]);
  const [pid, setPid] = useState("");

  const addItem = () => {
    const p = products.find((x) => x.id === pid);
    if (!p) return;
    setItems([...items, { productId: p.id, name: p.name, quantity: 1, price: p.price }]);
    setPid("");
  };
  const total = items.reduce((a, i) => a + i.price * i.quantity, 0);

  const submit = () => {
    const c = customers.find((x) => x.id === customerId);
    if (!c || items.length === 0) return toast.error("Customer and at least one item required");
    addQuotation({
      customerId: c.id, customerName: c.name, items, total,
      validUntil: new Date(Date.now() + validity * 86400000).toISOString(),
      status: "Draft",
    });
    setOpen(false); setItems([]); setCustomerId("");
    toast.success("Quotation created");
  };

  const cols: Column<Quotation>[] = [
    { key: "id", header: "Quotation #", cell: (q) => <span className="font-mono font-medium text-navy">{q.id}</span> },
    { key: "cust", header: "Customer", cell: (q) => q.customerName },
    { key: "amt", header: "Amount", cell: (q) => formatKES(q.total) },
    { key: "valid", header: "Valid Until", cell: (q) => formatDate(q.validUntil) },
    { key: "status", header: "Status", cell: (q) => <StatusBadge status={q.status} /> },
    {
      key: "act", header: "", cell: (q) => (
        <div className="flex gap-1 justify-end">
          {q.status === "Draft" && (
            <Button size="sm" variant="outline" onClick={() => { updateQuotationStatus(q.id, "Sent"); toast.success("Quotation sent"); }}>
              <Send className="h-3 w-3 mr-1" /> Send
            </Button>
          )}
          {q.status === "Sent" && (
            <Button size="sm" variant="outline" onClick={() => { updateQuotationStatus(q.id, "Accepted"); toast.success("Marked accepted"); }}>
              Accept
            </Button>
          )}
          {q.status === "Accepted" && (
            <Button size="sm" onClick={() => { const inv = convertQuotationToInvoice(q.id); if (inv) toast.success(`Converted to ${inv.id}`); }}>
              <ArrowRightCircle className="h-3 w-3 mr-1" /> Convert
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => toast.success("Email sent (demo)")}><Mail className="h-3 w-3" /></Button>
          <Button size="sm" variant="ghost" onClick={() => toast.success("SMS sent (demo)")}><MessageSquare className="h-3 w-3" /></Button>
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Quotations"
        description="Manage customer quotations and convert to invoices."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1" /> New Quotation</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Create Quotation</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Customer</Label>
                    <Select value={customerId} onValueChange={setCustomerId}>
                      <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                      <SelectContent>
                        {customers.filter((c) => c.type !== "Walk-in").map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Valid for (days)</Label>
                    <Input type="number" value={validity} onChange={(e) => setValidity(Number(e.target.value) || 14)} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={pid} onValueChange={setPid}>
                    <SelectTrigger><SelectValue placeholder="Add product…" /></SelectTrigger>
                    <SelectContent>
                      {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={addItem}>Add</Button>
                </div>
                <div className="border rounded-md max-h-48 overflow-auto">
                  {items.map((i, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 border-b last:border-0">
                      <span className="flex-1 text-sm truncate">{i.name}</span>
                      <Input type="number" className="w-20" value={i.quantity} onChange={(e) => {
                        const v = Number(e.target.value) || 1;
                        setItems(items.map((it, j) => j === idx ? { ...it, quantity: v } : it));
                      }} />
                      <span className="w-28 text-right text-sm font-medium">{formatKES(i.price * i.quantity)}</span>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => setItems(items.filter((_, j) => j !== idx))}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {items.length === 0 && <div className="p-4 text-sm text-center text-muted-foreground">No items added</div>}
                </div>
                <div className="text-right font-bold text-navy">Total: {formatKES(total)}</div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={submit}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <DataTable columns={cols} rows={quotations} empty="No quotations yet" />
    </div>
  );
}