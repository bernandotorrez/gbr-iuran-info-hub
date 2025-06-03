
import {
  Calendar,
  Home,
  Users,
  CreditCard,
  BarChart3,
  FileText,
  LogOut,
  Settings,
  TrendingUp,
  Newspaper,
  ArrowUpDown,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { Link, useLocation } from "react-router-dom"

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Master Data Warga",
    url: "/warga",
    icon: Users,
  },
  {
    title: "Master Tipe Iuran",
    url: "/tipe-iuran",
    icon: CreditCard,
  },
  {
    title: "Input Iuran",
    url: "/input-iuran",
    icon: TrendingUp,
  },
  {
    title: "Output Kas",
    url: "/output-kas",
    icon: ArrowUpDown,
  },
  {
    title: "Laporan Iuran",
    url: "/laporan",
    icon: BarChart3,
  },
  {
    title: "Artikel Berita",
    url: "/artikel",
    icon: Newspaper,
  },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Home className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-sidebar-foreground">SI Iuran GBR</h2>
            <p className="text-sm text-sidebar-foreground/70">Perumahan GBR</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 uppercase tracking-wider text-xs font-medium mb-2">
            Menu Utama
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className={`hover:bg-sidebar-accent hover:text-sidebar-primary transition-colors ${
                      location.pathname === item.url ? 'bg-sidebar-primary text-sidebar-primary-foreground' : ''
                    }`}
                  >
                    <Link to={item.url} className="flex items-center space-x-3 py-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="hover:bg-sidebar-accent">
              <Link to="/settings" className="flex items-center space-x-3 py-3">
                <Settings className="w-5 h-5" />
                <span>Pengaturan</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="hover:bg-destructive">
              <Link to="/logout" className="flex items-center space-x-3 py-3">
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
