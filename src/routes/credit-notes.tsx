import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { DataTable, type Column } from "@/components/DataTable";
import { useStore, canApprove } from "@/lib/store";
import { formatKES, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Eye, Check, X, Send } from "lucide-react";
import { toast } from "sonner";
import type { CreditNote } from "@/lib/types";

export const Route = createFileRoute("/credit-notes")({
  component: CreditNotes,
  head: () => ({ meta: [{ title: "Credit Notes — Travotech ERP" }] }),
});

function CreditNotes() {
  const { creditNotes, invoices, addCreditNote, setCreditNoteStatus, currentUser } = useStore();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<CreditNote | null>(null);
  const [invoiceId, setInvoiceId] = useState("");
  const [amount, setAmount] = useState(0);
  const [reason, setReason] = useState("");
  const approver = canApprove(currentUser.role);

  const submit = () => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv || amount <= 0 || !reason) return toast.error("All fields required");
    addCreditNote({ invoiceId: inv.id, customerId: inv.customerId, customerName: inv.customerName, amount, reason });
    setOpen(false); setInvoiceId(""); setAmount(0); setReason("");
    toast.success("Credit note created (Draft)");
  };

  const cols: Column<CreditNote>[] = [
    { key: "id", header: "CN #", cell: (c) => <span className="font-mono font-medium text-navy">{c.id}</span> },
    { key: "inv", header: "Invoice", cell: (c) => <span className="font-mono text-xs">{c.invoiceId}</span> },
    { key: "cust", header: "Customer", cell: (c) => c.customerName },
    { key: "amt", header: "Amount", cell: (c) => formatKES(c.amount) },
    { key: "by", header: "Created By", cell: (c) => c.createdBy },
    { key: "date", header: "Date", cell: (c) => formatDate(c.createdAt) },
    { key: "status", header: "Status", cell: (c) => <StatusBadge status={c.status} /> },
    {
      key: "act", header: "", className: "text-right", cell: (c) => (
        <div className="flex gap-1 justify-end">
          <Button size="sm" variant="outline" onClick={() => setView(c)}><Eye className="h-3 w-3" /></Button>
          {c.status === "Draft" && (
            <Button size="sm" variant="outline" onClick={() => { setCreditNoteStatus(c.id, "Pending Approval"); toast.success("Submitted for approval"); }}>
              <Send className="h-3 w-3 mr-1" /> Submit
            </Button>
          )}
          {c.status === "Pending Approval" && approver && (
            <>
              <Button size="sm" variant="outline" className="text-success" onClick={() => { setCreditNoteStatus(c.id, "Approved"); toast.success("Approved"); }}>
                <Check className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline" className="text-destructive" onClick={() => { setCreditNoteStatus(c.id, "Rejected"); toast.success("Rejected"); }}>
                <X className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Credit Notes"
        description={`Approval workflow — your role: ${currentUser.role}${approver ? " (can approve)" : ""}`}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> New Credit Note</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Credit Note</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Invoice</Label>
                  <Select value={invoiceId} onValueChange={setInvoiceId}>
                    <SelectTrigger><SelectValue placeholder="Select invoice…" /></SelectTrigger>
                    <SelectContent>
                      {invoices.map((i) => <SelectItem key={i.id} value={i.id}>{i.id} — {i.customerName} ({formatKES(i.total)})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Amount (KES)</Label><Input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value) || 0)} /></div>
                <div><Label>Reason</Label><Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Damaged on delivery" /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={submit}>Create Draft</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <DataTable columns={cols} rows={creditNotes} empty="No credit notes yet" />

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{view?.id} — Audit Trail</DialogTitle></DialogHeader>
          {view && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><div className="text-xs text-muted-foreground">Customer</div><div className="font-medium">{view.customerName}</div></div>
                <div><div className="text-xs text-muted-foreground">Invoice</div><div className="font-mono">{view.invoiceId}</div></div>
                <div><div className="text-xs text-muted-foreground">Amount</div><div className="font-medium">{formatKES(view.amount)}</div></div>
                <div><div className="text-xs text-muted-foreground">Status</div><StatusBadge status={view.status} /></div>
              </div>
              <div><div className="text-xs text-muted-foreground mb-1">Reason</div><div className="text-sm bg-muted p-3 rounded">{view.reason}</div></div>
              <div>
                <div className="text-xs text-muted-foreground mb-2 uppercase">History</div>
                <div className="space-y-2">
                  {view.history.map((h, i) => (
                    <div key={i} className="flex gap-3 text-sm border-l-2 border-primary/40 pl-3">
                      <div className="text-xs text-muted-foreground w-24 shrink-0">{formatDate(h.at)}</div>
                      <div><span className="font-medium">{h.action}</span> by {h.by}{h.note && ` — ${h.note}`}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}