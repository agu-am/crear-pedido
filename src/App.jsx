import Sidebar from "./components/Sidebar"
import ListadoProductos from "./components/ListadoProductos"
import ModalPedido from "./components/ModalPedido"
import { PedidosProvider } from "./context/PedidosProvider"
import BtnModalPedido from "./components/BtnModalPedido"
import SearchAutoCompletar from "./components/AutoCompletar"

function App() {


  return (
    <PedidosProvider>
      <div className="flex flex-col w-full xl:grid grid-cols-[.7fr,.3fr] justify-items-center">
        <SearchAutoCompletar />
        <ListadoProductos />
        <Sidebar />
        <BtnModalPedido />
        <ModalPedido />

      </div>
    </PedidosProvider>
  )
}

export default App
