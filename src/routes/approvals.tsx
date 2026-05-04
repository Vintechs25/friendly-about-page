import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatKES, formatDate } from "@/lib/format";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/approvals")({
  component: Approvals,
  head: () => ({ meta: [{ title: "Approvals — Travotech ERP" }] }),
});

type Status = "Pending" | "Approved" | "Rejected";
interface Item {
  id: string;
  type: "Credit Note" | "LPO" | "Discount" | "Customer Credit";
  ref: string;
  requestedBy: string;
  amount: number;
  threshold: string;
  approver: string;
  date: string;
  status: Status;
}

const initial: Item[] = [
  { id: "AP-1", type: "Credit Note", ref: "CN-0007", requestedBy: "Peter Otieno", amount: 48000, threshold: "> KES 25,000 → Branch Manager", approver: "Grace Wanjiku", date: "2026-05-02", status: "Pending" },
  { id: "AP-2", type: "LPO", ref: "LPO-0024", requestedBy: "Susan Njeri", amount: 1240000, threshold: "> KES 500,000 → Super Admin", approver: "James Mwangi", date: "2026-05-02", status: "Pending" },
  { id: "AP-3", type: "Discount", ref: "SALE-0188", requestedBy: "Mary Achieng", amount: 32000, threshold: "> 10% → Branch Manager", approver: "Grace Wanjiku", date: "2026-05-01", status: "Approved" },
  { id: "AP-4", type: "Customer Credit", ref: "CUST-0019", requestedBy: "Peter Otieno", amount: 800000, threshold: "Credit limit > KES 500,000 → Accountant", approver: "Daniel Kiprop", date: "2026-04-30", status: "Approved" },
  { id: "AP-5", type: "Credit Note", ref: "CN-0006", requestedBy: "Peter Otieno", amount: 9500, threshold: "≤ KES 25,000 → Sales Rep auto", approver: "—", date: "2026-04-29", status: "Rejected" },
];

const statusBadge = (s: Status) => {
  if (s === "Pending") return <Badge className="bg-orange-100 text-orange-700"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
  if (s === "Approved") return <Badge className="bg-green-100 text-green-700"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
  return <Badge className="bg-red-100 text-red-700"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
};

function Approvals() {
  const [items, setItems] = useState(initial);
  const setStatus = (id: string, status: Status) => setItems((xs) => xs.map((x) => x.id === id ? { ...x, status } : x));
  const pending = items.filter((i) => i.status === "Pending").length;

  return (
    <div>
      <PageHeader title="Approvals" description={`${pending} pending across credit notes, LPOs, discounts and customer credit limits.`} />
      <Card className="p-4 mb-4 bg-blue-50 border-blue-200">
        <div className="text-sm font-semibold text-navy mb-2">Approval Matrix (demo)</div>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Credit Notes: ≤ 25K auto · 25K–100K Branch Manager · &gt; 100K Super Admin</li>
          <li>• LPOs: ≤ 100K Procurement · 100K–500K Branch Manager · &gt; 500K Super Admin</li>
          <li>• Discounts: ≤ 5% Cashier · 5–10% Sales Rep · &gt; 10% Branch Manager</li>
          <li>• Customer Credit Limit: ≤ 200K Branch Manager · &gt; 500K Accountant + Super Admin</li>
        </ul>
      </Card>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Requested By</TableHead>
              <TableHead>Rule</TableHead>
              <TableHead>Approver</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((i) => (
              <TableRow key={i.id}>
                <TableCell>{i.type}</TableCell>
                <TableCell className="font-mono text-xs">{i.ref}</TableCell>
                <TableCell>{i.requestedBy}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{i.threshold}</TableCell>
                <TableCell>{i.approver}</TableCell>
                <TableCell>{formatDate(i.date)}</TableCell>
                <TableCell className="text-right font-mono">{formatKES(i.amount)}</TableCell>
                <TableCell>{statusBadge(i.status)}</TableCell>
                <TableCell>
                  {i.status === "Pending" && (
                    <div className="flex gap-1">
                      <Button size="sm" className="h-7" onClick={() => setStatus(i.id, "Approved")}>Approve</Button>
                      <Button size="sm" variant="outline" className="h-7" onClick={() => setStatus(i.id, "Rejected")}>Reject</Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
