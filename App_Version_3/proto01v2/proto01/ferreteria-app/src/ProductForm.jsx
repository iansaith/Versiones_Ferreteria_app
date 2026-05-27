import { useState, useEffect } from 'react'
import { productsAPI, categoriesAPI } from './api'

const ProductForm = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '', minStock: '', currentLocation: 'Estante 1', 
    category: '', mainSupplier: '', price: '', wholesalePrice: '', profit: ''
  })
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Cargar categorías dinámicas
  useEffect(() => {
    categoriesAPI.getAll()
      .then(res => setCategories(res.data))
      .catch(() => {})
  }, [])

  // Cargar datos al editar
  useEffect(() => {
    if (product?.id) {
      setFormData({
        name: product.name || '',
        minStock: product.minStock || '',
        currentLocation: product.currentLocation || 'Estante 1',
        category: product.category || '',
        mainSupplier: product.mainSupplier || '',
        price: product.price || '',
        wholesalePrice: product.wholesalePrice || '',
        profit: product.profit || ''
      })
    } else {
      setFormData({
        name: '', minStock: '', currentLocation: 'Estante 1', 
        category: '', mainSupplier: '', price: '', wholesalePrice: '', profit: ''
      })
    }
  }, [product])

  // Ganancia automática
  useEffect(() => {
    const price = parseFloat(formData.price) || 0
    const wholesale = parseFloat(formData.wholesalePrice) || 0
    const profit = price - wholesale
    if (!isNaN(profit)) {
      setFormData(prev => ({ ...prev, profit }))
    }
  }, [formData.price, formData.wholesalePrice])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.name.trim() || !formData.mainSupplier.trim() || !formData.price || !formData.wholesalePrice) {
      setError('❌ Nombre, proveedor y precios son obligatorios')
      setLoading(false)
      return
    }

    if (parseFloat(formData.price) <= parseFloat(formData.wholesalePrice)) {
      setError('❌ Precio venta debe ser mayor al mayorista')
      setLoading(false)
      return
    }

    try {
      if (product?.id) {
        await productsAPI.update(product.id, formData)
        alert('✅ Producto actualizado')
      } else {
        await productsAPI.create(formData)
        alert('✅ Producto creado')
      }
      
      setFormData({
        name: '', minStock: '', currentLocation: 'Estante 1', 
        category: '', mainSupplier: '', price: '', wholesalePrice: '', profit: ''
      })
      onSave()
    } catch (error) {
      console.error('❌ ERROR:', error)
      if (!error.response) {
        setError('❌ json-server no está corriendo (puerto 3001)')
      } else if (error.response.status === 404) {
        setError('Producto no encontrado')
      } else {
        setError(`Error: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2>{product?.id ? 'Editar' : 'Nuevo'} Producto</h2>
      
      {error && (
        <div className="alert alert-error" style={{marginBottom: '20px'}}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* DATOS BÁSICOS */}
        <div className="input-group">
          <label>Nombre <span style={{color:'red'}}>*</span>:</label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            placeholder="Ej: Taladro Bosch"
            required
          />
        </div>

        <div className="input-group">
          <label>Stock Mínimo:</label>
          <input
            type="number"
            value={formData.minStock}
            onChange={e => setFormData({...formData, minStock: e.target.value})}
            min="0"
          />
        </div>

        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
          <div className="input-group">
            <label>Ubicación:</label>
            <select
              value={formData.currentLocation}
              onChange={e => setFormData({...formData, currentLocation: e.target.value})}
            >
              <option>Estante 1</option>
              <option>Estante 2</option>
              <option>Estante 3</option>
            </select>
          </div>
          <div className="input-group">
            <label>Categoría:</label>
            <select
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
            >
              <option value="">-- Seleccionar --</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* PROVEEDOR */}
        <div className="input-group">
          <label>Proveedor <span style={{color:'red'}}>*</span>:</label>
          <input
            type="text"
            value={formData.mainSupplier}
            onChange={e => setFormData({...formData, mainSupplier: e.target.value})}
            placeholder="Ej: Distribuidora Bosch"
            required
          />
        </div>

        {/* PRECIOS */}
        <h4 style={{margin: '25px 0 15px 0', color: '#4CAF50', borderBottom: '2px solid #e8f5e8', paddingBottom: '10px'}}>
          Precios
        </h4>

        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
          <div className="input-group">
            <label>Precio Venta <span style={{color:'red'}}>*</span>:</label>
            <input
              type="number"
              value={formData.price}
              onChange={e => setFormData({...formData, price: e.target.value})}
              min="0"
              placeholder="450000"
              required
              style={{fontWeight: 'bold'}}
            />
          </div>
          <div className="input-group">
            <label>Compra Mayorista <span style={{color:'red'}}>*</span>:</label>
            <input
              type="number"
              value={formData.wholesalePrice}
              onChange={e => setFormData({...formData, wholesalePrice: e.target.value})}
              min="0"
              placeholder="380000"
              required
            />
          </div>
        </div>

        <div className="input-group">
          <label>Ganancia Unitaria <span style={{color:'green'}}>(Auto)</span>:</label>
          <input
            type="number"
            value={formData.profit}
            readOnly
            style={{
              background: '#e8f5e8',
              fontWeight: 'bold',
              color: '#2E7D32',
              border: '2px solid #4CAF50'
            }}
          />
        </div>

        {/* BOTONES */}
        <div style={{display: 'flex', gap: '15px', marginTop: '30px'}}>
          <button type="submit" className="btn" disabled={loading} style={{flex: 1, padding: '15px'}}>
            {loading ? 'Guardando...' : 'Guardar Producto'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel} style={{flex: 1, padding: '15px'}}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProductForm