import Sidebar from "../components/Sidebar"
import ListadoProductos from "../components/ListadoProductos"
import BtnModalPedido from "../components/BtnModalPedido"
import ModalPedido from "../components/ModalPedido"
import SearchAutoCompletar from "../components/AutoCompletar"

const Home = () => {
    return (
        <div className="flex flex-col w-full xl:grid grid-cols-[1fr_450px] justify-items-center justify-around">
            <SearchAutoCompletar />
            <ListadoProductos />
            <Sidebar />
            <BtnModalPedido />
            <ModalPedido />
        </div>
    )
}

export default Home