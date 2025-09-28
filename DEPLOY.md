# 🚀 Guia de Deploy na Vercel

Este guia explica como fazer deploy do Sistema de Cifras na Vercel.

## 📋 Pré-requisitos

1. **Conta na Vercel** - [vercel.com](https://vercel.com)
2. **Banco de dados PostgreSQL** - Recomendamos:
   - [Neon](https://neon.tech) (gratuito)
   - [Supabase](https://supabase.com) (gratuito)
   - [PlanetScale](https://planetscale.com) (gratuito)
   - [Railway](https://railway.app) (gratuito)

## 🗄️ Configuração do Banco de Dados

### 1. Criar banco PostgreSQL
Escolha um dos provedores acima e crie um banco PostgreSQL.

### 2. Obter URL de conexão
Copie a URL de conexão do banco (exemplo):
```
postgresql://username:password@host:port/database?sslmode=require
```

### 3. Executar migrações
```bash
# Configure a DATABASE_URL
export DATABASE_URL="sua-url-do-banco"

# Execute as migrações
pnpm prisma migrate deploy
```

## 🔧 Deploy na Vercel

### 1. Conectar repositório
1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Conecte seu repositório GitHub
4. Selecione o projeto `sistema-cifras`

### 2. Configurar variáveis de ambiente
Na Vercel, adicione as seguintes variáveis:

```env
DATABASE_URL=sua-url-do-banco-postgresql
NEXTAUTH_URL=https://seu-app.vercel.app
NEXTAUTH_SECRET=sua-chave-secreta-forte
NODE_ENV=production
```

### 3. Configurações de build
A Vercel detectará automaticamente as configurações do `vercel.json`:
- ✅ **Build Command**: `pnpm prisma generate && pnpm build`
- ✅ **Install Command**: `pnpm install`
- ✅ **Framework**: Next.js

### 4. Deploy
1. Clique em "Deploy"
2. Aguarde o build completar
3. Acesse sua aplicação!

## 🔍 Solução de Problemas

### Erro: "Cannot find module '.prisma/client/default'"
**Solução**: O Prisma Client não foi gerado corretamente.

1. Verifique se a `DATABASE_URL` está configurada
2. Execute localmente: `pnpm prisma generate`
3. Faça commit e push das mudanças
4. Re-deploy na Vercel

### Erro: "Database connection failed"
**Solução**: Problema de conexão com o banco.

1. Verifique se a `DATABASE_URL` está correta
2. Teste a conexão localmente
3. Verifique se o banco aceita conexões externas

### Erro: "Build timeout"
**Solução**: Build demorando muito.

1. Verifique os logs de build na Vercel
2. Considere usar um banco mais próximo
3. Otimize as dependências

## 📊 Monitoramento

### Logs da Vercel
1. Acesse o dashboard da Vercel
2. Vá em "Functions" para ver logs das APIs
3. Use "Analytics" para métricas de performance

### Banco de Dados
1. Monitore conexões ativas
2. Verifique queries lentas
3. Configure alertas de uso

## 🔄 Atualizações

### Deploy automático
- ✅ Push para `main` → Deploy automático
- ✅ Pull Requests → Preview deployments

### Deploy manual
```bash
# Fazer mudanças
git add .
git commit -m "feat: nova funcionalidade"
git push origin main

# Vercel fará deploy automaticamente
```

## 🛡️ Segurança

### Variáveis de ambiente
- ✅ Nunca commite `.env` files
- ✅ Use variáveis da Vercel para secrets
- ✅ Rotacione chaves regularmente

### Banco de dados
- ✅ Use SSL/TLS (sslmode=require)
- ✅ Configure firewall se necessário
- ✅ Monitore acessos suspeitos

## 📈 Performance

### Otimizações
- ✅ **Prisma**: Client gerado no build
- ✅ **Next.js**: Otimizações automáticas
- ✅ **Vercel**: CDN global
- ✅ **Imagens**: Otimização automática

### Monitoramento
- ✅ **Core Web Vitals**: Métricas de performance
- ✅ **Analytics**: Dados de uso
- ✅ **Functions**: Logs de API

## 🆘 Suporte

### Recursos úteis
- [Documentação Vercel](https://vercel.com/docs)
- [Prisma + Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

### Problemas comuns
1. **Build falha**: Verifique logs na Vercel
2. **API não funciona**: Verifique variáveis de ambiente
3. **Banco não conecta**: Teste URL de conexão

---

**🎉 Deploy concluído com sucesso!**

*Seu Sistema de Cifras está online e pronto para uso!*
