import Sidebar from "./components/Sidebar"
import ListadoProductos from "./components/ListadoProductos"
import ModalPedido from "./components/ModalPedido"
import { PedidosProvider } from "./context/PedidosProvider"
import BtnModalPedido from "./components/BtnModalPedido"

function App() {


  return (
    <PedidosProvider>
      <div className="flex w-full flex-col xl:flex-row">
        <ListadoProductos />
        <Sidebar />
        <BtnModalPedido />
        <ModalPedido />

      </div>
    </PedidosProvider>
  )
}

export default App