import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, ShoppingCart, FileText, Receipt, FileMinus,
  Package, Users, Truck, BarChart3, UserCog, ShieldCheck,
  BookOpen, BookText, Landmark, CheckSquare, Wallet, ShoppingBag,
  Bell, Settings as SettingsIcon,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";

const main = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/pos", label: "POS / Sales", icon: ShoppingCart },
  { to: "/quotations", label: "Quotations", icon: FileText },
  { to: "/invoices", label: "Invoices", icon: Receipt },
  { to: "/credit-notes", label: "Credit Notes", icon: FileMinus },
];
const ops = [
  { to: "/inventory", label: "Inventory", icon: Package },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/suppliers", label: "Suppliers", icon: Truck },
  { to: "/procurement", label: "Procurement / LPO", icon: ShoppingBag },
];
const finance = [
  { to: "/accounts", label: "Chart of Accounts", icon: BookOpen },
  { to: "/ledger", label: "General Ledger", icon: BookText },
  { to: "/bank-rec", label: "Bank Reconciliation", icon: Landmark },
  { to: "/payroll", label: "Payroll & HR", icon: Wallet },
];
const admin = [
  { to: "/approvals", label: "Approvals", icon: CheckSquare },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/users", label: "User Management", icon: UserCog },
  { to: "/audit", label: "Audit Trail", icon: ShieldCheck },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (to: string) => to === "/" ? path === "/" : path.startsWith(to);

  const renderGroup = (label: string, items: typeof main) => (
    <SidebarGroup>
      {!collapsed && <SidebarGroupLabel className="text-sidebar-foreground/60">{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.to}>
              <SidebarMenuButton asChild isActive={isActive(item.to)} tooltip={item.label}>
                <Link to={item.to} className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="h-9 w-9 rounded-md bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold shadow-md shrink-0">
            T
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-semibold text-sidebar-foreground leading-tight truncate">Travotech</div>
              <div className="text-[10px] text-sidebar-foreground/60 leading-tight truncate">Medical ERP</div>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {renderGroup("Sales", main)}
        {renderGroup("Operations", ops)}
        {renderGroup("Finance", finance)}
        {renderGroup("Administration", admin)}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        {!collapsed && (
          <div className="px-2 py-2 text-[10px] text-sidebar-foreground/60 leading-tight">
            Vintech Systems<br />Secure. Host. Empower.
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}