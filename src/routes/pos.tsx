import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { formatKES } from "@/lib/format";
import { Plus, Minus, Trash2, Search, Printer } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import type { LineItem, PaymentMethod } from "@/lib/types";

export const Route = createFileRoute("/pos")({
  component: POS,
  head: () => ({ meta: [{ title: "POS — Travotech ERP" }] }),
});

function POS() {
  const { products, customers, createSale } = useStore();
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<LineItem[]>([]);
  const [customerId, setCustomerId] = useState<string>("CUST-0010");
  const [payment, setPayment] = useState<PaymentMethod>("Cash");
  const [discount, setDiscount] = useState(0);
  const [receipt, setReceipt] = useState<any>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return products.filter((p) => !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)).slice(0, 12);
  }, [products, query]);

  const addToCart = (id: string) => {
    const p = products.find((x) => x.id === id)!;
    setCart((c) => {
      const ex = c.find((i) => i.productId === id);
      if (ex) return c.map((i) => i.productId === id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...c, { productId: id, name: p.name, quantity: 1, price: p.price }];
    });
  };

  const updateQty = (id: string, delta: number) =>
    setCart((c) => c.map((i) => i.productId === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  const removeItem = (id: string) => setCart((c) => c.filter((i) => i.productId !== id));

  const subtotal = cart.reduce((a, i) => a + i.price * i.quantity, 0);
  const discountAmt = subtotal * (discount / 100);
  const total = subtotal - discountAmt;

  const handleCheckout = () => {
    if (cart.length === 0) return toast.error("Cart is empty");
    const customer = customers.find((c) => c.id === customerId)!;
    if (payment === "Credit" && customer.type === "Walk-in") {
      return toast.error("Credit not allowed for walk-in customers");
    }
    const sale = createSale({
      customerId: customer.id,
      customerName: customer.name,
      items: cart, subtotal, discount: discountAmt, tax: 0, total, payment,
    });
    setReceipt(sale);
    setCart([]); setDiscount(0);
    toast.success(`Sale ${sale.id} completed`);
  };

  return (
    <div>
      <PageHeader title="Point of Sale" description="Quick sales counter for Nairobi Branch" />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by product name or SKU…"
                  className="pl-9"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filtered.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p.id)}
                    className="text-left border rounded-lg p-3 hover:border-primary hover:bg-accent transition-colors"
                  >
                    <div className="text-xs text-muted-foreground">{p.sku}</div>
                    <div className="font-medium text-sm line-clamp-2 mt-1 min-h-10">{p.name}</div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-semibold text-navy">{formatKES(p.price)}</span>
                      <span className={`text-xs ${p.stock <= p.reorderLevel ? "text-destructive" : "text-muted-foreground"}`}>Stock: {p.stock}</span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="shadow-md sticky top-20">
            <CardHeader>
              <CardTitle className="text-base text-navy">Current Sale</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Customer</Label>
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name} ({c.type})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="border rounded-md max-h-64 overflow-auto">
                {cart.length === 0 && (
                  <div className="p-6 text-center text-sm text-muted-foreground">Cart is empty</div>
                )}
                {cart.map((i) => (
                  <div key={i.productId} className="flex items-center gap-2 p-2 border-b last:border-0">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{i.name}</div>
                      <div className="text-xs text-muted-foreground">{formatKES(i.price)}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQty(i.productId, -1)}><Minus className="h-3 w-3" /></Button>
                      <span className="w-8 text-center text-sm">{i.quantity}</span>
                      <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQty(i.productId, 1)}><Plus className="h-3 w-3" /></Button>
                    </div>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeItem(i.productId)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Discount %</Label>
                  <Input type="number" min={0} max={100} value={discount} onChange={(e) => setDiscount(Number(e.target.value) || 0)} />
                </div>
                <div>
                  <Label>Payment</Label>
                  <Select value={payment} onValueChange={(v) => setPayment(v as PaymentMethod)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="M-Pesa">M-Pesa</SelectItem>
                      <SelectItem value="Bank">Bank</SelectItem>
                      <SelectItem value="Credit">Credit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1 text-sm pt-2 border-t">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatKES(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Discount ({discount}%)</span><span>-{formatKES(discountAmt)}</span></div>
                <div className="flex justify-between text-lg font-bold text-navy pt-1 border-t"><span>Total</span><span>{formatKES(total)}</span></div>
              </div>

              <Button className="w-full" size="lg" onClick={handleCheckout}>Complete Sale</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!receipt} onOpenChange={(o) => !o && setReceipt(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Receipt</DialogTitle>
          </DialogHeader>
          {receipt && (
            <div className="space-y-3 font-mono text-sm">
              <div className="text-center border-b pb-3">
                <div className="font-bold text-navy text-base">TRAVOTECH AGENCIES LIMITED</div>
                <div className="text-xs text-muted-foreground">Medical & Lab Equipment Suppliers</div>
                <div className="text-xs text-muted-foreground">Nairobi, Kenya · Tel: 0709 123 456</div>
              </div>
              <div className="text-xs flex justify-between">
                <span>{receipt.id}</span>
                <span>{new Date(receipt.createdAt).toLocaleString("en-GB")}</span>
              </div>
              <div className="text-xs">Customer: {receipt.customerName}</div>
              <div className="border-t border-b py-2 space-y-1">
                {receipt.items.map((i: LineItem) => (
                  <div key={i.productId} className="flex justify-between text-xs">
                    <span className="truncate flex-1">{i.quantity}× {i.name}</span>
                    <span>{formatKES(i.price * i.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatKES(receipt.subtotal)}</span></div>
                <div className="flex justify-between"><span>Discount</span><span>-{formatKES(receipt.discount)}</span></div>
                <div className="flex justify-between font-bold text-base pt-1 border-t"><span>TOTAL</span><span>{formatKES(receipt.total)}</span></div>
                <div className="flex justify-between pt-1"><span>Payment</span><span>{receipt.payment}</span></div>
              </div>
              <div className="text-center text-xs text-muted-foreground border-t pt-2">
                Thank you for your business!
              </div>
              <Button className="w-full" variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4 mr-2" /> Print</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}