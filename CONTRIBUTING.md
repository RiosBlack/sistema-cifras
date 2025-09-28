# 🤝 Guia de Contribuição

Obrigado por considerar contribuir para o Sistema de Cifras! Este documento fornece diretrizes para contribuir com o projeto.

## 📋 Como Contribuir

### 1. Fork e Clone
```bash
# Faça fork do repositório no GitHub
# Clone seu fork localmente
git clone https://github.com/SEU-USUARIO/sistema-cifras.git
cd sistema-cifras
```

### 2. Configuração do Ambiente
```bash
# Instale as dependências
pnpm install

# Configure o banco de dados
docker compose up -d
pnpm prisma migrate dev

# Crie um usuário de teste
node scripts/create-test-user.js

# Inicie o servidor de desenvolvimento
pnpm dev
```

### 3. Crie uma Branch
```bash
git checkout -b feature/nome-da-feature
# ou
git checkout -b fix/descricao-do-bug
```

### 4. Desenvolvimento

#### Padrões de Código
- **TypeScript**: Use tipagem forte
- **ESLint**: Siga as regras configuradas
- **Prettier**: Formatação automática
- **Conventional Commits**: Use mensagens padronizadas

#### Estrutura de Commits
```bash
feat: adicionar nova funcionalidade
fix: corrigir bug
docs: atualizar documentação
style: formatação de código
refactor: refatorar código
test: adicionar testes
chore: tarefas de manutenção
```

#### Exemplos:
```bash
git commit -m "feat: adicionar sistema de favoritos"
git commit -m "fix: corrigir transposição de acordes"
git commit -m "docs: atualizar README com novas funcionalidades"
```

### 5. Testes
```bash
# Execute os testes
pnpm test

# Verifique a qualidade do código
pnpm lint

# Verifique a formatação
pnpm format
```

### 6. Push e Pull Request
```bash
# Push para sua branch
git push origin feature/nome-da-feature

# Crie um Pull Request no GitHub
```

## 🎯 Tipos de Contribuições

### 🐛 Reportar Bugs
1. Verifique se o bug já foi reportado
2. Use o template de issue
3. Inclua informações detalhadas:
   - Passos para reproduzir
   - Comportamento esperado vs atual
   - Screenshots (se aplicável)
   - Ambiente (SO, navegador, versão)

### ✨ Sugerir Funcionalidades
1. Verifique se a funcionalidade já foi sugerida
2. Descreva claramente o problema que resolve
3. Explique como seria a implementação
4. Considere casos de uso alternativos

### 💻 Contribuições de Código
- **Bug fixes**: Correções de bugs existentes
- **Features**: Novas funcionalidades
- **Documentação**: Melhorias na documentação
- **Testes**: Adição de testes
- **Refatoração**: Melhorias de código

## 📚 Áreas de Foco

### 🎵 Funcionalidades Musicais
- Melhorias no construtor de cifras
- Novos tipos de acordes
- Sistema de transposição
- Funcionalidades de impressão

### 🎨 Interface do Usuário
- Componentes de UI
- Responsividade
- Acessibilidade
- Experiência do usuário

### 🔧 Infraestrutura
- Performance
- Segurança
- Testes automatizados
- CI/CD

### 📖 Documentação
- README
- Documentação de API
- Guias de uso
- Exemplos

## 🔍 Processo de Review

### Critérios de Aceitação
- ✅ Código segue os padrões estabelecidos
- ✅ Funcionalidade testada e funcionando
- ✅ Documentação atualizada
- ✅ Não quebra funcionalidades existentes
- ✅ Commits bem estruturados

### Timeline
- **Review**: 1-3 dias úteis
- **Feedback**: Resposta em 24-48h
- **Aprovação**: Após correções necessárias

## 🚫 O que NÃO Fazer

- ❌ Commits com mensagens genéricas
- ❌ Código sem tipagem TypeScript
- ❌ Quebrar funcionalidades existentes
- ❌ Ignorar testes
- ❌ Pull Requests muito grandes
- ❌ Código não formatado

## 💡 Dicas para Contribuidores

### Para Iniciantes
1. Comece com issues marcadas como "good first issue"
2. Leia a documentação existente
3. Faça perguntas na seção de discussões
4. Teste suas mudanças localmente

### Para Desenvolvedores Experientes
1. Revise código de outros contribuidores
2. Sugira melhorias arquiteturais
3. Ajude com issues complexas
4. Mentore novos contribuidores

## 📞 Comunicação

### Canais
- **Issues**: Para bugs e funcionalidades
- **Discussions**: Para dúvidas e ideias
- **Pull Requests**: Para código

### Linguagem
- **Português**: Para discussões e documentação
- **Inglês**: Para código e commits

## 🏆 Reconhecimento

Contribuidores ativos serão reconhecidos:
- Listados no README
- Menção em releases
- Badge de contribuidor

## 📄 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a [MIT License](LICENSE).

---

**Obrigado por contribuir! 🎵✨**

*Juntos, podemos tornar o Sistema de Cifras ainda melhor para a comunidade musical!*
