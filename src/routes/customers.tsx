import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DataTable, type Column } from "@/components/DataTable";
import { useStore, canApprove } from "@/lib/store";
import { formatKES, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Eye, Check, X, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Customer, CustomerType } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BulkIO } from "@/components/BulkIO";

const TYPES: CustomerType[] = ["Hospital", "Lab", "University", "Walk-in"];

export const Route = createFileRoute("/customers")({
  component: Customers,
  head: () => ({ meta: [{ title: "Customers — Travotech ERP" }] }),
});

function Customers() {
  const { customers, sales, invoices, addCustomer, setCustomerCreditStatus, updateCustomer, deleteCustomer, bulkImportCustomers, currentUser } = useStore();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Customer | null>(null);
  const [edit, setEdit] = useState<Customer | null>(null);
  const approver = canApprove(currentUser.role);
  const [form, setForm] = useState({
    name: "", type: "Hospital" as CustomerType, phone: "", email: "",
    address: "", contactPerson: "", kraPin: "", notes: "", creditLimit: 0,
  });

  const submit = () => {
    if (!form.name) return toast.error("Name required");
    addCustomer({
      ...form, outstandingBalance: 0,
      creditStatus: form.creditLimit > 0 ? "Pending" : "None",
    });
    setOpen(false);
    toast.success("Customer created");
  };

  const saveEdit = () => {
    if (!edit) return;
    updateCustomer(edit.id, edit);
    setEdit(null);
    toast.success("Customer updated");
  };

  const cols: Column<Customer>[] = [
    { key: "id", header: "ID", cell: (c) => <span className="font-mono text-xs text-navy">{c.id}</span> },
    { key: "name", header: "Customer", cell: (c) => (
      <div>
        <div className="font-medium">{c.name}</div>
        <div className="text-xs text-muted-foreground">{c.contactPerson}</div>
      </div>
    ) },
    { key: "type", header: "Type", cell: (c) => <Badge type={c.type} /> },
    { key: "phone", header: "Phone", cell: (c) => c.phone },
    { key: "limit", header: "Credit Limit", cell: (c) => formatKES(c.creditLimit), className: "text-right" },
    { key: "out", header: "Outstanding", cell: (c) => (
      <span className={c.outstandingBalance > 0 ? "text-destructive font-medium" : ""}>{formatKES(c.outstandingBalance)}</span>
    ), className: "text-right" },
    { key: "credit", header: "Credit Status", cell: (c) => <StatusBadge status={c.creditStatus} /> },
    { key: "act", header: "", className: "text-right", cell: (c) => (
      <div className="flex gap-1 justify-end">
        <Button size="sm" variant="outline" onClick={() => setView(c)}><Eye className="h-3 w-3" /></Button>
        <Button size="sm" variant="outline" onClick={() => setEdit({ ...c })}><Pencil className="h-3 w-3" /></Button>
        <Button size="sm" variant="outline" className="text-destructive" onClick={() => { if (confirm(`Delete ${c.name}?`)) { deleteCustomer(c.id); toast.success("Deleted"); } }}><Trash2 className="h-3 w-3" /></Button>
        {c.creditStatus === "Pending" && approver && (
          <>
            <Button size="sm" variant="outline" className="text-success" onClick={() => { setCustomerCreditStatus(c.id, "Approved"); toast.success("Credit approved"); }}><Check className="h-3 w-3" /></Button>
            <Button size="sm" variant="outline" className="text-destructive" onClick={() => { setCustomerCreditStatus(c.id, "Rejected"); toast.success("Credit rejected"); }}><X className="h-3 w-3" /></Button>
          </>
        )}
      </div>
    ) },
  ];

  const customerTxns = view ? [
    ...sales.filter((s) => s.customerId === view.id).map((s) => ({ id: s.id, date: s.createdAt, type: "Sale", amount: s.total, status: s.payment })),
    ...invoices.filter((i) => i.customerId === view.id).map((i) => ({ id: i.id, date: i.createdAt, type: "Invoice", amount: i.total, status: i.status })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];

  return (
    <div>
      <PageHeader
        title="Customers"
        description={`${customers.length} customers · ${customers.filter(c => c.creditStatus === "Pending").length} credit requests pending`}
        actions={
          <div className="flex gap-2">
            <BulkIO
              entity="customers"
              rows={customers as unknown as Record<string, unknown>[]}
              template={{ name: "ABC Hospital", type: "Hospital", phone: "0712345678", email: "info@abc.co.ke", address: "Nairobi", contactPerson: "Jane", kraPin: "P051234567X", creditLimit: "100000" }}
              onImport={(rows) => bulkImportCustomers(rows as Partial<Customer>[])}
            />
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> New Customer</Button></DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader><DialogTitle>New Customer</DialogTitle></DialogHeader>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                  <div><Label>Type</Label>
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as CustomerType })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Phone</Label><Input value={form.phone} placeholder="07XXXXXXXX" onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                  <div className="col-span-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                  <div className="col-span-2"><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
                  <div><Label>Contact Person</Label><Input value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} /></div>
                  <div><Label>KRA PIN (optional)</Label><Input value={form.kraPin} onChange={(e) => setForm({ ...form, kraPin: e.target.value })} /></div>
                  <div className="col-span-2"><Label>Credit Limit Request (KES)</Label><Input type="number" value={form.creditLimit} onChange={(e) => setForm({ ...form, creditLimit: Number(e.target.value) || 0 })} /></div>
                  <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button onClick={submit}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />
      <DataTable columns={cols} rows={customers} />

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Edit {edit?.name}</DialogTitle></DialogHeader>
          {edit && (
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>Name</Label><Input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={edit.phone} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} /></div>
              <div><Label>Email</Label><Input value={edit.email} onChange={(e) => setEdit({ ...edit, email: e.target.value })} /></div>
              <div className="col-span-2"><Label>Address</Label><Input value={edit.address} onChange={(e) => setEdit({ ...edit, address: e.target.value })} /></div>
              <div><Label>Contact Person</Label><Input value={edit.contactPerson} onChange={(e) => setEdit({ ...edit, contactPerson: e.target.value })} /></div>
              <div><Label>Credit Limit</Label><Input type="number" value={edit.creditLimit} onChange={(e) => setEdit({ ...edit, creditLimit: Number(e.target.value) || 0 })} /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEdit(null)}>Cancel</Button>
            <Button onClick={saveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>{view?.name}</DialogTitle></DialogHeader>
          {view && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <Field label="Customer ID" value={view.id} />
                <Field label="Type" value={view.type} />
                <Field label="Created" value={formatDate(view.createdAt)} />
                <Field label="Phone" value={view.phone} />
                <Field label="Email" value={view.email} />
                <Field label="Contact Person" value={view.contactPerson} />
                <Field label="Address" value={view.address} className="col-span-2" />
                <Field label="KRA PIN" value={view.kraPin || "—"} />
                {view.notes && <Field label="Notes" value={view.notes} className="col-span-3" />}
              </div>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Credit Usage</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Outstanding: <span className="font-semibold text-destructive">{formatKES(view.outstandingBalance)}</span></span>
                    <span>Limit: <span className="font-semibold">{formatKES(view.creditLimit)}</span></span>
                  </div>
                  <Progress value={view.creditLimit > 0 ? (view.outstandingBalance / view.creditLimit) * 100 : 0} />
                  <div className="text-xs text-muted-foreground">Status: <StatusBadge status={view.creditStatus} /></div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Transaction History</CardTitle></CardHeader>
                <CardContent className="p-0 max-h-64 overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50"><tr><th className="text-left p-2">Ref</th><th className="text-left p-2">Date</th><th className="text-left p-2">Type</th><th className="text-right p-2">Amount</th><th className="text-left p-2">Status</th></tr></thead>
                    <tbody>
                      {customerTxns.length === 0 && <tr><td colSpan={5} className="text-center p-4 text-muted-foreground">No transactions</td></tr>}
                      {customerTxns.map((t) => (
                        <tr key={t.type + t.id} className="border-t">
                          <td className="p-2 font-mono text-xs">{t.id}</td>
                          <td className="p-2">{formatDate(t.date)}</td>
                          <td className="p-2">{t.type}</td>
                          <td className="text-right p-2">{formatKES(t.amount)}</td>
                          <td className="p-2"><StatusBadge status={t.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <div className="text-xs text-muted-foreground uppercase">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function Badge({ type }: { type: CustomerType }) {
  const colors: Record<CustomerType, string> = {
    Hospital: "bg-info/15 text-info border-info/30",
    Lab: "bg-primary/10 text-primary border-primary/30",
    University: "bg-success/15 text-success border-success/30",
    "Walk-in": "bg-muted text-muted-foreground border",
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border font-medium ${colors[type]}`}>{type}</span>;
}