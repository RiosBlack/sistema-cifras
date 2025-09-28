"use client"

import { useRouter } from 'next/navigation'
import { useAuthContext } from './auth-context'

interface User {
  id: string
  email: string
  name: string
  role: 'USER' | 'ADMIN'
}

export function useAuth() {
  const { user, setUser } = useAuthContext()
  const router = useRouter()


  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      if (result.success) {
        console.log('Login bem-sucedido, salvando usuário:', result.user)
        setUser(result.user)
        localStorage.setItem('user', JSON.stringify(result.user))
        
        // Definir cookie de sessão
        document.cookie = `user-session=${JSON.stringify(result.user)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
        
        console.log('Usuário salvo no localStorage e cookie')
        return { success: true }
      } else {
        console.log('Login falhou:', result.error)
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Erro no login:', error)
      return { success: false, error: 'Erro de conexão' }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      })
    } catch (error) {
      console.error('Erro no logout:', error)
    } finally {
      setUser(null)
      localStorage.removeItem('user')
      
      // Remover cookie de sessão
      document.cookie = 'user-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      
      router.push('/')
    }
  }

  return {
    user,
    loading: false, // Loading é gerenciado pelo contexto
    login,
    logout,
    isAuthenticated: !!user
  }
}
