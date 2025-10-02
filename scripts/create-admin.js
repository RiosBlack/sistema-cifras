const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    console.log('🎵 Sistema de Cifras - Criar Administrador\n')

    // Verificar se já existe um admin
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (existingAdmin) {
      console.log('✅ Já existe um administrador no sistema:')
      console.log(`📧 Email: ${existingAdmin.email}`)
      console.log(`👤 Nome: ${existingAdmin.name}`)
      console.log(`🆔 ID: ${existingAdmin.id}`)
      return
    }

    // Dados do administrador padrão
    const adminData = {
      email: 'admin@sistemacifras.com',
      name: 'Administrador',
      password: 'admin123',
      role: 'ADMIN'
    }

    // Criptografar a senha
    const hashedPassword = await bcrypt.hash(adminData.password, 12)

    // Criar o administrador
    const admin = await prisma.user.create({
      data: {
        email: adminData.email,
        name: adminData.name,
        password: hashedPassword,
        role: adminData.role
      }
    })

    console.log('✅ Administrador criado com sucesso!')
    console.log(`📧 Email: ${admin.email}`)
    console.log(`👤 Nome: ${admin.name}`)
    console.log(`🔐 Senha: ${adminData.password}`)
    console.log(`🔑 Role: ${admin.role}`)
    console.log(`🆔 ID: ${admin.id}`)
    console.log(`📅 Criado em: ${admin.createdAt}`)
    console.log('\n🎯 Use estas credenciais para fazer login como administrador!')

  } catch (error) {
    console.error('❌ Erro ao criar administrador:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()

