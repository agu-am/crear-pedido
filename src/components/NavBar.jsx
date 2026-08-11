import usePedido from '../hooks/usePedido'
import { Link } from 'react-router-dom'
import { GiHamburgerMenu } from 'react-icons/gi'
import MenuMobile from './MenuMobile'

const NavBar = () => {
  const { toggleMenu, setToggleMenu } = usePedido()
  return (
    <header className="sticky top-0 z-30 bg-canvas shadow-card">
      {toggleMenu && <MenuMobile />}
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/">
          <img
            className="h-10 w-10 rounded-2xl object-cover"
            src="https://pedidospaul.agudev.com.ar/wp-content/uploads/2023/11/logoPedidosPaul.png"
            alt="Logo de Pedidos Paul"
          />
        </Link>
        <button
          onClick={() => setToggleMenu(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-ink text-ink transition hover:bg-canvas-soft lg:hidden"
          aria-label="Abrir menú"
        >
          <GiHamburgerMenu size="1.2rem" />
        </button>
      </div>
    </header>
  )
}

export default NavBar
