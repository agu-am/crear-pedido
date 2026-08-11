import usePedido from '../hooks/usePedido'
import { RxCross2 } from 'react-icons/rx'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { FaSignOutAlt } from 'react-icons/fa'
import { clearToken } from '../helpers/api'

const MenuMobile = () => {
    const { setToggleMenu } = usePedido()
    const navigate = useNavigate()

    const cerrar = () => setToggleMenu(false)

    const handleLogout = () => {
        clearToken()
        setToggleMenu(false)
        navigate('/login')
    }

    const links = [
        { to: '/', label: 'Inicio', end: true },
        { to: '/admin', label: 'Dashboard', end: true },
        { to: '/productos', label: 'Productos', end: false },
        { to: '/ordenes', label: 'Órdenes', end: false },
        { to: '/clientes', label: 'Clientes', end: false },
    ]

    const linkClass = ({ isActive }) =>
        isActive
            ? 'block rounded-2xl bg-positive-pale px-4 py-3.5 text-sm font-semibold text-positive-deep'
            : 'block rounded-2xl px-4 py-3.5 text-sm font-semibold text-ink'

    return (
        <div className="lg:hidden">
            <div
                className="fixed inset-0 z-40 bg-ink/50"
                onClick={cerrar}
            ></div>
            <div className="fixed left-0 top-0 z-50 flex h-full w-8/12 max-w-xs flex-col rounded-r-3xl bg-canvas shadow-sheet">
                <div className="flex items-center justify-between p-5">
                    <Link to="/" onClick={cerrar}>
                        <img
                            className="h-10 w-10 rounded-2xl object-cover"
                            src="https://pedidospaul.agudev.com.ar/wp-content/uploads/2023/11/logoPedidosPaul.png"
                            alt="Logo de Pedidos Paul"
                        />
                    </Link>
                    <button
                        onClick={cerrar}
                        className="text-mute transition hover:text-ink"
                        aria-label="Cerrar menú"
                    >
                        <RxCross2 size="1.5rem" />
                    </button>
                </div>
                <ul className="flex flex-1 flex-col gap-1 overflow-y-auto px-3">
                    {links.map((l) => (
                        <li key={l.to}>
                            <NavLink to={l.to} end={l.end} onClick={cerrar} className={linkClass}>
                                {l.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
                <div className="border-t border-canvas-soft p-4">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-3xl border border-ink py-3 text-sm font-semibold text-ink transition hover:bg-canvas-soft"
                    >
                        <FaSignOutAlt size="0.9rem" /> Salir
                    </button>
                </div>
            </div>
        </div>
    )
}

export default MenuMobile
