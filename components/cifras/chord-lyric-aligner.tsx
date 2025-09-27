"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"

interface ChordLyricAlignerProps {
  onAddLine: (formattedLine: string) => void
  onChordSelect?: (chord: string) => void
}

export function ChordLyricAligner({ onAddLine, onChordSelect }: ChordLyricAlignerProps) {
  const [chordsLine, setChordsLine] = useState("")
  const [lyricsLine, setLyricsLine] = useState("")
  const chordsRef = useRef<HTMLTextAreaElement>(null)
  const lyricsRef = useRef<HTMLTextAreaElement>(null)

  const syncScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const source = e.target as HTMLTextAreaElement
    const target = source === chordsRef.current ? lyricsRef.current : chordsRef.current

    if (target) {
      target.scrollLeft = source.scrollLeft
    }
  }

  const insertChord = (chord: string) => {
    const textarea = chordsRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const before = chordsLine.substring(0, start)
    const after = chordsLine.substring(end)

    const newText = before + chord + after
    setChordsLine(newText)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + chord.length, start + chord.length)
    }, 0)
  }

  const formatLine = (): string => {
    if (!chordsLine.trim() && !lyricsLine.trim()) return ""
    if (!chordsLine.trim()) return lyricsLine
    if (!lyricsLine.trim()) return chordsLine

    let result = ""
    let i = 0
    let j = 0

    while (i < chordsLine.length || j < lyricsLine.length) {
      const chord = chordsLine[i] || " "
      const lyric = lyricsLine[j] || " "

      // Se há um acorde nesta posição
      if (chord !== " ") {
        // Encontra o acorde completo
        let fullChord = ""
        while (i < chordsLine.length && chordsLine[i] !== " ") {
          fullChord += chordsLine[i]
          i++
        }
        result += `[${fullChord}]`
      }

      // Adiciona a letra
      if (j < lyricsLine.length) {
        result += lyric
        j++
      }

      // Avança no acorde se ainda há espaços
      if (chord === " ") {
        i++
      }
    }

    return result
  }

  const handleAddLine = () => {
    const formatted = formatLine()
    if (formatted.trim()) {
      onAddLine(formatted)
      setChordsLine("")
      setLyricsLine("")
    }
  }

  const clearLines = () => {
    setChordsLine("")
    setLyricsLine("")
  }

  const previewLine = formatLine()

  // Expor função para inserir acordes externamente
  useEffect(() => {
    if (onChordSelect) {
      // Esta função será chamada pelo seletor de acordes
      window.insertChordInAligner = insertChord
    }
  }, [onChordSelect])

  return (
    <Card className="border-2 border-dashed border-muted-foreground/20">
      <CardContent className="p-4 space-y-4">
        <div className="text-sm font-medium text-muted-foreground">
          Construtor de Linha - Alinhe os acordes com a letra
        </div>

        {/* Campo para acordes */}
        <div className="space-y-2">
          <Label htmlFor="chords-input" className="text-xs text-blue-600">
            Acordes (posicione sobre as palavras correspondentes)
          </Label>
          <Textarea
            ref={chordsRef}
            id="chords-input"
            value={chordsLine}
            onChange={(e) => setChordsLine(e.target.value)}
            placeholder="C       F       G       Am"
            className="font-mono text-sm bg-blue-50/50 border-blue-200 resize-none"
            rows={1}
            onScroll={syncScroll}
          />
        </div>

        {/* Campo para letra */}
        <div className="space-y-2">
          <Label htmlFor="lyrics-input" className="text-xs text-green-600">
            Letra
          </Label>
          <Textarea
            ref={lyricsRef}
            id="lyrics-input"
            value={lyricsLine}
            onChange={(e) => setLyricsLine(e.target.value)}
            placeholder="Imagine there's no heaven"
            className="font-mono text-sm bg-green-50/50 border-green-200 resize-none"
            rows={1}
            onScroll={syncScroll}
          />
        </div>

        {/* Preview */}
        {previewLine && (
          <div className="space-y-2">
            <Label className="text-xs text-purple-600">Preview</Label>
            <div className="font-mono text-sm p-2 bg-purple-50/50 border border-purple-200 rounded min-h-[2rem] whitespace-pre-wrap">
              {previewLine.split(/(\[[^\]]+\])/).map((part, index) => {
                if (part.match(/^\[[^\]]+\]$/)) {
                  return (
                    <span key={index} className="text-purple-600 font-bold bg-purple-100 px-1 rounded">
                      {part.slice(1, -1)}
                    </span>
                  )
                }
                return part
              })}
            </div>
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex gap-2">
          <Button type="button" size="sm" onClick={handleAddLine} disabled={!chordsLine.trim() && !lyricsLine.trim()}>
            <Plus className="w-4 h-4 mr-1" />
            Adicionar Linha
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearLines}
            disabled={!chordsLine.trim() && !lyricsLine.trim()}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Limpar
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          💡 Dica: Digite os acordes alinhados com as palavras correspondentes. Use espaços para posicionar
          corretamente.
        </div>
      </CardContent>
    </Card>
  )
}
