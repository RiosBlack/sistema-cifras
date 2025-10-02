"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CifraEditor } from "@/components/cifras/cifra-editor"
import { CifraImport } from "@/components/cifras/cifra-import"
import { AuthRouteGuard } from "@/components/auth-route-guard"
import { useAuthContext } from "@/lib/auth-context"
import { transposeLyrics, getSemitonesDifference, NOTES, ALL_NOTES } from "@/lib/music-utils"
import { Plus, Search, Music, Filter, Edit, Trash2, Eye, Minus, Printer, Upload } from "lucide-react"

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
  user: {
    id: string
    name: string
    email: string
    role: 'USER' | 'ADMIN'
  }
}

interface Tag {
  id: string
  name: string
  color: string
  user: {
    id: string
    name: string
    role: 'USER' | 'ADMIN'
  }
}

export default function Dashboard() {
  const { user } = useAuthContext()
  const [cifras, setCifras] = useState<Cifra[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showEditor, setShowEditor] = useState(false)
  const [editingCifra, setEditingCifra] = useState<Cifra | null>(null)
  const [viewingCifra, setViewingCifra] = useState<Cifra | null>(null)
  const [deletingCifra, setDeletingCifra] = useState<Cifra | null>(null)
  const [transpositionOffset, setTranspositionOffset] = useState(0)
  const [showImport, setShowImport] = useState(false)
  const [importedData, setImportedData] = useState<any>(null)
  const [loadingCifras, setLoadingCifras] = useState(true)

  // Carregar dados da API
  useEffect(() => {
    if (user?.id) {
      loadCifras()
      loadTags()
    }
  }, [user?.id])

  // Resetar transposição quando abrir uma nova cifra
  useEffect(() => {
    if (viewingCifra) {
      setTranspositionOffset(0)
    }
  }, [viewingCifra])

  const loadCifras = async () => {
    if (!user?.id) return
    
    setLoadingCifras(true)
    try {
      // Para usuários USER, incluir cifras de admins
      const includeAdminCifras = user.role === 'USER'
      const response = await fetch(`/api/cifras?userId=${user.id}&includeAdminCifras=${includeAdminCifras}`)
      const result = await response.json()
      
      if (result.success) {
        setCifras(result.data)
      }
    } catch (error) {
      console.error('Erro ao carregar cifras:', error)
    } finally {
      setLoadingCifras(false)
    }
  }

  const loadTags = async () => {
    if (!user?.id) return
    
    try {
      // Para usuários USER, incluir tags de admins
      const includeAdminTags = user.role === 'USER'
      const response = await fetch(`/api/tags?userId=${user.id}&includeAdminTags=${includeAdminTags}`)
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
    if (!user?.id) {
      console.error('Usuário não logado')
      return
    }
    
    try {
      const userId = user.id
      
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

  const handleImport = (data: { title: string; artist: string; lyrics: string; originalKey: string }) => {
    setImportedData(data)
    setShowImport(false)
    setEditingCifra(null)
    setShowEditor(true)
  }

  const renderCifraCard = (cifra: Cifra) => {
    const isOwnCifra = cifra.user.id === user?.id
    const isAdminCifra = cifra.user.role === 'ADMIN' && !isOwnCifra
    
    return (<Card key={cifra.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base sm:text-lg truncate">{cifra.title}</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground truncate">{cifra.artist}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <Button variant="ghost" size="sm" onClick={() => setViewingCifra(cifra)} className="h-8 w-8 p-0">
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingCifra(cifra)
                  setShowEditor(true)
                }}
                className="h-8 w-8 p-0"
                disabled={!isOwnCifra}
                title={!isOwnCifra ? "Você só pode editar suas próprias cifras" : "Editar cifra"}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePrintCifra(cifra)}
                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
              >
                <Printer className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteCifra(cifra)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                disabled={!isOwnCifra}
                title={!isOwnCifra ? "Você só pode excluir suas próprias cifras" : "Excluir cifra"}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1 text-xs">
            <Badge variant="outline" className="text-xs">Tom: {cifra.currentKey}</Badge>
            {cifra.capoPosition > 0 && <Badge variant="outline" className="text-xs">Capo: {cifra.capoPosition}ª</Badge>}
          </div>

          <div className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
            {cifra.lyrics.replace(/\[[^\]]+\]/g, "").substring(0, 80)}...
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
    </Card>)
  }

  const renderCifraViewer = () => {
    if (!viewingCifra) return null

    // Aplicar transposição na letra
    const transposedLyrics = transpositionOffset !== 0 
      ? transposeLyrics(viewingCifra.lyrics, transpositionOffset)
      : viewingCifra.lyrics

    // Determina se o tom original é menor
    const isMinorKey = viewingCifra.originalKey.endsWith('m')
    
    // Filtra as notas baseado no tipo de tom
    const availableNotes = isMinorKey 
      ? ALL_NOTES.filter(note => note.endsWith('m')) // Apenas tons menores
      : ALL_NOTES.filter(note => !note.endsWith('m')) // Apenas tons maiores

    // Calcular o tom atual baseado na transposição
    const getCurrentKey = () => {
      if (transpositionOffset === 0) return viewingCifra.currentKey
      
      const originalIndex = NOTES.indexOf(viewingCifra.currentKey.replace('m', ''))
      if (originalIndex === -1) return viewingCifra.currentKey
      
      const newIndex = (originalIndex + transpositionOffset + 12) % 12
      let newKey = NOTES[newIndex]
      
      // Adiciona 'm' de volta se era um tom menor
      if (isMinorKey) {
        newKey = newKey + 'm'
      }
      
      return newKey
    }

    const currentKey = getCurrentKey()

    // Função para lidar com mudança de tom
    const handleKeyChange = (newKey: string) => {
      if (newKey === viewingCifra.currentKey) {
        // Se selecionou o tom original, resetar transposição
        setTranspositionOffset(0)
      } else {
        const originalIndex = NOTES.indexOf(viewingCifra.currentKey.replace('m', ''))
        const newIndex = NOTES.indexOf(newKey.replace('m', ''))
        
        if (originalIndex !== -1 && newIndex !== -1) {
          const offset = (newIndex - originalIndex + 12) % 12
          setTranspositionOffset(offset)
        }
      }
    }

    return (
      <Dialog open={!!viewingCifra} onOpenChange={() => setViewingCifra(null)}>
        <DialogContent className="max-w-[90%] max-h-[90vh] overflow-y-auto mx-auto my-auto">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold">{viewingCifra.title}</h2>
                <p className="text-sm sm:text-base text-muted-foreground pb-2">{viewingCifra.artist}</p>
                <div className="flex flex-col sm:flex-row sm:justify-center gap-2">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm font-medium">Tom:</span>
                    <Select value={currentKey} onValueChange={handleKeyChange}>
                      <SelectTrigger className="w-20 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableNotes.map((note) => (
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
                    <Badge variant="outline" className="text-xs">Capo: {viewingCifra.capoPosition}ª casa</Badge>
                  )}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Controle de transposição */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">Transposição:</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTranspositionOffset(prev => Math.max(prev - 1, -12))}
                disabled={transpositionOffset <= -12}
                className="h-8 w-8 p-0"
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
                className="h-8 w-8 p-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTranspositionOffset(0)}
              className="text-xs h-8"
            >
              Reset
            </Button>
          </div>

          <div className="whitespace-pre-wrap font-mono text-xl leading-relaxed border rounded-lg p-4 text-orange-500 font-bold">
            {transposedLyrics.split(/(\[[^\]]+\]|^[^:]+:)/gm).map((part, index) => {
              if (part.match(/^\[[^\]]+\]$/)) {
                return (
                  <span key={index} className="text-primary font-bold bg-primary/10 px-1 rounded">
                    {part.slice(1, -1)}
                  </span>
                )
              }
              if (part.match(/^[^:]+:$/)) {
                return (
                  <span key={index} className="text-black font-normal">
                    {part}
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
    <AuthRouteGuard requireAuth={true}>
      <div className="container mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Minhas Cifras</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {filteredCifras.length} de {cifras.length} cifras
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button 
            onClick={() => setShowImport(true)} 
            variant="outline" 
            className="w-full sm:w-auto"
            disabled={user?.role === 'USER'}
            title={user?.role === 'USER' ? "Apenas administradores podem importar cifras" : "Importar Cifra"}
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar Cifra
          </Button>
          <Button 
            onClick={() => { setImportedData(null); setEditingCifra(null); setShowEditor(true); }} 
            className="w-full sm:w-auto"
            disabled={user?.role === 'USER'}
            title={user?.role === 'USER' ? "Apenas administradores podem criar novas cifras" : "Nova Cifra"}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Cifra
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título ou artista..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtrar por tags:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const isAdminTag = tag.user.role === 'ADMIN' && tag.user.id !== user?.id
              return (
                <Badge
                  key={tag.id}
                  variant={selectedTags.includes(tag.name) ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => toggleTag(tag.name)}
                  title={isAdminTag ? `Tag criada por ${tag.user.name}` : 'Sua tag'}
                >
                  {tag.name}
                </Badge>
              )
            })}
          </div>
        </div>

      </div>

      {/* Lista de cifras */}
      {loadingCifras ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-lg font-medium mb-2">Carregando cifras...</h3>
            <p className="text-muted-foreground">
              Aguarde enquanto buscamos as cifras disponíveis
            </p>
          </CardContent>
        </Card>
      ) : filteredCifras.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Music className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {cifras.length === 0 ? "Nenhuma cifra disponível" : "Nenhuma cifra encontrada"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {cifras.length === 0 
                ? (user?.role === 'USER' 
                    ? "Não há cifras disponíveis no momento" 
                    : "Comece adicionando sua primeira cifra!")
                : "Tente ajustar os filtros de busca."
              }
            </p>
            {cifras.length === 0 && user?.role === 'ADMIN' && (
              <Button onClick={() => setShowEditor(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeira Cifra
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredCifras.map(renderCifraCard)}
        </div>
      )}

      {/* Modal de Importação */}
      {showImport && (
        <Dialog open={showImport} onOpenChange={setShowImport}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogTitle className="sr-only">Importar Cifra</DialogTitle>
            <CifraImport onImport={handleImport} />
          </DialogContent>
        </Dialog>
      )}

      {/* Editor Modal */}
      {showEditor && (
        <Dialog open={showEditor} onOpenChange={setShowEditor}>
          <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto p-0 mx-4">
            <DialogTitle className="sr-only">
              {editingCifra ? "Editar Cifra" : importedData ? "Cifra Importada" : "Nova Cifra"}
            </DialogTitle>
            <CifraEditor
              initialData={editingCifra || importedData || undefined}
              availableTags={tags}
              onSave={handleSaveCifra}
              onCancel={() => {
                setShowEditor(false)
                setEditingCifra(null)
                setImportedData(null)
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
    </AuthRouteGuard>
  )
}
