import { useState, useEffect } from 'react'
import { productosAPI } from '../api.js'

const FormularioProducto = ({ producto, onGuardar, onCancelar }) => {
  const [formulario, setFormulario] = useState({
    name: '',
    minStock: '',
    stock: '',
    currentLocation: 'Estante 1',
    category: 'Herramientas',
    mainSupplier: '',
    price: '',
    wholesalePrice: '',
    profit: ''
  })
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    if (producto?.id) {
      setFormulario({
        name: producto.name || '',
        minStock: producto.minStock || '',
        stock: producto.stock || '',
        currentLocation: producto.currentLocation || 'Estante 1',
        category: producto.category || 'Herramientas',
        mainSupplier: producto.mainSupplier || '',
        price: producto.price || '',
        wholesalePrice: producto.wholesalePrice || '',
        profit: producto.profit || ''
      })
    } else {
      setFormulario({
        name: '',
        minStock: '',
        stock: '',
        currentLocation: 'Estante 1',
        category: 'Herramientas',
        mainSupplier: '',
        price: '',
        wholesalePrice: '',
        profit: ''
      })
    }
  }, [producto])

  useEffect(() => {
    const precio = parseFloat(formulario.price) || 0
    const mayorista = parseFloat(formulario.wholesalePrice) || 0
    setFormulario(prev => ({ ...prev, profit: precio - mayorista }))
  }, [formulario.price, formulario.wholesalePrice])

  const manejarEnvio = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError('')

    if (!formulario.name.trim() || !formulario.mainSupplier.trim() || !formulario.price || !formulario.wholesalePrice) {
      setError('Nombre, proveedor y precios son obligatorios')
      setCargando(false)
      return
    }

    if (parseFloat(formulario.price) <= parseFloat(formulario.wholesalePrice)) {
      setError('El precio de venta debe ser mayor al precio mayorista')
      setCargando(false)
      return
    }

    try {
      if (producto?.id) {
        await productosAPI.actualizar(producto.id, formulario)
      } else {
        await productosAPI.crear(formulario)
      }
      onGuardar()
    } catch (err) {
      if (!err.response) {
        setError('No se pudo conectar con el servidor')
      } else {
        setError('Error al guardar el producto')
      }
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="card shadow p-4 mb-4">
      <h4 className="mb-4">{producto?.id ? 'Editar' : 'Nuevo'} Producto</h4>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={manejarEnvio}>
        <div className="mb-3">
          <label className="form-label fw-semibold">Nombre <span className="text-danger">*</span></label>
          <input
            type="text"
            className="form-control"
            value={formulario.name}
            onChange={e => setFormulario({ ...formulario, name: e.target.value })}
            placeholder="Ej: Taladro Bosch"
            required
          />
        </div>

        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label fw-semibold">Stock Minimo:</label>
            <input
              type="number"
              className="form-control"
              value={formulario.minStock}
              onChange={e => setFormulario({ ...formulario, minStock: e.target.value })}
              min="0"
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold">Stock Actual <span className="text-danger">*</span></label>
            <input
              type="number"
              className="form-control"
              value={formulario.stock}
              onChange={e => setFormulario({ ...formulario, stock: e.target.value })}
              min="0"
              placeholder="Ej: 10"
              required
            />
          </div>
        </div>

        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label fw-semibold">Ubicacion:</label>
            <select
              className="form-select"
              value={formulario.currentLocation}
              onChange={e => setFormulario({ ...formulario, currentLocation: e.target.value })}
            >
              <option>Estante 1</option>
              <option>Estante 2</option>
              <option>Estante 3</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold">Categoria:</label>
            <select
              className="form-select"
              value={formulario.category}
              onChange={e => setFormulario({ ...formulario, category: e.target.value })}
            >
              <option>Herramienta electrica</option>
              <option>Pinturas</option>
              <option>Herramientas</option>
            </select>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Proveedor <span className="text-danger">*</span></label>
          <input
            type="text"
            className="form-control"
            value={formulario.mainSupplier}
            onChange={e => setFormulario({ ...formulario, mainSupplier: e.target.value })}
            placeholder="Ej: Distribuidora Bosch"
            required
          />
        </div>

        <h6 className="text-success border-bottom pb-2 mb-3">Precios</h6>

        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label fw-semibold">Precio Venta <span className="text-danger">*</span></label>
            <input
              type="number"
              className="form-control fw-bold"
              value={formulario.price}
              onChange={e => setFormulario({ ...formulario, price: e.target.value })}
              min="0"
              placeholder="450000"
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold">Compra Mayorista <span className="text-danger">*</span></label>
            <input
              type="number"
              className="form-control"
              value={formulario.wholesalePrice}
              onChange={e => setFormulario({ ...formulario, wholesalePrice: e.target.value })}
              min="0"
              placeholder="380000"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold">Ganancia Unitaria <span className="text-success">(Auto)</span></label>
          <input
            type="number"
            className="form-control fw-bold text-success"
            value={formulario.profit}
            readOnly
            style={{ background: '#e8f5e8', border: '2px solid #4CAF50' }}
          />
        </div>

        <div className="d-flex gap-3">
          <button type="submit" className="btn btn-warning flex-fill py-2" disabled={cargando}>
            {cargando ? <span className="spinner-border spinner-border-sm me-2" role="status" /> : null}
            {cargando ? 'Guardando...' : 'Guardar Producto'}
          </button>
          <button type="button" className="btn btn-secondary flex-fill py-2" onClick={onCancelar}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

export default FormularioProducto