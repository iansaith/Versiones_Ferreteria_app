const ItemProducto = ({ producto, esAdmin, onEditar, onEliminar, onAgregarCarrito }) => {
  const formatearPrecio = (valor) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor)
  }

  const sinStock = parseInt(producto.stock) === 0
  const stockBajo = parseInt(producto.stock) > 0 && parseInt(producto.stock) <= parseInt(producto.minStock)

  const colorStock = sinStock ? 'danger' : stockBajo ? 'warning' : 'success'
  const textoStock = sinStock ? 'Sin stock' : stockBajo ? `Stock bajo: ${producto.stock}` : `Stock: ${producto.stock}`

  return (
    <div className={`product-card ${sinStock ? 'opacity-50' : ''}`}>
      <div className="d-flex justify-content-between align-items-start mb-2">
        <h5 className="mb-0">{producto.name}</h5>
        <span className={`badge bg-${colorStock}`}>{textoStock}</span>
      </div>

      <div className="row g-2 mb-3">
        <div className="col-6">
          <p className="mb-1"><strong>Ubicacion:</strong> {producto.currentLocation}</p>
          <p className="mb-1"><strong>Categoria:</strong> {producto.category}</p>
          <p className="mb-1"><strong>Proveedor:</strong> {producto.mainSupplier}</p>
        </div>
        <div className="col-6">
          <p className="mb-1"><strong>Precio venta:</strong> <span className="text-success fw-semibold">{formatearPrecio(producto.price)}</span></p>
          <p className="mb-1"><strong>Precio mayorista:</strong> <span className="text-muted text-decoration-line-through">{formatearPrecio(producto.wholesalePrice)}</span></p>
          <p className="mb-1"><strong>Ganancia:</strong> <span className="text-success fw-bold">{formatearPrecio(producto.profit)}</span></p>
        </div>
      </div>

      <div className="d-flex gap-2 flex-wrap">
        <button
          className="btn btn-primary btn-sm"
          onClick={() => onAgregarCarrito(producto)}
          disabled={sinStock}
        >
          {sinStock ? 'Agotado' : 'Agregar al carrito'}
        </button>
        {esAdmin && (
          <>
            <button className="btn btn-warning btn-sm" onClick={() => onEditar(producto)}>Editar</button>
            <button className="btn btn-danger btn-sm" onClick={() => onEliminar(producto.id)}>Eliminar</button>
          </>
        )}
      </div>
    </div>
  )
}

export default ItemProducto