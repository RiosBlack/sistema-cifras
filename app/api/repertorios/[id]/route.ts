import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const repertorioUpdateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  description: z.string().optional()
})

// GET - Buscar repertório por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const repertorio = await prisma.repertorio.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
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
      }
    })

    if (!repertorio) {
      return NextResponse.json(
        { error: 'Repertório não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: repertorio
    })

  } catch (error) {
    console.error('Erro ao buscar repertório:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar repertório
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = repertorioUpdateSchema.parse(body)

    // Verificar se o repertório existe
    const existingRepertorio = await prisma.repertorio.findUnique({
      where: { id }
    })
    
    if (!existingRepertorio) {
      return NextResponse.json(
        { error: 'Repertório não encontrado' },
        { status: 404 }
      )
    }

    // Atualizar repertório
    const repertorio = await prisma.repertorio.update({
      where: { id },
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
    console.error('Erro ao atualizar repertório:', error)
    
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

// DELETE - Deletar repertório
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Verificar se o repertório existe
    const existingRepertorio = await prisma.repertorio.findUnique({
      where: { id }
    })
    
    if (!existingRepertorio) {
      return NextResponse.json(
        { error: 'Repertório não encontrado' },
        { status: 404 }
      )
    }

    // Deletar repertório (as cifras serão removidas automaticamente por cascade)
    await prisma.repertorio.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Repertório deletado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao deletar repertório:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
