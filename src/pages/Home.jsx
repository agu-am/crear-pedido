import { useState } from "react"
import { Link } from "react-router-dom"
import { FaChartLine } from "react-icons/fa"
import Sidebar from "../components/Sidebar"
import ListadoProductos from "../components/ListadoProductos"
import BtnModalPedido from "../components/BtnModalPedido"
import ModalPedido from "../components/ModalPedido"
import SearchAutoCompletar from "../components/AutoCompletar"

const Home = () => {
    const [logeado] = useState(() => Boolean(localStorage.getItem("token")))

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
                    {logeado && (
                        <Link
                            to="/admin"
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink text-ink transition hover:bg-canvas-soft"
                            aria-label="Ir al dashboard"
                            title="Dashboard"
                        >
                            <FaChartLine size="1.1rem" />
                        </Link>
                    )}
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
