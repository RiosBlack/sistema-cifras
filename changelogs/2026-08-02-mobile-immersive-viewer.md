# 2026-08-02 — Viewer imersivo no celular

## O que mudou
Ao abrir a visualização (ícone Eye) de cifra ou repertório em viewport < 768px, o Dialog ocupa 100% da tela (imersão no app, sem Fullscreen API do browser).

## Comportamento
- **Cifra (mobile):** título, artista, tom, transposição, letra e observações; fecha com X/ESC.
- **Repertório (mobile):** título, lista e letras em só leitura — ocultos imprimir, subir, descer e remover.
- **Desktop:** Dialog e controles iguais ao anterior.

## Arquivos
- `app/dashboard/page.tsx` — classes `max-md:` de fullscreen no viewer de cifra
- `app/repertorio/page.tsx` — fullscreen + `hidden md:flex` nos controles de edição
