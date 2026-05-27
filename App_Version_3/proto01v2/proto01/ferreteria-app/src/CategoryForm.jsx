import { useState, useEffect } from 'react'
import { categoriesAPI } from './api'

const CategoryForm = ({ category, onSave, onCancel }) => {
  const [formData, setFormData] = useState({ name: '', description: '', icon: '📦' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const icons = ['📦', '⚡', '🎨', '🔨', '🪛', '🔩', '🪚', '🚜', '🌱']

  useEffect(() => {
    if (category?.id) {
      setFormData({ name: category.name, description: category.description, icon: category.icon })
    } else {
      setFormData({ name: '', description: '', icon: '📦' })
    }
  }, [category])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!formData.name.trim()) {
      setError('Nombre obligatorio')
      setLoading(false)
      return
    }

    try {
      if (category?.id) {
        await categoriesAPI.update(category.id, formData)
      } else {
        await categoriesAPI.create(formData)
      }
      onSave()
    } catch (err) {
      setError('Error guardando. Verifica json-server puerto 3001')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2>{category?.id ? 'Editar' : 'Nueva'} Categoría</h2>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Nombre <span style={{color: 'red'}}>*</span>:</label>
          <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
        </div>
        <div className="input-group">
          <label>Descripción:</label>
          <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="3" />
        </div>
        <div className="input-group">
          <label>Icono:</label>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '8px'}}>
            {icons.map(icon => (
              <button key={icon} type="button" style={{
                padding: '10px', border: formData.icon === icon ? '2px solid #4CAF50' : '1px solid #ddd',
                background: formData.icon === icon ? '#e8f5e8' : 'white', borderRadius: '6px', cursor: 'pointer', fontSize: '1.5em'
              }} onClick={() => setFormData({...formData, icon})}>{icon}</button>
            ))}
          </div>
        </div>
        <div style={{display: 'flex', gap: '10px'}}>
          <button type="submit" className="btn" disabled={loading} style={{flex: 1}}>
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel} style={{flex: 1}}>Cancelar</button>
        </div>
      </form>
    </div>
  )
}
export default CategoryForm