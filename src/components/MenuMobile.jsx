import usePedido from '../hooks/usePedido'
import { RxCross2 } from 'react-icons/rx'
import { Link } from 'react-router-dom'

const MenuMobile = () => {
    const { setToggleMenu } = usePedido()
    const links = [
        { to: '/', label: 'Inicio' },
        { to: '/ordenes', label: 'Órdenes' },
        { to: '/clientes', label: 'Clientes' },
    ]
    return (
        <div className="lg:hidden">
            <div
                className="fixed inset-0 z-40 bg-ink/50"
                onClick={() => setToggleMenu(false)}
            ></div>
            <div className="fixed left-0 top-0 z-50 flex h-full w-8/12 max-w-xs flex-col rounded-r-3xl bg-canvas shadow-sheet">
                <div className="flex items-center justify-between p-5">
                    <Link to="/" onClick={() => setToggleMenu(false)}>
                        <img
                            className="h-10 w-10 rounded-2xl object-cover"
                            src="https://pedidospaul.agudev.com.ar/wp-content/uploads/2023/11/logoPedidosPaul.png"
                            alt="Logo de Pedidos Paul"
                        />
                    </Link>
                    <button
                        onClick={() => setToggleMenu(false)}
                        className="text-mute transition hover:text-ink"
                        aria-label="Cerrar menú"
                    >
                        <RxCross2 size="1.5rem" />
                    </button>
                </div>
                <ul className="divide-y divide-canvas-soft px-3">
                    {links.map((l) => (
                        <li key={l.to}>
                            <Link
                                onClick={() => setToggleMenu(false)}
                                to={l.to}
                                className="block px-3 py-4 text-sm font-semibold text-ink"
                            >
                                {l.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default MenuMobile
