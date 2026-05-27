import { useState, useEffect } from 'react'
import { usersAPI } from './api'

const UserForm = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    if (user && user.id) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        role: user.role || 'user'
      })
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'user'
      })
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Nombre y email son obligatorios')
      setLoading(false)
      return
    }

    if (formData.password && formData.password !== confirmPassword) {
      setError('Las contrasenas no coinciden')
      setLoading(false)
      return
    }

    if (formData.password && formData.password.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres')
      setLoading(false)
      return
    }

    try {
      if (user && user.id) {
        const updateData = { ...formData }
        if (!updateData.password) delete updateData.password
        
        await usersAPI.update(user.id, updateData)
        alert('Usuario actualizado correctamente')
      } else {
        await usersAPI.create(formData)
        alert('Usuario creado correctamente')
      }
      
      onSave()
    } catch (error) {
      console.error('Error:', error)
      setError('Error al guardar usuario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2>{user?.id ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
      
      {error && (
        <div className="alert alert-error" style={{marginBottom: '20px'}}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Nombre <span style={{color: 'red'}}>*</span>:</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Ej: Juan Perez"
            required
          />
        </div>

        <div className="input-group">
          <label>Email <span style={{color: 'red'}}>*</span>:</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="usuario@ferreteria.com"
            required
          />
        </div>

         <div className="input-group">
          <label>Nueva Contrasena (requerida):</label>
          <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          placeholder="Minimo 6 caracteres"
          required={!user?.id}  
          />
</div>

        <div className="input-group">
          <label>Confirmar Contrasena:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repite la contrasena"
          />
        </div>

        <div className="input-group">
          <label>Rol:</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value})}
          >
            <option value="user">Encargado</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button
            type="submit"
            className="btn"
            disabled={loading}
            style={{ flex: 1 }}
          >
            {loading ? 'Guardando...' : 'Guardar Usuario'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            style={{ flex: 1 }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

export default UserForm