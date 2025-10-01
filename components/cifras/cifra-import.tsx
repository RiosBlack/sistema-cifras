"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react'
import { parseCifraFromText, readFileAsText, sectionsToLyrics } from '@/lib/cifra-import-utils'

interface CifraImportProps {
  onImport: (data: {
    title: string
    artist: string
    lyrics: string
    originalKey: string
  }) => void
}

export function CifraImport({ onImport }: CifraImportProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    // Validar tipo de arquivo
    if (!file.name.endsWith('.txt')) {
      setError('Por favor, envie apenas arquivos .txt')
      return
    }

    setImporting(true)
    setError(null)
    setSuccess(false)

    try {
      // Ler conteúdo do arquivo
      const content = await readFileAsText(file)
      
      // Parsear cifra
      const parsed = parseCifraFromText(content)
      
      // Validar se conseguiu extrair seções
      if (parsed.sections.length === 0) {
        setError('Não foi possível extrair acordes do arquivo. Verifique o formato.')
        setImporting(false)
        return
      }

      // Converter seções para o formato de lyrics
      const lyrics = sectionsToLyrics(parsed.sections)

      // Chamar callback de importação
      onImport({
        title: parsed.title,
        artist: parsed.artist,
        lyrics: lyrics,
        originalKey: parsed.originalKey
      })

      setSuccess(true)
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSuccess(false)
      }, 3000)

    } catch (err) {
      console.error('Erro ao importar cifra:', err)
      setError('Erro ao processar o arquivo. Verifique se está no formato correto.')
    } finally {
      setImporting(false)
    }
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      await handleFile(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      await handleFile(files[0])
    }
    // Limpar input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Importar Cifra
        </CardTitle>
        <CardDescription>
          Envie um arquivo .txt com a cifra no formato padrão (seções e acordes sem letras)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Área de drop */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
          className={`
            relative border-2 border-dashed rounded-lg p-8
            transition-colors cursor-pointer
            flex flex-col items-center justify-center gap-4
            min-h-[200px]
            ${isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
            }
            ${importing ? 'opacity-50 cursor-wait' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            onChange={handleFileSelect}
            className="hidden"
            disabled={importing}
          />

          <div className="flex flex-col items-center gap-2 text-center">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                {importing ? 'Processando arquivo...' : 'Clique ou arraste um arquivo aqui'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Apenas arquivos .txt são aceitos
              </p>
            </div>
          </div>

          {importing && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="text-sm">Importando...</span>
              </div>
            </div>
          )}
        </div>

        {/* Mensagens de erro */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Mensagem de sucesso */}
        {success && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-600 dark:text-green-400">
              Cifra importada com sucesso! Os campos foram preenchidos automaticamente.
            </AlertDescription>
          </Alert>
        )}

        {/* Instruções */}
        <div className="text-xs text-muted-foreground space-y-2 border-t pt-4">
          <p className="font-medium">Formato esperado do arquivo:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Primeira linha: Artista - Título</li>
            <li>Seções entre colchetes: [Intro], [Verso], [Refrão]</li>
            <li>Acordes em linhas separadas (sem letras de música)</li>
            <li>Exemplo: F7M Dm7 Am7(9)</li>
          </ul>
          <p className="text-xs italic mt-2">
            💡 O sistema irá extrair apenas os acordes, ignorando as letras da música.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

