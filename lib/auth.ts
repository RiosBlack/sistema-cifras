import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'

const prisma = new PrismaClient()

export interface LoginCredentials {
  email: string
  password: string
}

export interface User {
  id: string
  email: string
  name: string
  role: 'USER' | 'ADMIN'
}

export async function authenticateUser(credentials: LoginCredentials): Promise<User | null> {
  try {
    // Buscar usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email: credentials.email }
    })

    if (!user) {
      return null
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(credentials.password, user.password)

    if (!isValidPassword) {
      return null
    }

    // Retornar dados do usuário (sem a senha)
    return {
      id: user.id,
      email: user.email,
      name: user.name || '',
      role: user.role
    }
  } catch (error) {
    console.error('Erro na autenticação:', error)
    return null
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    return user
  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    return null
  }
}

export async function createSession(user: User) {
  // Em uma implementação real, você criaria uma sessão JWT ou usar NextAuth.js
  // Por enquanto, vamos simular uma sessão
  return {
    user,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias
  }
}

export async function getSessionFromRequest(request: NextRequest): Promise<User | null> {
  // Em uma implementação real, você extrairia o token JWT do cookie/header
  // Por enquanto, vamos retornar null
  return null
}
