# Busca por nome no modal de adicionar cifra

**Data:** 2026-07-31

## Objetivo
Facilitar a seleção de cifras no modal “Adicionar Cifra ao Repertório” quando há muitas opções.

## Mudanças
- Input de busca no modal, no mesmo padrão visual da lista de repertórios.
- Filtro client-side apenas pelo título (`cifra.title`).
- Mensagem “Nenhuma cifra encontrada” quando o filtro não retorna resultados.
- Termo de busca limpo ao abrir/fechar o modal.

## Arquivos
- `app/repertorio/page.tsx`
