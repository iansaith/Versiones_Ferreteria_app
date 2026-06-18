
const Carrito = ({ items, onCambiarCantidad, onEliminarItem, onConfirmarCompra, onCerrar }) => {
  const formatearPrecio = (valor) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor)
  }

  const totalCompra = items.reduce((total, item) => {
    return total + (parseFloat(item.price) * item.cantidad)
  }, 0)

  const totalItems = items.reduce((total, item) => total + item.cantidad, 0)

  if (items.length === 0) {
    return (
      <div className="card shadow p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">Carrito</h4>
          <button className="btn btn-sm btn-outline-secondary" onClick={onCerrar}>Cerrar</button>
        </div>
        <div className="text-center py-5 text-muted">
          <p className="fs-5">El carrito esta vacio</p>
          <p className="small">Agrega productos desde la lista</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card shadow p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">
          Carrito
          <span className="badge bg-warning text-dark ms-2">{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
        </h4>
        <button className="btn btn-sm btn-outline-secondary" onClick={onCerrar}>Cerrar</button>
      </div>

      <div className="d-flex flex-column gap-3 mb-4">
        {items.map(item => (
          <div key={item.id} className="border rounded p-3">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h6 className="mb-0">{item.name}</h6>
                <small className="text-muted">{formatearPrecio(item.price)} por unidad</small>
              </div>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => onEliminarItem(item.id)}
              >
                Quitar
              </button>
            </div>

            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => onCambiarCantidad(item.id, item.cantidad - 1)}
                  disabled={item.cantidad <= 1}
                >
                  -
                </button>
                <span className="fw-bold px-2">{item.cantidad}</span>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => onCambiarCantidad(item.id, item.cantidad + 1)}
                  disabled={item.cantidad >= item.stock}
                >
                  +
                </button>
                <small className="text-muted ms-1">Max: {item.stock}</small>
              </div>
              <span className="fw-bold text-success">
                {formatearPrecio(parseFloat(item.price) * item.cantidad)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-top pt-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Total:</h5>
          <h5 className="mb-0 text-success">{formatearPrecio(totalCompra)}</h5>
        </div>
        <button
          className="btn btn-success w-100 py-2 fw-bold"
          onClick={() => onConfirmarCompra(items)}
        >
          Confirmar Compra
        </button>
      </div>
    </div>
  )
}

export default Carrito
