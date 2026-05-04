import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable, type Column } from "@/components/DataTable";
import { useStore } from "@/lib/store";
import { formatKES, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, PackageCheck, Send, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import type { Supplier, PurchaseOrder, LineItem } from "@/lib/types";

export const Route = createFileRoute("/suppliers")({
  component: Suppliers,
  head: () => ({ meta: [{ title: "Suppliers — Travotech ERP" }] }),
});

function Suppliers() {
  const { suppliers, products, purchaseOrders, addSupplier, addPO, receivePO } = useStore();
  const [open, setOpen] = useState(false);
  const [poOpen, setPoOpen] = useState(false);
  const [view, setView] = useState<Supplier | null>(null);
  const [form, setForm] = useState({ name: "", contactPerson: "", phone: "", email: "", address: "", kraPin: "" });
  const [poForm, setPoForm] = useState({ supplierId: "", expectedDays: 7, items: [] as LineItem[], pid: "" });

  const submit = () => {
    if (!form.name) return toast.error("Name required");
    addSupplier(form);
    setOpen(false);
    toast.success("Supplier created");
  };

  const submitPO = () => {
    const sup = suppliers.find((s) => s.id === poForm.supplierId);
    if (!sup || poForm.items.length === 0) return toast.error("Supplier and items required");
    const total = poForm.items.reduce((a, i) => a + i.price * i.quantity, 0);
    addPO({
      supplierId: sup.id, supplierName: sup.name, items: poForm.items, total,
      status: "Draft",
      expectedDate: new Date(Date.now() + poForm.expectedDays * 86400000).toISOString(),
    });
    setPoOpen(false); setPoForm({ supplierId: "", expectedDays: 7, items: [], pid: "" });
    toast.success("LPO created");
  };

  const supCols: Column<Supplier>[] = [
    { key: "id", header: "ID", cell: (s) => <span className="font-mono text-xs text-navy">{s.id}</span> },
    { key: "name", header: "Supplier", cell: (s) => (
      <div>
        <div className="font-medium">{s.name}</div>
        <div className="text-xs text-muted-foreground">{s.contactPerson}</div>
      </div>
    ) },
    { key: "phone", header: "Phone", cell: (s) => s.phone },
    { key: "email", header: "Email", cell: (s) => s.email },
    { key: "kra", header: "KRA PIN", cell: (s) => <span className="font-mono text-xs">{s.kraPin}</span> },
    { key: "act", header: "", className: "text-right", cell: (s) => (
      <Button size="sm" variant="outline" onClick={() => setView(s)}><Eye className="h-3 w-3" /></Button>
    ) },
  ];

  const poCols: Column<PurchaseOrder>[] = [
    { key: "id", header: "LPO #", cell: (p) => <span className="font-mono font-medium text-navy">{p.id}</span> },
    { key: "sup", header: "Supplier", cell: (p) => p.supplierName },
    { key: "amt", header: "Total", cell: (p) => formatKES(p.total) },
    { key: "exp", header: "Expected", cell: (p) => formatDate(p.expectedDate) },
    { key: "status", header: "Status", cell: (p) => <StatusBadge status={p.status} /> },
    { key: "act", header: "", className: "text-right", cell: (p) => (
      <div className="flex gap-1 justify-end">
        {p.status === "Draft" && <Button size="sm" variant="outline" onClick={() => toast.success("LPO sent")}><Send className="h-3 w-3 mr-1" /> Send</Button>}
        {p.status !== "Received" && <Button size="sm" onClick={() => { receivePO(p.id); toast.success("GRN recorded · stock updated"); }}><PackageCheck className="h-3 w-3 mr-1" /> Receive</Button>}
      </div>
    ) },
  ];

  const supplierPOs = view ? purchaseOrders.filter((p) => p.supplierId === view.id) : [];

  return (
    <div>
      <PageHeader
        title="Suppliers & Procurement"
        actions={
          <>
            <Dialog open={poOpen} onOpenChange={setPoOpen}>
              <DialogTrigger asChild><Button variant="outline"><Plus className="h-4 w-4 mr-1" /> New LPO</Button></DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader><DialogTitle>New Local Purchase Order</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Supplier</Label>
                      <Select value={poForm.supplierId} onValueChange={(v) => setPoForm({ ...poForm, supplierId: v })}>
                        <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                        <SelectContent>{suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div><Label>Expected (days)</Label><Input type="number" value={poForm.expectedDays} onChange={(e) => setPoForm({ ...poForm, expectedDays: Number(e.target.value) || 7 })} /></div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={poForm.pid} onValueChange={(v) => setPoForm({ ...poForm, pid: v })}>
                      <SelectTrigger><SelectValue placeholder="Add product…" /></SelectTrigger>
                      <SelectContent>{products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <Button type="button" onClick={() => {
                      const p = products.find((x) => x.id === poForm.pid);
                      if (!p) return;
                      setPoForm({ ...poForm, items: [...poForm.items, { productId: p.id, name: p.name, quantity: 1, price: p.cost }], pid: "" });
                    }}>Add</Button>
                  </div>
                  <div className="border rounded-md max-h-48 overflow-auto">
                    {poForm.items.map((i, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 border-b last:border-0">
                        <span className="flex-1 text-sm truncate">{i.name}</span>
                        <Input type="number" className="w-20" value={i.quantity} onChange={(e) => {
                          const v = Number(e.target.value) || 1;
                          setPoForm({ ...poForm, items: poForm.items.map((it, j) => j === idx ? { ...it, quantity: v } : it) });
                        }} />
                        <Input type="number" className="w-24" value={i.price} onChange={(e) => {
                          const v = Number(e.target.value) || 0;
                          setPoForm({ ...poForm, items: poForm.items.map((it, j) => j === idx ? { ...it, price: v } : it) });
                        }} />
                        <span className="w-24 text-right text-sm font-medium">{formatKES(i.price * i.quantity)}</span>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => setPoForm({ ...poForm, items: poForm.items.filter((_, j) => j !== idx) })}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {poForm.items.length === 0 && <div className="p-4 text-sm text-center text-muted-foreground">No items</div>}
                  </div>
                </div>
                <DialogFooter><Button variant="outline" onClick={() => setPoOpen(false)}>Cancel</Button><Button onClick={submitPO}>Create LPO</Button></DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> New Supplier</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>New Supplier</DialogTitle></DialogHeader>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2"><Label>Company Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                  <div><Label>Contact Person</Label><Input value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} /></div>
                  <div><Label>Phone</Label><Input value={form.phone} placeholder="07XXXXXXXX" onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                  <div className="col-span-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                  <div className="col-span-2"><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
                  <div className="col-span-2"><Label>KRA PIN</Label><Input value={form.kraPin} onChange={(e) => setForm({ ...form, kraPin: e.target.value })} /></div>
                </div>
                <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit}>Create</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        }
      />
      <Tabs defaultValue="suppliers">
        <TabsList>
          <TabsTrigger value="suppliers">Suppliers ({suppliers.length})</TabsTrigger>
          <TabsTrigger value="po">Purchase Orders ({purchaseOrders.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="suppliers" className="mt-4"><DataTable columns={supCols} rows={suppliers} /></TabsContent>
        <TabsContent value="po" className="mt-4"><DataTable columns={poCols} rows={purchaseOrders} /></TabsContent>
      </Tabs>

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{view?.name}</DialogTitle></DialogHeader>
          {view && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><div className="text-xs text-muted-foreground">Supplier ID</div><div className="font-mono">{view.id}</div></div>
                <div><div className="text-xs text-muted-foreground">Contact</div><div>{view.contactPerson}</div></div>
                <div><div className="text-xs text-muted-foreground">Phone</div><div>{view.phone}</div></div>
                <div><div className="text-xs text-muted-foreground">Email</div><div>{view.email}</div></div>
                <div className="col-span-2"><div className="text-xs text-muted-foreground">Address</div><div>{view.address}</div></div>
                <div><div className="text-xs text-muted-foreground">KRA PIN</div><div className="font-mono">{view.kraPin}</div></div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-2 uppercase">Recent LPOs</div>
                <div className="space-y-1">
                  {supplierPOs.length === 0 && <div className="text-sm text-muted-foreground">No purchase orders yet</div>}
                  {supplierPOs.map((p) => (
                    <div key={p.id} className="flex justify-between border-b last:border-0 py-2 text-sm">
                      <span className="font-mono">{p.id}</span><span>{formatDate(p.createdAt)}</span>
                      <span className="font-medium">{formatKES(p.total)}</span><StatusBadge status={p.status} />
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