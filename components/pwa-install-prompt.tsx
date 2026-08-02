'use client'

import { useEffect, useState } from 'react'
import { Download, Share, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'pwa-install-dismissed'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    nav.standalone === true
  )
}

function isIos(): boolean {
  if (typeof window === 'undefined') return false
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
}

function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(max-width: 767px)').matches || isIos()
}

export function PwaInstallPrompt() {
  const [visible, setVisible] = useState(false)
  const [isIosDevice, setIsIosDevice] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (isStandalone() || !isMobile()) return
    if (localStorage.getItem(STORAGE_KEY) === '1') return

    setIsIosDevice(isIos())
    setVisible(true)

    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall)
  }, [])

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
    dismiss()
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-[60] p-3 sm:hidden">
      <div className="mx-auto max-w-lg rounded-lg border bg-background shadow-lg p-3 flex gap-3 items-start">
        <div className="mt-0.5 text-muted-foreground">
          {isIosDevice ? <Share className="h-5 w-5" /> : <Download className="h-5 w-5" />}
        </div>
        <div className="flex-1 text-sm space-y-1">
          <p className="font-medium">Instale o app Cifras</p>
          {isIosDevice ? (
            <p className="text-muted-foreground text-xs">
              Toque em Compartilhar e depois em &quot;Adicionar à Tela de Início&quot; para abrir sem a barra do navegador.
            </p>
          ) : deferredPrompt ? (
            <p className="text-muted-foreground text-xs">
              Instale na tela inicial para usar como app, sem a barra de endereço.
            </p>
          ) : (
            <p className="text-muted-foreground text-xs">
              No menu do Chrome, escolha &quot;Instalar app&quot; ou &quot;Adicionar à tela inicial&quot;.
            </p>
          )}
          {!isIosDevice && deferredPrompt && (
            <Button size="sm" className="mt-2 h-8" onClick={handleInstall}>
              Instalar
            </Button>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 shrink-0"
          onClick={dismiss}
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
