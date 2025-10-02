import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Listar tags
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const includeAdminTags = searchParams.get('includeAdminTags') === 'true'

    // Buscar informações do usuário para verificar o role
    let currentUser = null
    if (userId) {
      currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true }
      })
    }

    let where: any = {}
    
    if (userId) {
      if (includeAdminTags && currentUser?.role === 'USER') {
        // Para usuários USER, incluir suas próprias tags + tags de usuários ADMIN
        where.OR = [
          { userId: userId }, // Tags próprias
          { 
            user: { 
              role: 'ADMIN' 
            } 
          } // Tags de usuários ADMIN
        ]
      } else {
        // Para usuários ADMIN ou quando não incluir tags de admin, mostrar apenas as próprias
        where.userId = userId
      }
    }

    const tags = await prisma.tag.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: tags
    })

  } catch (error) {
    console.error('Erro ao buscar tags:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
