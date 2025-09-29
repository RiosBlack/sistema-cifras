"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Music, Filter, Edit, Trash2, Eye, Play, ChevronUp, ChevronDown, X, Printer } from "lucide-react"
import { NOTES, getSemitonesDifference, transposeLyrics } from "@/lib/music-utils"
import { AuthRouteGuard } from "@/components/auth-route-guard"
import { useAuthContext } from "@/lib/auth-context"

interface Repertorio {
  id: string
  name: string
  description?: string
  createdAt: string
  cifras: Array<{
    id: string
    selectedKey: string
    order: number
    cifra: {
      id: string
      title: string
      artist: string
      currentKey: string
      lyrics: string
    }
  }>
}

interface Cifra {
  id: string
  title: string
  artist: string
  currentKey: string
  lyrics: string
}

export default function RepertorioPage() {
  const { user } = useAuthContext()
  const [repertorios, setRepertorios] = useState<Repertorio[]>([])
  const [cifras, setCifras] = useState<Cifra[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingRepertorio, setEditingRepertorio] = useState<Repertorio | null>(null)
  const [viewingRepertorio, setViewingRepertorio] = useState<Repertorio | null>(null)
  const [deletingRepertorio, setDeletingRepertorio] = useState<Repertorio | null>(null)
  const [newRepertorioName, setNewRepertorioName] = useState("")
  const [newRepertorioDescription, setNewRepertorioDescription] = useState("")
  const [editRepertorioName, setEditRepertorioName] = useState("")
  const [editRepertorioDescription, setEditRepertorioDescription] = useState("")
  const [showAddCifraModal, setShowAddCifraModal] = useState(false)
  const [selectedCifra, setSelectedCifra] = useState<Cifra | null>(null)
  const [selectedKey, setSelectedKey] = useState("")
  const [addingToRepertorio, setAddingToRepertorio] = useState<Repertorio | null>(null)

  // Carregar dados da API
  useEffect(() => {
    if (user?.id) {
      loadRepertorios()
      loadCifras()
    }
  }, [user?.id])

  const loadRepertorios = async () => {
    if (!user?.id) return
    
    try {
      const response = await fetch(`/api/repertorios?userId=${user.id}`)
      const result = await response.json()
      if (result.success) {
        setRepertorios(result.data)
      }
    } catch (error) {
      console.error('Erro ao carregar repertórios:', error)
    }
  }

  const loadCifras = async () => {
    if (!user?.id) return
    
    try {
      const response = await fetch(`/api/cifras?userId=${user.id}`)
      const result = await response.json()
      if (result.success) {
        setCifras(result.data)
      }
    } catch (error) {
      console.error('Erro ao carregar cifras:', error)
    }
  }

  const handleCreateRepertorio = async () => {
    if (!newRepertorioName.trim()) return

    try {
      const response = await fetch('/api/repertorios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newRepertorioName,
          description: newRepertorioDescription,
          userId: user?.id
        }),
      })

      const result = await response.json()
      if (result.success) {
        setRepertorios((prev) => [result.data, ...prev])
        setNewRepertorioName("")
        setNewRepertorioDescription("")
        setShowCreateModal(false)
      }
    } catch (error) {
      console.error('Erro ao criar repertório:', error)
    }
  }

  const handleDeleteRepertorio = async () => {
    if (!deletingRepertorio) return

    try {
      const response = await fetch(`/api/repertorios/${deletingRepertorio.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()
      if (result.success) {
        setRepertorios((prev) => prev.filter((r) => r.id !== deletingRepertorio.id))
        setDeletingRepertorio(null)
      }
    } catch (error) {
      console.error('Erro ao deletar repertório:', error)
    }
  }

  const handleEditRepertorio = async () => {
    if (!editingRepertorio || !editRepertorioName.trim()) return

    try {
      const response = await fetch(`/api/repertorios/${editingRepertorio.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editRepertorioName,
          description: editRepertorioDescription,
        }),
      })

      const result = await response.json()
      if (result.success) {
        setRepertorios((prev) => 
          prev.map((r) => r.id === editingRepertorio.id ? result.data : r)
        )
        setEditingRepertorio(null)
        setEditRepertorioName("")
        setEditRepertorioDescription("")
      }
    } catch (error) {
      console.error('Erro ao editar repertório:', error)
    }
  }

  const openEditModal = (repertorio: Repertorio) => {
    setEditingRepertorio(repertorio)
    setEditRepertorioName(repertorio.name)
    setEditRepertorioDescription(repertorio.description || "")
  }

  const openAddCifraModal = (repertorio: Repertorio) => {
    setAddingToRepertorio(repertorio)
    setShowAddCifraModal(true)
    setSelectedCifra(null)
    setSelectedKey("")
  }

  const handleAddCifraToRepertorio = async () => {
    if (!addingToRepertorio || !selectedCifra || !selectedKey) return

    try {
      const response = await fetch(`/api/repertorios/${addingToRepertorio.id}/cifras`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cifraId: selectedCifra.id,
          selectedKey: selectedKey,
        }),
      })

      const result = await response.json()
      if (result.success) {
        // Recarregar repertórios para mostrar a cifra adicionada
        await loadRepertorios()
        setShowAddCifraModal(false)
        setAddingToRepertorio(null)
        setSelectedCifra(null)
        setSelectedKey("")
      }
    } catch (error) {
      console.error('Erro ao adicionar cifra ao repertório:', error)
    }
  }

  const handleMoveCifra = async (repertorioId: string, cifraId: string, direction: 'up' | 'down') => {
    try {
      console.log('=== MOVENDO CIFRA ===')
      console.log('repertorioId:', repertorioId)
      console.log('cifraId:', cifraId)
      console.log('direction:', direction)
      
      const response = await fetch(`/api/repertorios/${repertorioId}/cifras/${cifraId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ direction })
      })

      console.log('Status da resposta:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Erro HTTP:', response.status, errorText)
        
        // Se for erro 400 (posição inválida), não mostrar erro no console
        if (response.status === 400) {
          console.log('Movimento não permitido - posição inválida')
          return
        }
        return
      }

      const result = await response.json()
      console.log('Resultado da API:', result)
      
      if (result.success) {
        // Atualizar o estado local imediatamente
        if (viewingRepertorio) {
          const updatedRepertorio = { ...viewingRepertorio }
          const currentIndex = updatedRepertorio.cifras.findIndex(c => c.cifra.id === cifraId)
          const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
          
          if (newIndex >= 0 && newIndex < updatedRepertorio.cifras.length) {
            // Trocar as cifras de posição no array
            const cifras = [...updatedRepertorio.cifras]
            const temp = cifras[currentIndex]
            cifras[currentIndex] = cifras[newIndex]
            cifras[newIndex] = temp
            
            setViewingRepertorio({
              ...updatedRepertorio,
              cifras
            })
          }
        }
        
        await loadRepertorios()
        console.log('Cifra movida com sucesso')
      } else {
        console.error('Erro na resposta da API:', result)
      }
    } catch (error) {
      console.error('Erro ao mover cifra:', error)
    }
  }

  const handleRemoveCifraFromRepertorio = async (repertorioId: string, cifraId: string) => {
    try {
      console.log('=== REMOVENDO CIFRA ===')
      console.log('repertorioId:', repertorioId)
      console.log('cifraId:', cifraId)
      console.log('Tipo repertorioId:', typeof repertorioId)
      console.log('Tipo cifraId:', typeof cifraId)
      
      const url = `/api/repertorios/${repertorioId}/cifras/${cifraId}`
      console.log('URL da requisição:', url)
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('Status da resposta:', response.status)
      console.log('Response ok:', response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Erro HTTP:', response.status, errorText)
        return
      }

      const result = await response.json()
      console.log('Resultado da API:', result)
      
      if (result.success) {
        // Atualizar o estado local imediatamente
        if (viewingRepertorio) {
          const updatedRepertorio = { ...viewingRepertorio }
          updatedRepertorio.cifras = updatedRepertorio.cifras.filter(c => c.cifra.id !== cifraId)
          setViewingRepertorio(updatedRepertorio)
        }
        
        await loadRepertorios()
        console.log('Cifra removida com sucesso')
      } else {
        console.error('Erro na resposta da API:', result)
      }
    } catch (error) {
      console.error('Erro ao remover cifra do repertório:', error)
    }
  }

  const handlePrintRepertorio = () => {
    if (!viewingRepertorio) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${viewingRepertorio.name}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .repertorio-title {
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .repertorio-description {
              font-size: 16px;
              color: #666;
            }
            .cifra {
              page-break-inside: avoid;
              margin-bottom: 40px;
              border: 1px solid #ddd;
              padding: 20px;
              border-radius: 8px;
            }
            .cifra-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 15px;
              padding-bottom: 10px;
              border-bottom: 1px solid #eee;
            }
            .cifra-title {
              font-size: 20px;
              font-weight: bold;
            }
            .cifra-artist {
              font-size: 16px;
              color: #666;
            }
            .cifra-info {
              display: flex;
              gap: 15px;
              font-size: 14px;
              color: #666;
            }
            .cifra-content {
              font-family: 'Courier New', monospace;
              font-size: 14px;
              white-space: pre-wrap;
              line-height: 1.8;
            }
            .chord {
              background-color: #f0f0f0;
              padding: 2px 4px;
              border-radius: 3px;
              font-weight: bold;
            }
            .order {
              font-size: 14px;
              color: #999;
            }
            @media print {
              body { margin: 0; }
              .cifra { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="repertorio-title">${viewingRepertorio.name}</div>
            ${viewingRepertorio.description ? `<div class="repertorio-description">${viewingRepertorio.description}</div>` : ''}
          </div>
          
          ${viewingRepertorio.cifras.map((repertorioCifra, index) => {
            const cifra = repertorioCifra.cifra
            const finalTransposition = getSemitonesDifference(cifra.currentKey, repertorioCifra.selectedKey)
            const transposedLyrics = finalTransposition !== 0 
              ? transposeLyrics(cifra.lyrics, finalTransposition)
              : cifra.lyrics

            return `
              <div class="cifra">
                <div class="cifra-header">
                  <div>
                    <div class="cifra-title">${cifra.title}</div>
                    <div class="cifra-artist">${cifra.artist}</div>
                  </div>
                  <div class="order">#${index + 1}</div>
                </div>
                
                <div class="cifra-info">
                  <span><strong>Tom Original:</strong> ${cifra.currentKey}</span>
                  <span><strong>Tom no Repertório:</strong> ${repertorioCifra.selectedKey}</span>
                  ${finalTransposition !== 0 ? `<span><strong>Transposição:</strong> ${finalTransposition > 0 ? '+' : ''}${finalTransposition}</span>` : ''}
                </div>
                
                <div class="cifra-content">${transposedLyrics.replace(/\[([^\]]+)\]/g, '<span class="chord">[$1]</span>')}</div>
              </div>
            `
          }).join('')}
        </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  const filteredRepertorios = repertorios.filter((repertorio) =>
    repertorio.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repertorio.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const renderRepertorioCard = (repertorio: Repertorio) => (
    <Card key={repertorio.id} className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0 space-y-1">
            <CardTitle className="text-base sm:text-lg truncate">{repertorio.name}</CardTitle>
            {repertorio.description && (
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{repertorio.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {repertorio.cifras.length} cifra{repertorio.cifras.length !== 1 ? 's' : ''}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Criado em {new Date(repertorio.createdAt).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewingRepertorio(repertorio)}
              className="h-8 w-8 p-0"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openAddCifraModal(repertorio)}
              title="Adicionar cifra"
              className="h-8 w-8 p-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openEditModal(repertorio)}
              className="h-8 w-8 p-0"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeletingRepertorio(repertorio)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  )

  return (
    <AuthRouteGuard requireAuth={true}>
      <div className="container mx-auto px-4 py-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Repertórios</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gerencie suas listas de cifras com tons específicos
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Novo Repertório
        </Button>
      </div>

      {/* Busca */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar repertórios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Lista de repertórios */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredRepertorios.map(renderRepertorioCard)}
      </div>

      {filteredRepertorios.length === 0 && (
        <div className="text-center py-12">
          <Music className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum repertório encontrado</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "Tente ajustar sua busca" : "Crie seu primeiro repertório"}
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Repertório
            </Button>
          )}
        </div>
      )}

      {/* Modal de criação */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Novo Repertório</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome</label>
              <Input
                value={newRepertorioName}
                onChange={(e) => setNewRepertorioName(e.target.value)}
                placeholder="Ex: Repertório Gospel"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Descrição (opcional)</label>
              <Input
                value={newRepertorioDescription}
                onChange={(e) => setNewRepertorioDescription(e.target.value)}
                placeholder="Ex: Músicas para culto dominical"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateRepertorio}>
                Criar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmação de exclusão */}
      <Dialog open={!!deletingRepertorio} onOpenChange={() => setDeletingRepertorio(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Tem certeza que deseja excluir o repertório <strong>"{deletingRepertorio?.name}"</strong>?
            </p>
            <p className="text-xs text-destructive">
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDeletingRepertorio(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteRepertorio}
              >
                Excluir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de edição */}
      <Dialog open={!!editingRepertorio} onOpenChange={() => setEditingRepertorio(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Repertório</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome</label>
              <Input
                value={editRepertorioName}
                onChange={(e) => setEditRepertorioName(e.target.value)}
                placeholder="Ex: Repertório Gospel"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Descrição (opcional)</label>
              <Input
                value={editRepertorioDescription}
                onChange={(e) => setEditRepertorioDescription(e.target.value)}
                placeholder="Ex: Músicas para culto dominical"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setEditingRepertorio(null)}
              >
                Cancelar
              </Button>
              <Button onClick={handleEditRepertorio}>
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de adicionar cifra */}
      <Dialog open={showAddCifraModal} onOpenChange={setShowAddCifraModal}>
        <DialogContent className="max-w-2xl mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              Adicionar Cifra ao Repertório
              {addingToRepertorio && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  - {addingToRepertorio.name}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Selecionar Cifra</label>
              <div className="grid gap-2 max-h-60 overflow-y-auto border rounded-md p-2">
                {cifras.map((cifra) => (
                  <div
                    key={cifra.id}
                    className={`p-2 sm:p-3 rounded-md border cursor-pointer transition-colors ${
                      selectedCifra?.id === cifra.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => {
                      setSelectedCifra(cifra)
                      setSelectedKey(cifra.currentKey)
                    }}
                  >
                    <div className="font-medium text-sm sm:text-base truncate">{cifra.title}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground truncate">{cifra.artist}</div>
                    <div className="text-xs text-muted-foreground">
                      Tom original: {cifra.currentKey}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedCifra && (
              <div>
                <label className="text-sm font-medium">Tom para o Repertório</label>
                <Select value={selectedKey} onValueChange={setSelectedKey}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tom" />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTES.map((note) => (
                      <SelectItem key={note} value={note}>
                        {note}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Tom original: {selectedCifra.currentKey}
                  {selectedKey !== selectedCifra.currentKey && (
                    <span className="ml-2 text-primary">
                      (transposição: {getSemitonesDifference(selectedCifra.currentKey, selectedKey) > 0 ? '+' : ''}{getSemitonesDifference(selectedCifra.currentKey, selectedKey)})
                    </span>
                  )}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowAddCifraModal(false)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddCifraToRepertorio}
                disabled={!selectedCifra || !selectedKey}
                className="w-full sm:w-auto"
              >
                Adicionar Cifra
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de visualização de repertório */}
      <Dialog open={!!viewingRepertorio} onOpenChange={() => setViewingRepertorio(null)}>
        <DialogContent className="max-w-[90%] sm:max-w-4xl max-h-[90vh] overflow-y-auto mx-auto my-auto">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold">{viewingRepertorio?.name}</h2>
                {viewingRepertorio?.description && (
                  <p className="text-sm sm:text-base text-muted-foreground">{viewingRepertorio.description}</p>
                )}
                <div className="flex justify-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {viewingRepertorio?.cifras.length} cifra{viewingRepertorio?.cifras.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Botões de ação */}
          <div className="flex justify-center gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintRepertorio}
              className="flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Imprimir Repertório
            </Button>
          </div>

          {/* Lista de cifras do repertório */}
          <div className="space-y-4">
            {viewingRepertorio?.cifras.map((repertorioCifra, index) => {
              const cifra = repertorioCifra.cifra
              const finalTransposition = getSemitonesDifference(cifra.currentKey, repertorioCifra.selectedKey)
              const transposedLyrics = finalTransposition !== 0 
                ? transposeLyrics(cifra.lyrics, finalTransposition)
                : cifra.lyrics

              return (
                <div key={repertorioCifra.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{cifra.title}</h3>
                      <p className="text-muted-foreground">{cifra.artist}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          Tom original: {cifra.currentKey}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Tom repertório: {repertorioCifra.selectedKey}
                        </Badge>
                        {finalTransposition !== 0 && (
                          <Badge variant="secondary" className="text-xs">
                            Transposição: {finalTransposition > 0 ? '+' : ''}{finalTransposition}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-muted-foreground">
                        #{index + 1}
                      </div>
                    </div>
                  </div>
                  
                  <div className="whitespace-pre-wrap font-mono text-base leading-relaxed border rounded-lg p-4 bg-muted/20 font-bold text-orange-500">
                    {transposedLyrics.split(/(\[[^\]]+\]|^[^:]+:)/gm).map((part, partIndex) => {
                      if (part.match(/^\[[^\]]+\]$/)) {
                        return (
                          <span key={partIndex} className="text-primary font-bold bg-primary/10 px-1 rounded">
                            {part.slice(1, -1)}
                          </span>
                        )
                      }
                      if (part.match(/^[^:]+:$/)) {
                        return (
                          <span key={partIndex} className="text-black font-normal">
                            {part}
                          </span>
                        )
                      }
                      return part
                    })}
                  </div>
                  
                  {/* Controles simples */}
                  <div className="flex flex-wrap justify-end gap-2 mt-3 pt-3 border-t">
                    <button
                      onClick={() => {
                        console.log('Mover para cima:', { repertorioId: viewingRepertorio?.id, cifraId: cifra.id, index })
                        if (viewingRepertorio && index > 0) {
                          handleMoveCifra(viewingRepertorio.id, cifra.id, 'up')
                        } else {
                          console.log('Não é possível subir - já está na primeira posição')
                        }
                      }}
                      disabled={index === 0}
                      className="px-2 sm:px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ↑ Subir
                    </button>
                    <button
                      onClick={() => {
                        console.log('Mover para baixo:', { repertorioId: viewingRepertorio?.id, cifraId: cifra.id, index })
                        if (viewingRepertorio && index < viewingRepertorio.cifras.length - 1) {
                          handleMoveCifra(viewingRepertorio.id, cifra.id, 'down')
                        } else {
                          console.log('Não é possível descer - já está na última posição')
                        }
                      }}
                      disabled={index === viewingRepertorio!.cifras.length - 1}
                      className="px-2 sm:px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ↓ Descer
                    </button>
                    <button
                      onClick={() => {
                        console.log('Remover cifra:', { repertorioId: viewingRepertorio?.id, cifraId: cifra.id })
                        if (viewingRepertorio) {
                          handleRemoveCifraFromRepertorio(viewingRepertorio.id, cifra.id)
                        }
                      }}
                      className="px-2 sm:px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      ✕ Remover
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {viewingRepertorio?.cifras.length === 0 && (
            <div className="text-center py-8">
              <Music className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma cifra no repertório</h3>
              <p className="text-muted-foreground">
                Adicione cifras usando o botão + no card do repertório
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </AuthRouteGuard>
  )
}
