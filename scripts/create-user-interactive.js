const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
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

async function createUser(userData) {
  try {
    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    })

    if (existingUser) {
      console.log(`❌ Usuário com email ${userData.email} já existe!`)
      return null
    }

    // Criptografar a senha
    const hashedPassword = await bcrypt.hash(userData.password, 12)

    // Criar o usuário
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
        role: userData.role || 'USER'
      }
    })

    console.log(`\n✅ Usuário criado com sucesso!`)
    console.log(`📧 Email: ${user.email}`)
    console.log(`👤 Nome: ${user.name}`)
    console.log(`🔐 Role: ${user.role}`)
    console.log(`🆔 ID: ${user.id}`)
    console.log(`📅 Criado em: ${user.createdAt}`)

    return user
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error)
    return null
  }
}

async function main() {
  console.log('🎵 Sistema de Cifras - Criar Usuário\n')

  try {
    // Perguntar email
    let email
    while (true) {
      email = await askQuestion('📧 Digite o email: ')
      
      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (emailRegex.test(email)) {
        break
      }
      console.log('❌ Email inválido! Tente novamente.\n')
    }

    // Perguntar nome
    const name = await askQuestion('👤 Digite o nome completo: ')

    // Perguntar senha
    let password
    while (true) {
      password = await askQuestion('🔐 Digite a senha (mínimo 6 caracteres): ')
      
      if (password.length >= 6) {
        break
      }
      console.log('❌ Senha deve ter pelo menos 6 caracteres!\n')
    }

    // Perguntar role
    let role
    while (true) {
      role = await askQuestion('🔑 Digite o role (USER/ADMIN) [padrão: USER]: ')
      
      if (!role) {
        role = 'USER'
        break
      }
      
      if (['USER', 'ADMIN'].includes(role.toUpperCase())) {
        role = role.toUpperCase()
        break
      }
      console.log('❌ Role deve ser USER ou ADMIN!\n')
    }

    // Confirmar dados
    console.log('\n📋 Confirme os dados:')
    console.log(`📧 Email: ${email}`)
    console.log(`👤 Nome: ${name}`)
    console.log(`🔐 Role: ${role}`)
    
    const confirm = await askQuestion('\n✅ Confirmar criação? (s/N): ')
    
    if (confirm.toLowerCase() === 's' || confirm.toLowerCase() === 'sim') {
      const userData = {
        email,
        name,
        password,
        role
      }

      await createUser(userData)
    } else {
      console.log('❌ Criação cancelada.')
    }

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

module.exports = { createUser }
