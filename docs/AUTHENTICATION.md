# Sistema de Autenticação

## Visão Geral

O sistema de autenticação foi implementado usando Next.js, Prisma, bcryptjs, Zod e React Hook Form, seguindo as melhores práticas de segurança.

## Componentes

### 1. Formulário de Login (`components/auth/login-form.tsx`)

- **Validação**: Zod schema para email e senha
- **UI**: shadcn/ui components com design responsivo
- **Funcionalidades**:
  - Mostrar/ocultar senha
  - Loading state durante autenticação
  - Tratamento de erros
  - Redirecionamento automático após login

### 2. Formulário de Registro (`components/auth/register-form.tsx`)

- **Validação**: Zod schema com confirmação de senha
- **Funcionalidades**:
  - Validação de nome, email e senha
  - Confirmação de senha
  - Verificação de email único
  - Redirecionamento para login após registro

### 3. Páginas

- **Login**: `/login`
- **Registro**: `/register`

## API Routes

### 1. Login (`/api/auth/login`)

```typescript
POST /api/auth/login
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Resposta de sucesso:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "email": "usuario@exemplo.com",
    "name": "Nome do Usuário",
    "role": "USER"
  }
}
```

### 2. Registro (`/api/auth/register`)

```typescript
POST /api/auth/register
{
  "name": "Nome Completo",
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

## Segurança

### 1. Criptografia de Senhas
- **Biblioteca**: bcryptjs
- **Salt rounds**: 12
- **Verificação**: `bcrypt.compare()` para autenticação

### 2. Validação de Dados
- **Frontend**: Zod schemas
- **Backend**: Validação dupla com Zod
- **Sanitização**: Prisma ORM

### 3. Tratamento de Erros
- Mensagens de erro específicas
- Logs de segurança
- Rate limiting (recomendado para produção)

## Scripts de Gerenciamento

### 1. Criar Usuário de Teste
```bash
npm run create-test-user
```

### 2. Menu Interativo
```bash
npm run user-menu
```

### 3. Listar Usuários
```bash
npm run list-users
```

## Usuário de Teste

**Credenciais padrão:**
- **Email**: `teste@exemplo.com`
- **Senha**: `123456`
- **Nome**: João Silva
- **Role**: USER

## Próximos Passos

### 1. Sessões e JWT
- Implementar JWT tokens
- Cookies seguros
- Refresh tokens

### 2. Middleware de Autenticação
- Proteção de rotas
- Verificação de sessão
- Redirecionamento automático

### 3. Recuperação de Senha
- Reset de senha por email
- Tokens temporários
- Validação de segurança

### 4. Autenticação Social
- Google OAuth
- GitHub OAuth
- Facebook OAuth

## Estrutura de Arquivos

```
components/auth/
├── login-form.tsx
└── register-form.tsx

app/
├── login/page.tsx
├── register/page.tsx
└── api/auth/
    ├── login/route.ts
    └── register/route.ts

lib/
└── auth.ts

scripts/
├── create-test-user.js
├── create-user-interactive.js
└── user-menu.js
```

## Dependências

```json
{
  "@hookform/resolvers": "^3.9.1",
  "react-hook-form": "^7.48.2",
  "zod": "^3.22.4",
  "bcryptjs": "3.0.2",
  "@prisma/client": "6.16.2"
}
```

## Configuração do Banco

O sistema usa PostgreSQL com Prisma ORM. Certifique-se de que:

1. Docker Compose está rodando
2. Variável `DATABASE_URL` está configurada
3. Prisma Client foi gerado: `npx prisma generate`

## Testes

### 1. Teste de Login
1. Acesse `/login`
2. Use as credenciais do usuário de teste
3. Verifique redirecionamento para `/dashboard`

### 2. Teste de Registro
1. Acesse `/register`
2. Preencha o formulário
3. Verifique redirecionamento para `/login`

### 3. Teste de Validação
1. Tente login com credenciais inválidas
2. Verifique mensagens de erro
3. Teste validação de email e senha
