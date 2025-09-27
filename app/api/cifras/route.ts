import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const cifraSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  artist: z.string().min(1, 'Artista é obrigatório'),
  originalKey: z.string().optional(),
  currentKey: z.string().optional(),
  capoPosition: z.number().int().min(0).default(0),
  difficulty: z.enum(['FACIL', 'MEDIO', 'DIFICIL']).optional(),
  lyrics: z.string().min(1, 'Letra é obrigatória'),
  chords: z.any().optional(),
  chordsOriginal: z.any().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  userId: z.string().min(1, 'ID do usuário é obrigatório')
})

// GET - Listar cifras
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const search = searchParams.get('search')
    const tag = searchParams.get('tag')

    let where: any = {}
    
    if (userId) {
      where.userId = userId
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { artist: { contains: search, mode: 'insensitive' } },
        { lyrics: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (tag) {
      where.tags = {
        some: {
          name: tag
        }
      }
    }

    const cifras = await prisma.cifra.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: cifras
    })

  } catch (error) {
    console.error('Erro ao buscar cifras:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar cifra
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar dados de entrada
    const validatedData = cifraSchema.parse(body)
    
    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Criar cifra
    const cifra = await prisma.cifra.create({
      data: {
        title: validatedData.title,
        artist: validatedData.artist,
        originalKey: validatedData.originalKey,
        currentKey: validatedData.currentKey,
        capoPosition: validatedData.capoPosition,
        difficulty: validatedData.difficulty,
        lyrics: validatedData.lyrics,
        chords: validatedData.chords,
        chordsOriginal: validatedData.chordsOriginal,
        notes: validatedData.notes,
        userId: validatedData.userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    // Adicionar tags se fornecidas
    if (validatedData.tags.length > 0) {
      for (const tagName of validatedData.tags) {
        // Verificar se a tag já existe
        let tag = await prisma.tag.findFirst({
          where: {
            name: tagName,
            userId: validatedData.userId
          }
        })

        // Criar tag se não existir
        if (!tag) {
          tag = await prisma.tag.create({
            data: {
              name: tagName,
              userId: validatedData.userId
            }
          })
        }

        // Conectar tag à cifra
        await prisma.cifraTag.create({
          data: {
            cifraId: cifra.id,
            tagId: tag.id
          }
        })
      }
    }

    // Buscar cifra completa com tags
    const cifraCompleta = await prisma.cifra.findUnique({
      where: { id: cifra.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: cifraCompleta
    })

  } catch (error) {
    console.error('Erro ao criar cifra:', error)
    
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
