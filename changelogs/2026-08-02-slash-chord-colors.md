# Cores: slash chords vs separadores

**Data:** 2026-08-02

## Objetivo
Corrigir a coloração da barra `/` e pontuação na visualização de cifras.

## Regras
- `C/E` (barra colada à letra) → **laranja** (faz parte do acorde)
- ` / ` (espaços dos dois lados) → **preto** (separador entre acordes)
- `(`, `)` → **azul** (as notas ao redor ficam laranja)
- `-` → **preto** (as notas ao redor ficam laranja)
- Textos com mais de 3 palavras → **preto**
- `→` e `Nx` → azul (inalterado)

## Causa
O regex `\s*\/\s*` tratava qualquer `/` (inclusive em `C/E`) como separador preto.
A primeira correção escurecia blocos inteiros `(...)` e `-Label`, incluindo as notas.

## Arquivos
- `components/cifras/cifra-lyrics-display.tsx`
- `AGENTS.md`
