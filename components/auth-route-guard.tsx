"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/lib/auth-context'

interface AuthRouteGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export function AuthRouteGuard({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login' 
}: AuthRouteGuardProps) {
  const { user, loading, isAuthenticated } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !isAuthenticated) {
        router.push(redirectTo)
      } else if (!requireAuth && isAuthenticated) {
        router.push('/dashboard')
      }
    }
  }, [loading, isAuthenticated, requireAuth, redirectTo, router])

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Se não está autenticado e requer autenticação, não renderizar nada
  if (requireAuth && !isAuthenticated) {
    return null
  }

  // Se está autenticado e não deveria estar (página de login), não renderizar nada
  if (!requireAuth && isAuthenticated) {
    return null
  }

  return <>{children}</>
}
