"use client"

import { useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: 'USER' | 'ADMIN'
}

export function useCookieAuth() {
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

    // Verificar se há dados do usuário no cookie
    const userCookie = getCookie('user-session')
    const userData = localStorage.getItem('user')
    
    console.log('useCookieAuth - userCookie:', userCookie)
    console.log('useCookieAuth - userData do localStorage:', userData)
    
    if (userCookie) {
      try {
        const parsedUser = JSON.parse(userCookie)
        console.log('useCookieAuth - usuário parseado do cookie:', parsedUser)
        setUser(parsedUser)
      } catch (error) {
        console.error('Erro ao parsear dados do usuário do cookie:', error)
        // Limpar cookie inválido
        document.cookie = 'user-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      }
    } else if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        console.log('useCookieAuth - usuário parseado do localStorage:', parsedUser)
        setUser(parsedUser)
      } catch (error) {
        console.error('Erro ao parsear dados do usuário do localStorage:', error)
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
        }
      } else if (!userData && user) {
        setUser(null)
      }
    }, 1000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [user])

  return {
    user,
    loading,
    isAuthenticated: !!user
  }
}
