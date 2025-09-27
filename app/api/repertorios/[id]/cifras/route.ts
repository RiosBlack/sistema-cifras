import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const repertorioCifraSchema = z.object({
  cifraId: z.string().min(1, 'Cifra ID é obrigatório'),
  selectedKey: z.string().min(1, 'Tom selecionado é obrigatório'),
  order: z.number().int().min(0).optional()
})

// POST - Adicionar cifra ao repertório
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = repertorioCifraSchema.parse(body)

    // Verificar se o repertório existe
    const repertorio = await prisma.repertorio.findUnique({
      where: { id }
    })
    
    if (!repertorio) {
      return NextResponse.json(
        { error: 'Repertório não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se a cifra existe
    const cifra = await prisma.cifra.findUnique({
      where: { id: validatedData.cifraId }
    })
    
    if (!cifra) {
      return NextResponse.json(
        { error: 'Cifra não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se a cifra já está no repertório
    const existingCifra = await prisma.repertorioCifra.findUnique({
      where: {
        repertorioId_cifraId: {
          repertorioId: id,
          cifraId: validatedData.cifraId
        }
      }
    })

    if (existingCifra) {
      return NextResponse.json(
        { error: 'Cifra já está no repertório' },
        { status: 400 }
      )
    }

    // Obter a próxima ordem
    const lastOrder = await prisma.repertorioCifra.findFirst({
      where: { repertorioId: id },
      orderBy: { order: 'desc' },
      select: { order: true }
    })

    const nextOrder = (lastOrder?.order || 0) + 1

    // Adicionar cifra ao repertório
    const repertorioCifra = await prisma.repertorioCifra.create({
      data: {
        repertorioId: id,
        cifraId: validatedData.cifraId,
        selectedKey: validatedData.selectedKey,
        order: validatedData.order ?? nextOrder
      },
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
    console.error('Erro ao adicionar cifra ao repertório:', error)
    
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

// GET - Listar cifras do repertório
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cifras = await prisma.repertorioCifra.findMany({
      where: { repertorioId: id },
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
    })

    return NextResponse.json({
      success: true,
      data: cifras
    })

  } catch (error) {
    console.error('Erro ao buscar cifras do repertório:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
