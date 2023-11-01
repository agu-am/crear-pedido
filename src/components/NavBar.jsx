import React from 'react'
import { Link } from 'react-router-dom'
import { FaUserAlt } from 'react-icons/fa'

const NavBar = () => {
  return (
    <div className='p-2 flex justify-between items-center border-b-2'>
      <Link to='/'>
        <img
          className='w-14'
          src="./public/assets/img/logoPedidosPaul.png"
          alt="Logo de Pedidos Paul"
        />
      </Link>
      <div>
        <Link to='/ordenes'>
          <FaUserAlt size="2rem"/>
        </Link>
      </div>
    </div>
  )
}

export default NavBar