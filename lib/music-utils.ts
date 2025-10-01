// Círculo das quintas para transposição
export const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
export const NOTES_FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"]

// Todas as notas disponíveis para seleção (sustenidos e bemóis) - Maiores e Menores
export const ALL_NOTES = [
  // Tons maiores
  "C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B",
  // Tons menores
  "Cm", "C#m", "Dbm", "Dm", "D#m", "Ebm", "Em", "Fm", "F#m", "Gbm", "Gm", "G#m", "Abm", "Am", "A#m", "Bbm", "Bm"
]

// Acordes comuns e suas variações
export const CHORD_TYPES = [
  "",
  "m",
  "7",
  "m7",
  "maj7",
  "sus2",
  "sus4",
  "dim",
  "aug",
  "6",
  "m6",
  "9",
  "m9",
  "add9",
  "11",
  "13",
]

// Extrai a nota base de um acorde (incluindo 'm' para tons menores)
export function extractBaseNote(chord: string): string {
  const match = chord.match(/^([A-G][#b]?m?)/)
  return match ? match[1] : chord
}

// Normaliza nota para usar apenas sustenidos
export function normalizeNote(note: string): string {
  const flatToSharp: { [key: string]: string } = {
    Db: "C#",
    Eb: "D#",
    Gb: "F#",
    Ab: "G#",
    Bb: "A#",
    Dbm: "C#m",
    Ebm: "D#m",
    Gbm: "F#m",
    Abm: "G#m",
    Bbm: "A#m",
  }
  return flatToSharp[note] || note
}

// Transpõe um acorde por um número de semitons
export function transposeChord(chord: string, semitones: number): string {
  if (!chord || semitones === 0) return chord

  const baseNote = extractBaseNote(chord)
  const isMinor = baseNote.endsWith('m')
  
  // Remove 'm' temporariamente para transposição
  const noteWithoutMinor = baseNote.replace(/m$/, '')
  const normalizedNote = normalizeNote(noteWithoutMinor)
  const currentIndex = NOTES.indexOf(normalizedNote)

  if (currentIndex === -1) return chord

  const newIndex = (currentIndex + semitones + 12) % 12
  let newNote = NOTES[newIndex]
  
  // Adiciona 'm' de volta se era um acorde menor
  if (isMinor) {
    newNote = newNote + 'm'
  }

  return chord.replace(baseNote, newNote)
}

// Calcula a diferença em semitons entre duas notas
export function getSemitonesDifference(fromKey: string, toKey: string): number {
  // Remove 'm' para calcular apenas a diferença entre as notas base
  const fromNoteBase = normalizeNote(fromKey.replace('m', ''))
  const toNoteBase = normalizeNote(toKey.replace('m', ''))
  
  const fromIndex = NOTES.indexOf(fromNoteBase)
  const toIndex = NOTES.indexOf(toNoteBase)

  if (fromIndex === -1 || toIndex === -1) return 0

  return (toIndex - fromIndex + 12) % 12
}

// Aplica capotraste (cada casa = +1 semitom)
export function applyCapo(chord: string, capoPosition: number): string {
  return transposeChord(chord, capoPosition)
}

// Sugere posição de capotraste para tons mais fáceis
export function suggestCapoPosition(originalKey: string): number {
  const easyKeys = ["C", "G", "D", "A", "E"]
  // Remove 'm' para obter apenas a nota base
  const originalKeyBase = normalizeNote(originalKey.replace('m', ''))
  const originalIndex = NOTES.indexOf(originalKeyBase)

  if (originalIndex === -1) return 0

  for (const easyKey of easyKeys) {
    const easyIndex = NOTES.indexOf(easyKey)
    const capoPosition = (originalIndex - easyIndex + 12) % 12

    if (capoPosition <= 7) {
      // Máximo 7ª casa
      return capoPosition
    }
  }

  return 0
}

// Extrai acordes de uma letra cifrada
export function extractChords(lyrics: string): string[] {
  // Regex para acordes no formato [C], [Dm7], etc.
  const bracketRegex = /\[([A-G][#b]?(?:m|maj|dim|aug|sus[24]|add\d+|\d+)*)\]/g
  
  // Regex para acordes em seções (formato: Intro: D9 / A / C#m7)
  const sectionRegex = /\b([A-G][#b]?(?:m|maj|dim|aug|sus[24]|add\d+|\d+)*)\b/g
  
  const bracketMatches = [...(lyrics.match(bracketRegex) || [])].map(match => match.slice(1, -1))
  const sectionMatches = [...(lyrics.match(sectionRegex) || [])]
  
  const allChords = [...bracketMatches, ...sectionMatches]
  return [...new Set(allChords)] // Remove duplicatas
}

// Transpõe todos os acordes em uma letra
export function transposeLyrics(lyrics: string, semitones: number): string {
  if (semitones === 0) return lyrics

  // Regex para acordes dentro de colchetes [C], [Dm7], etc.
  const bracketChordRegex = /\[([A-G][#b]?(?:m|maj|dim|aug|sus[24]|add\d+|\d+)*)\]/g

  // Processar linha por linha
  const lines = lyrics.split('\n')
  const processedLines = lines.map(line => {
    const trimmedLine = line.trim()
    
    // Se a linha é uma seção (contém dois pontos)
    if (trimmedLine.includes(':')) {
      const colonIndex = trimmedLine.indexOf(':')
      const sectionName = trimmedLine.substring(0, colonIndex).trim()
      const chordsPart = trimmedLine.substring(colonIndex + 1).trim()
      
      // Transpor apenas os acordes na parte após os dois pontos
      const transposedChords = chordsPart.replace(/\b([A-G][#b]?(?:m|maj|dim|aug|sus[24]|add\d+|\d+)*)\b/g, (chordMatch) => {
        return transposeChord(chordMatch, semitones)
      })
      
      return `${sectionName}: ${transposedChords}`
    } else {
      // Para linhas que não são seções, transpor acordes dentro de colchetes
      return line.replace(bracketChordRegex, (match, chord) => {
        return `[${transposeChord(chord, semitones)}]`
      })
    }
  })

  return processedLines.join('\n')
}
