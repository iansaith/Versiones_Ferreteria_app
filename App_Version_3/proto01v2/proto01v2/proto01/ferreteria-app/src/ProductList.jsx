import { useState, useEffect } from 'react'
import ProductItem from './ProductItem'
import ProductForm from './ProductForm'
import { productsAPI } from './api'

const ProductList = ({ isAdmin }) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingProduct, setEditingProduct] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const formatPrice = (value) => {
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', currency: 'COP', minimumFractionDigits: 0 
    }).format(value || 0)
  }

  const calculateTotals = (products) => {
    return products.reduce((totals, product) => {
      const price = parseFloat(product.price) || 0
      const profit = parseFloat(product.profit) || 0
      totals.count += 1
      totals.totalValue += price
      totals.totalProfit += profit
      return totals
    }, { count: 0, totalValue: 0, totalProfit: 0 })
  }

  const loadProducts = async () => {
    setLoading(true)
    try {
      const response = await productsAPI.getAll()
      setProducts(response.data || [])
      setError('')
    } catch {
      setError('Error cargando productos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const handleSave = () => {
    setEditingProduct(null)
    setShowForm(false)
    loadProducts()
  }

  const handleEdit = (product) => {
    if (!isAdmin) return alert('Solo administradores')
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!isAdmin) return alert('Solo administradores')
    if (window.confirm('Eliminar producto')) {
      try {
        await productsAPI.delete(id)
        loadProducts()
        alert('Eliminado')
      } catch {
        alert('Error eliminando')
      }
    }
  }

  const totals = calculateTotals(products)

  if (loading) return <div className="card" style={{textAlign:'center',padding:'60px'}}><h2>Cargando...</h2></div>

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px'}}>
        <div>
          <h1>Productos ({totals.count})</h1>
          {isAdmin && <p style={{color:'#666'}}>Ganancia: <strong style={{color:'#4CAF50'}}>{formatPrice(totals.totalProfit)}</strong></p>}
        </div>
        {isAdmin && <button className="btn" onClick={() => setShowForm(!showForm)}>{showForm ? 'X' : 'Nuevo'}</button>}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      
      {showForm && isAdmin && (
        <ProductForm
          product={editingProduct}
          onSave={handleSave}
          onCancel={() => {setEditingProduct(null); setShowForm(false)}}
        />
      )}

      <div className="product-grid">
        {products.map(product => (
          <ProductItem
            key={product.id}
            product={product}
            isAdmin={isAdmin}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {products.length > 0 && (
        <div className="card" style={{marginTop:'40px', padding:'30px'}}>
          <h3>Resumen</h3>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'20px', marginTop:'20px'}}>
            <div style={{background:'#e8f5e8', padding:'20px', borderRadius:'10px'}}>
              <h4 style={{color:'#4CAF50'}}>Valor Total</h4>
              <div style={{fontSize:'1.8em', fontWeight:'bold', color:'#2E7D32'}}>{formatPrice(totals.totalValue)}</div>
            </div>
            <div style={{background:'#e1f5fe', padding:'20px', borderRadius:'10px'}}>
              <h4 style={{color:'#0288D1'}}>Ganancia</h4>
              <div style={{fontSize:'1.8em', fontWeight:'bold', color:'#0277BD'}}>{formatPrice(totals.totalProfit)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductList