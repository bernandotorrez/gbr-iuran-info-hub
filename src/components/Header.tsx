
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "./ThemeToggle"
import { Bell, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

export function Header() {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    toast.success('Berhasil logout');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 md:h-16 items-center justify-between px-3 md:px-4">
        <div className="flex items-center space-x-2 md:space-x-4">
          <SidebarTrigger className="text-foreground" />
          <div className="hidden sm:block">
            <h1 className="text-base md:text-lg font-semibold">Sistem Informasi Iuran GBR</h1>
            <p className="text-xs md:text-sm text-muted-foreground">Selamat datang di dashboard</p>
          </div>
          <div className="block sm:hidden">
            <h1 className="text-sm font-semibold">SI Iuran GBR</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-4">
          <Button variant="outline" size="icon" className="h-8 w-8 md:h-10 md:w-10">
            <Bell className="h-3 w-3 md:h-4 md:w-4" />
          </Button>
          
          <ThemeToggle />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8 md:h-10 md:w-10">
                <User className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background border w-48">
              <DropdownMenuItem className="cursor-default">
                <User className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Profile</span>
                  <span className="text-xs text-muted-foreground">{user?.phone || 'User'}</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
