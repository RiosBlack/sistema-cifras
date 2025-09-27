// Círculo das quintas para transposição
export const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
export const NOTES_FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"]

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

// Extrai a nota base de um acorde
export function extractBaseNote(chord: string): string {
  const match = chord.match(/^([A-G][#b]?)/)
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
  }
  return flatToSharp[note] || note
}

// Transpõe um acorde por um número de semitons
export function transposeChord(chord: string, semitones: number): string {
  if (!chord || semitones === 0) return chord

  const baseNote = extractBaseNote(chord)
  const normalizedNote = normalizeNote(baseNote)
  const currentIndex = NOTES.indexOf(normalizedNote)

  if (currentIndex === -1) return chord

  const newIndex = (currentIndex + semitones + 12) % 12
  const newNote = NOTES[newIndex]

  return chord.replace(baseNote, newNote)
}

// Calcula a diferença em semitons entre duas notas
export function getSemitonesDifference(fromKey: string, toKey: string): number {
  const fromIndex = NOTES.indexOf(normalizeNote(fromKey))
  const toIndex = NOTES.indexOf(normalizeNote(toKey))

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
  const originalIndex = NOTES.indexOf(normalizeNote(originalKey))

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

  const chordRegex = /\b([A-G][#b]?(?:m|maj|dim|aug|sus[24]|add\d+|\d+)*)\b/g

  return lyrics.replace(chordRegex, (match) => {
    return transposeChord(match, semitones)
  })
}
