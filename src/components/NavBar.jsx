import usePedido from '../hooks/usePedido'
import { Link } from 'react-router-dom'
import { GiHamburgerMenu } from 'react-icons/gi'
import MenuMobile from './MenuMobile'

const NavBar = () => {
  const { toggleMenu, setToggleMenu } = usePedido()
  const handleToggleMenuMobile = () => {
    setToggleMenu(true)
  }
  return (
    <div className='sticky top-0 z-20 bg-white px-4 h-16 flex justify-between items-center border-b-2'>
      {toggleMenu && <MenuMobile />}
      <Link to='/'>
        <img
          className='w-14'
          src="https://pedidosprueba.agustinjs.com/wp-content/uploads/2023/11/logoPedidosPaul.png"
          alt="Logo de Pedidos Paul"
        />
      </Link>
      <div>
        <button
          onClick={handleToggleMenuMobile}
          className='xl:hidden'
        >
          <GiHamburgerMenu className='p-2 rounded-md bg-gradient-to-r from-green-400 via-green-500 to-green-600' size="2.4rem" color='white' />
        </button>
      </div>
    </div>
  )
}

export default NavBar