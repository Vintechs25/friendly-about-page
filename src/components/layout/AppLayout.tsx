import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { Toaster } from "@/components/ui/sonner";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b bg-card px-4 sticky top-0 z-30 shadow-sm">
            <SidebarTrigger />
            <TopBar />
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-x-auto">{children}</main>
          <footer className="border-t bg-card px-4 md:px-6 py-3 text-xs text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-2">
            <div>© {new Date().getFullYear()} Travotech Agencies Limited — Nairobi, Kenya</div>
            <div className="flex items-center gap-2">
              <span>Powered by</span>
              <span className="font-semibold text-navy">Vintech Systems and Consulting</span>
              <span className="italic">— "Secure. Host. Empower."</span>
            </div>
          </footer>
        </div>
        <Toaster richColors position="top-right" />
      </div>
    </SidebarProvider>
  );
}