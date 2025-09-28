"use client"

import { Music, List } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

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

export function AuthLoading() {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <Music className="h-6 w-6" />
              <span className="text-xl font-bold">Sistema de Cifras</span>
            </div>
            
            <div className="flex space-x-6">
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
          
          <div className="animate-pulse bg-muted h-8 w-24 rounded"></div>
        </div>
      </div>
    </nav>
  )
}
