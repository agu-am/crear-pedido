import { useContext } from "react"
import PedidosContext from "../context/PedidosProvider"

const usePedido = () => {
    return useContext(PedidosContext)
}

export default usePedido;