'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Book {
    id: string
    title: string
    description: string
    isbn: string
    publishedYear: number
    genre: string
    pages: number
    authorId: string
    author: { id: string; name: string; email: string }
}

interface Author {
    id: string
    name: string
}

interface Pagination {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
}

export default function BooksPage() {
    const [books, setBooks] = useState<Book[]>([])
    const [authors, setAuthors] = useState<Author[]>([])
    const [pagination, setPagination] = useState<Pagination | null>(null)
    const [loading, setLoading] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    const [search, setSearch] = useState('')
    const [genre, setGenre] = useState('')
    const [authorFilter, setAuthorFilter] = useState('')
    const [sortBy, setSortBy] = useState('createdAt')
    const [order, setOrder] = useState('desc')
    const [page, setPage] = useState(1)

    const [form, setForm] = useState({ title: '', description: '', isbn: '', publishedYear: '', genre: '', pages: '', authorId: '' })

    const fetchBooks = useCallback(async () => {
        setLoading(true)
        const params = new URLSearchParams({
            page: page.toString(), limit: '10', sortBy, order,
            ...(search && { search }),
            ...(genre && { genre }),
            ...(authorFilter && { authorName: authorFilter }),
        })
        const res = await fetch(`/api/books/search?${params}`)
        const data = await res.json()
        setBooks(data.data || [])
        setPagination(data.pagination || null)
        setLoading(false)
    }, [search, genre, authorFilter, sortBy, order, page])

    useEffect(() => {
        const timer = setTimeout(() => fetchBooks(), 400)
        return () => clearTimeout(timer)
    }, [fetchBooks])

    useEffect(() => {
        fetch('/api/authors').then(r => r.json()).then(setAuthors)
    }, [])

    const handleSubmit = async () => {
        const method = editingId ? 'PUT' : 'POST'
        const url = editingId ? `/api/books/${editingId}` : '/api/books'
        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...form, publishedYear: form.publishedYear ? parseInt(form.publishedYear) : null, pages: form.pages ? parseInt(form.pages) : null })
        })
        setForm({ title: '', description: '', isbn: '', publishedYear: '', genre: '', pages: '', authorId: '' })
        setShowForm(false)
        setEditingId(null)
        fetchBooks()
    }

    const handleEdit = (book: Book) => {
        setForm({ title: book.title, description: book.description || '', isbn: book.isbn || '', publishedYear: book.publishedYear?.toString() || '', genre: book.genre || '', pages: book.pages?.toString() || '', authorId: book.authorId })
        setEditingId(book.id)
        setShowForm(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar este libro?')) return
        await fetch(`/api/books/${id}`, { method: 'DELETE' })
        fetchBooks()
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">📖 Libros</h1>
                            <p className="text-slate-400">
                                {pagination?.total || 0} {pagination?.total === 1 ? 'libro' : 'libros'} encontrado{pagination?.total === 1 ? '' : 's'}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Link href="/" className="btn btn-secondary">
                                👤 Autores
                            </Link>
                            <button 
                                onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ title: '', description: '', isbn: '', publishedYear: '', genre: '', pages: '', authorId: '' }) }}
                                className="btn btn-primary"
                            >
                                <span>+</span> Nuevo Libro
                            </button>
                        </div>
                    </div>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="card p-6 mb-8">
                        <h3 className="text-lg font-semibold text-white mb-4">
                            {editingId ? '✏️ Editar Libro' : '➕ Nuevo Libro'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {[
                                { key: 'title', placeholder: 'Título del libro *' },
                                { key: 'isbn', placeholder: 'ISBN' },
                                { key: 'publishedYear', placeholder: 'Año de publicación', type: 'number' },
                                { key: 'genre', placeholder: 'Género' },
                                { key: 'pages', placeholder: 'Número de páginas', type: 'number' },
                            ].map(({ key, placeholder, type }) => (
                                <input 
                                    key={key} 
                                    type={type || 'text'}
                                    placeholder={placeholder} 
                                    value={(form as any)[key]}
                                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                                    className="input-field"
                                />
                            ))}
                            <select 
                                value={form.authorId} 
                                onChange={e => setForm({ ...form, authorId: e.target.value })}
                                className="input-field"
                            >
                                <option value="">Selecciona un autor *</option>
                                {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                            <textarea 
                                placeholder="Descripción del libro" 
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                className="input-field md:col-span-2 resize-none"
                                rows={3}
                            />
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={handleSubmit}
                                className="btn btn-primary"
                            >
                                {editingId ? '💾 Guardar cambios' : '✅ Crear libro'}
                            </button>
                            <button 
                                onClick={() => { setShowForm(false); setEditingId(null); setForm({ title: '', description: '', isbn: '', publishedYear: '', genre: '', pages: '', authorId: '' }) }}
                                className="btn btn-secondary"
                            >
                                ✕ Cancelar
                            </button>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-8">
                    <input 
                        placeholder="🔍 Buscar por título..." 
                        value={search} 
                        onChange={e => { setSearch(e.target.value); setPage(1) }}
                        className="input-field md:col-span-2"
                    />
                    <input 
                        placeholder="Filtrar por género..." 
                        value={genre} 
                        onChange={e => { setGenre(e.target.value); setPage(1) }}
                        className="input-field"
                    />
                    <input 
                        placeholder="Filtrar por autor..." 
                        value={authorFilter} 
                        onChange={e => { setAuthorFilter(e.target.value); setPage(1) }}
                        className="input-field"
                    />
                    <select 
                        value={sortBy} 
                        onChange={e => setSortBy(e.target.value)}
                        className="input-field"
                    >
                        <option value="createdAt">Ordenar: Fecha</option>
                        <option value="title">Ordenar: Título</option>
                        <option value="publishedYear">Ordenar: Año</option>
                    </select>
                    <select 
                        value={order} 
                        onChange={e => setOrder(e.target.value)}
                        className="input-field"
                    >
                        <option value="desc">↓ Descendente</option>
                        <option value="asc">↑ Ascendente</option>
                    </select>
                </div>

                {/* Books List */}
                {loading ? (
                    <div className="card p-8 text-center">
                        <p className="text-slate-400 animate-pulse">Buscando libros...</p>
                    </div>
                ) : books.length === 0 ? (
                    <div className="card p-8 text-center">
                        <p className="text-slate-400 mb-4">No se encontraron libros con esos filtros</p>
                        <button 
                            onClick={() => setShowForm(true)}
                            className="btn btn-primary"
                        >
                            <span>+</span> Crear el primer libro
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        {books.map(book => (
                            <div key={book.id} className="card-hover p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-white text-lg mb-2">{book.title}</h3>
                                    <div className="flex flex-wrap gap-3 text-sm text-slate-400">
                                        <span className="badge badge-secondary">{book.author?.name}</span>
                                        {book.genre && <span className="badge badge-secondary">{book.genre}</span>}
                                        {book.publishedYear && <span className="badge badge-secondary">📅 {book.publishedYear}</span>}
                                        {book.pages && <span className="badge badge-secondary">📄 {book.pages} págs</span>}
                                    </div>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                    <button 
                                        onClick={() => handleEdit(book)} 
                                        className="btn btn-secondary text-sm"
                                    >
                                        ✏️ Editar
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(book.id)} 
                                        className="btn btn-danger text-sm"
                                    >
                                        🗑️ Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-8">
                        <button 
                            onClick={() => setPage(p => p - 1)} 
                            disabled={!pagination.hasPrev}
                            className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            ← Anterior
                        </button>
                        <div className="text-slate-400 text-sm min-w-[150px] text-center">
                            Página <span className="font-semibold text-white">{pagination.page}</span> de <span className="font-semibold text-white">{pagination.totalPages}</span>
                        </div>
                        <button 
                            onClick={() => setPage(p => p + 1)} 
                            disabled={!pagination.hasNext}
                            className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Siguiente →
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}