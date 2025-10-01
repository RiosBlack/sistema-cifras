"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Music, X, Edit, Check, ChevronUp, ChevronDown } from "lucide-react"

// Acordes principais - Tons maiores
const MAJOR_CHORDS = [
  "C", "D", "E", "F", "G", "A", "B"
]

// Acordes principais - Tons menores
const MINOR_CHORDS = [
  "Cm", "Dm", "Em", "Fm", "Gm", "Am", "Bm"
]

// Variações de acordes
const CHORD_VARIATIONS = [
  "7", "maj7", "m7", "sus2", "sus4", "add9", "9", "11", "13",
  "dim", "aug", "5", "6", "m6", "maj9", "m9", "7sus4", "m"
]

// Símbolos especiais
const SPECIAL_SYMBOLS = [
  "#", "b", " ", "(", ")"
]

interface ChordSection {
  id: string
  name: string
  chords: string
  repetition?: number
}

interface SectionChordBuilderProps {
  onChordSelect?: (chord: string) => void
  initialSections?: ChordSection[]
  onSectionsChange?: (sections: ChordSection[]) => void
}

export function SectionChordBuilder({ onChordSelect, initialSections = [], onSectionsChange }: SectionChordBuilderProps) {
  const [sectionName, setSectionName] = useState("")
  const [chordSequence, setChordSequence] = useState("")
  const [repetition, setRepetition] = useState(1)
  const [sections, setSections] = useState<ChordSection[]>([])
  const [selectedChord, setSelectedChord] = useState("")
  const [selectedSeparator, setSelectedSeparator] = useState<" / " | " → " | null>(null)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editChords, setEditChords] = useState("")
  const [editRepetition, setEditRepetition] = useState(1)
  const chordInputRef = useRef<HTMLInputElement>(null)
  const editChordInputRef = useRef<HTMLInputElement>(null)

  // Carregar seções iniciais quando o componente for montado
  useEffect(() => {
    if (initialSections.length > 0 && sections.length === 0) {
      setSections(initialSections)
    }
  }, [initialSections, sections.length])

  // Notificar o editor quando as seções mudarem
  useEffect(() => {
    if (onSectionsChange) {
      onSectionsChange(sections)
    }
  }, [sections, onSectionsChange])

  const commonSections = ["Intro", "A", "B", "C", "D", "Refrão", "Ponte", "Solo", "Outro"]

  const addToSelectedChord = (chord: string) => {
    setSelectedChord(prev => prev + chord)
  }

  const insertSelectedChord = () => {
    if (!selectedChord.trim() || !selectedSeparator) return

    const input = chordInputRef.current
    if (!input) return

    const start = input.selectionStart || 0
    const end = input.selectionEnd || 0
    const before = chordSequence.substring(0, start)
    const after = chordSequence.substring(end)

    // Adiciona o acorde com o separador selecionado
    const newSequence = before + selectedChord + selectedSeparator + after
    setChordSequence(newSequence)
    setSelectedChord("")
    setSelectedSeparator(null)

    // Reposiciona o cursor após o separador
    const cursorOffset = selectedSeparator === " → " ? 3 : 3
    setTimeout(() => {
      input.focus()
      input.setSelectionRange(start + selectedChord.length + cursorOffset, start + selectedChord.length + cursorOffset)
    }, 0)
  }

  const clearSelectedChord = () => {
    setSelectedChord("")
    setSelectedSeparator(null)
  }

  const addSection = () => {
    if (!sectionName.trim() || !chordSequence.trim()) return

    // Remove o último separador da sequência de acordes
    let cleanChords = chordSequence.trim()
    
    // Remove separadores do final ( /  ou  → )
    cleanChords = cleanChords.replace(/\s*[\/→]\s*$/, '')

    const newSection: ChordSection = {
      id: Date.now().toString(),
      name: sectionName.trim(),
      chords: cleanChords,
      repetition: repetition > 1 ? repetition : undefined
    }

    const updatedSections = [...sections, newSection]
    setSections(updatedSections)
    
    // Limpa os campos
    setSectionName("")
    setChordSequence("")
    setRepetition(1)
  }

  const removeSection = (id: string) => {
    const updatedSections = sections.filter(section => section.id !== id)
    setSections(updatedSections)
  }

  const startEditSection = (section: ChordSection) => {
    setEditingSection(section.id)
    setEditName(section.name)
    setEditChords(section.chords)
    setEditRepetition(section.repetition || 1)
  }

  const cancelEditSection = () => {
    setEditingSection(null)
    setEditName("")
    setEditChords("")
    setEditRepetition(1)
  }

  const saveEditSection = () => {
    if (!editingSection || !editName.trim() || !editChords.trim()) return

    const updatedSections = sections.map(section => {
      if (section.id === editingSection) {
        return {
          ...section,
          name: editName.trim(),
          chords: editChords.trim(),
          repetition: editRepetition > 1 ? editRepetition : undefined
        }
      }
      return section
    })

    setSections(updatedSections)
    cancelEditSection()
  }

  const insertSeparatorInEdit = (separator: string) => {
    const input = editChordInputRef.current
    if (!input) return

    const start = input.selectionStart || 0
    const end = input.selectionEnd || 0
    const currentValue = editChords

    // Insere o separador na posição do cursor
    const newValue = currentValue.substring(0, start) + separator + currentValue.substring(end)
    setEditChords(newValue)

    // Reposiciona o cursor após o separador inserido
    setTimeout(() => {
      input.focus()
      const newPosition = start + separator.length
      input.setSelectionRange(newPosition, newPosition)
    }, 0)
  }

  const moveSectionUp = (index: number) => {
    if (index === 0) return // Já está no topo
    
    const updatedSections = [...sections]
    // Troca a seção com a anterior
    const temp = updatedSections[index]
    updatedSections[index] = updatedSections[index - 1]
    updatedSections[index - 1] = temp
    
    setSections(updatedSections)
  }

  const moveSectionDown = (index: number) => {
    if (index === sections.length - 1) return // Já está no final
    
    const updatedSections = [...sections]
    // Troca a seção com a próxima
    const temp = updatedSections[index]
    updatedSections[index] = updatedSections[index + 1]
    updatedSections[index + 1] = temp
    
    setSections(updatedSections)
  }

  const formatSectionForDisplay = (section: ChordSection): string => {
    let result = `${section.name}: ${section.chords}`
    if (section.repetition && section.repetition > 1) {
      result += ` ${section.repetition}x`
    }
    return result
  }

  const formatSectionForLyrics = (section: ChordSection): string => {
    let result = `${section.name}: ${section.chords}`
    if (section.repetition && section.repetition > 1) {
      result += ` ${section.repetition}x`
    }
    return result
  }

  // Expor função para inserir acordes externamente
  useEffect(() => {
    if (onChordSelect) {
      window.insertChordInSectionBuilder = addToSelectedChord
    }
  }, [onChordSelect])

  return (
    <Card className="border-2 border-dashed border-muted-foreground/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Music className="w-5 h-5" />
          Construtor de Cifra por Seções
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Seções comuns */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Seções Comuns</Label>
          <div className="flex flex-wrap gap-2">
            {commonSections.map((section) => (
              <Button
                key={section}
                variant="outline"
                size="sm"
                onClick={() => setSectionName(section)}
                className="h-8 text-xs"
              >
                {section}
              </Button>
            ))}
          </div>
        </div>

        {/* Seletor de acordes */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Tons Maiores</Label>
          <div className="flex flex-wrap gap-2">
            {MAJOR_CHORDS.map((chord) => (
              <Button
                key={chord}
                variant="outline"
                size="sm"
                onClick={() => addToSelectedChord(chord)}
                className="h-8 text-xs font-mono"
              >
                {chord}
              </Button>
            ))}
          </div>

          <Label className="text-sm font-medium">Tons Menores</Label>
          <div className="flex flex-wrap gap-2">
            {MINOR_CHORDS.map((chord) => (
              <Button
                key={chord}
                variant="outline"
                size="sm"
                onClick={() => addToSelectedChord(chord)}
                className="h-8 text-xs font-mono"
              >
                {chord}
              </Button>
            ))}
          </div>
          
          <Label className="text-sm font-medium">Variações</Label>
          <div className="flex flex-wrap gap-2">
            {CHORD_VARIATIONS.map((variation) => (
              <Button
                key={variation}
                variant="secondary"
                size="sm"
                onClick={() => addToSelectedChord(variation)}
                className="h-8 text-xs font-mono"
              >
                {variation}
              </Button>
            ))}
          </div>
          
          <Label className="text-sm font-medium">Símbolos</Label>
          <div className="flex flex-wrap gap-2">
            {SPECIAL_SYMBOLS.filter(symbol => symbol !== "→").map((symbol) => (
              <Button
                key={symbol}
                variant="ghost"
                size="sm"
                onClick={() => addToSelectedChord(symbol)}
                className="h-8 text-xs font-mono"
              >
                {symbol === " " ? "␣" : symbol}
              </Button>
            ))}
          </div>
          
          {/* Separadores */}
          <Label className="text-sm font-medium">Separadores</Label>
          <div className="flex items-center gap-2">
            <Button
              variant={selectedSeparator === " / " ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSeparator(" / ")}
              className="h-8 text-xs font-mono"
            >
              /
            </Button>
            <Button
              variant={selectedSeparator === " → " ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSeparator(" → ")}
              className="h-8 text-xs font-mono bg-blue-600 hover:bg-blue-700"
            >
              →
            </Button>
            <span className="text-xs text-muted-foreground">
              Escolha o separador
            </span>
          </div>
          
          <div className="text-xs text-muted-foreground">
            💡 Use "→" para indicar transição entre acordes (ex: D9→C#m)
          </div>

           {/* Preview do acorde selecionado */}
           <div className="space-y-2">
            <Label className="text-sm font-medium">Acorde Selecionado</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-2 bg-muted rounded border font-mono text-sm min-h-[2rem] flex items-center">
                {selectedChord || "Nenhum acorde selecionado"}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={insertSelectedChord}
                disabled={!selectedChord.trim() || !selectedSeparator}
                className="h-8"
              >
                Inserir
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelectedChord}
                disabled={!selectedChord.trim()}
                className="h-8"
              >
                Limpar
              </Button>
            </div>
          </div>  
        </div>

        {/* Formulário para nova seção */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-3 sm:p-4 bg-muted/30 rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="section-name" className="text-sm">
              Nome da Seção
            </Label>
            <Input
              id="section-name"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              placeholder="Ex: Intro, A, B, Refrão..."
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="chord-sequence" className="text-sm">
              Sequência de Acordes
            </Label>
            <div className="flex items-center gap-2">
              <Input
                ref={chordInputRef}
                id="chord-sequence"
                value={chordSequence}
                onChange={(e) => setChordSequence(e.target.value)}
                placeholder="Ex: D9 / A / C#m7 / F#m7"
                className="text-sm font-mono flex-1"
                readOnly
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setChordSequence("")}
                disabled={!chordSequence.trim()}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              Use o seletor de acordes abaixo para montar a sequência
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="repetition" className="text-sm">
              Repetição
            </Label>
            <Input
              id="repetition"
              type="number"
              min="1"
              max="10"
              value={repetition}
              onChange={(e) => setRepetition(parseInt(e.target.value) || 1)}
              className="text-sm"
            />
            <div className="text-xs text-muted-foreground">
              Quantas vezes repetir (opcional)
            </div>
          </div>
        </div>

        {/* Botão para adicionar seção */}
        <div className="flex justify-center">
          <Button 
            onClick={addSection} 
            disabled={!sectionName.trim() || !chordSequence.trim()}
            className="w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Seção
          </Button>
        </div>

        {/* Lista de seções adicionadas */}
        {sections.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Seções Adicionadas</Label>
            <div className="space-y-2">
              {sections.map((section, index) => (
                <div
                  key={section.id}
                  className="bg-background border rounded-lg"
                >
                  {editingSection === section.id ? (
                    // Modo de edição
                    <div className="p-3 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Nome da Seção</Label>
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Nome da seção"
                            className="text-sm"
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <Label className="text-xs">Acordes</Label>
                          <Input
                            ref={editChordInputRef}
                            value={editChords}
                            onChange={(e) => setEditChords(e.target.value)}
                            placeholder="Ex: C / G / Am / F"
                            className="text-sm font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Repetições</Label>
                          <Input
                            type="number"
                            min="1"
                            value={editRepetition}
                            onChange={(e) => setEditRepetition(parseInt(e.target.value) || 1)}
                            className="text-sm"
                          />
                        </div>
                      </div>
                      
                      {/* Separadores para edição */}
                      <div className="space-y-2 border-t pt-3">
                        <Label className="text-xs font-medium">Adicionar Separador</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => insertSeparatorInEdit(" / ")}
                            className="h-7 text-xs font-mono"
                          >
                            / (Barra)
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => insertSeparatorInEdit(" → ")}
                            className="h-7 text-xs font-mono"
                          >
                            → (Seta)
                          </Button>
                          <span className="text-xs text-muted-foreground">
                            Clique para inserir na posição do cursor
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={cancelEditSection}
                          className="h-8 text-xs"
                        >
                          Cancelar
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={saveEditSection}
                          className="h-8 text-xs"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Salvar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Modo de visualização
                    <div className="flex items-center gap-2 p-2 sm:p-3">
                      {/* Botões de reordenação */}
                      <div className="flex flex-col gap-0.5 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveSectionUp(index)}
                          disabled={index === 0}
                          className="h-4 w-6 sm:h-5 sm:w-7 p-0 hover:bg-primary/10"
                          title="Mover para cima"
                        >
                          <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveSectionDown(index)}
                          disabled={index === sections.length - 1}
                          className="h-4 w-6 sm:h-5 sm:w-7 p-0 hover:bg-primary/10"
                          title="Mover para baixo"
                        >
                          <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>

                      {/* Conteúdo da seção */}
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-xs sm:text-sm truncate">
                          {formatSectionForDisplay(section)}
                        </div>
                      </div>

                      {/* Botões de ação */}
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditSection(section)}
                          className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-blue-600 hover:text-blue-700"
                          title="Editar seção"
                        >
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSection(section.id)}
                          className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-destructive hover:text-destructive"
                          title="Remover seção"
                        >
                          <X className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}


        <div className="text-xs text-muted-foreground">
          💡 Dica: Use o formato "D9 / A / C#m7 / F#m7" para separar os acordes. 
          Adicione quantas seções precisar para montar sua cifra completa.
        </div>
      </CardContent>
    </Card>
  )
}

// Declaração global para a função de inserção de acordes
declare global {
  interface Window {
    insertChordInSectionBuilder?: (chord: string) => void
  }
}
