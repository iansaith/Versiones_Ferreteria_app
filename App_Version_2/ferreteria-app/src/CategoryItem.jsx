const CategoryItem = ({ category, isAdmin, onEdit, onDelete }) => {
  return (
    <div className="product-card" style={{ borderLeft: '5px solid #4CAF50' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontSize: '2em', marginRight: '15px' }}>{category.icon}</span>
        <div>
          <h3 style={{ margin: 0, color: '#4CAF50' }}>{category.name}</h3>
          <p style={{ margin: 0, color: '#666', fontSize: '0.9em' }}>
            {category.description}
          </p>
        </div>
      </div>
      
      <div style={{ marginTop: '15px' }}>
        {isAdmin ? (
          <>
            <button className="btn" onClick={() => onEdit(category)} style={{marginRight: '10px'}}>
              Editar
            </button>
            <button className="btn btn-danger" onClick={() => onDelete(category.id)}>
              Eliminar
            </button>
          </>
        ) : (
          <span style={{ color: '#999', fontStyle: 'italic' }}>
            Solo Admin puede editar
          </span>
        )}
      </div>
    </div>
  )
}

export default CategoryItem