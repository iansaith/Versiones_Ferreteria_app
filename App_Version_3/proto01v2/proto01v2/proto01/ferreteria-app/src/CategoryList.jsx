import { useState, useEffect } from 'react'
import CategoryItem from './CategoryItem'
import CategoryForm from './CategoryForm'
import { categoriesAPI } from './api'

const CategoryList = ({ isAdmin }) => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingCategory, setEditingCategory] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const loadCategories = async () => {
    setLoading(true)
    try {
      const response = await categoriesAPI.getAll()
      setCategories(response.data || [])
      setError('')
    } catch {
      setError('Error cargando categorias')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const handleSave = () => {
    setEditingCategory(null)
    setShowForm(false)
    loadCategories()
  }

  const handleEdit = (category) => {
    if (!isAdmin) {
      alert('Solo administradores pueden editar')
      return
    }
    setEditingCategory(category)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!isAdmin) {
      alert('Solo administradores pueden eliminar')
      return
    }
    if (window.confirm('Eliminar categoria')) {
      try {
        await categoriesAPI.delete(id)
        loadCategories()
      } catch {
        alert('Error eliminando')
      }
    }
  }

  if (loading) return <div className="card">Cargando categorias...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Categorias ({categories.length})</h1>
        {isAdmin && (
          <button className="btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : 'Nueva Categoria'}
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && isAdmin && (
        <CategoryForm
          category={editingCategory}
          onSave={handleSave}
          onCancel={() => {
            setEditingCategory(null)
            setShowForm(false)
          }}
        />
      )}

      <div className="product-grid">
        {categories.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
            <h3>No hay categorias</h3>
            <p>Crea la primera categoria</p>
          </div>
        ) : (
          categories.map(category => (
            <CategoryItem
              key={category.id}
              category={category}
              isAdmin={isAdmin}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default CategoryList