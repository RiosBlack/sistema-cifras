# Impressão colorida de cifras e repertórios

**Data:** 2026-07-31

## Objetivo
Manter na impressão as mesmas cores da tela (acordes laranja, `/` preto, `→`/`Nx` azul), em vez de preto e branco.

## Causa
Navegadores removem ou convertem cores na impressão por padrão (economia de tinta), a menos que `print-color-adjust: exact` seja definido.

## Mudanças
- Forçado `print-color-adjust: exact` (e `-webkit-print-color-adjust`) nos estilos de impressão.
- Cor laranja explícita em `.chord` no HTML de impressão.
- Aplicado em impressão de cifra (dashboard) e de repertório.

## Arquivos
- `components/cifras/cifra-lyrics-display.tsx`
- `app/repertorio/page.tsx`
- `app/dashboard/page.tsx`
