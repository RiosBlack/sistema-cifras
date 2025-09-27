import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const repertorioCifraUpdateSchema = z.object({
  selectedKey: z.string().min(1, 'Tom selecionado é obrigatório').optional(),
  order: z.number().int().min(0).optional()
})

// PUT - Atualizar cifra no repertório
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; cifraId: string }> }
) {
  try {
    const { id, cifraId } = await params
    const body = await request.json()
    const validatedData = repertorioCifraUpdateSchema.parse(body)

    // Verificar se a cifra está no repertório
    const existingCifra = await prisma.repertorioCifra.findUnique({
      where: {
        repertorioId_cifraId: {
          repertorioId: id,
          cifraId: cifraId
        }
      }
    })

    if (!existingCifra) {
      return NextResponse.json(
        { error: 'Cifra não encontrada no repertório' },
        { status: 404 }
      )
    }

    // Atualizar cifra no repertório
    const repertorioCifra = await prisma.repertorioCifra.update({
      where: {
        repertorioId_cifraId: {
          repertorioId: id,
          cifraId: cifraId
        }
      },
      data: validatedData,
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
      }
    })

    return NextResponse.json({
      success: true,
      data: repertorioCifra
    })

  } catch (error) {
    console.error('Erro ao atualizar cifra no repertório:', error)
    
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

// DELETE - Remover cifra do repertório
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; cifraId: string }> }
) {
  try {
    const { id, cifraId } = await params
    // Verificar se a cifra está no repertório
    const existingCifra = await prisma.repertorioCifra.findUnique({
      where: {
        repertorioId_cifraId: {
          repertorioId: id,
          cifraId: cifraId
        }
      }
    })

    if (!existingCifra) {
      return NextResponse.json(
        { error: 'Cifra não encontrada no repertório' },
        { status: 404 }
      )
    }

    // Remover cifra do repertório
    await prisma.repertorioCifra.delete({
      where: {
        repertorioId_cifraId: {
          repertorioId: id,
          cifraId: cifraId
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Cifra removida do repertório com sucesso'
    })

  } catch (error) {
    console.error('Erro ao remover cifra do repertório:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
