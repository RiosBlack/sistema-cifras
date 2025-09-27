"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Music, X } from "lucide-react"

// Acordes principais
const MAIN_CHORDS = [
  "C", "D", "E", "F", "G", "A", "B",
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
  onAddSection: (section: ChordSection) => void
  onChordSelect?: (chord: string) => void
  initialSections?: ChordSection[]
  onSectionsChange?: (sections: ChordSection[]) => void
}

export function SectionChordBuilder({ onAddSection, onChordSelect, initialSections = [], onSectionsChange }: SectionChordBuilderProps) {
  const [sectionName, setSectionName] = useState("")
  const [chordSequence, setChordSequence] = useState("")
  const [repetition, setRepetition] = useState(1)
  const [sections, setSections] = useState<ChordSection[]>([])
  const [selectedChord, setSelectedChord] = useState("")
  const [selectedSeparator, setSelectedSeparator] = useState<" / " | " → " | null>(null)
  const chordInputRef = useRef<HTMLInputElement>(null)

  // Carregar seções iniciais quando o componente for montado
  useEffect(() => {
    if (initialSections.length > 0) {
      setSections(initialSections)
    }
  }, [initialSections])

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

    setSections(prev => [...prev, newSection])
    onAddSection(newSection)

    // Limpa os campos
    setSectionName("")
    setChordSequence("")
    setRepetition(1)
  }

  const removeSection = (id: string) => {
    setSections(prev => prev.filter(section => section.id !== id))
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
         

          <Label className="text-sm font-medium">Acordes Principais</Label>
          <div className="flex flex-wrap gap-2">
            {MAIN_CHORDS.map((chord) => (
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
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
            className="w-full md:w-auto"
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
              {sections.map((section) => (
                <div
                  key={section.id}
                  className="flex items-center justify-between p-3 bg-background border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-mono text-sm">
                      {formatSectionForDisplay(section)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSection(section.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
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
