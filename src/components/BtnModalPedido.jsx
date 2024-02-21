import usePedido from "../hooks/usePedido"
import { BsFillBasket2Fill } from 'react-icons/bs'


const BtnModalPedido = () => {

    const { modalPedido, setModalPedido, pedido } = usePedido()

    return (
        <button 
        className={pedido.productos.length > 0 
            ? `fixed z-10 p-4 animate-fade animate-duration-500 animate-ease-linear rounded-full left-2 bottom-3 bg-gradient-to-r from-green-400 via-green-500 to-green-600 xl:hidden` 
            : `hidden xl:hidden`}
        onClick={() => setModalPedido(!modalPedido)}
        >
            <BsFillBasket2Fill color="white" size="2.5rem"/>
        </button>
    )
}

export default BtnModalPedido