"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CifraEditor } from "@/components/cifras/cifra-editor"
import { transposeLyrics, getSemitonesDifference, NOTES } from "@/lib/music-utils"
import { Plus, Search, Music, Filter, Edit, Trash2, Eye, Minus, Printer } from "lucide-react"

interface Cifra {
  id: string
  title: string
  artist: string
  originalKey: string
  currentKey: string
  capoPosition: number
  lyrics: string
  notes?: string
  tags: Array<{
    cifraId: string
    tagId: string
    tag: {
      id: string
      name: string
      color: string
    }
  }>
  createdAt: string
}

interface Tag {
  id: string
  name: string
  color: string
}

export default function Dashboard() {
  const [cifras, setCifras] = useState<Cifra[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showEditor, setShowEditor] = useState(false)
  const [editingCifra, setEditingCifra] = useState<Cifra | null>(null)
  const [viewingCifra, setViewingCifra] = useState<Cifra | null>(null)
  const [deletingCifra, setDeletingCifra] = useState<Cifra | null>(null)
  const [transpositionOffset, setTranspositionOffset] = useState(0)

  // Carregar dados da API
  useEffect(() => {
    loadCifras()
    loadTags()
  }, [])

  // Resetar transposição quando abrir uma nova cifra
  useEffect(() => {
    if (viewingCifra) {
      setTranspositionOffset(0)
    }
  }, [viewingCifra])

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

  const loadTags = async () => {
    try {
      const response = await fetch('/api/tags?userId=cmg2h8hjz0000xntvzqw0hteh')
      const result = await response.json()
      
      if (result.success) {
        setTags(result.data)
      }
    } catch (error) {
      console.error('Erro ao carregar tags:', error)
    }
  }

  const filteredCifras = cifras.filter((cifra) => {
    const matchesSearch =
      cifra.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cifra.artist.toLowerCase().includes(searchTerm.toLowerCase())

    const cifraTagNames = cifra.tags.map(t => t.tag.name)
    const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => cifraTagNames.includes(tag))

    return matchesSearch && matchesTags
  })

  const handleSaveCifra = async (data: any) => {
    try {
      
      const userId = "cmg2h8hjz0000xntvzqw0hteh" // ID do usuário teste@exemplo.com
      
      if (editingCifra) {
        
        const requestData = {
          ...data,
          userId
        }
        
        // Atualizar cifra existente
        const response = await fetch(`/api/cifras/${editingCifra.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        })

        
        if (!response.ok) {
          console.error('Erro HTTP:', response.status, response.statusText)
          const errorText = await response.text()
          console.error('Conteúdo do erro:', errorText)
          return
        }
        
        let result
        try {
          result = await response.json()
        } catch (jsonError) {
          console.error('Erro ao fazer parse do JSON:', jsonError)
          const responseText = await response.text()
          console.error('Resposta como texto:', responseText)
          return
        }
        
        if (result && result.success) {
          setCifras((prev) => prev.map((c) => (c.id === editingCifra.id ? result.data : c)))
          // Recarregar a lista para garantir que está atualizada
          await loadCifras()
        } else {
          console.error('Erro na resposta da API:', result)
        }
      } else {
        // Criar nova cifra
        const response = await fetch('/api/cifras', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...data,
            userId
          }),
        })

        const result = await response.json()
        
        if (result.success) {
          setCifras((prev) => [result.data, ...prev])
        }
      }

      setShowEditor(false)
      setEditingCifra(null)
    } catch (error) {
      console.error('Erro ao salvar cifra:', error)
    }
  }

  const handleDeleteCifra = (cifra: Cifra) => {
    setDeletingCifra(cifra)
  }

  const confirmDeleteCifra = async () => {
    if (!deletingCifra) return

    try {
      const response = await fetch(`/api/cifras/${deletingCifra.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()
      
      if (result.success) {
        setCifras((prev) => prev.filter((c) => c.id !== deletingCifra.id))
      }
    } catch (error) {
      console.error('Erro ao deletar cifra:', error)
    } finally {
      setDeletingCifra(null)
    }
  }

  const getCurrentKey = (originalKey: string, offset: number) => {
    if (offset === 0) return originalKey
    
    const originalIndex = NOTES.indexOf(originalKey)
    if (originalIndex === -1) return originalKey
    
    const newIndex = (originalIndex + offset + 12) % 12
    return NOTES[newIndex]
  }

  const handlePrintCifra = (cifra: Cifra) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const currentKey = getCurrentKey(cifra.originalKey, transpositionOffset)
    const transposedLyrics = transpositionOffset !== 0 
      ? transposeLyrics(cifra.lyrics, transpositionOffset)
      : cifra.lyrics

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${cifra.title} - ${cifra.artist}</title>
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
            .cifra-title {
              font-size: 32px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .cifra-artist {
              font-size: 20px;
              color: #666;
              margin-bottom: 15px;
            }
            .cifra-info {
              display: flex;
              justify-content: center;
              gap: 30px;
              font-size: 16px;
              color: #666;
            }
            .cifra-content {
              font-family: 'Courier New', monospace;
              font-size: 16px;
              white-space: pre-wrap;
              line-height: 2;
              text-align: left;
            }
            .chord {
              background-color: #f0f0f0;
              padding: 3px 6px;
              border-radius: 4px;
              font-weight: bold;
            }
            .notes {
              background-color: #f8f9fa;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 20px;
              border-left: 4px solid #007bff;
            }
            .notes-title {
              font-weight: bold;
              margin-bottom: 10px;
              color: #007bff;
            }
            .tags {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
              margin-top: 20px;
              justify-content: center;
            }
            .tag {
              background-color: #e9ecef;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 14px;
              color: #495057;
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="cifra-title">${cifra.title}</div>
            <div class="cifra-artist">${cifra.artist}</div>
            <div class="cifra-info">
              <span><strong>Tom Original:</strong> ${cifra.originalKey}</span>
              <span><strong>Tom Atual:</strong> ${currentKey}</span>
              ${transpositionOffset !== 0 ? `<span><strong>Transposição:</strong> ${transpositionOffset > 0 ? '+' : ''}${transpositionOffset}</span>` : ''}
              ${cifra.capoPosition > 0 ? `<span><strong>Capotraste:</strong> ${cifra.capoPosition}ª casa</span>` : ''}
            </div>
          </div>
          
          ${cifra.notes ? `
            <div class="notes">
              <div class="notes-title">Notas:</div>
              <div>${cifra.notes}</div>
            </div>
          ` : ''}
          
          <div class="cifra-content">${transposedLyrics.replace(/\[([^\]]+)\]/g, '<span class="chord">[$1]</span>')}</div>
          
          ${cifra.tags && cifra.tags.length > 0 ? `
            <div class="tags">
              ${cifra.tags.map((tag: any) => `
                <span class="tag">${typeof tag === 'string' ? tag : tag.name || tag.tag?.name}</span>
              `).join('')}
            </div>
          ` : ''}
        </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  const toggleTag = (tagName: string) => {
    setSelectedTags((prev) => (prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName]))
  }

  const renderCifraCard = (cifra: Cifra) => (
    <Card key={cifra.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{cifra.title}</CardTitle>
            <p className="text-muted-foreground">{cifra.artist}</p>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => setViewingCifra(cifra)}>
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditingCifra(cifra)
                setShowEditor(true)
              }}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePrintCifra(cifra)}
              className="text-blue-600 hover:text-blue-700"
            >
              <Printer className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteCifra(cifra)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex gap-2 text-sm">
            <Badge variant="outline">Tom: {cifra.currentKey}</Badge>
            {cifra.capoPosition > 0 && <Badge variant="outline">Capo: {cifra.capoPosition}ª</Badge>}
          </div>

          <div className="text-sm text-muted-foreground line-clamp-2">
            {cifra.lyrics.replace(/\[[^\]]+\]/g, "").substring(0, 100)}...
          </div>

          <div className="flex flex-wrap gap-1">
            {cifra.tags.map((tagRelation) => (
              <Badge key={tagRelation.tagId} variant="secondary" className="text-xs">
                {tagRelation.tag.name}
              </Badge>
            ))}
          </div>

          <div className="text-xs text-muted-foreground">
            Criada em {new Date(cifra.createdAt).toLocaleDateString("pt-BR")}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderCifraViewer = () => {
    if (!viewingCifra) return null

    // Aplicar transposição na letra
    const transposedLyrics = transpositionOffset !== 0 
      ? transposeLyrics(viewingCifra.lyrics, transpositionOffset)
      : viewingCifra.lyrics

    // Calcular o tom atual baseado na transposição
    const getCurrentKey = () => {
      if (transpositionOffset === 0) return viewingCifra.currentKey
      
      const originalIndex = NOTES.indexOf(viewingCifra.currentKey)
      if (originalIndex === -1) return viewingCifra.currentKey
      
      const newIndex = (originalIndex + transpositionOffset + 12) % 12
      return NOTES[newIndex]
    }

    const currentKey = getCurrentKey()

    // Função para lidar com mudança de tom
    const handleKeyChange = (newKey: string) => {
      if (newKey === viewingCifra.currentKey) {
        // Se selecionou o tom original, resetar transposição
        setTranspositionOffset(0)
      } else {
        const originalIndex = NOTES.indexOf(viewingCifra.currentKey)
        const newIndex = NOTES.indexOf(newKey)
        
        if (originalIndex !== -1 && newIndex !== -1) {
          const offset = (newIndex - originalIndex + 12) % 12
          setTranspositionOffset(offset)
        }
      }
    }

    return (
      <Dialog open={!!viewingCifra} onOpenChange={() => setViewingCifra(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold">{viewingCifra.title}</h2>
                <p className="text-muted-foreground">{viewingCifra.artist}</p>
                <div className="flex justify-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Tom:</span>
                    <Select value={currentKey} onValueChange={handleKeyChange}>
                      <SelectTrigger className="w-20 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {NOTES.map((note) => (
                          <SelectItem key={note} value={note}>
                            {note}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {transpositionOffset !== 0 && (
                      <span className="text-xs text-muted-foreground">
                        ({transpositionOffset > 0 ? '+' : ''}{transpositionOffset})
                      </span>
                    )}
                  </div>
                  {viewingCifra.capoPosition > 0 && (
                    <Badge variant="outline">Capo: {viewingCifra.capoPosition}ª casa</Badge>
                  )}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Controle de transposição */}
          <div className="flex items-center justify-center gap-4 p-4 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">Transposição:</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTranspositionOffset(prev => Math.max(prev - 1, -12))}
                disabled={transpositionOffset <= -12}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-12 text-center font-mono text-sm">
                {transpositionOffset > 0 ? `+${transpositionOffset}` : transpositionOffset}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTranspositionOffset(prev => Math.min(prev + 1, 12))}
                disabled={transpositionOffset >= 12}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTranspositionOffset(0)}
              className="text-xs"
            >
              Reset
            </Button>
          </div>

          <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed border rounded-lg p-4">
            {transposedLyrics.split(/(\[[^\]]+\])/).map((part, index) => {
              if (part.match(/^\[[^\]]+\]$/)) {
                return (
                  <span key={index} className="text-primary font-bold bg-primary/10 px-1 rounded">
                    {part.slice(1, -1)}
                  </span>
                )
              }
              return part
            })}
          </div>

          {viewingCifra.notes && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Observações:</h4>
              <p className="text-sm text-muted-foreground">{viewingCifra.notes}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Minhas Cifras</h1>
          <p className="text-muted-foreground">
            {filteredCifras.length} de {cifras.length} cifras
          </p>
        </div>
        <Button onClick={() => setShowEditor(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Cifra
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título ou artista..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <Badge
                key={tag.id}
                variant={selectedTags.includes(tag.name) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleTag(tag.name)}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de cifras */}
      {filteredCifras.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Music className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {cifras.length === 0 ? "Nenhuma cifra cadastrada" : "Nenhuma cifra encontrada"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {cifras.length === 0 ? "Comece adicionando sua primeira cifra!" : "Tente ajustar os filtros de busca."}
            </p>
            {cifras.length === 0 && (
              <Button onClick={() => setShowEditor(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeira Cifra
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCifras.map(renderCifraCard)}
        </div>
      )}

      {/* Editor Modal */}
      {showEditor && (
        <Dialog open={showEditor} onOpenChange={setShowEditor}>
          <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto p-0">
            <DialogTitle className="sr-only">
              {editingCifra ? "Editar Cifra" : "Nova Cifra"}
            </DialogTitle>
            <CifraEditor
              initialData={editingCifra || undefined}
              availableTags={tags}
              onSave={handleSaveCifra}
              onCancel={() => {
                setShowEditor(false)
                setEditingCifra(null)
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Visualizador */}
      {renderCifraViewer()}

      {/* Modal de confirmação de exclusão */}
      <Dialog open={!!deletingCifra} onOpenChange={() => setDeletingCifra(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Tem certeza que deseja excluir a cifra <strong>"{deletingCifra?.title}"</strong> de <strong>{deletingCifra?.artist}</strong>?
            </p>
            <p className="text-xs text-destructive">
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDeletingCifra(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteCifra}
              >
                Excluir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
