import { useState } from "react";
import Login from "./Login";
import Home from "./Home";
import Usuarios from "./Usuarios";

function App() {

  const [vista, setVista] = useState("login");

  return (

    <div>

      {vista === "login" && (
        <Login entrar={()=>setVista("home")} />
      )}

      {vista === "home" && (
        <Home
          irUsuarios={()=>setVista("usuarios")}
          cerrar={()=>setVista("login")}
        />
      )}

      {vista === "usuarios" && (
        <Usuarios volver={()=>setVista("home")} />
      )}

    </div>

  );
}

export default App;