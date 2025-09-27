import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const cifraUpdateSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').optional(),
  artist: z.string().min(1, 'Artista é obrigatório').optional(),
  originalKey: z.string().optional(),
  currentKey: z.string().optional(),
  capoPosition: z.number().int().min(0).optional(),
  difficulty: z.enum(['FACIL', 'MEDIO', 'DIFICIL']).optional(),
  lyrics: z.string().min(1, 'Letra é obrigatória').optional(),
  chords: z.any().optional(),
  chordsOriginal: z.any().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional()
})

// GET - Buscar cifra por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cifra = await prisma.cifra.findUnique({
      where: { id: params.id },
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

    if (!cifra) {
      return NextResponse.json(
        { error: 'Cifra não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: cifra
    })

  } catch (error) {
    console.error('Erro ao buscar cifra:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar cifra
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Validar dados de entrada
    const validatedData = cifraUpdateSchema.parse(body)
    
    // Verificar se a cifra existe
    const existingCifra = await prisma.cifra.findUnique({
      where: { id: params.id }
    })
    
    if (!existingCifra) {
      return NextResponse.json(
        { error: 'Cifra não encontrada' },
        { status: 404 }
      )
    }

    // Atualizar cifra
    const cifra = await prisma.cifra.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        updatedAt: new Date()
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

    // Atualizar tags se fornecidas
    if (validatedData.tags !== undefined) {
      // Remover todas as tags existentes
      await prisma.cifraTag.deleteMany({
        where: { cifraId: params.id }
      })

      // Adicionar novas tags
      for (const tagName of validatedData.tags) {
        // Verificar se a tag já existe
        let tag = await prisma.tag.findFirst({
          where: {
            name: tagName,
            userId: existingCifra.userId
          }
        })

        // Criar tag se não existir
        if (!tag) {
          tag = await prisma.tag.create({
            data: {
              name: tagName,
              userId: existingCifra.userId
            }
          })
        }

        // Conectar tag à cifra
        await prisma.cifraTag.create({
          data: {
            cifraId: params.id,
            tagId: tag.id
          }
        })
      }
    }

    // Buscar cifra completa com tags atualizadas
    const cifraCompleta = await prisma.cifra.findUnique({
      where: { id: params.id },
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
    console.error('Erro ao atualizar cifra:', error)
    
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

// DELETE - Deletar cifra
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se a cifra existe
    const existingCifra = await prisma.cifra.findUnique({
      where: { id: params.id }
    })
    
    if (!existingCifra) {
      return NextResponse.json(
        { error: 'Cifra não encontrada' },
        { status: 404 }
      )
    }

    // Deletar cifra (as tags serão removidas automaticamente por cascade)
    await prisma.cifra.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Cifra deletada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao deletar cifra:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
