const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

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

    console.log(`👥 Total de usuários: ${users.length}\n`)

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

async function main() {
  await listUsers()
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

module.exports = { listUsers }
