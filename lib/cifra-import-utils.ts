/**
 * Utilitários para importação de cifras de arquivos TXT/PDF
 */

interface ParsedSection {
  name: string
  chords: string
}

interface ParsedCifra {
  title: string
  artist: string
  sections: ParsedSection[]
  originalKey: string
}

/**
 * Extrai acordes de uma linha, removendo letras e mantendo apenas os acordes
 */
function extractChordsFromLine(line: string): string {
  // Padrão para identificar acordes: nota (A-G) + opcional (#/b) + opcional (extensões)
  // Suporta: C, Cm, C7, C7M, Cm7, C#m7, Db, Am7(9), G/A, etc.
  const chordPattern = /\b([A-G][#b]?(?:m|maj|M|aug|dim|sus|add)?[0-9]?(?:\([^)]*\))?(?:\/[A-G][#b]?)?)\b/g
  const chords = line.match(chordPattern) || []
  
  // Remove duplicatas e junta com separador
  const uniqueChords = [...new Set(chords)]
  return uniqueChords.join(' / ')
}

/**
 * Identifica se uma linha contém principalmente acordes (sem muitas letras consecutivas)
 */
function isChordLine(line: string): boolean {
  // Remove espaços
  const trimmed = line.trim()
  if (!trimmed) return false
  
  // Verifica se tem padrão de acorde
  const chordPattern = /[A-G][#b]?(?:m|maj|sus|dim|aug|add)?[0-9]?(?:\([^)]*\))?/
  const hasChords = chordPattern.test(trimmed)
  
  // Verifica se tem muitas palavras seguidas (indica letra de música)
  const words = trimmed.split(/\s+/)
  const hasLyrics = words.length > 5 && words.some(word => word.length > 3 && !/[A-G][#b]?/.test(word))
  
  return hasChords && !hasLyrics
}

/**
 * Normaliza o nome da seção
 */
function normalizeSectionName(name: string): string {
  // Remove caracteres especiais e espaços extras
  let normalized = name.trim()
    .replace(/\[|\]/g, '') // Remove colchetes
    .replace(/^\d+\.\s*/, '') // Remove numeração
    .trim()
  
  // Capitaliza primeira letra
  if (normalized.length > 0) {
    normalized = normalized.charAt(0).toUpperCase() + normalized.slice(1)
  }
  
  return normalized
}

/**
 * Detecta a tonalidade original da cifra
 */
function detectOriginalKey(content: string): string {
  // Procura por padrões comuns de indicação de tom
  const tomMatch = content.match(/(?:Tom|Tonalidade|Key):\s*([A-G][#b]?m?)/i)
  if (tomMatch) {
    return tomMatch[1]
  }
  
  // Procura pelo primeiro acorde da primeira seção musical
  const lines = content.split('\n')
  for (const line of lines) {
    if (isChordLine(line)) {
      const firstChordMatch = line.match(/\b([A-G][#b]?)/)
      if (firstChordMatch) {
        return firstChordMatch[1]
      }
    }
  }
  
  return 'C' // Tom padrão
}

/**
 * Parseia o conteúdo do arquivo TXT e converte para o formato de seções
 */
export function parseCifraFromText(content: string): ParsedCifra {
  const lines = content.split('\n')
  
  // Extrai título e artista da primeira linha (formato: "Artista - Título")
  let title = 'Cifra Importada'
  let artist = 'Desconhecido'
  
  const firstLine = lines[0]?.trim()
  if (firstLine) {
    const parts = firstLine.split(' - ')
    if (parts.length >= 2) {
      artist = parts[0].trim()
      title = parts.slice(1).join(' - ').trim()
    } else {
      title = firstLine
    }
  }
  
  // Detecta tonalidade original
  const originalKey = detectOriginalKey(content)
  
  const sections: ParsedSection[] = []
  let currentSectionName = ''
  let currentChords: string[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Ignora linhas vazias
    if (!line) {
      // Se temos uma seção em andamento, finaliza ela
      if (currentSectionName && currentChords.length > 0) {
        sections.push({
          name: normalizeSectionName(currentSectionName),
          chords: currentChords.join(' ')
        })
        currentSectionName = ''
        currentChords = []
      }
      continue
    }
    
    // Ignora linhas de acordes de referência no final (formato: "Am7 = X 0 2 0 1 0")
    if (line.match(/^[A-G][#b]?.*=.*\d/)) {
      continue
    }
    
    // Ignora separadores decorativos
    if (line.match(/^[-=]+/)) {
      continue
    }
    
    // Detecta nome de seção (entre colchetes)
    const bracketMatch = line.match(/^\[([^\]]+)\]$/)
    if (bracketMatch) {
      // Se já tinha uma seção, salva antes de iniciar nova
      if (currentSectionName && currentChords.length > 0) {
        sections.push({
          name: normalizeSectionName(currentSectionName),
          chords: currentChords.join(' ')
        })
        currentChords = []
      }
      currentSectionName = bracketMatch[1]
      continue
    }
    
    // Se temos uma seção ativa e é uma linha de acordes, extrai e adiciona
    if (currentSectionName && isChordLine(line)) {
      const chords = extractChordsFromLine(line)
      if (chords) {
        currentChords.push(chords)
      }
      continue
    }
    
    // Ignora linhas de letra (não processamos letras)
  }
  
  // Adiciona a última seção se houver
  if (currentSectionName && currentChords.length > 0) {
    sections.push({
      name: normalizeSectionName(currentSectionName),
      chords: currentChords.join(' ')
    })
  }
  
  return {
    title,
    artist,
    sections,
    originalKey
  }
}

/**
 * Converte as seções parseadas para o formato esperado pelo editor
 */
export function sectionsToLyrics(sections: ParsedSection[]): string {
  return sections.map(section => {
    return `${section.name}: ${section.chords}`
  }).join('\n')
}

/**
 * Lê um arquivo e retorna seu conteúdo como texto
 */
export async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const content = e.target?.result as string
      resolve(content)
    }
    
    reader.onerror = () => {
      reject(new Error('Erro ao ler o arquivo'))
    }
    
    reader.readAsText(file)
  })
}

