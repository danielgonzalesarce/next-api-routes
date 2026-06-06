import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)

        const search = searchParams.get('search') || ''
        const genre = searchParams.get('genre') || ''
        const authorName = searchParams.get('authorName') || ''
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))
        const sortBy = ['title', 'publishedYear', 'createdAt'].includes(searchParams.get('sortBy') || '')
            ? searchParams.get('sortBy')! : 'createdAt'
        const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc'

        const where = {
            ...(search && { title: { contains: search, mode: 'insensitive' as const } }),
            ...(genre && { genre }),
            ...(authorName && { author: { name: { contains: authorName, mode: 'insensitive' as const } } }),
        }

        const [books, total] = await Promise.all([
            prisma.book.findMany({
                where,
                include: { author: { select: { id: true, name: true, email: true } } },
                orderBy: { [sortBy]: order },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.book.count({ where }),
        ])

        const totalPages = Math.ceil(total / limit)

        return NextResponse.json({
            data: books,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: 'Error al buscar libros' }, { status: 500 })
    }
}