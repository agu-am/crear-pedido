import { Routes, Route, Navigate } from "react-router-dom"
import { PedidosProvider } from "./context/PedidosProvider"
import { useState } from "react"
import Home from "./pages/Home"
import Ordenes from "./pages/Ordenes"
import Login from "./pages/Login"
import NotFound from "./pages/NotFound"

function App() {

  const [token, setToken] = useState(null);

  return (
    <PedidosProvider>
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/login" element={<Login setToken={setToken} />}/>
          <Route path="/ordenes" element={token ? <Ordenes /> : <Navigate to="/login"/>}/>
          <Route path="*" element={<NotFound />}/>
        </Routes>
    </PedidosProvider>
  )
}

export default App
