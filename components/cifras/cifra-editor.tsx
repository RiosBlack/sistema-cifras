"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChordSelector } from "./chord-selector"
import { TransposeControls } from "./transpose-controls"
import { Save, Music, Tag, X } from "lucide-react"
import { NOTES, ALL_NOTES, transposeLyrics, extractChords, getSemitonesDifference } from "@/lib/music-utils"
import { SectionChordBuilder } from "./section-chord-builder"

declare global {
  interface Window {
    insertChordInSectionBuilder?: (chord: string) => void
  }
}

interface CifraEditorProps {
  initialData?: {
    id?: string
    title: string
    artist: string
    originalKey: string
    lyrics: string
    tags: Array<{
      cifraId: string
      tagId: string
      tag: {
        id: string
        name: string
        color: string
      }
    }> | string[]
    notes?: string
  }
  availableTags: Array<{ id: string; name: string; color: string }>
  onSave: (data: any) => void
  onCancel: () => void
}

export function CifraEditor({ initialData, availableTags, onSave, onCancel }: CifraEditorProps) {
  // Adicione estas refs e estados após os estados existentes:
  const chordsRef = useRef<HTMLTextAreaElement>(null)
  const lyricsRef = useRef<HTMLTextAreaElement>(null)

  // Adicione estes campos ao formData inicial:
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    artist: initialData?.artist || "",
    originalKey: initialData?.originalKey || "C",
    currentKey: initialData?.originalKey || "C",
    lyrics: initialData?.lyrics || "",
    chordsLine: "", // Nova linha para acordes temporária
    lyricsLine: "", // Nova linha para letra temporária
    notes: initialData?.notes || "",
    tags: Array.isArray(initialData?.tags) 
      ? initialData.tags.every(tag => typeof tag === 'string') 
        ? initialData.tags as string[]
        : (initialData.tags as any[]).map(t => t.tag.name)
      : [],
    capoPosition: 0,
  })

  const [newTag, setNewTag] = useState("")
  const [activeTab, setActiveTab] = useState("edit")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [chordSections, setChordSections] = useState<Array<{id: string, name: string, chords: string, repetition?: number}>>([])
  const [currentSections, setCurrentSections] = useState<Array<{id: string, name: string, chords: string, repetition?: number}>>([])

  // Função para extrair seções de acordes da cifra existente
  const extractChordSections = (lyrics: string) => {
    const sections: Array<{id: string, name: string, chords: string, repetition?: number}> = []
    
    // Dividir por linhas e processar cada uma
    const lines = lyrics.split('\n')
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim()
      
      // Ignorar linhas vazias
      if (!trimmedLine) return
      
      // Procurar por padrões de seção com dois pontos: "Nome: acordes"
      // Aceita qualquer caractere no nome da seção (incluindo números, acentos, etc.)
      const colonMatch = trimmedLine.match(/^([^:]+):\s*(.+)$/)
      if (colonMatch) {
        const sectionName = colonMatch[1].trim()
        let chords = colonMatch[2].trim()
        
        // Extrair repetição se houver (ex: "2x" ou "3x" no final)
        let repetition: number | undefined = undefined
        const repetitionMatch = chords.match(/\s+(\d+)x\s*$/)
        if (repetitionMatch) {
          repetition = parseInt(repetitionMatch[1])
          chords = chords.replace(/\s+\d+x\s*$/, '').trim()
        }
        
        // Verificar se a linha tem acordes (contém pelo menos uma letra maiúscula seguida de # ou b opcional)
        if (chords.match(/[A-G][#b]?/)) {
          sections.push({
            id: `section-${Date.now()}-${Math.random()}-${index}`,
            name: sectionName,
            chords: chords,
            repetition: repetition
          })
        }
      }
    })
    
    console.log('Seções extraídas:', sections.length, sections)
    return sections
  }

  // Carregar seções de acordes quando initialData mudar
  useEffect(() => {
    if (initialData?.lyrics) {
      const sections = extractChordSections(initialData.lyrics)
      setChordSections(sections)
      setCurrentSections(sections)
    }
  }, [initialData])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const insertChordAtCursor = (chord: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = formData.lyrics
    const before = text.substring(0, start)
    const after = text.substring(end)

    const newText = before + `[${chord}]` + after
    handleInputChange("lyrics", newText)

    // Reposiciona o cursor
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + chord.length + 2, start + chord.length + 2)
    }, 0)
  }

  const handleTranspose = (newKey: string) => {
    const semitones = getSemitonesDifference(formData.currentKey, newKey)
    const transposedLyrics = transposeLyrics(formData.lyrics, semitones)

    setFormData((prev) => ({
      ...prev,
      currentKey: newKey,
      lyrics: transposedLyrics,
    }))
  }

  const handleCapoChange = (position: number) => {
    setFormData((prev) => ({ ...prev, capoPosition: position }))
  }

  // Adicione estas funções após handleCapoChange:

  const syncScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const source = e.target as HTMLTextAreaElement
    const target = source === chordsRef.current ? lyricsRef.current : chordsRef.current

    if (target) {
      target.scrollLeft = source.scrollLeft
    }
  }

  const insertChordInChordLine = (chord: string) => {
    const textarea = chordsRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = formData.chordsLine
    const before = text.substring(0, start)
    const after = text.substring(end)

    const newText = before + chord + after
    handleInputChange("chordsLine", newText)

    // Reposiciona o cursor
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + chord.length, start + chord.length)
    }, 0)
  }

  const addLineToLyrics = () => {
    if (!formData.chordsLine.trim() && !formData.lyricsLine.trim()) return

    const chordLine = formData.chordsLine || ""
    const lyricLine = formData.lyricsLine || ""

    // Formata a linha combinando acordes e letra
    const formattedLine = formatChordAndLyricLine(chordLine, lyricLine)

    const newLyrics = formData.lyrics ? formData.lyrics + "\n" + formattedLine : formattedLine

    handleInputChange("lyrics", newLyrics)

    // Limpa as linhas temporárias
    handleInputChange("chordsLine", "")
    handleInputChange("lyricsLine", "")
  }

  const clearCurrentLines = () => {
    handleInputChange("chordsLine", "")
    handleInputChange("lyricsLine", "")
  }

  const formatChordAndLyricLine = (chordLine: string, lyricLine: string): string => {
    if (!chordLine.trim()) return lyricLine
    if (!lyricLine.trim()) return chordLine

    // Converte as linhas em arrays de caracteres para alinhamento
    const chords = chordLine.split("")
    const lyrics = lyricLine.split("")

    let result = ""
    let chordBuffer = ""
    let inChord = false

    // Processa caractere por caractere
    for (let i = 0; i < Math.max(chords.length, lyrics.length); i++) {
      const chord = chords[i] || " "
      const lyric = lyrics[i] || " "

      // Se encontrou um acorde (não é espaço)
      if (chord !== " " && !inChord) {
        // Inicia um novo acorde
        chordBuffer = chord
        inChord = true
      } else if (chord !== " " && inChord) {
        // Continua construindo o acorde
        chordBuffer += chord
      } else if (chord === " " && inChord) {
        // Terminou o acorde, adiciona ao resultado
        result += `[${chordBuffer}]`
        chordBuffer = ""
        inChord = false
      }

      // Adiciona a letra se não estiver em espaço
      if (lyric !== " " || !inChord) {
        result += lyric
      }
    }

    // Se terminou com um acorde pendente
    if (inChord && chordBuffer) {
      result += `[${chordBuffer}]`
    }

    return result
  }

  const handleReset = () => {
    const semitones = getSemitonesDifference(formData.currentKey, formData.originalKey)
    const resetLyrics = transposeLyrics(formData.lyrics, semitones)

    setFormData((prev) => ({
      ...prev,
      currentKey: formData.originalKey,
      lyrics: resetLyrics,
      capoPosition: 0,
    }))
  }

  const addTag = (tagName: string) => {
    if (tagName && !formData.tags.includes(tagName)) {
      handleInputChange("tags", [...formData.tags, tagName])
    }
    setNewTag("")
  }

  const removeTag = (tagName: string) => {
    handleInputChange(
      "tags",
      formData.tags.filter((tag) => tag !== tagName),
    )
  }


  const handleSectionsChange = useCallback((sections: Array<{id: string, name: string, chords: string, repetition?: number}>) => {
    // Evitar loop infinito - só atualizar se as seções realmente mudaram
    const sectionsChanged = JSON.stringify(sections) !== JSON.stringify(currentSections)
    if (!sectionsChanged) return
    
    setCurrentSections(sections)
    
    // Se não há seções, não fazer nada
    if (sections.length === 0) {
      return
    }
    
    // Atualizar a letra com as seções atuais
    const sectionsText = sections.map(section => {
      return `${section.name}: ${section.chords}${section.repetition && section.repetition > 1 ? ` ${section.repetition}x` : ''}`
    }).join('\n')
    
    // Só usar as seções, sem tentar preservar letra original
    handleInputChange("lyrics", sectionsText)
  }, [currentSections])

  const handleSave = () => {
    
    const chords = extractChords(formData.lyrics)

    const dataToSave = {
      title: formData.title,
      artist: formData.artist,
      originalKey: formData.originalKey,
      currentKey: formData.currentKey,
      capoPosition: formData.capoPosition,
      lyrics: formData.lyrics,
      notes: formData.notes,
      tags: formData.tags,
      chords,
      chordsOriginal: chords, // Backup dos acordes originais
    }
    
    
    onSave(dataToSave)
  }

  const renderPreview = () => {
    return (
      <div className="space-y-4">
        <div className="text-center border-b pb-4">
          <h2 className="text-xl sm:text-2xl font-bold">{formData.title || "Título da Música"}</h2>
          <p className="text-sm sm:text-base text-muted-foreground">{formData.artist || "Artista"}</p>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">Tom: {formData.currentKey}</Badge>
            {formData.capoPosition > 0 && <Badge variant="outline" className="text-xs">Capo: {formData.capoPosition}ª casa</Badge>}
          </div>
        </div>

        <div className="whitespace-pre-wrap font-mono text-xs sm:text-sm leading-relaxed">
          {formData.lyrics.split(/(\[[^\]]+\])/).map((part, index) => {
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
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 p-4 sm:p-0">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Music className="w-5 h-5" />
            {initialData?.id ? "Editar Cifra" : "Nova Cifra"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit" className="text-sm">Editar</TabsTrigger>
              <TabsTrigger value="preview" className="text-sm">Visualizar</TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="space-y-4 sm:space-y-6">
              {/* Informações básicas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Nome da música"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="artist">Artista *</Label>
                  <Input
                    id="artist"
                    value={formData.artist}
                    onChange={(e) => handleInputChange("artist", e.target.value)}
                    placeholder="Nome do artista"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="originalKey">Tom Original</Label>
                  <Select
                    value={formData.originalKey}
                    onValueChange={(value) => {
                      handleInputChange("originalKey", value)
                      handleInputChange("currentKey", value)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_NOTES.map((note) => (
                        <SelectItem key={note} value={note}>
                          {note}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Controles de transposição */}
              <TransposeControls
                originalKey={formData.originalKey}
                currentKey={formData.currentKey}
                capoPosition={formData.capoPosition}
                onTranspose={handleTranspose}
                onCapoChange={handleCapoChange}
                onReset={handleReset}
              />

              {/* Editor de cifra com alinhamento */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Construtor de Cifra</Label>
                </div>

                <SectionChordBuilder
                  onChordSelect={insertChordAtCursor}
                  initialSections={chordSections}
                  onSectionsChange={handleSectionsChange}
                />

              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Nova tag..."
                    onKeyPress={(e) => e.key === "Enter" && addTag(newTag)}
                  />
                  <Button variant="outline" onClick={() => addTag(newTag)} disabled={!newTag}>
                    <Tag className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {availableTags.map((tag) => (
                    <Button
                      key={tag.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => addTag(tag.name)}
                      className="h-6 text-xs"
                      disabled={formData.tags.includes(tag.name)}
                    >
                      {tag.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Notas */}
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Observações pessoais sobre a música..."
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="preview">{renderPreview()}</TabsContent>
          </Tabs>

          {/* Botões de ação */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 sm:pt-6 border-t">
            <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!formData.title || !formData.artist} className="w-full sm:w-auto">
              <Save className="w-4 h-4 mr-2" />
              Salvar Cifra
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
