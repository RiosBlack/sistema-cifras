const { PrismaClient } = require('@prisma/client')
const readline = require('readline')

const prisma = new PrismaClient()

// Criar interface readline
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// Função para fazer perguntas
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim())
    })
  })
}

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            cifras: true,
            tags: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (users.length === 0) {
      console.log('📭 Nenhum usuário encontrado!')
      return
    }

    console.log(`\n👥 Total de usuários: ${users.length}\n`)

    users.forEach((user, index) => {
      console.log(`${index + 1}. 👤 ${user.name}`)
      console.log(`   📧 Email: ${user.email}`)
      console.log(`   🔐 Role: ${user.role}`)
      console.log(`   🆔 ID: ${user.id}`)
      console.log(`   📅 Criado: ${user.createdAt.toLocaleDateString('pt-BR')}`)
      console.log(`   🎵 Cifras: ${user._count.cifras}`)
      console.log(`   🏷️  Tags: ${user._count.tags}`)
      console.log('')
    })
  } catch (error) {
    console.error('❌ Erro ao listar usuários:', error)
  }
}

async function createUser() {
  const { createUser } = require('./create-user-interactive')
  await createUser()
}

async function deleteUser() {
  const { deleteUser } = require('./delete-user-interactive')
  await deleteUser()
}

async function showMenu() {
  console.log('\n🎵 Sistema de Cifras - Gerenciamento de Usuários')
  console.log('================================================')
  console.log('1. 👥 Listar usuários')
  console.log('2. ➕ Criar usuário')
  console.log('3. ❌ Deletar usuário')
  console.log('4. 🚪 Sair')
  console.log('')
}

async function main() {
  console.log('🎵 Sistema de Cifras - Gerenciamento de Usuários')
  console.log('================================================')

  while (true) {
    await showMenu()
    
    const choice = await askQuestion('Escolha uma opção (1-4): ')
    
    switch (choice) {
      case '1':
        await listUsers()
        break
      case '2':
        await createUser()
        break
      case '3':
        await deleteUser()
        break
      case '4':
        console.log('\n👋 Até logo!')
        rl.close()
        return
      default:
        console.log('❌ Opção inválida! Tente novamente.\n')
    }
    
    // Pausa antes de mostrar o menu novamente
    if (choice !== '4') {
      await askQuestion('\nPressione Enter para continuar...')
    }
  }
}

// Executar se for chamado diretamente
if (require.main === module) {
  main()
    .catch((error) => {
      console.error('❌ Erro fatal:', error)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}

module.exports = { main }
