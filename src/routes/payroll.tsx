import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatKES, formatDate } from "@/lib/format";
import { BulkIO } from "@/components/BulkIO";
import { DocActions } from "@/components/DocActions";
import { useState } from "react";
import { Calculator, FileDown } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/payroll")({
  component: Payroll,
  head: () => ({ meta: [{ title: "Payroll — Travotech ERP" }] }),
});

interface Pay {
  id: string; employee: string; role: string; gross: number;
  paye: number; nhif: number; nssf: number; loan: number; net: number;
  month: string; status: "Draft" | "Approved" | "Paid";
}

const initial: Pay[] = [
  { id: "PAY-0001", employee: "James Mwangi", role: "Super Admin", gross: 250000, paye: 62500, nhif: 1700, nssf: 2160, loan: 10000, net: 173640, month: "2026-04", status: "Paid" },
  { id: "PAY-0002", employee: "Grace Wanjiku", role: "Branch Manager", gross: 180000, paye: 36000, nhif: 1700, nssf: 2160, loan: 0, net: 140140, month: "2026-04", status: "Paid" },
  { id: "PAY-0003", employee: "Mary Achieng", role: "Cashier", gross: 55000, paye: 6500, nhif: 1100, nssf: 2160, loan: 5000, net: 40240, month: "2026-04", status: "Paid" },
  { id: "PAY-0004", employee: "Daniel Kiprop", role: "Accountant", gross: 140000, paye: 28000, nhif: 1700, nssf: 2160, loan: 0, net: 108140, month: "2026-04", status: "Paid" },
  { id: "PAY-0005", employee: "Peter Otieno", role: "Sales Rep", gross: 75000, paye: 9000, nhif: 1300, nssf: 2160, loan: 2000, net: 60540, month: "2026-05", status: "Draft" },
  { id: "PAY-0006", employee: "Susan Njeri", role: "Procurement", gross: 95000, paye: 12500, nhif: 1500, nssf: 2160, loan: 0, net: 78840, month: "2026-05", status: "Draft" },
];

function Payroll() {
  const [rows, setRows] = useState(initial);
  const total = rows.reduce((a, r) => a + r.net, 0);
  const totalPAYE = rows.reduce((a, r) => a + r.paye, 0);

  const runPayroll = () => {
    setRows((rs) => rs.map((r) => r.status === "Draft" ? { ...r, status: "Approved" } : r));
    toast.success("Payroll run for May 2026 — sent for approval");
  };

  const payslip = (p: Pay) => `<h1>Payslip — ${p.employee}</h1>
    <div class="meta">${p.id} · ${p.month} · ${p.role}</div>
    <table><tbody>
      <tr><td>Gross</td><td>${formatKES(p.gross)}</td></tr>
      <tr><td>PAYE</td><td>(${formatKES(p.paye)})</td></tr>
      <tr><td>NHIF</td><td>(${formatKES(p.nhif)})</td></tr>
      <tr><td>NSSF</td><td>(${formatKES(p.nssf)})</td></tr>
      <tr><td>Loan</td><td>(${formatKES(p.loan)})</td></tr>
      <tr><td><b>Net Pay</b></td><td><b>${formatKES(p.net)}</b></td></tr>
    </tbody></table>`;

  return (
    <div>
      <PageHeader title="Payroll & HR" description="Monthly payroll, PAYE/NHIF/NSSF, and payslip distribution."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={runPayroll}><Calculator className="h-3 w-3 mr-1" /> Run Payroll</Button>
            <BulkIO entity="payroll" rows={rows as unknown as Record<string, unknown>[]} />
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Total Net (this run)</CardTitle></CardHeader><CardContent className="text-xl font-bold text-navy">{formatKES(total)}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">PAYE Remittance</CardTitle></CardHeader><CardContent className="text-xl font-bold text-navy">{formatKES(totalPAYE)}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Active Employees</CardTitle></CardHeader><CardContent className="text-xl font-bold text-navy">{rows.length}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Drafts Pending</CardTitle></CardHeader><CardContent className="text-xl font-bold text-orange-600">{rows.filter(r => r.status === "Draft").length}</CardContent></Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payslip</TableHead><TableHead>Employee</TableHead><TableHead>Month</TableHead>
              <TableHead className="text-right">Gross</TableHead><TableHead className="text-right">PAYE</TableHead>
              <TableHead className="text-right">NHIF</TableHead><TableHead className="text-right">NSSF</TableHead>
              <TableHead className="text-right">Net</TableHead><TableHead>Status</TableHead><TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-xs">{p.id}</TableCell>
                <TableCell><div className="font-medium">{p.employee}</div><div className="text-xs text-muted-foreground">{p.role}</div></TableCell>
                <TableCell>{formatDate(p.month + "-01")}</TableCell>
                <TableCell className="text-right font-mono">{formatKES(p.gross)}</TableCell>
                <TableCell className="text-right font-mono text-destructive">({formatKES(p.paye)})</TableCell>
                <TableCell className="text-right font-mono text-destructive">({formatKES(p.nhif)})</TableCell>
                <TableCell className="text-right font-mono text-destructive">({formatKES(p.nssf)})</TableCell>
                <TableCell className="text-right font-mono font-bold">{formatKES(p.net)}</TableCell>
                <TableCell>
                  <Badge className={p.status === "Paid" ? "bg-green-100 text-green-700" : p.status === "Approved" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}>{p.status}</Badge>
                </TableCell>
                <TableCell>
                  <DocActions title={`Payslip-${p.id}`} html={payslip(p)} emailTo={p.employee} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card className="mt-4 p-4 bg-blue-50 border-blue-200">
        <div className="text-sm font-semibold text-navy mb-2 flex items-center gap-2"><FileDown className="h-4 w-4" /> KRA / Statutory Returns (demo)</div>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• P9A annual employee tax form — auto-generated per employee</li>
          <li>• PAYE monthly return (P10) — exportable to KRA iTax CSV</li>
          <li>• NHIF & NSSF byproduct returns — exportable to portal format</li>
        </ul>
      </Card>
    </div>
  );
}
