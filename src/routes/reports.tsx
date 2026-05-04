import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { formatKES } from "@/lib/format";
import { Download, Upload, FileSpreadsheet, FileText } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/reports")({
  component: Reports,
  head: () => ({ meta: [{ title: "Reports — Travotech ERP" }] }),
});

const COLORS = ["oklch(0.28 0.09 258)", "oklch(0.45 0.18 258)", "oklch(0.65 0.13 230)", "oklch(0.62 0.15 150)"];

function Reports() {
  const { sales, invoices, customers, products } = useStore();

  // Aged debtors: bucket by days since invoice
  const buckets = { "0-30": 0, "31-60": 0, "61-90": 0, "91-120": 0, "120+": 0 };
  invoices.filter((i) => i.status !== "Paid").forEach((i) => {
    const days = Math.floor((Date.now() - new Date(i.createdAt).getTime()) / 86400000);
    const bal = i.total - i.paid;
    if (days <= 30) buckets["0-30"] += bal;
    else if (days <= 60) buckets["31-60"] += bal;
    else if (days <= 90) buckets["61-90"] += bal;
    else if (days <= 120) buckets["91-120"] += bal;
    else buckets["120+"] += bal;
  });
  const ageData = Object.entries(buckets).map(([k, v]) => ({ bucket: k, amount: v }));

  // Top products
  const productSales = new Map<string, number>();
  sales.forEach((s) => s.items.forEach((i) => {
    productSales.set(i.name, (productSales.get(i.name) || 0) + i.price * i.quantity);
  }));
  const top = [...productSales.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, amount]) => ({ name: name.slice(0, 28), amount }));

  // Payment breakdown
  const payMix = ["Cash", "M-Pesa", "Credit", "Bank"].map((m, i) => ({
    name: m,
    value: sales.filter((s) => s.payment === m).reduce((a, s) => a + s.total, 0),
    color: COLORS[i],
  }));

  const handleExport = (kind: string) => {
    let csv = "";
    if (kind === "customers") {
      csv = "ID,Name,Type,Phone,Email,Credit Limit,Outstanding\n" + customers.map((c) => `${c.id},${c.name},${c.type},${c.phone},${c.email},${c.creditLimit},${c.outstandingBalance}`).join("\n");
    } else if (kind === "products") {
      csv = "SKU,Name,Category,Stock,Reorder,Price\n" + products.map((p) => `${p.sku},${p.name},${p.category},${p.stock},${p.reorderLevel},${p.price}`).join("\n");
    } else {
      csv = "ID,Customer,Date,Total,Payment\n" + sales.map((s) => `${s.id},${s.customerName},${s.createdAt},${s.total},${s.payment}`).join("\n");
    }
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${kind}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`${kind}.csv downloaded`);
  };

  return (
    <div>
      <PageHeader title="Reports & Analytics" description="Business insights and exportable data." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader><CardTitle className="text-base text-navy">Aged Debtors</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0.015 245)" />
                  <XAxis dataKey="bucket" />
                  <YAxis tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => formatKES(v)} />
                  <Bar dataKey="amount" fill="oklch(0.45 0.18 258)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base text-navy">Payment Method Breakdown</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={payMix} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                    {payMix.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatKES(v)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-4">
        <CardHeader><CardTitle className="text-base text-navy">Top-Selling Products</CardTitle></CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0.015 245)" />
                <XAxis type="number" tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" width={180} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => formatKES(v)} />
                <Bar dataKey="amount" fill="oklch(0.28 0.09 258)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base text-navy">Data Import / Export</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[{ k: "sales", l: "Sales" }, { k: "customers", l: "Customers" }, { k: "products", l: "Products" }].map((x) => (
              <Card key={x.k} className="border-dashed">
                <CardContent className="p-4 space-y-2">
                  <div className="font-medium text-navy">{x.l}</div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleExport(x.k)}><Download className="h-3 w-3 mr-1" /> CSV</Button>
                    <Button size="sm" variant="outline" onClick={() => toast.success(`${x.l} PDF generated (demo)`)}><FileText className="h-3 w-3 mr-1" /> PDF</Button>
                    <Button size="sm" variant="outline" onClick={() => toast.success(`${x.l} Excel generated (demo)`)}><FileSpreadsheet className="h-3 w-3 mr-1" /> Excel</Button>
                  </div>
                  <Button size="sm" variant="ghost" className="w-full" onClick={() => toast.info("Import dialog (demo) — accepts CSV / Excel")}>
                    <Upload className="h-3 w-3 mr-1" /> Import
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}