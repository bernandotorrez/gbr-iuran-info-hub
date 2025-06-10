
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Header } from "@/components/Header"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-6 bg-background">
          {children}
        </main>
        
        {/* Footer */}
        <footer className="border-t bg-muted/30 px-4 md:px-6 py-3">
          <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-muted-foreground">
            <div>© 2025 SI Iuran GBR. All rights reserved.</div>
            <div className="mt-1 sm:mt-0">
              Created by: Bernand Dayamuntari Hermawan (Blok C1-5)
            </div>
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  )
}
