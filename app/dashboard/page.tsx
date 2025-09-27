"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CifraEditor } from "@/components/cifras/cifra-editor"
import { Plus, Search, Music, Filter, Edit, Trash2, Eye } from "lucide-react"

interface Cifra {
  id: string
  title: string
  artist: string
  originalKey: string
  currentKey: string
  capoPosition: number
  lyrics: string
  notes?: string
  tags: string[]
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

  // Mock data - em produção viria da API
  useEffect(() => {
    const mockCifras: Cifra[] = [
      {
        id: "1",
        title: "Imagine",
        artist: "John Lennon",
        originalKey: "C",
        currentKey: "C",
        capoPosition: 0,
        lyrics:
          "[C]Imagine there's no [F]heaven\n[C]It's easy if you [F]try\n[C]No hell be[F]low us\n[C]Above us only [F]sky",
        tags: ["Rock", "Clássico"],
        createdAt: "2024-01-15",
      },
      {
        id: "2",
        title: "Wonderwall",
        artist: "Oasis",
        originalKey: "G",
        currentKey: "G",
        capoPosition: 2,
        lyrics:
          "[Em7]Today is [G]gonna be the day that they're [D]gonna throw it back to [C]you\n[Em7]By now you [G]should've somehow real[D]ized what you gotta [C]do",
        tags: ["Rock", "Britpop"],
        createdAt: "2024-01-14",
      },
    ]

    const mockTags: Tag[] = [
      { id: "1", name: "Rock", color: "#8B5CF6" },
      { id: "2", name: "Pop", color: "#06B6D4" },
      { id: "3", name: "Clássico", color: "#10B981" },
      { id: "4", name: "Britpop", color: "#F59E0B" },
    ]

    setCifras(mockCifras)
    setTags(mockTags)
  }, [])

  const filteredCifras = cifras.filter((cifra) => {
    const matchesSearch =
      cifra.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cifra.artist.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => cifra.tags.includes(tag))

    return matchesSearch && matchesTags
  })

  const handleSaveCifra = (data: any) => {
    if (editingCifra) {
      setCifras((prev) => prev.map((c) => (c.id === editingCifra.id ? { ...c, ...data } : c)))
    } else {
      const newCifra: Cifra = {
        id: Date.now().toString(),
        ...data,
        createdAt: new Date().toISOString().split("T")[0],
      }
      setCifras((prev) => [newCifra, ...prev])
    }

    setShowEditor(false)
    setEditingCifra(null)
  }

  const handleDeleteCifra = (id: string) => {
    setCifras((prev) => prev.filter((c) => c.id !== id))
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
              onClick={() => handleDeleteCifra(cifra.id)}
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
            {cifra.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
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

    return (
      <Dialog open={!!viewingCifra} onOpenChange={() => setViewingCifra(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold">{viewingCifra.title}</h2>
                <p className="text-muted-foreground">{viewingCifra.artist}</p>
                <div className="flex justify-center gap-2">
                  <Badge variant="outline">Tom: {viewingCifra.currentKey}</Badge>
                  {viewingCifra.capoPosition > 0 && (
                    <Badge variant="outline">Capo: {viewingCifra.capoPosition}ª casa</Badge>
                  )}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed border rounded-lg p-4">
            {viewingCifra.lyrics.split(/(\[[^\]]+\])/).map((part, index) => {
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
    </div>
  )
}
