const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function deleteUser(email) {
  try {
    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: {
        _count: {
          select: {
            cifras: true,
            tags: true
          }
        }
      }
    })

    if (!existingUser) {
      console.log(`❌ Usuário com email ${email} não encontrado!`)
      return null
    }

    console.log(`👤 Usuário encontrado:`)
    console.log(`   📧 Email: ${existingUser.email}`)
    console.log(`   👤 Nome: ${existingUser.name}`)
    console.log(`   🔐 Role: ${existingUser.role}`)
    console.log(`   🎵 Cifras: ${existingUser._count.cifras}`)
    console.log(`   🏷️  Tags: ${existingUser._count.tags}`)
    console.log('')

    // Simular confirmação (em produção, usar readline)
    console.log('⚠️  ATENÇÃO: Esta ação irá deletar o usuário e todos os seus dados!')
    console.log('   - Todas as cifras do usuário serão deletadas')
    console.log('   - Todas as tags do usuário serão deletadas')
    console.log('   - Esta ação não pode ser desfeita!')
    console.log('')

    // Para demonstração, vamos deletar automaticamente
    // Em produção, adicionar confirmação interativa
    const deletedUser = await prisma.user.delete({
      where: { email }
    })

    console.log(`✅ Usuário ${deletedUser.name} (${deletedUser.email}) deletado com sucesso!`)
    return deletedUser
  } catch (error) {
    console.error('❌ Erro ao deletar usuário:', error)
    return null
  }
}

async function main() {
  const args = process.argv.slice(2)
  
  if (args.length < 1) {
    console.log(`
📝 Uso: node scripts/delete-user.js <email>

Exemplo:
  node scripts/delete-user.js user@exemplo.com
    `)
    process.exit(1)
  }

  const email = args[0]

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    console.log('❌ Email inválido!')
    process.exit(1)
  }

  await deleteUser(email)
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

module.exports = { deleteUser }
