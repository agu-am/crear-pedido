import usePedido from '../hooks/usePedido'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { GiHamburgerMenu } from 'react-icons/gi'
import { FaSignOutAlt, FaHome, FaChartLine, FaBoxOpen, FaClipboardList, FaUsers } from 'react-icons/fa'
import MenuMobile from './MenuMobile'
import { clearToken } from '../helpers/api'

const linkBase = 'flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition'

const links = [
  { to: '/', label: 'Inicio', end: true, Icon: FaHome },
  { to: '/admin', label: 'Dashboard', end: true, Icon: FaChartLine },
  { to: '/productos', label: 'Productos', end: false, Icon: FaBoxOpen },
  { to: '/ordenes', label: 'Órdenes', end: false, Icon: FaClipboardList },
  { to: '/clientes', label: 'Clientes', end: false, Icon: FaUsers },
]

const NavBar = () => {
  const { toggleMenu, setToggleMenu } = usePedido()
  const navigate = useNavigate()

  const handleLogout = () => {
    clearToken()
    navigate('/login')
  }

  const linkClass = ({ isActive }) =>
    isActive
      ? `${linkBase} bg-positive-pale text-positive-deep`
      : `${linkBase} text-body hover:bg-canvas-soft hover:text-ink`

  return (
    <header className="sticky top-0 z-30 bg-canvas shadow-card">
      {toggleMenu && <MenuMobile />}
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/" className="shrink-0" aria-label="Ir al inicio">
          <img
            className="h-9 w-9 rounded-2xl object-cover"
            src="https://pedidospaul.agudev.com.ar/wp-content/uploads/2023/11/logoPedidosPaul.png"
            alt="Logo de Pedidos Paul"
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegación">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              <l.Icon size="0.85rem" />
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="hidden items-center gap-2 rounded-full border border-ink px-4 py-2 text-sm font-semibold text-ink transition hover:bg-canvas-soft lg:flex"
          >
            <FaSignOutAlt size="0.9rem" /> Salir
          </button>
          <button
            onClick={() => setToggleMenu(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink text-ink transition hover:bg-canvas-soft lg:hidden"
            aria-label="Abrir menú"
          >
            <GiHamburgerMenu size="1.2rem" />
          </button>
        </div>
      </div>
    </header>
  )
}

export default NavBar
