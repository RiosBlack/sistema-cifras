"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Music, List, Home, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/use-auth"
import { useAuthContext } from "@/lib/auth-context"
import { AuthLoading } from "@/components/auth-loading"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navigation = [
  {
    name: "Cifras",
    href: "/dashboard",
    icon: Music
  },
  {
    name: "Repertórios",
    href: "/repertorio",
    icon: List
  }
]

export function Navigation() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const { user, isAuthenticated, loading } = useAuthContext()
  
  console.log('Navigation - user:', user)
  console.log('Navigation - isAuthenticated:', isAuthenticated)
  console.log('Navigation - loading:', loading)

  // Evitar hidratação incorreta
  if (loading) {
    return <AuthLoading />
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6 max-w-full">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-2">
          <div className="flex items-center space-x-2 sm:space-x-8 min-w-0">
            <div className="flex items-center space-x-2 min-w-0">
              <Music className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
              <span className="text-base sm:text-xl font-bold truncate">Sistema de Cifras</span>
            </div>
            
            <div className="hidden sm:flex space-x-6">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Menu do usuário */}
          {isAuthenticated && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 flex-shrink-0">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline truncate max-w-[150px]">{user.name || user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium truncate">{user.name || 'Usuário'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        {/* Menu mobile */}
        <div className="sm:hidden border-t pt-2 pb-2">
          <div className="flex space-x-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
