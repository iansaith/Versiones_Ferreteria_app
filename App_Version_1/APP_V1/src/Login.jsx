import { useState } from "react";

function Login({entrar}) {

  const [user,setUser] = useState("");
  const [pass,setPass] = useState("");
  const [error,setError] = useState("");

  const validar=(e)=>{
    e.preventDefault();

    if(user==="admin" && pass==="1234"){
      entrar();
    }else{
      setError("Datos incorrectos");
    }
  };

  return(

    <div className="container">

      <h2>Login</h2>

      <form onSubmit={validar}>

        <input
        placeholder="Usuario"
        onChange={(e)=>setUser(e.target.value)}
        />

        <input
        type="password"
        placeholder="Contraseña"
        onChange={(e)=>setPass(e.target.value)}
        />

        <button>Entrar</button>

      </form>

      {error && <p>{error}</p>}

    </div>

  );
}

export default Login;