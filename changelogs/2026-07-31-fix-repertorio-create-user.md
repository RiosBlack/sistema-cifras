# 2026-07-31 — Fix: criar repertório sem `user`

## Problema
Ao criar um repertório, a página crashava com:
`Cannot read properties of undefined (reading 'id')` em `renderRepertorioCard`.

## Causa
O `POST /api/repertorios` retornava o repertório sem a relação `user`. O frontend inseria esse objeto na lista e, ao renderizar, acessava `repertorio.user.id`.

## Correção
- Incluir `user` (id, name, email, role) no `include` do `POST`, alinhado ao `GET`.
- Incluir `role` no `user` dos endpoints `GET`/`PUT` por id, para consistência com a listagem.
