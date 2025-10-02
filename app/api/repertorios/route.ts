import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const repertorioSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  userId: z.string().min(1, 'User ID é obrigatório')
})

// GET - Listar repertórios
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const includeAdminRepertorios = searchParams.get('includeAdminRepertorios') === 'true'

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar informações do usuário para verificar o role
    let currentUser = null
    currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true }
    })

    let where: any = {}
    
    if (includeAdminRepertorios && currentUser?.role === 'USER') {
      // Para usuários USER, incluir seus próprios repertórios + repertórios de usuários ADMIN
      where.OR = [
        { userId: userId }, // Repertórios próprios
        { 
          user: { 
            role: 'ADMIN' 
          } 
        } // Repertórios de usuários ADMIN
      ]
    } else {
      // Para usuários ADMIN ou quando não incluir repertórios de admin, mostrar apenas os próprios
      where.userId = userId
    }

    const repertorios = await prisma.repertorio.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        cifras: {
          include: {
            cifra: {
              select: {
                id: true,
                title: true,
                artist: true,
                currentKey: true,
                lyrics: true
              }
            }
          },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: repertorios
    })

  } catch (error) {
    console.error('Erro ao buscar repertórios:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar repertório
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = repertorioSchema.parse(body)

    const repertorio = await prisma.repertorio.create({
      data: validatedData,
      include: {
        cifras: {
          include: {
            cifra: {
              select: {
                id: true,
                title: true,
                artist: true,
                currentKey: true,
                lyrics: true
              }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: repertorio
    })

  } catch (error) {
    console.error('Erro ao criar repertório:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
