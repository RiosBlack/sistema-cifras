const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@teste.com' }
    })

    if (existingUser) {
      console.log('Usuário de teste já existe!')
      return
    }

    // Criar usuário de teste
    const hashedPassword = await bcrypt.hash('123456', 10)
    
    const user = await prisma.user.create({
      data: {
        email: 'admin@teste.com',
        password: hashedPassword,
        name: 'Usuário Teste',
        role: 'ADMIN'
      }
    })

    console.log('Usuário de teste criado com sucesso!')
    console.log('Email: admin@teste.com')
    console.log('Senha: 123456')
    console.log('ID:', user.id)
    
  } catch (error) {
    console.error('Erro ao criar usuário de teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()