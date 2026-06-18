import { useState, useEffect } from 'react'
import { productosAPI, categoriasAPI } from '../api.js'

const FormularioProducto = ({ producto, onGuardar, onCancelar }) => {
  const [formulario, setFormulario] = useState({
    name: '',
    minStock: '',
    stock: '',
    currentLocation: 'Estante 1',
    category: '',
    mainSupplier: '',
    price: '',
    wholesalePrice: '',
    profit: '',
    image: ''
  })
  const [tipoImagen, setTipoImagen] = useState('url')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [categorias, setCategorias] = useState([])
const [cantidadAgregar, setCantidadAgregar] = useState('')
  useEffect(() => {
    categoriasAPI.obtenerTodos().then(res => setCategorias(res.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (producto?.id) {
      setFormulario({
        name: producto.name || '',
        minStock: producto.minStock || '',
        stock: producto.stock || '',
        currentLocation: producto.currentLocation || 'Estante 1',
        category: producto.category || '',
        mainSupplier: producto.mainSupplier || '',
        price: producto.price || '',
        wholesalePrice: producto.wholesalePrice || '',
        profit: producto.profit || '',
        image: producto.image || ''
      })
      setTipoImagen(producto.image?.startsWith('data:') ? 'local' : 'url')
    } else {
      setFormulario({
        name: '',
        minStock: '',
        stock: '',
        currentLocation: 'Estante 1',
        category: '',
        mainSupplier: '',
        price: '',
        wholesalePrice: '',
        profit: '',
        image: ''
      })
      setTipoImagen('url')
    }
  }, [producto])

  useEffect(() => {
    const precio = parseFloat(formulario.price) || 0
    const mayorista = parseFloat(formulario.wholesalePrice) || 0
    setFormulario(prev => ({ ...prev, profit: precio - mayorista }))
  }, [formulario.price, formulario.wholesalePrice])




  const manejarImagenLocal = (e) => {
    const archivo = e.target.files[0]
    if (!archivo) return
    const reader = new FileReader()
    reader.onloadend = () => setFormulario(prev => ({ ...prev, image: reader.result }))
    reader.readAsDataURL(archivo)
  }

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
      await productosAPI.actualizar(producto.id, {
        ...formulario,
        stockNuevo: cantidadAgregar ? parseInt(cantidadAgregar) : 0
      })
    } else {
      await productosAPI.crear(formulario)
    }
    onGuardar()
  } catch (err) {
    if (!err.response) {
      setError('No se pudo conectar con el servidor')
    } else {
      const mensaje = err.response?.data?.message || 'Error al guardar el producto'
      setError(mensaje)
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

  {/* Si es nuevo producto → stock inicial. Si es edición → solo lectura + campo agregar */}
  {!producto?.id ? (
    <div className="col-md-6">
      <label className="form-label fw-semibold">Stock Inicial <span className="text-danger">*</span></label>
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
  ) : (
    <>
      <div className="col-md-6">
        <label className="form-label fw-semibold">Stock Actual:</label>
        <input
          type="number"
          className="form-control"
          value={producto.stock}
          readOnly
          style={{ background: '#f5f5f5' }}
        />
      </div>
      <div className="col-md-6 mt-2">
        <label className="form-label fw-semibold">Agregar Unidades:</label>
        <input
          type="number"
          className="form-control"
          value={cantidadAgregar}
          onChange={e => setCantidadAgregar(e.target.value)}
          min="1"
          placeholder="Ej: 5"
        />
        <small className="text-muted">Se sumará al stock actual</small>
      </div>
    </>
  )}
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
              <option value="">Selecciona una categoria</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.icon} {cat.name}</option>
              ))}
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

        <h6 className="text-success border-bottom pb-2 mb-3">Imagen del Producto</h6>

        <div className="mb-3">
          <div className="d-flex gap-3 mb-3">
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                id="tipoUrl"
                value="url"
                checked={tipoImagen === 'url'}
                onChange={() => { setTipoImagen('url'); setFormulario(prev => ({ ...prev, image: '' })) }}
              />
              <label className="form-check-label" htmlFor="tipoUrl">URL externa</label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                id="tipoLocal"
                value="local"
                checked={tipoImagen === 'local'}
                onChange={() => { setTipoImagen('local'); setFormulario(prev => ({ ...prev, image: '' })) }}
              />
              <label className="form-check-label" htmlFor="tipoLocal">Archivo local</label>
            </div>
          </div>

          {tipoImagen === 'url' ? (
            <input
              type="url"
              className="form-control"
              value={formulario.image}
              onChange={e => setFormulario({ ...formulario, image: e.target.value })}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          ) : (
            <input
              type="file"
              className="form-control"
              accept="image/*"
              onChange={manejarImagenLocal}
            />
          )}

          {formulario.image && (
            <div className="mt-3 text-center">
              <img
                src={formulario.image}
                alt="Vista previa"
                style={{ maxHeight: '150px', maxWidth: '100%', borderRadius: '8px', objectFit: 'contain' }}
              />
              <div className="mt-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => setFormulario(prev => ({ ...prev, image: '' }))}
                >
                  Quitar imagen
                </button>
              </div>
            </div>
          )}
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