const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    console.log('🎵 Criando usuário de teste...')
    
    const email = 'teste@exemplo.com'
    const name = 'João Silva'
    const password = '123456'
    const role = 'USER'
    
    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      console.log('❌ Usuário já existe!')
      return
    }
    
    // Criptografar senha
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role
      }
    })
    
    console.log('✅ Usuário criado com sucesso!')
    console.log(`📧 Email: ${user.email}`)
    console.log(`👤 Nome: ${user.name}`)
    console.log(`🔑 Senha: ${password}`)
    console.log(`👑 Role: ${user.role}`)
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()
