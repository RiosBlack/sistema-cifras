"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirecionar para a página de login
    router.replace("/login")
  }, [router])

  // Mostrar loading enquanto redireciona
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-black/5">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecionando para o login...</p>
      </div>
    </div>
  )
}