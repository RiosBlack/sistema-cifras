"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Music, Filter, Edit, Trash2, Eye, Play } from "lucide-react"
import { NOTES } from "@/lib/music-utils"

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

  // Carregar dados da API
  useEffect(() => {
    loadRepertorios()
    loadCifras()
  }, [])

  const loadRepertorios = async () => {
    try {
      const response = await fetch('/api/repertorios?userId=cmg2h8hjz0000xntvzqw0hteh')
      const result = await response.json()
      if (result.success) {
        setRepertorios(result.data)
      }
    } catch (error) {
      console.error('Erro ao carregar repertórios:', error)
    }
  }

  const loadCifras = async () => {
    try {
      const response = await fetch('/api/cifras?userId=cmg2h8hjz0000xntvzqw0hteh')
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
          userId: "cmg2h8hjz0000xntvzqw0hteh"
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

  const filteredRepertorios = repertorios.filter((repertorio) =>
    repertorio.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repertorio.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const renderRepertorioCard = (repertorio: Repertorio) => (
    <Card key={repertorio.id} className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{repertorio.name}</CardTitle>
            {repertorio.description && (
              <p className="text-sm text-muted-foreground">{repertorio.description}</p>
            )}
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {repertorio.cifras.length} cifra{repertorio.cifras.length !== 1 ? 's' : ''}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Criado em {new Date(repertorio.createdAt).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewingRepertorio(repertorio)}
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openEditModal(repertorio)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeletingRepertorio(repertorio)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Repertórios</h1>
          <p className="text-muted-foreground">
            Gerencie suas listas de cifras com tons específicos
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
    </div>
  )
}
