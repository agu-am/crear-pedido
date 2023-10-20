import Sidebar from "./components/Sidebar"
import ListadoProductos from "./components/ListadoProductos"
import { PedidosProvider } from "./context/PedidosProvider"

function App() {


  return (
    <PedidosProvider>
      <div className="flex w-full flex-col xl:flex-row">
        <ListadoProductos />
        <Sidebar />
      </div>
    </PedidosProvider>
  )
}

export default App
