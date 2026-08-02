'use client'

import { useEffect } from 'react'

export function PwaRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    // Registrar em produção; em localhost também (útil para testar PWA com HTTPS/túnel)
    const register = async () => {
      try {
        await navigator.serviceWorker.register('/sw.js', { scope: '/' })
      } catch (err) {
        console.warn('Falha ao registrar service worker:', err)
      }
    }

    register()
  }, [])

  return null
}
