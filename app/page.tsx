"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Music, Guitar, Search, Tags, RotateCcw, Smartphone } from "lucide-react"
import { useEffect } from "react"

export default function LandingPage() {
useEffect(() => {
  window.location.replace("/login")
}, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-black/5">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Music className="w-8 h-8 text-purple-600" />
            <span className="text-xl font-bold">CifrasApp</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Cadastrar</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-black bg-clip-text text-transparent">
            Organize suas cifras como nunca antes
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A plataforma definitiva para músicos organizarem, transporem e gerenciarem suas cifras favoritas. Com
            transposição automática e calculadora de capotraste integrada.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg px-8">
              <Link href="/register">Começar Gratuitamente</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 bg-transparent">
              <Link href="/dashboard">Ver Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tudo que você precisa para suas cifras</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Funcionalidades pensadas especialmente para músicos que querem organização e praticidade
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-purple-200 transition-colors">
              <CardHeader>
                <RotateCcw className="w-12 h-12 text-purple-600 mb-4" />
                <CardTitle>Transposição Automática</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Mude o tom de qualquer cifra instantaneamente. Todos os acordes são atualizados automaticamente.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-purple-200 transition-colors">
              <CardHeader>
                <Guitar className="w-12 h-12 text-purple-600 mb-4" />
                <CardTitle>Calculadora de Capotraste</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Sistema inteligente que sugere a melhor posição do capotraste para facilitar a execução.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-purple-200 transition-colors">
              <CardHeader>
                <Tags className="w-12 h-12 text-purple-600 mb-4" />
                <CardTitle>Organização Inteligente</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Crie tags personalizadas e organize suas cifras por gênero, dificuldade, artista e muito mais.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-purple-200 transition-colors">
              <CardHeader>
                <Search className="w-12 h-12 text-purple-600 mb-4" />
                <CardTitle>Busca Avançada</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Encontre rapidamente qualquer cifra por título, artista, tom ou tags. Filtros combinados inclusos.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-purple-200 transition-colors">
              <CardHeader>
                <Music className="w-12 h-12 text-purple-600 mb-4" />
                <CardTitle>Editor Intuitivo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Seletor visual de acordes, importação do CifraClub e editor com preview em tempo real.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-purple-200 transition-colors">
              <CardHeader>
                <Smartphone className="w-12 h-12 text-purple-600 mb-4" />
                <CardTitle>100% Responsivo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Acesse suas cifras em qualquer dispositivo. Interface otimizada para mobile, tablet e desktop.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-50 to-purple-100">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Veja como é simples</h2>
            <p className="text-xl text-muted-foreground">Interface intuitiva que qualquer músico pode usar</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Imagine - John Lennon</CardTitle>
                    <p className="opacity-90">Tom: C | Capo: 3ª casa</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">Rock</Badge>
                    <Badge variant="secondary">Clássico</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="font-mono text-sm leading-relaxed bg-muted/30 p-4 rounded-lg">
                  <span className="text-purple-600 font-bold bg-purple-100 px-1 rounded">[C]</span>Imagine there's no{" "}
                  <span className="text-purple-600 font-bold bg-purple-100 px-1 rounded">[F]</span>heaven
                  <br />
                  <span className="text-purple-600 font-bold bg-purple-100 px-1 rounded">[C]</span>It's easy if you{" "}
                  <span className="text-purple-600 font-bold bg-purple-100 px-1 rounded">[F]</span>try
                  <br />
                  <span className="text-purple-600 font-bold bg-purple-100 px-1 rounded">[C]</span>No hell be
                  <span className="text-purple-600 font-bold bg-purple-100 px-1 rounded">[F]</span>low us
                  <br />
                  <span className="text-purple-600 font-bold bg-purple-100 px-1 rounded">[C]</span>Above us only{" "}
                  <span className="text-purple-600 font-bold bg-purple-100 px-1 rounded">[F]</span>sky
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-purple-800 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Pronto para organizar suas cifras?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de músicos que já descobriram uma forma melhor de gerenciar suas cifras.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild className="text-lg px-8">
              <Link href="/register">Criar Conta Gratuita</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="text-lg px-8 border-white text-white hover:bg-white hover:text-purple-600 bg-transparent"
            >
              <Link href="/dashboard">Explorar Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Music className="w-6 h-6 text-purple-400" />
              <span className="text-lg font-bold">CifrasApp</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-muted-foreground">© 2024 CifrasApp. Feito com ♪ para músicos.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
