# 2026-08-02 — PWA standalone

## O que mudou
O app passou a ser instalável como Progressive Web App (`display: standalone`). Ao adicionar à tela inicial no celular, abre sem a barra de endereço do navegador.

## Detalhes
- Manifest em `app/manifest.ts` (nome, ícones 192/512, standalone)
- Ícones em `public/icons/`
- Service worker mínimo em `public/sw.js` + registro via `components/pwa-register.tsx`
- Banner de instalação no mobile (`components/pwa-install-prompt.tsx`) quando não está em standalone
- Metadata Apple / themeColor atualizados em `app/layout.tsx`

## Como instalar
- **Android Chrome:** menu → Instalar app / Adicionar à tela inicial
- **iOS Safari:** Compartilhar → Adicionar à Tela de Início

## Observação
Dentro do Chrome/Safari normal a barra continua; ela some apenas no atalho instalado.
