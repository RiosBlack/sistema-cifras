# 🎵 Sistema de Cifras

Um sistema completo para gerenciamento de cifras musicais, desenvolvido para uso próprio e distribuído como software open source.

## 📋 Sobre o Projeto

Este é um projeto pessoal criado para facilitar o gerenciamento de cifras musicais, permitindo:
- Criação e edição de cifras com construtor visual
- Transposição de acordes em tempo real
- Organização em repertórios com tons específicos
- Sistema de tags para categorização
- Funcionalidades de impressão

## 🚀 Tecnologias Utilizadas

### Frontend
- **Next.js 15** - Framework React com App Router
- **React 18** - Biblioteca de interface
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes de UI
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas

### Backend
- **Next.js API Routes** - API serverless
- **Prisma** - ORM para banco de dados
- **PostgreSQL** - Banco de dados principal
- **bcryptjs** - Hash de senhas

### Infraestrutura
- **Docker Compose** - Containerização do banco
- **pnpm** - Gerenciador de pacotes

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- pnpm
- Docker e Docker Compose

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/sistema-cifras.git
cd sistema-cifras
```

### 2. Instale as dependências
```bash
pnpm install
```

### 3. Configure as variáveis de ambiente
```bash
cp env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/sistema_cifras"
NEXTAUTH_SECRET="sua-chave-secreta-aqui"
```

### 4. Configure o banco de dados
```bash
# Inicie o PostgreSQL com Docker
docker compose up -d

# Execute as migrações do Prisma
pnpm prisma migrate dev

# (Opcional) Execute o seed para dados iniciais
pnpm prisma db seed
```

### 5. Crie um usuário de teste
```bash
node scripts/create-test-user.js
```

### 6. Inicie o servidor de desenvolvimento
```bash
pnpm dev
```

O sistema estará disponível em [http://localhost:3000](http://localhost:3000)

## 👤 Credenciais de Teste

- **Email**: admin@teste.com
- **Senha**: 123456

## 📚 Funcionalidades

### 🎼 Gerenciamento de Cifras
- **Criar/Editar**: Construtor visual de cifras por seções
- **Transposição**: Transpor acordes em tempo real
- **Visualização**: Modo de visualização com formatação
- **Tags**: Sistema de categorização
- **Impressão**: Geração de PDF para impressão

### 📝 Construtor de Cifras
- **Seções**: Intro, A, B, C, D, etc.
- **Acordes**: Seleção visual de acordes com variações
- **Separadores**: "/" e "→" para transições
- **Formatação**: Destaque visual de seções e separadores

### 🎯 Repertórios
- **Organização**: Agrupar cifras em listas
- **Tons Específicos**: Definir tom para cada cifra no repertório
- **Reordenação**: Arrastar e soltar para reordenar
- **Impressão**: Imprimir repertório completo

### 🔐 Sistema de Autenticação
- **Login/Logout**: Autenticação segura
- **Middleware**: Proteção automática de rotas
- **Sessões**: Persistência com cookies
- **Contexto Global**: Estado reativo de autenticação

## 🗂️ Estrutura do Projeto

```
sistema-cifras/
├── app/                    # App Router do Next.js
│   ├── api/               # API Routes
│   ├── dashboard/         # Página principal
│   ├── login/             # Página de login
│   └── repertorio/        # Página de repertórios
├── components/            # Componentes React
│   ├── cifras/           # Componentes específicos de cifras
│   └── ui/               # Componentes de UI (shadcn/ui)
├── lib/                  # Utilitários e configurações
├── prisma/               # Schema e migrações do banco
├── scripts/              # Scripts de automação
└── public/               # Arquivos estáticos
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev                 # Inicia servidor de desenvolvimento
pnpm build              # Build de produção
pnpm start              # Inicia servidor de produção

# Banco de dados
pnpm prisma studio      # Interface visual do banco
pnpm prisma migrate dev # Aplica migrações
pnpm prisma generate    # Gera cliente Prisma

# Usuários
node scripts/create-user.js        # Criar usuário interativo
node scripts/create-test-user.js   # Criar usuário de teste
node scripts/list-users.js         # Listar usuários
node scripts/delete-user.js        # Deletar usuário

# Docker
docker compose up -d    # Inicia banco de dados
docker compose down     # Para banco de dados
```

## 🤝 Contribuição

Este é um projeto pessoal, mas contribuições são bem-vindas! 

### Como contribuir:
1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

### Padrões de código:
- Use TypeScript para tipagem
- Siga as convenções do ESLint/Prettier
- Escreva commits descritivos
- Documente funcionalidades complexas

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🙏 Agradecimentos

- **shadcn/ui** - Componentes de UI incríveis
- **Next.js** - Framework React poderoso
- **Prisma** - ORM moderno e intuitivo
- **Tailwind CSS** - CSS utility-first

## 📞 Contato

- **Desenvolvedor**: Douglas Rios

---

⭐ **Se este projeto te ajudou, considere dar uma estrela!**

*Desenvolvido com ❤️ para a comunidade musical*
