import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DataTable, type Column } from "@/components/DataTable";
import { useStore } from "@/lib/store";
import { formatKES, formatDate, daysUntil } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertTriangle, Clock, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Product, ProductCategory } from "@/lib/types";
import { BulkIO } from "@/components/BulkIO";

const CATEGORIES: ProductCategory[] = ["Medical Instruments", "Lab Equipment", "Reagents", "Surgical Consumables", "Rapid Diagnostic Kits"];

export const Route = createFileRoute("/inventory")({
  component: Inventory,
  head: () => ({ meta: [{ title: "Inventory — Travotech ERP" }] }),
});

function Inventory() {
  const { products, addProduct, updateProduct, deleteProduct, bulkImportProducts } = useStore();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Product | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [q, setQ] = useState("");
  const [form, setForm] = useState({
    name: "", sku: "", category: "Reagents" as ProductCategory, price: 0, cost: 0,
    stock: 0, reorderLevel: 0, unit: "Box", batchNumber: "", expiry: "", batchQty: 0,
  });

  const filtered = products.filter((p) => {
    if (q && !p.name.toLowerCase().includes(q.toLowerCase()) && !p.sku.toLowerCase().includes(q.toLowerCase())) return false;
    if (filter === "low") return p.stock <= p.reorderLevel;
    if (filter === "expiry") return p.batches.some((b) => daysUntil(b.expiry) <= 90);
    if (filter !== "all") return p.category === filter;
    return true;
  });

  const submit = () => {
    if (!form.name || !form.sku) return toast.error("Name and SKU required");
    addProduct({
      name: form.name, sku: form.sku, category: form.category, price: form.price, cost: form.cost,
      stock: form.stock, reorderLevel: form.reorderLevel, unit: form.unit,
      batches: form.batchNumber && form.expiry ? [{ batchNumber: form.batchNumber, expiry: new Date(form.expiry).toISOString(), quantity: form.batchQty }] : [],
    });
    setOpen(false);
    toast.success("Product added");
  };

  const cols: Column<Product>[] = [
    { key: "sku", header: "SKU", cell: (p) => <span className="font-mono text-xs">{p.sku}</span> },
    { key: "name", header: "Product", cell: (p) => (
      <div>
        <div className="font-medium">{p.name}</div>
        <div className="text-xs text-muted-foreground">{p.category}</div>
      </div>
    ) },
    { key: "stock", header: "Stock", cell: (p) => (
      <div className="flex items-center gap-2">
        <span className={p.stock <= p.reorderLevel ? "text-destructive font-semibold" : ""}>{p.stock}</span>
        {p.stock <= p.reorderLevel && <AlertTriangle className="h-3 w-3 text-destructive" />}
        <span className="text-xs text-muted-foreground">/ {p.reorderLevel} {p.unit}</span>
      </div>
    ) },
    { key: "batch", header: "Batches", cell: (p) => (
      <div className="space-y-1">
        {p.batches.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
        {p.batches.map((b) => {
          const d = daysUntil(b.expiry);
          const expSoon = d <= 90;
          return (
            <div key={b.batchNumber} className="text-xs flex items-center gap-1">
              <span className="font-mono">{b.batchNumber}</span>
              <span className="text-muted-foreground">·</span>
              <span className={expSoon ? "text-warning-foreground font-medium" : ""}>
                {expSoon && <Clock className="inline h-3 w-3 mr-0.5" />}{formatDate(b.expiry)} ({d}d)
              </span>
            </div>
          );
        })}
      </div>
    ) },
    { key: "price", header: "Price", cell: (p) => formatKES(p.price), className: "text-right" },
    { key: "tags", header: "", cell: (p) => (
      <div className="flex gap-1 flex-wrap justify-end items-center">
        {p.stock <= p.reorderLevel && <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">Low</Badge>}
        {p.batches.some((b) => daysUntil(b.expiry) <= 90) && <Badge variant="outline" className="bg-warning/15 text-warning-foreground border-warning/40">Near Expiry</Badge>}
        <Button size="sm" variant="outline" onClick={() => setEdit({ ...p })}><Pencil className="h-3 w-3" /></Button>
        <Button size="sm" variant="outline" className="text-destructive" onClick={() => { if (confirm(`Delete ${p.name}?`)) { deleteProduct(p.id); toast.success("Deleted"); } }}><Trash2 className="h-3 w-3" /></Button>
      </div>
    ), className: "text-right" },
  ];

  return (
    <div>
      <PageHeader
        title="Inventory"
        description="Track stock, batches, and expiry across all categories."
        actions={
          <div className="flex gap-2">
            <BulkIO
              entity="products"
              rows={products as unknown as Record<string, unknown>[]}
              template={{ sku: "MED-NEW-001", name: "New Item", category: "Reagents", price: "1500", cost: "900", stock: "20", reorderLevel: "5", unit: "Box" }}
              onImport={(rows) => bulkImportProducts(rows as Partial<Product>[])}
            />
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Add Product</Button></DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader><DialogTitle>Add Product</DialogTitle></DialogHeader>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                  <div><Label>SKU</Label><Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
                  <div><Label>Category</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as ProductCategory })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Price (KES)</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) || 0 })} /></div>
                  <div><Label>Cost (KES)</Label><Input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: Number(e.target.value) || 0 })} /></div>
                  <div><Label>Stock</Label><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) || 0 })} /></div>
                  <div><Label>Reorder Level</Label><Input type="number" value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: Number(e.target.value) || 0 })} /></div>
                  <div><Label>Unit</Label><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
                  <div className="col-span-2 border-t pt-3"><Label>Initial Batch (optional)</Label></div>
                  <div><Label>Batch #</Label><Input value={form.batchNumber} onChange={(e) => setForm({ ...form, batchNumber: e.target.value })} /></div>
                  <div><Label>Expiry</Label><Input type="date" value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} /></div>
                  <div><Label>Batch Qty</Label><Input type="number" value={form.batchQty} onChange={(e) => setForm({ ...form, batchQty: Number(e.target.value) || 0 })} /></div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button onClick={submit}>Add Product</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />
      <div className="flex flex-wrap gap-2 mb-4">
        <Input placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            <SelectItem value="low">Low Stock</SelectItem>
            <SelectItem value="expiry">Near Expiry (≤90d)</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <DataTable columns={cols} rows={filtered} empty="No products" />

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Edit {edit?.name}</DialogTitle></DialogHeader>
          {edit && (
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>Name</Label><Input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></div>
              <div><Label>SKU</Label><Input value={edit.sku} onChange={(e) => setEdit({ ...edit, sku: e.target.value })} /></div>
              <div><Label>Unit</Label><Input value={edit.unit} onChange={(e) => setEdit({ ...edit, unit: e.target.value })} /></div>
              <div><Label>Price</Label><Input type="number" value={edit.price} onChange={(e) => setEdit({ ...edit, price: Number(e.target.value) || 0 })} /></div>
              <div><Label>Cost</Label><Input type="number" value={edit.cost} onChange={(e) => setEdit({ ...edit, cost: Number(e.target.value) || 0 })} /></div>
              <div><Label>Stock</Label><Input type="number" value={edit.stock} onChange={(e) => setEdit({ ...edit, stock: Number(e.target.value) || 0 })} /></div>
              <div><Label>Reorder Level</Label><Input type="number" value={edit.reorderLevel} onChange={(e) => setEdit({ ...edit, reorderLevel: Number(e.target.value) || 0 })} /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEdit(null)}>Cancel</Button>
            <Button onClick={() => { if (edit) { updateProduct(edit.id, edit); setEdit(null); toast.success("Product updated"); } }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}