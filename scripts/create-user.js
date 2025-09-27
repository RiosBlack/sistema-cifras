const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

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

    console.log(`✅ Usuário criado com sucesso!`)
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
  // Verificar argumentos da linha de comando
  const args = process.argv.slice(2)
  
  if (args.length < 3) {
    console.log(`
📝 Uso: node scripts/create-user.js <email> <nome> <senha> [role]

Exemplos:
  node scripts/create-user.js admin@exemplo.com "Admin" "123456" ADMIN
  node scripts/create-user.js user@exemplo.com "Usuário" "123456" USER
  node scripts/create-user.js user@exemplo.com "Usuário" "123456"
    `)
    process.exit(1)
  }

  const [email, name, password, role] = args

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    console.log('❌ Email inválido!')
    process.exit(1)
  }

  // Validar senha
  if (password.length < 6) {
    console.log('❌ Senha deve ter pelo menos 6 caracteres!')
    process.exit(1)
  }

  // Validar role
  if (role && !['USER', 'ADMIN'].includes(role)) {
    console.log('❌ Role deve ser USER ou ADMIN!')
    process.exit(1)
  }

  const userData = {
    email,
    name,
    password,
    role: role || 'USER'
  }

  await createUser(userData)
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
