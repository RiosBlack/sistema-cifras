"use client"

import { usePathname } from "next/navigation"
import { Navigation } from "@/components/navigation"

export function ConditionalNavigation() {
  const pathname = usePathname()
  
  // Não mostrar navegação nas páginas de login e registro
  if (pathname === "/login" || pathname === "/register") {
    return null
  }
  
  return <Navigation />
}
