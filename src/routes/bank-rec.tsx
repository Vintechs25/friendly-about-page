import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatKES, formatDate } from "@/lib/format";
import { CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/bank-rec")({
  component: BankRec,
  head: () => ({ meta: [{ title: "Bank Reconciliation — Travotech ERP" }] }),
});

const initial = [
  { id: "B1", date: "2026-04-30", desc: "M-PESA C2B 247247 — Aga Khan", amount: 240000, matched: true, ref: "INV-0042" },
  { id: "B2", date: "2026-04-29", desc: "RTGS IN — Kenyatta NH", amount: 480000, matched: true, ref: "INV-0039" },
  { id: "B3", date: "2026-04-29", desc: "Bank charges", amount: -1850, matched: true, ref: "JE-0007" },
  { id: "B4", date: "2026-04-28", desc: "M-PESA — Mater Hospital", amount: 84000, matched: false, ref: "" },
  { id: "B5", date: "2026-04-28", desc: "Cheque #00231 — Nairobi Hospital", amount: 320000, matched: false, ref: "" },
  { id: "B6", date: "2026-04-27", desc: "Salaries debit", amount: -373000, matched: true, ref: "JE-0004" },
  { id: "B7", date: "2026-04-26", desc: "Standing order — rent", amount: -90000, matched: false, ref: "" },
];

function BankRec() {
  const [rows, setRows] = useState(initial);
  const opening = 2980000;
  const cleared = rows.filter((r) => r.matched).reduce((a, r) => a + r.amount, 0);
  const pending = rows.filter((r) => !r.matched).reduce((a, r) => a + r.amount, 0);

  const toggle = (id: string) => setRows((rs) => rs.map((r) => r.id === id ? { ...r, matched: !r.matched } : r));

  return (
    <div>
      <PageHeader title="Bank Reconciliation" description="Equity Bank — Travotech Operations (KES) · April 2026" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <Card className="p-4"><div className="text-xs text-muted-foreground">Opening Balance</div><div className="text-lg font-bold mt-1">{formatKES(opening)}</div></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground">Cleared</div><div className="text-lg font-bold mt-1 text-green-700">{formatKES(cleared)}</div></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground">Pending</div><div className="text-lg font-bold mt-1 text-orange-600">{formatKES(pending)}</div></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground">Statement Balance</div><div className="text-lg font-bold mt-1 text-navy">{formatKES(opening + cleared + pending)}</div></Card>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Matched Ref</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  {r.matched ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                </TableCell>
                <TableCell>{formatDate(r.date)}</TableCell>
                <TableCell>{r.desc}</TableCell>
                <TableCell>{r.ref ? <Badge variant="secondary" className="font-mono">{r.ref}</Badge> : <span className="text-xs text-muted-foreground">—</span>}</TableCell>
                <TableCell className={`text-right font-mono ${r.amount < 0 ? "text-red-600" : ""}`}>{formatKES(r.amount)}</TableCell>
                <TableCell><Button size="sm" variant="outline" onClick={() => toggle(r.id)}>{r.matched ? "Unmatch" : "Match"}</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
