# AGENTS.md — Sistema de Cifras

## Resumo
Sistema web para gerenciamento de cifras musicais: criação/edição, transposição, repertórios, tags e impressão.

## Tech Stack
- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes, Prisma ORM, PostgreSQL
- **Auth:** Cookies + bcrypt (sessão própria; ver `lib/auth.ts`, `middleware.ts`)
- **Package manager:** pnpm

## Regras de negócio
- Usuários autenticados gerenciam suas próprias cifras e repertórios.
- ADMIN pode ver cifras de outros usuários, mas só edita/exclui as próprias.
- Separadores de acordes: ` / ` (barra com espaços) e ` → ` (seta de transição).
- Visualização: acordes em laranja (inclui slash chords como `C/E`); **` / ` preto**; **`→`, `Nx` (ex: 2x) e `()` azul**; `-` e textos com mais de 3 palavras em preto (notas ao redor continuam laranja); rótulos de seção em preto.

## Autenticação
1. Login/registro em `/login` e `/register`.
2. Sessão via cookie HTTP-only.
3. Rotas protegidas por `AuthRouteGuard` + `middleware.ts`.

## Estrutura de pastas
```
app/                  # Rotas (dashboard, repertorio, login, api, admin)
components/
  cifras/             # Editor, import, lyrics display, chord builder
  auth/               # Formulários de auth
  ui/                 # shadcn/ui
lib/                  # auth, music-utils, contexts
prisma/               # Schema e migrations
scripts/              # Utilitários de usuário/DB
changelogs/           # Histórico de mudanças por feature
```

## ERD (simplificado)
```
User 1──* Cifra
User 1──* Repertorio
User 1──* Tag
Cifra *──* Tag (CifraTag)
Repertorio *──* Cifra (RepertorioCifra: selectedKey, order)
```

## Setup
```bash
pnpm install
cp env.example .env
docker compose up -d
pnpm prisma migrate dev
pnpm run create-test-user
pnpm run dev
```

## Variáveis de ambiente
| Var | Descrição |
|-----|-----------|
| `DATABASE_URL` | Connection string PostgreSQL |
| `NEXTAUTH_URL` | URL base da app |
| `NEXTAUTH_SECRET` | Segredo de sessão |
| `NODE_ENV` | development / production |

## Changelogs
- [2026-08-02 — slash chords vs separadores](changelogs/2026-08-02-slash-chord-colors.md)
- [2026-08-02 — PWA standalone](changelogs/2026-08-02-pwa-standalone.md)
- [2026-08-02 — viewer imersivo no celular](changelogs/2026-08-02-mobile-immersive-viewer.md)
- [2026-07-31 — busca no modal adicionar cifra](changelogs/2026-07-31-repertorio-add-cifra-search.md)
- [2026-07-31 — impressão colorida](changelogs/2026-07-31-print-colors.md)
- [2026-07-31 — fix criar repertório (user)](changelogs/2026-07-31-fix-repertorio-create-user.md)
- [2026-07-31 — cores dos separadores](changelogs/2026-07-31-separator-colors.md)
