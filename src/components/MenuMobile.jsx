import usePedido from '../hooks/usePedido'
import { RxCross2 } from 'react-icons/rx'
import { Link } from 'react-router-dom'

const MenuMobile = () => {
    const { setToggleMenu } = usePedido()
    return (
        <div className='xl:hidden'>
            <div className='absolute inset-0 opacity-25 bg-black w-screen h-screen'></div>
            <div className='fixed left-0 top-0 z-30 opacity-100 bg-white rounded-e-xl w-8/12 h-full'>
                <div className='flex justify-between items-center p-5'>
                    <Link to='/'>
                        <img
                            className='w-2/12'
                            src="https://pedidosprueba.agustinjs.com/wp-content/uploads/2023/11/logoPedidosPaul.png"
                            alt="Logo Pedidos Paul"
                        />
                    </Link>
                    <RxCross2
                        onClick={() => setToggleMenu(false)}
                        size="2rem"
                    />
                </div>
                <ul className='flex flex-col gap-4 text-center px-5 uppercase font-bold'>
                    <li><Link onClick={() => setToggleMenu(false)} to='/'>Inicio</Link></li>
                    <li><Link onClick={() => setToggleMenu(false)} to='login'>Ingresar</Link></li>
                    <li><Link onClick={() => setToggleMenu(false)} to='ordenes'>Ordenes</Link></li>
                    <li><Link>Añadir cliente</Link></li>
                </ul>
            </div>
        </div>
    )
}

export default MenuMobile