import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Shield, KeyRound, Smartphone, Plug, Mail, MessageSquare, CreditCard } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  component: Settings,
  head: () => ({ meta: [{ title: "Settings — Travotech ERP" }] }),
});

function Settings() {
  const [mfa, setMfa] = useState(true);
  const [sessionMin, setSessionMin] = useState(30);

  return (
    <div>
      <PageHeader title="Settings" description="Company profile, security, and integrations." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base text-navy">Company Profile</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Business Name</Label><Input defaultValue="Travotech Medical Supplies Ltd" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>KRA PIN</Label><Input defaultValue="P051234567X" /></div>
              <div><Label>VAT No.</Label><Input defaultValue="0192834" /></div>
            </div>
            <div><Label>Address</Label><Input defaultValue="Industrial Area, Nairobi" /></div>
            <Button size="sm" onClick={() => toast.success("Company profile saved")}>Save</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base text-navy flex items-center gap-2"><Shield className="h-4 w-4" /> Security & MFA</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between border rounded-md p-3">
              <div className="flex items-center gap-2"><Smartphone className="h-4 w-4 text-primary" />
                <div><div className="font-medium text-sm">Multi-Factor Authentication</div><div className="text-xs text-muted-foreground">Required for all Super Admins</div></div>
              </div>
              <Switch checked={mfa} onCheckedChange={setMfa} />
            </div>
            <div><Label>Session Timeout (minutes)</Label><Input type="number" value={sessionMin} onChange={(e) => setSessionMin(Number(e.target.value))} /></div>
            <div className="flex items-center justify-between border rounded-md p-3">
              <div className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-primary" />
                <div><div className="font-medium text-sm">Password Policy</div><div className="text-xs text-muted-foreground">Min 12 chars · rotate 90d</div></div>
              </div>
              <Badge className="bg-green-100 text-green-700">Enforced</Badge>
            </div>
            <Button size="sm" onClick={() => toast.success("Security settings saved")}>Save</Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base text-navy flex items-center gap-2"><Plug className="h-4 w-4" /> Integrations</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { name: "M-Pesa Daraja", desc: "STK Push & C2B/B2C", icon: CreditCard, status: "Connected" },
              { name: "KRA eTIMS", desc: "Electronic invoice signing", icon: Shield, status: "Connected" },
              { name: "SMTP Email", desc: "Transactional email (sender)", icon: Mail, status: "Connected" },
              { name: "Africa's Talking SMS", desc: "Bulk SMS gateway", icon: MessageSquare, status: "Disconnected" },
            ].map((i) => (
              <div key={i.name} className="border rounded-md p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <i.icon className="h-5 w-5 text-primary" />
                  <div><div className="font-medium text-sm">{i.name}</div><div className="text-xs text-muted-foreground">{i.desc}</div></div>
                </div>
                <Badge className={i.status === "Connected" ? "bg-green-100 text-green-700" : "bg-muted"}>{i.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
