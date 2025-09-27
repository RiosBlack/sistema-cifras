"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { RotateCcw, Music2, Guitar } from "lucide-react"
import { NOTES, getSemitonesDifference, suggestCapoPosition } from "@/lib/music-utils"

interface TransposeControlsProps {
  originalKey: string
  currentKey: string
  capoPosition: number
  onTranspose: (newKey: string) => void
  onCapoChange: (position: number) => void
  onReset: () => void
}

export function TransposeControls({
  originalKey,
  currentKey,
  capoPosition,
  onTranspose,
  onCapoChange,
  onReset,
}: TransposeControlsProps) {
  const [showSuggestion, setShowSuggestion] = useState(false)

  const semitonesDiff = getSemitonesDifference(originalKey, currentKey)
  const suggestedCapo = suggestCapoPosition(originalKey)

  const capoOptions = Array.from({ length: 13 }, (_, i) => i)

  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Music2 className="w-4 h-4" />
          Controles de Tom
        </h3>
        <Button variant="ghost" size="sm" onClick={onReset} disabled={currentKey === originalKey && capoPosition === 0}>
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Transposição */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Tom da Música</label>
          <div className="flex items-center gap-2">
            <Select value={currentKey} onValueChange={onTranspose}>
              <SelectTrigger className="w-full">
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
            {currentKey !== originalKey && (
              <Badge variant="secondary" className="text-xs">
                {semitonesDiff > 6 ? `-${12 - semitonesDiff}` : `+${semitonesDiff}`}
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            Original: <span className="font-medium">{originalKey}</span>
          </div>
        </div>

        {/* Capotraste */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Guitar className="w-3 h-3" />
            Capotraste
          </label>
          <Select value={capoPosition.toString()} onValueChange={(value) => onCapoChange(Number.parseInt(value))}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {capoOptions.map((position) => (
                <SelectItem key={position} value={position.toString()}>
                  {position === 0 ? "Sem capotraste" : `${position}ª casa`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {capoPosition > 0 && (
            <div className="text-xs text-muted-foreground">Acordes simplificados com capo na {capoPosition}ª casa</div>
          )}
        </div>
      </div>

      {/* Sugestão inteligente */}
      {suggestedCapo > 0 && suggestedCapo !== capoPosition && (
        <div className="bg-muted/50 rounded-md p-3">
          <div className="flex items-center justify-between">
            <div className="text-xs">
              <span className="font-medium">Sugestão:</span> Use capotraste na {suggestedCapo}ª casa para acordes mais
              fáceis
            </div>
            <Button variant="ghost" size="sm" onClick={() => onCapoChange(suggestedCapo)} className="text-xs h-6">
              Aplicar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
