"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Music } from "lucide-react"
import { NOTES, CHORD_TYPES } from "@/lib/music-utils"

interface ChordSelectorProps {
  onChordSelect: (chord: string) => void
  trigger?: React.ReactNode
}

export function ChordSelector({ onChordSelect, trigger }: ChordSelectorProps) {
  const [selectedNote, setSelectedNote] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const filteredNotes = NOTES.filter((note) => note.toLowerCase().includes(searchTerm.toLowerCase()))

  const filteredChordTypes = CHORD_TYPES.filter((type) => type.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleChordSelect = (note: string, type: string) => {
    const chord = note + type
    onChordSelect(chord)
    setIsOpen(false)
    setSelectedNote("")
    setSearchTerm("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Music className="w-4 h-4 mr-2" />
            Inserir Acorde
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Seletor de Acordes</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Buscar nota ou tipo de acorde..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {!selectedNote ? (
            <div>
              <h3 className="text-sm font-medium mb-2">Selecione a nota base:</h3>
              <div className="grid grid-cols-6 gap-2">
                {filteredNotes.map((note) => (
                  <Button
                    key={note}
                    variant="outline"
                    onClick={() => setSelectedNote(note)}
                    className="h-12 text-lg font-bold"
                  >
                    {note}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-sm font-medium">Nota selecionada:</h3>
                <Badge variant="secondary" className="text-lg">
                  {selectedNote}
                </Badge>
                <Button variant="ghost" size="sm" onClick={() => setSelectedNote("")}>
                  Alterar
                </Button>
              </div>

              <h3 className="text-sm font-medium mb-2">Selecione o tipo do acorde:</h3>
              <div className="grid grid-cols-4 gap-2">
                {filteredChordTypes.map((type) => (
                  <Button
                    key={type}
                    variant="outline"
                    onClick={() => handleChordSelect(selectedNote, type)}
                    className="h-12"
                  >
                    {selectedNote}
                    {type || "maior"}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <h4 className="text-xs font-medium text-muted-foreground mb-2">Acordes comuns:</h4>
            <div className="flex flex-wrap gap-1">
              {["C", "G", "Am", "F", "D", "Em", "A", "E", "Dm", "B7"].map((chord) => (
                <Button
                  key={chord}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onChordSelect(chord)
                    setIsOpen(false)
                  }}
                  className="h-8 text-xs"
                >
                  {chord}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
