import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatKES } from "@/lib/format";

export const Route = createFileRoute("/accounts")({
  component: Accounts,
  head: () => ({ meta: [{ title: "Chart of Accounts — Travotech ERP" }] }),
});

const accounts = [
  { code: "1000", name: "Cash on Hand", type: "Asset", balance: 245000 },
  { code: "1010", name: "Equity Bank — KES", type: "Asset", balance: 3120000 },
  { code: "1020", name: "M-Pesa Paybill 247247", type: "Asset", balance: 480000 },
  { code: "1100", name: "Accounts Receivable", type: "Asset", balance: 1850000 },
  { code: "1200", name: "Inventory — Medical", type: "Asset", balance: 6420000 },
  { code: "1500", name: "Office Equipment", type: "Asset", balance: 420000 },
  { code: "2000", name: "Accounts Payable", type: "Liability", balance: 920000 },
  { code: "2100", name: "VAT Payable (16%)", type: "Liability", balance: 312000 },
  { code: "2200", name: "PAYE Payable", type: "Liability", balance: 87000 },
  { code: "3000", name: "Owner's Equity", type: "Equity", balance: 8500000 },
  { code: "3100", name: "Retained Earnings", type: "Equity", balance: 2196000 },
  { code: "4000", name: "Sales Revenue", type: "Income", balance: 12480000 },
  { code: "4100", name: "Service Revenue", type: "Income", balance: 640000 },
  { code: "5000", name: "Cost of Goods Sold", type: "Expense", balance: 7820000 },
  { code: "6000", name: "Salaries & Wages", type: "Expense", balance: 1840000 },
  { code: "6100", name: "Rent — Nairobi", type: "Expense", balance: 360000 },
  { code: "6200", name: "Utilities", type: "Expense", balance: 84000 },
];

const typeColor: Record<string, string> = {
  Asset: "bg-blue-100 text-blue-700",
  Liability: "bg-orange-100 text-orange-700",
  Equity: "bg-purple-100 text-purple-700",
  Income: "bg-green-100 text-green-700",
  Expense: "bg-red-100 text-red-700",
};

function Accounts() {
  return (
    <div>
      <PageHeader title="Chart of Accounts" description="Demo ledger structure — Assets, Liabilities, Equity, Income, Expenses." />
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Account Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((a) => (
              <TableRow key={a.code}>
                <TableCell className="font-mono text-sm">{a.code}</TableCell>
                <TableCell className="font-medium">{a.name}</TableCell>
                <TableCell><Badge className={typeColor[a.type]} variant="secondary">{a.type}</Badge></TableCell>
                <TableCell className="text-right font-mono">{formatKES(a.balance)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
