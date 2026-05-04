import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DataTable, type Column } from "@/components/DataTable";
import { useStore } from "@/lib/store";
import { Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import type { User, Role } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ROLES: Role[] = ["Super Admin", "Branch Manager", "Sales Rep", "Cashier", "Accountant", "Procurement Officer", "Auditor"];

const PERMISSIONS: Record<Role, string[]> = {
  "Super Admin": ["All actions", "User management", "All approvals", "Financial reports"],
  "Branch Manager": ["Approve credit notes", "Approve credit limits", "View financial reports", "All sales operations"],
  "Sales Rep": ["Create sales", "Create quotations", "Create credit notes (draft)"],
  "Cashier": ["POS operations", "Record payments"],
  "Accountant": ["Approve credit notes", "View financial reports", "Record payments"],
  "Procurement Officer": ["Manage suppliers", "Create LPOs", "Receive GRN"],
  "Auditor": ["Read-only access", "View audit trail", "View financial reports"],
};

export const Route = createFileRoute("/users")({
  component: Users,
  head: () => ({ meta: [{ title: "User Management — Travotech ERP" }] }),
});

function Users() {
  const { users, addUser, toggleUserActive } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "Sales Rep" as Role, branch: "Nairobi Branch", active: true });

  const submit = () => {
    if (!form.name || !form.email) return toast.error("Name and email required");
    addUser(form);
    setOpen(false);
    toast.success("User created");
  };

  const cols: Column<User>[] = [
    { key: "id", header: "ID", cell: (u) => <span className="font-mono text-xs text-navy">{u.id}</span> },
    { key: "name", header: "Name", cell: (u) => (<div><div className="font-medium">{u.name}</div><div className="text-xs text-muted-foreground">{u.email}</div></div>) },
    { key: "phone", header: "Phone", cell: (u) => u.phone },
    { key: "role", header: "Role", cell: (u) => <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20 font-medium">{u.role}</span> },
    { key: "branch", header: "Branch", cell: (u) => u.branch },
    { key: "active", header: "Active", cell: (u) => <Switch checked={u.active} onCheckedChange={() => toggleUserActive(u.id)} /> },
  ];

  return (
    <div>
      <PageHeader
        title="User Management"
        description="Roles & permissions across Travotech."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> New User</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New User</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div><Label>Phone</Label><Input value={form.phone} placeholder="07XXXXXXXX" onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div><Label>Role</Label>
                  <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Role })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Branch</Label><Input value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} /></div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit}>Create</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <DataTable columns={cols} rows={users} />

      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base text-navy flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Roles & Permissions</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {ROLES.map((r) => (
              <div key={r} className="border rounded-md p-3 bg-card">
                <div className="font-semibold text-navy">{r}</div>
                <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                  {PERMISSIONS[r].map((p) => <li key={p}>• {p}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}