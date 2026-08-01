# Cores dos separadores na visualização de cifras

**Data:** 2026-07-31

## Objetivo
Diferenciar visualmente barras (`/`), setas (`→`) e repetições (`Nx`) na exibição de acordes.

## Mudanças
- Criado `components/cifras/cifra-lyrics-display.tsx` com renderização compartilhada.
- `/` em **preto**; `→` e `Nx` (ex: `2x`) em **azul** (`text-blue-600`).
- Aplicado em dashboard (modal), repertório, preview do editor e HTML de impressão.

## Arquivos
- `components/cifras/cifra-lyrics-display.tsx` (novo)
- `app/dashboard/page.tsx`
- `app/repertorio/page.tsx`
- `components/cifras/cifra-editor.tsx`
