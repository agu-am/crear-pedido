import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { PedidosProvider } from "./context/PedidosProvider"
import Home from "./pages/Home"
import Ordenes from "./pages/Ordenes"
import NotFound from "./pages/NotFound"

function App() {
  return (
    <PedidosProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/ordenes" element={<Ordenes />}/>
          <Route path="*" element={<NotFound />}/>
        </Routes>
      </Router>
    </PedidosProvider>
  )
}

export default App
