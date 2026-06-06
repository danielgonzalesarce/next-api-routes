'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Author {
  id: string
  name: string
  email: string
  bio: string
  nationality: string
  birthYear: number
  createdAt: string
}

interface Book {
  id: string
  title: string
  description: string
  isbn: string
  publishedYear: number
  genre: string
  pages: number
  authorId: string
}

interface Stats {
  authorId: string
  authorName: string
  totalBooks: number
  firstBook: { title: string; year: number } | null
  latestBook: { title: string; year: number } | null
  averagePages: number
  genres: string[]
  longestBook: { title: string; pages: number } | null
  shortestBook: { title: string; pages: number } | null
}

export default function AuthorDetailPage() {
  const params = useParams()
  const authorId = params.id as string

  const [author, setAuthor] = useState<Author | null>(null)
  const [books, setBooks] = useState<Book[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [showAddBook, setShowAddBook] = useState(false)
  
  const [editForm, setEditForm] = useState({ name: '', email: '', bio: '', nationality: '', birthYear: '' })
  const [bookForm, setBookForm] = useState({
    title: '',
    description: '',
    isbn: '',
    publishedYear: '',
    genre: '',
    pages: '',
  })

  const fetchAuthorData = async () => {
    setLoading(true)
    try {
      const authorRes = await fetch(`/api/authors/${authorId}`)
      const authorData = await authorRes.json()
      setAuthor(authorData)
      setEditForm({
        name: authorData.name,
        email: authorData.email,
        bio: authorData.bio || '',
        nationality: authorData.nationality || '',
        birthYear: authorData.birthYear?.toString() || '',
      })

      const statsRes = await fetch(`/api/authors/${authorId}/stats`)
      const statsData = await statsRes.json()
      setStats(statsData)

      const booksRes = await fetch(`/api/books?authorId=${authorId}`)
      const booksData = await booksRes.json()
      setBooks(booksData)
    } catch (error) {
      console.error('Error fetching author data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authorId) {
      fetchAuthorData()
    }
  }, [authorId])

  const handleUpdateAuthor = async () => {
    try {
      const response = await fetch(`/api/authors/${authorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          birthYear: editForm.birthYear ? parseInt(editForm.birthYear) : null,
        }),
      })
      
      if (response.ok) {
        setEditing(false)
        fetchAuthorData()
      }
    } catch (error) {
      console.error('Error updating author:', error)
    }
  }

  const handleAddBook = async () => {
    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bookForm,
          authorId,
          publishedYear: bookForm.publishedYear ? parseInt(bookForm.publishedYear) : null,
          pages: bookForm.pages ? parseInt(bookForm.pages) : null,
        }),
      })

      if (response.ok) {
        setShowAddBook(false)
        setBookForm({
          title: '',
          description: '',
          isbn: '',
          publishedYear: '',
          genre: '',
          pages: '',
        })
        fetchAuthorData()
      }
    } catch (error) {
      console.error('Error adding book:', error)
    }
  }

  const handleDeleteBook = async (bookId: string) => {
    if (!confirm('¿Eliminar este libro?')) return
    try {
      await fetch(`/api/books/${bookId}`, { method: 'DELETE' })
      fetchAuthorData()
    } catch (error) {
      console.error('Error deleting book:', error)
    }
  }

  if (loading || !author || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Cargando información del autor...</p>
          <div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mb-4">
            ← Volver a autores
          </Link>
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{author.name}</h1>
              <div className="flex flex-wrap gap-4 text-slate-400">
                <span>📧 {author.email}</span>
                {author.nationality && <span>🌍 {author.nationality}</span>}
                {author.birthYear && <span>📅 Nace en {author.birthYear}</span>}
              </div>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className={`btn ${editing ? 'btn-secondary' : 'btn-primary'}`}
            >
              {editing ? '✕ Cancelar' : '✏️ Editar'}
            </button>
          </div>
        </div>

        {/* Edit Form */}
        {editing && (
          <div className="card p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Editar Información</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                placeholder="Nombre completo *"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="input-field"
              />
              <input
                placeholder="Email *"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="input-field"
              />
              <input
                placeholder="Nacionalidad"
                value={editForm.nationality}
                onChange={(e) => setEditForm({ ...editForm, nationality: e.target.value })}
                className="input-field"
              />
              <input
                placeholder="Año de nacimiento"
                type="number"
                value={editForm.birthYear}
                onChange={(e) => setEditForm({ ...editForm, birthYear: e.target.value })}
                className="input-field"
              />
            </div>
            <textarea
              placeholder="Biografía"
              value={editForm.bio}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              className="input-field md:col-span-2 resize-none mb-4"
              rows={3}
            />
            <div className="flex gap-3">
              <button
                onClick={handleUpdateAuthor}
                className="btn btn-primary"
              >
                💾 Guardar cambios
              </button>
              <button
                onClick={() => setEditing(false)}
                className="btn btn-secondary"
              >
                ✕ Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Bio */}
        {author.bio && !editing && (
          <div className="card p-6 mb-8">
            <p className="text-slate-300 leading-relaxed">{author.bio}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Libros</p>
                <p className="text-3xl font-bold text-white">{stats.totalBooks}</p>
              </div>
              <span className="text-4xl">📚</span>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Promedio Páginas</p>
                <p className="text-3xl font-bold text-white">{stats.averagePages}</p>
              </div>
              <span className="text-4xl">📄</span>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Géneros</p>
                <p className="text-3xl font-bold text-white">{stats.genres.length}</p>
              </div>
              <span className="text-4xl">🎭</span>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Período</p>
                <p className="text-lg font-bold text-white">{stats.firstBook?.year || '-'} - {stats.latestBook?.year || '-'}</p>
              </div>
              <span className="text-4xl">📅</span>
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {stats.firstBook && (
            <div className="card p-6">
              <h4 className="text-slate-400 text-sm mb-3 font-semibold">📖 Primer Libro</h4>
              <div className="font-semibold text-white text-lg">{stats.firstBook.title}</div>
              <div className="text-slate-400 text-sm mt-1">{stats.firstBook.year}</div>
            </div>
          )}

          {stats.latestBook && (
            <div className="card p-6">
              <h4 className="text-slate-400 text-sm mb-3 font-semibold">🆕 Último Libro</h4>
              <div className="font-semibold text-white text-lg">{stats.latestBook.title}</div>
              <div className="text-slate-400 text-sm mt-1">{stats.latestBook.year}</div>
            </div>
          )}

          {stats.longestBook && (
            <div className="card p-6">
              <h4 className="text-slate-400 text-sm mb-3 font-semibold">📕 Libro Más Largo</h4>
              <div className="font-semibold text-white text-lg">{stats.longestBook.title}</div>
              <div className="text-slate-400 text-sm mt-1">{stats.longestBook.pages} páginas</div>
            </div>
          )}

          {stats.shortestBook && (
            <div className="card p-6">
              <h4 className="text-slate-400 text-sm mb-3 font-semibold">📗 Libro Más Corto</h4>
              <div className="font-semibold text-white text-lg">{stats.shortestBook.title}</div>
              <div className="text-slate-400 text-sm mt-1">{stats.shortestBook.pages} páginas</div>
            </div>
          )}
        </div>

        {/* Géneros */}
        {stats.genres.length > 0 && (
          <div className="card p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">🎭 Géneros que ha escrito</h3>
            <div className="flex flex-wrap gap-2">
              {stats.genres.map((genre) => (
                <div key={genre} className="badge badge-primary">
                  {genre}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Libros */}
        <div className="border-t border-slate-700 pt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              📚 Libros ({books.length})
            </h2>
            <button
              onClick={() => setShowAddBook(!showAddBook)}
              className="btn btn-primary"
            >
              <span>+</span> Nuevo Libro
            </button>
          </div>

          {/* Add Book Form */}
          {showAddBook && (
            <div className="card p-6 mb-8">
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
                    value={(bookForm as any)[key]}
                    onChange={(e) => setBookForm({ ...bookForm, [key]: e.target.value })}
                    className="input-field"
                  />
                ))}
                <textarea
                  placeholder="Descripción"
                  value={bookForm.description}
                  onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                  className="input-field md:col-span-2 resize-none"
                  rows={2}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAddBook}
                  className="btn btn-primary"
                >
                  ✅ Agregar Libro
                </button>
                <button
                  onClick={() => setShowAddBook(false)}
                  className="btn btn-secondary"
                >
                  ✕ Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Books List */}
          {books.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-slate-400 mb-4">Este autor no tiene libros registrados aún</p>
              <button
                onClick={() => setShowAddBook(true)}
                className="btn btn-primary"
              >
                <span>+</span> Agregar el primer libro
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {books.map((book) => (
                <div key={book.id} className="card-hover p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-lg mb-2">{book.title}</h3>
                    <div className="flex flex-wrap gap-3 text-sm">
                      {book.genre && <span className="badge badge-secondary">{book.genre}</span>}
                      {book.publishedYear && <span className="badge badge-secondary">📅 {book.publishedYear}</span>}
                      {book.pages && <span className="badge badge-secondary">📄 {book.pages} págs</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteBook(book.id)}
                    className="btn btn-danger text-sm flex-shrink-0"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
