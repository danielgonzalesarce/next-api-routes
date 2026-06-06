'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Author {
  id: string
  name: string
  email: string
  nationality: string
  birthYear: number
  bio: string
  _count: { books: number }
}

export default function Dashboard() {
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', nationality: '', birthYear: '', bio: '' })
  const [editingId, setEditingId] = useState<string | null>(null)

  const fetchAuthors = async () => {
    const res = await fetch('/api/authors')
    const data = await res.json()
    setAuthors(data)
    setLoading(false)
  }

  useEffect(() => { fetchAuthors() }, [])

  const handleSubmit = async () => {
    const method = editingId ? 'PUT' : 'POST'
    const url = editingId ? `/api/authors/${editingId}` : '/api/authors'
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, birthYear: form.birthYear ? parseInt(form.birthYear) : null })
    })
    setForm({ name: '', email: '', nationality: '', birthYear: '', bio: '' })
    setShowForm(false)
    setEditingId(null)
    fetchAuthors()
  }

  const handleEdit = (author: Author) => {
    setForm({ name: author.name, email: author.email, nationality: author.nationality || '', birthYear: author.birthYear?.toString() || '', bio: author.bio || '' })
    setEditingId(author.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este autor y todos sus libros?')) return
    await fetch(`/api/authors/${id}`, { method: 'DELETE' })
    fetchAuthors()
  }

  const totalBooks = authors.reduce((sum, a) => sum + (a._count?.books || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">📚 Biblioteca Digital</h1>
              <p className="text-slate-400">Gestiona tus autores y colección de libros</p>
            </div>
            <div className="flex gap-3">
              <Link href="/books" className="btn btn-secondary gap-2">
                <span>📖</span> Ver Libros
              </Link>
              <button 
                onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: '', email: '', nationality: '', birthYear: '', bio: '' }) }}
                className="btn btn-primary"
              >
                <span>+</span> Nuevo Autor
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Autores', value: authors.length, icon: '👤' },
            { label: 'Total Libros', value: totalBooks, icon: '📚' },
            { label: 'Promedio', value: authors.length ? (totalBooks / authors.length).toFixed(1) : 0, icon: '📊' },
          ].map((stat, i) => (
            <div key={i} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
                <div className="text-4xl">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        {showForm && (
          <div className="card p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">
              {editingId ? '✏️ Editar Autor' : '➕ Nuevo Autor'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {[
                { key: 'name', placeholder: 'Nombre completo *' },
                { key: 'email', placeholder: 'Email *' },
                { key: 'nationality', placeholder: 'Nacionalidad' },
                { key: 'birthYear', placeholder: 'Año de nacimiento', type: 'number' },
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
              <textarea 
                placeholder="Biografía" 
                value={form.bio}
                onChange={e => setForm({ ...form, bio: e.target.value })}
                className="input-field md:col-span-2 resize-none" 
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleSubmit}
                className="btn btn-primary"
              >
                {editingId ? '💾 Guardar cambios' : '✅ Crear autor'}
              </button>
              <button 
                onClick={() => { setShowForm(false); setEditingId(null); setForm({ name: '', email: '', nationality: '', birthYear: '', bio: '' }) }}
                className="btn btn-secondary"
              >
                ✕ Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Authors List */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Autores Registrados</h2>
          {loading ? (
            <div className="card p-8 text-center">
              <p className="text-slate-400">Cargando...</p>
            </div>
          ) : authors.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-slate-400 mb-4">No hay autores registrados aún</p>
              <button 
                onClick={() => setShowForm(true)}
                className="btn btn-primary"
              >
                <span>+</span> Crear el primer autor
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {authors.map(author => (
                <div key={author.id} className="card-hover p-5 flex justify-between items-center">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-lg">{author.name}</h3>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-400">
                      <span>📧 {author.email}</span>
                      {author.nationality && <span>🌍 {author.nationality}</span>}
                      {author.birthYear && <span>📅 {author.birthYear}</span>}
                      <span className="badge badge-primary">
                        📚 {author._count?.books || 0} {author._count?.books === 1 ? 'libro' : 'libros'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Link 
                      href={`/authors/${author.id}`} 
                      className="btn btn-secondary text-sm"
                    >
                      👁️ Ver
                    </Link>
                    <button 
                      onClick={() => handleEdit(author)} 
                      className="btn btn-secondary text-sm"
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(author.id)} 
                      className="btn btn-danger text-sm"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}