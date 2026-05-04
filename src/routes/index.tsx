import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { useStore } from "@/lib/store";
import { formatKES, formatDate, daysUntil } from "@/lib/format";
import {
  TrendingUp, Wallet, AlertTriangle, Receipt, Plus, FileText, UserPlus,
  Package, Clock,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Legend,
} from "recharts";
import { StatusBadge } from "@/components/StatusBadge";

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({
    meta: [{ title: "Dashboard — Travotech ERP" }],
  }),
});

function Dashboard() {
  const { sales, invoices, products, customers, creditNotes } = useStore();

  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const startOfWeek = startOfDay - 6 * 86400000;
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getTime();

  const sumSince = (ts: number) => sales.filter((s) => new Date(s.createdAt).getTime() >= ts).reduce((a, s) => a + s.total, 0);
  const todaySales = sumSince(startOfDay);
  const weekSales = sumSince(startOfWeek);
  const monthSales = sumSince(startOfMonth);

  const outstanding = customers.reduce((a, c) => a + c.outstandingBalance, 0);
  const lowStock = products.filter((p) => p.stock <= p.reorderLevel);
  const nearExpiry = products.flatMap((p) =>
    p.batches.filter((b) => daysUntil(b.expiry) <= 90).map((b) => ({ product: p.name, ...b })),
  );
  const pendingApprovals = creditNotes.filter((c) => c.status === "Pending Approval").length;

  // 7-day sales trend
  const trend = Array.from({ length: 7 }).map((_, i) => {
    const day = startOfDay - (6 - i) * 86400000;
    const next = day + 86400000;
    const total = sales.filter((s) => {
      const t = new Date(s.createdAt).getTime();
      return t >= day && t < next;
    }).reduce((a, s) => a + s.total, 0);
    return {
      day: new Date(day).toLocaleDateString("en-GB", { weekday: "short" }),
      sales: total,
    };
  });

  // Payment breakdown
  const paymentMix = ["Cash", "M-Pesa", "Credit", "Bank"].map((m) => ({
    method: m,
    amount: sales.filter((s) => s.payment === m).reduce((a, s) => a + s.total, 0),
  }));

  const recent = sales.slice(0, 5);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of operations across Travotech Nairobi Branch."
        actions={
          <>
            <Button asChild><Link to="/pos"><Plus className="h-4 w-4 mr-1" /> New Sale</Link></Button>
            <Button asChild variant="outline"><Link to="/quotations"><FileText className="h-4 w-4 mr-1" /> New Quotation</Link></Button>
            <Button asChild variant="outline"><Link to="/customers"><UserPlus className="h-4 w-4 mr-1" /> New Customer</Link></Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPI title="Sales Today" value={formatKES(todaySales)} icon={TrendingUp} accent="primary" sub={`${sales.filter(s => new Date(s.createdAt).getTime() >= startOfDay).length} transactions`} />
        <KPI title="Sales This Week" value={formatKES(weekSales)} icon={TrendingUp} accent="info" sub="Last 7 days" />
        <KPI title="Sales This Month" value={formatKES(monthSales)} icon={TrendingUp} accent="success" sub={today.toLocaleDateString("en-GB", { month: "long" })} />
        <KPI title="Outstanding Debtors" value={formatKES(outstanding)} icon={Wallet} accent="warning" sub={`${customers.filter(c => c.outstandingBalance > 0).length} customers`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base text-navy">Sales — last 7 days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.45 0.18 258)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="oklch(0.45 0.18 258)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0.015 245)" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => formatKES(v)} />
                  <Area type="monotone" dataKey="sales" stroke="oklch(0.45 0.18 258)" strokeWidth={2} fill="url(#g1)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base text-navy">Payment Method Mix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentMix}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0.015 245)" />
                  <XAxis dataKey="method" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => formatKES(v)} />
                  <Bar dataKey="amount" fill="oklch(0.28 0.09 258)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base text-navy flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning" /> Low Stock</CardTitle>
            <Link to="/inventory" className="text-xs text-primary hover:underline">View all</Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {lowStock.length === 0 && <p className="text-sm text-muted-foreground">All stock levels healthy.</p>}
            {lowStock.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm border-b last:border-0 pb-2">
                <div className="min-w-0">
                  <div className="font-medium truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.sku}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-destructive font-semibold">{p.stock}</div>
                  <div className="text-xs text-muted-foreground">/ {p.reorderLevel}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base text-navy flex items-center gap-2"><Clock className="h-4 w-4 text-info" /> Near Expiry (≤90d)</CardTitle>
            <Link to="/inventory" className="text-xs text-primary hover:underline">View all</Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {nearExpiry.length === 0 && <p className="text-sm text-muted-foreground">No batches near expiry.</p>}
            {nearExpiry.slice(0, 5).map((b) => (
              <div key={b.batchNumber} className="flex items-center justify-between text-sm border-b last:border-0 pb-2">
                <div className="min-w-0">
                  <div className="font-medium truncate">{b.product}</div>
                  <div className="text-xs text-muted-foreground">Batch {b.batchNumber}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-warning-foreground font-semibold">{daysUntil(b.expiry)}d</div>
                  <div className="text-xs text-muted-foreground">{formatDate(b.expiry)}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base text-navy flex items-center gap-2"><Receipt className="h-4 w-4 text-primary" /> Recent Transactions</CardTitle>
            <Link to="/invoices" className="text-xs text-primary hover:underline">View all</Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {recent.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm border-b last:border-0 pb-2">
                <div className="min-w-0">
                  <div className="font-medium truncate">{s.customerName}</div>
                  <div className="text-xs text-muted-foreground">{s.id} · {formatDate(s.createdAt)}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-semibold text-navy">{formatKES(s.total)}</div>
                  <StatusBadge status={s.payment} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {pendingApprovals > 0 && (
        <Card className="mt-4 border-warning/40 bg-warning/5">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
            <div className="flex-1 text-sm">
              <span className="font-semibold">{pendingApprovals}</span> credit note{pendingApprovals > 1 ? "s" : ""} awaiting approval.
            </div>
            <Button asChild size="sm" variant="outline"><Link to="/credit-notes">Review</Link></Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function KPI({ title, value, icon: Icon, sub, accent }: { title: string; value: string; icon: any; sub?: string; accent: "primary" | "info" | "success" | "warning" }) {
  const colors: Record<string, string> = {
    primary: "text-primary bg-primary/10",
    info: "text-info bg-info/10",
    success: "text-success bg-success/10",
    warning: "text-warning-foreground bg-warning/15",
  };
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className="text-2xl font-bold text-navy mt-2 truncate">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${colors[accent]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
