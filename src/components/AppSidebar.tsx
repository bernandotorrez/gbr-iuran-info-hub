
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
  UserCheck,
  BookOpen,
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
import { useAuth } from "@/contexts/AuthContext"
import { useUserRole } from "@/hooks/useUserRole"
import { toast } from "sonner"

const menuItems = [
  {
    title: "Dashboard",
    url: "/cms",
    icon: Home,
    roles: ['admin', 'warga', 'security']
  },
  {
    title: "Master Data Warga",
    url: "/cms/warga",
    icon: Users,
    roles: ['admin', 'warga', 'security']
  },
  {
    title: "Master Tipe Iuran",
    url: "/cms/tipe-iuran",
    icon: CreditCard,
    roles: ['admin', 'warga', 'security']
  },
  {
    title: "Master Kategori Kas",
    url: "/cms/master-kategori-kas",
    icon: Settings,
    roles: ['admin', 'warga', 'security']
  },
  {
    title: "Input Iuran",
    url: "/cms/input-iuran",
    icon: TrendingUp,
    roles: ['admin', 'warga', 'security']
  },
  {
    title: "Output Kas",
    url: "/cms/output-kas",
    icon: ArrowUpDown,
    roles: ['admin', 'warga', 'security']
  },
  {
    title: "Laporan Iuran",
    url: "/cms/laporan",
    icon: BarChart3,
    roles: ['admin', 'warga', 'security']
  },
  {
    title: "Artikel Berita",
    url: "/cms/artikel",
    icon: Newspaper,
    roles: ['admin', 'warga', 'security']
  },
  {
    title: "Buku Tamu",
    url: "/cms/buku-tamu",
    icon: BookOpen,
    roles: ['admin', 'security']
  },
  {
    title: "Struktur Pengurus",
    url: "/cms/struktur-pengurus",
    icon: UserCheck,
    roles: ['admin', 'warga', 'security']
  },
]

export function AppSidebar() {
  const location = useLocation();
  const { signOut } = useAuth();
  const { userProfile } = useUserRole();

  const handleLogout = async () => {
    await signOut();
    toast.success('Berhasil logout');
  };

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => {
    if (!userProfile?.role) return true; // Show all if role not loaded yet
    return item.roles.includes(userProfile.role);
  });

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-4 md:p-6">
        <div className="flex items-center space-x-2 md:space-x-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-lg flex items-center justify-center">
            <Home className="w-4 h-4 md:w-6 md:h-6 text-white" />
          </div>
          <div className="hidden md:block">
            <h2 className="text-lg font-semibold text-sidebar-foreground">SI Iuran GBR</h2>
            <p className="text-sm text-sidebar-foreground/70">Perumahan GBR</p>
          </div>
          <div className="block md:hidden">
            <h2 className="text-sm font-semibold text-sidebar-foreground">SI Iuran</h2>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 uppercase tracking-wider text-xs font-medium mb-2 hidden md:block">
            Menu Utama
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className={`hover:bg-sidebar-accent hover:text-sidebar-primary transition-colors ${
                      location.pathname === item.url ? 'bg-sidebar-primary text-sidebar-primary-foreground' : ''
                    }`}
                  >
                    <Link to={item.url} className="flex items-center space-x-2 md:space-x-3 py-2 md:py-3">
                      <item.icon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                      <span className="font-medium text-xs md:text-sm truncate">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-3 md:p-4 border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="hover:bg-sidebar-accent">
              <Link to="/cms/settings" className="flex items-center space-x-2 md:space-x-3 py-2 md:py-3">
                <Settings className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-xs md:text-sm">Pengaturan</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout}
              className="hover:bg-destructive cursor-pointer w-full flex items-center space-x-2 md:space-x-3 py-2 md:py-3"
            >
              <LogOut className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-xs md:text-sm">Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
