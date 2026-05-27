const ProductItem = ({ product, isAdmin, onEdit, onDelete }) => {
  const formatPrice = (value) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value)
  }

  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'15px'}}>
        <div>
          <p><strong>Ubicación:</strong> {product.currentLocation}</p>
          <p><strong>Categoría:</strong> {product.category}</p>
          <p><strong>Proveedor:</strong> {product.mainSupplier}</p>
        </div>
        <div>
          <p><strong>Precio Venta:</strong> <span style={{color:'green', fontSize:'1.1em'}}>{formatPrice(product.price)}</span></p>
          <p><strong>Compra Mayorista:</strong> <span style={{color:'#666', textDecoration:'line-through'}}>{formatPrice(product.wholesalePrice)}</span></p>
          <p><strong>Ganancia:</strong> <span style={{color:'#4CAF50', fontWeight:'bold'}}>{formatPrice(product.profit)}</span></p>
        </div>
      </div>

      <div>
        {isAdmin ? (
          <>
            <button className="btn" onClick={() => onEdit(product)} style={{marginRight:'10px'}}>Editar</button>
            <button className="btn btn-danger" onClick={() => onDelete(product.id)}>Eliminar</button>
          </>
        ) : <span style={{color:'#999'}}>Solo Admin edita</span>}
      </div>
    </div>
  )
}
export default ProductItem