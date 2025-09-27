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

    console.log(`\n👤 Usuário encontrado:`)
    console.log(`   📧 Email: ${existingUser.email}`)
    console.log(`   👤 Nome: ${existingUser.name}`)
    console.log(`   🔐 Role: ${existingUser.role}`)
    console.log(`   🎵 Cifras: ${existingUser._count.cifras}`)
    console.log(`   🏷️  Tags: ${existingUser._count.tags}`)
    console.log('')

    // Confirmar exclusão
    console.log('⚠️  ATENÇÃO: Esta ação irá deletar o usuário e todos os seus dados!')
    console.log('   - Todas as cifras do usuário serão deletadas')
    console.log('   - Todas as tags do usuário serão deletadas')
    console.log('   - Esta ação não pode ser desfeita!')
    console.log('')

    const confirm = await askQuestion('❓ Tem certeza que deseja deletar este usuário? (s/N): ')
    
    if (confirm.toLowerCase() === 's' || confirm.toLowerCase() === 'sim') {
      const deletedUser = await prisma.user.delete({
        where: { email }
      })

      console.log(`\n✅ Usuário ${deletedUser.name} (${deletedUser.email}) deletado com sucesso!`)
      return deletedUser
    } else {
      console.log('❌ Exclusão cancelada.')
      return null
    }
  } catch (error) {
    console.error('❌ Erro ao deletar usuário:', error)
    return null
  }
}

async function main() {
  console.log('🎵 Sistema de Cifras - Deletar Usuário\n')

  try {
    // Perguntar email
    let email
    while (true) {
      email = await askQuestion('📧 Digite o email do usuário a ser deletado: ')
      
      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (emailRegex.test(email)) {
        break
      }
      console.log('❌ Email inválido! Tente novamente.\n')
    }

    await deleteUser(email)

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    rl.close()
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

module.exports = { deleteUser }
