import { useState } from "react";

function Usuarios({volver}){

  const [usuarios,setUsuarios] = useState([]);
  const [nombre,setNombre] = useState("");
  const [email,setEmail] = useState("");

  const agregar=(e)=>{
    e.preventDefault();

    const nuevo={
      id:Date.now(),
      nombre,
      email
    };

    setUsuarios([...usuarios,nuevo]);
    setNombre("");
    setEmail("");
  };

  const eliminar=(id)=>{
    setUsuarios(usuarios.filter(u=>u.id!==id));
  };

  return(

    <div className="container">

      <h2>Usuarios</h2>

      <form onSubmit={agregar}>

        <input
        placeholder="Nombre"
        value={nombre}
        onChange={(e)=>setNombre(e.target.value)}
        />

        <input
        placeholder="Email"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
        />

        <button>Registrar</button>

      </form>

      <h3>Lista</h3>

      {usuarios.map(u=>(

        <div key={u.id}>

          {u.nombre} - {u.email}

          <button onClick={()=>eliminar(u.id)}>
            Eliminar
          </button>

        </div>

      ))}

      <br/>

      <button onClick={volver}>
        Volver
      </button>

    </div>

  );
}

export default Usuarios;