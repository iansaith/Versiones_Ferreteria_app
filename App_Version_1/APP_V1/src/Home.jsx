function Home({irUsuarios,cerrar}){

  return(

    <div className="container">

      <h1>Bienvenido</h1>

      <button onClick={irUsuarios}>
        Gestionar Usuarios
      </button>

      <br/><br/>

      <button onClick={cerrar}>
        Cerrar sesión
      </button>

    </div>

  );
}

export default Home;