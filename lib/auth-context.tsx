"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: 'USER' | 'ADMIN'
}

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Função para obter cookie
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) {
        const cookieValue = parts.pop()?.split(';').shift()
        return cookieValue ? decodeURIComponent(cookieValue) : null
      }
      return null
    }

    // Verificar primeiro o cookie, depois localStorage como fallback
    const userCookie = getCookie('user-session')
    const userData = localStorage.getItem('user')
    
    console.log('AuthContext - userCookie:', userCookie)
    console.log('AuthContext - userData do localStorage:', userData)
    
    if (userCookie) {
      try {
        const parsedUser = JSON.parse(userCookie)
        console.log('AuthContext - usuário parseado do cookie:', parsedUser)
        setUser(parsedUser)
        // Sincronizar com localStorage
        localStorage.setItem('user', JSON.stringify(parsedUser))
      } catch (error) {
        console.error('Erro ao parsear dados do usuário do cookie:', error)
        // Limpar cookie inválido
        document.cookie = 'user-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      }
    } else if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        console.log('AuthContext - usuário parseado do localStorage:', parsedUser)
        setUser(parsedUser)
        // Sincronizar com cookie
        document.cookie = `user-session=${JSON.stringify(parsedUser)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
      } catch (error) {
        console.error('Erro ao parsear dados do usuário:', error)
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  // Escutar mudanças no localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const userData = localStorage.getItem('user')
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)
        } catch (error) {
          console.error('Erro ao parsear dados do usuário:', error)
          localStorage.removeItem('user')
          setUser(null)
        }
      } else {
        setUser(null)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Escutar mudanças no localStorage da mesma aba
    const interval = setInterval(() => {
      const userData = localStorage.getItem('user')
      if (userData && !user) {
        try {
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)
        } catch (error) {
          console.error('Erro ao parsear dados do usuário:', error)
          localStorage.removeItem('user')
          setUser(null)
        }
      } else if (!userData && user) {
        setUser(null)
      }
    }, 500) // Verificar a cada 500ms

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [user])

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    setUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
