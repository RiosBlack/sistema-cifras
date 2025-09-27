# Docker Setup para Sistema de Cifras

Este documento explica como configurar e executar o banco de dados PostgreSQL usando Docker Compose.

## Pré-requisitos

- Docker
- Docker Compose

## Configuração

### 1. Configurar variáveis de ambiente

Copie o arquivo de exemplo e configure as variáveis:

```bash
cp env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/sistema_cifras?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
NODE_ENV="development"
```

### 2. Iniciar os serviços

```bash
# Iniciar apenas o PostgreSQL
docker-compose up postgres -d

# Ou iniciar todos os serviços (PostgreSQL + pgAdmin)
docker-compose up -d
```

### 3. Executar migrações do Prisma

```bash
# Gerar o cliente Prisma
npx prisma generate

# Executar as migrações
npx prisma db push

# Ou criar uma migração
npx prisma migrate dev --name init
```

## Serviços Disponíveis

### PostgreSQL
- **Host**: localhost
- **Porta**: 5432
- **Database**: sistema_cifras
- **Usuário**: postgres
- **Senha**: postgres123

### pgAdmin (Opcional)
- **URL**: http://localhost:8080
- **Email**: admin@sistema-cifras.com
- **Senha**: admin123

Para conectar o pgAdmin ao PostgreSQL:
- Host: postgres
- Port: 5432
- Database: sistema_cifras
- Username: postgres
- Password: postgres123

## Comandos Úteis

```bash
# Parar os serviços
docker-compose down

# Parar e remover volumes (CUIDADO: apaga todos os dados)
docker-compose down -v

# Ver logs
docker-compose logs postgres

# Acessar o container PostgreSQL
docker-compose exec postgres psql -U postgres -d sistema_cifras

# Resetar o banco de dados
docker-compose down -v
docker-compose up postgres -d
npx prisma db push
```

## Estrutura do Banco

O banco de dados inclui as seguintes tabelas:

- `users` - Usuários do sistema
- `tags` - Tags para categorizar cifras
- `cifras` - Cifras musicais
- `cifra_tags` - Relacionamento entre cifras e tags

## Troubleshooting

### Erro de conexão
- Verifique se o container está rodando: `docker-compose ps`
- Verifique os logs: `docker-compose logs postgres`
- Confirme se a porta 5432 não está sendo usada por outro serviço

### Problemas de migração
- Certifique-se de que o `.env` está configurado corretamente
- Execute `npx prisma generate` antes das migrações
- Use `npx prisma db push` para desenvolvimento ou `npx prisma migrate dev` para produção
