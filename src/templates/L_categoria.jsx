import { useState, useEffect } from 'react'
import ItemCategoria from './I_categoria'
import FormularioCategoria from './F_categoria'
import { categoriasAPI } from '../api'

const ListaCategorias = ({ esAdmin }) => {
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [filtro, setFiltro] = useState('')
  const [categoriaEditando, setCategoriaEditando] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  const cargarCategorias = async () => {
    setCargando(true)
    try {
      const respuesta = await categoriasAPI.obtenerTodos()
      setCategorias(respuesta.data || [])
      setError('')
    } catch {
      setError('Error cargando categorias')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarCategorias()
  }, [])

  const manejarGuardado = () => {
    setCategoriaEditando(null)
    setMostrarFormulario(false)
    cargarCategorias()
  }

  const manejarEdicion = (categoria) => {
    if (!esAdmin) return alert('Solo administradores pueden editar')
    setCategoriaEditando(categoria)
    setMostrarFormulario(true)
  }

  const manejarEliminacion = async (id) => {
    if (!esAdmin) return alert('Solo administradores pueden eliminar')
    if (window.confirm('Eliminar categoria?')) {
      try {
        await categoriasAPI.eliminar(id)
        cargarCategorias()
      } catch {
        alert('Error eliminando categoria')
      }
    }
  }

  if (cargando) return (
    <div className="d-flex justify-content-center p-5">
      <div className="spinner-border text-warning" role="status" />
    </div>
  )

  const normalizarTexto = (valor = '') => String(valor ?? '').toLowerCase().trim()
  const categoriasFiltradas = categorias.filter(categoria =>
    normalizarTexto(categoria.name).includes(normalizarTexto(filtro)) ||
    normalizarTexto(categoria.description).includes(normalizarTexto(filtro))
  )

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Categorias ({categorias.length})</h2>
        {esAdmin && (
          <button
            className="btn btn-warning"
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
          >
            {mostrarFormulario ? 'Cancelar' : 'Nueva Categoria'}
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card p-3 mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar categoría o descripción..."
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
        />
        {filtro && <small className="text-muted mt-2 d-block">{categoriasFiltradas.length} resultado{categoriasFiltradas.length !== 1 ? 's' : ''}</small>}
      </div>

      {mostrarFormulario && esAdmin && (
        <FormularioCategoria
          categoria={categoriaEditando}
          onGuardar={manejarGuardado}
          onCancelar={() => {
            setCategoriaEditando(null)
            setMostrarFormulario(false)
          }}
        />
      )}

      <div className="product-grid">
        {categoriasFiltradas.length === 0 ? (
          <div className="card text-center p-5">
            <h4>No hay categorias registradas</h4>
            <p className="text-muted">Crea la primera categoria</p>
          </div>
        ) : (
          categoriasFiltradas.map(categoria => (
            <ItemCategoria
              key={categoria.id}
              categoria={categoria}
              esAdmin={esAdmin}
              onEditar={manejarEdicion}
              onEliminar={manejarEliminacion}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default ListaCategorias