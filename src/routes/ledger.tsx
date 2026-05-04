import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatKES, formatDate } from "@/lib/format";

export const Route = createFileRoute("/ledger")({
  component: Ledger,
  head: () => ({ meta: [{ title: "General Ledger — Travotech ERP" }] }),
});

const entries = [
  { id: "JE-0001", date: "2026-04-30", memo: "Sale INV-0042 to Aga Khan Hospital", lines: [
    { account: "1100 A/R", debit: 184000, credit: 0 },
    { account: "4000 Sales Revenue", debit: 0, credit: 158620 },
    { account: "2100 VAT Payable", debit: 0, credit: 25380 },
  ]},
  { id: "JE-0002", date: "2026-04-30", memo: "M-Pesa receipt from Kenyatta NH", lines: [
    { account: "1020 M-Pesa", debit: 240000, credit: 0 },
    { account: "1100 A/R", debit: 0, credit: 240000 },
  ]},
  { id: "JE-0003", date: "2026-04-29", memo: "GRN — LPO-0017 reagents received", lines: [
    { account: "1200 Inventory", debit: 612000, credit: 0 },
    { account: "2000 A/P", debit: 0, credit: 612000 },
  ]},
  { id: "JE-0004", date: "2026-04-28", memo: "April salaries paid", lines: [
    { account: "6000 Salaries", debit: 460000, credit: 0 },
    { account: "1010 Equity Bank", debit: 0, credit: 373000 },
    { account: "2200 PAYE", debit: 0, credit: 87000 },
  ]},
  { id: "JE-0005", date: "2026-04-27", memo: "Credit Note CN-0003 — Mater Hospital", lines: [
    { account: "4000 Sales Revenue", debit: 12000, credit: 0 },
    { account: "1100 A/R", debit: 0, credit: 12000 },
  ]},
];

function Ledger() {
  return (
    <div>
      <PageHeader title="General Ledger" description="Demo journal entries — every transaction has balanced debits and credits." />
      <div className="space-y-4">
        {entries.map((je) => {
          const total = je.lines.reduce((a, l) => a + l.debit, 0);
          return (
            <Card key={je.id}>
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div>
                  <span className="font-mono text-sm font-semibold">{je.id}</span>
                  <span className="ml-3 text-sm text-muted-foreground">{formatDate(je.date)}</span>
                </div>
                <div className="text-sm">{je.memo}</div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {je.lines.map((l, i) => (
                    <TableRow key={i}>
                      <TableCell>{l.account}</TableCell>
                      <TableCell className="text-right font-mono">{l.debit ? formatKES(l.debit) : "—"}</TableCell>
                      <TableCell className="text-right font-mono">{l.credit ? formatKES(l.credit) : "—"}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/40 font-semibold">
                    <TableCell>Totals</TableCell>
                    <TableCell className="text-right font-mono">{formatKES(total)}</TableCell>
                    <TableCell className="text-right font-mono">{formatKES(total)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
