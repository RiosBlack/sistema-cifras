import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { ConditionalNavigation } from '@/components/conditional-navigation'
import { AuthProvider } from '@/lib/auth-context'
import { PwaRegister } from '@/components/pwa-register'
import { PwaInstallPrompt } from '@/components/pwa-install-prompt'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sistema de Cifras',
  description: 'Gerenciamento de cifras musicais, transposição e repertórios',
  applicationName: 'Sistema de Cifras',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Cifras',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthProvider>
          <ConditionalNavigation />
          {children}
          <PwaRegister />
          <PwaInstallPrompt />
        </AuthProvider>
      </body>
    </html>
  )
}
