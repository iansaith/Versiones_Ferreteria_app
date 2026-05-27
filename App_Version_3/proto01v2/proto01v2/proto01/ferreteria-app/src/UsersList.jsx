import { useState, useEffect } from 'react'
import UserItem from './UserItem'
import UserForm from './UserForm'
import { usersAPI } from './api'

const UsersList = ({ isAdmin }) => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const loadUsers = async () => {
    setLoading(true)
    try {
      const response = await usersAPI.getAll()
      setUsers(response.data || [])
      setError('')
    } catch {
      setError('Error cargando usuarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleSave = () => {
    setEditingUser(null)
    setShowForm(false)
    loadUsers()
  }

  const handleEdit = (user) => {
    if (!isAdmin) {
      alert('Solo administradores pueden editar usuarios')
      return
    }
    setEditingUser(user)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!isAdmin) {
      alert('Solo administradores pueden eliminar usuarios')
      return
    }
    if (window.confirm('Eliminar usuario Esta accion no se puede deshacer.')) {
      try {
        await usersAPI.delete(id)
        loadUsers()
      } catch {
        alert('Error eliminando usuario')
      }
    }
  }

  if (loading) return <div className="card">Cargando usuarios...</div>

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <h1>Usuarios ({users.length})</h1>
        {isAdmin && (
          <button className="btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : 'Nuevo Usuario'}
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && isAdmin && (
        <UserForm
          user={editingUser}
          onSave={handleSave}
          onCancel={() => {
            setEditingUser(null)
            setShowForm(false)
          }}
        />
      )}

      <div className="product-grid">
        {users.length === 0 ? (
          <div className="card" style={{textAlign: 'center', padding: '60px'}}>
            <h3>No hay usuarios registrados</h3>
          </div>
        ) : (
          users.map(user => (
            <UserItem
              key={user.id}
              user={user}
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

export default UsersList