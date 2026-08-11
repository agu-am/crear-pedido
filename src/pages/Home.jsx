import Sidebar from "../components/Sidebar"
import ListadoProductos from "../components/ListadoProductos"
import BtnModalPedido from "../components/BtnModalPedido"
import ModalPedido from "../components/ModalPedido"
import SearchAutoCompletar from "../components/AutoCompletar"

const Home = () => {
    return (
        <div className="min-h-screen pb-24 lg:pb-0">
            <header className="sticky top-0 z-30 bg-canvas px-4 py-3 shadow-card">
                <div className="mx-auto flex max-w-6xl items-center gap-3">
                    <img
                        className="h-10 w-10 shrink-0 rounded-2xl object-cover"
                        src="https://pedidospaul.agudev.com.ar/wp-content/uploads/2023/11/logoPedidosPaul.png"
                        alt="Logo de Pedidos Paul"
                    />
                    <SearchAutoCompletar />
                </div>
            </header>

            <div className="mx-auto max-w-6xl px-4 py-5 lg:grid lg:grid-cols-[1fr_420px] lg:items-start lg:gap-8">
                <main>
                    <ListadoProductos />
                </main>
                <aside className="hidden lg:block">
                    <Sidebar />
                </aside>
            </div>

            <BtnModalPedido />
            <ModalPedido />
        </div>
    )
}

export default Home
