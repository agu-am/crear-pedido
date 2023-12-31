import { useEffect, useState } from "react"
import usePedido from "../hooks/usePedido"

const Producto = ({ producto }) => {
    const { handleSetPedido, handleDecrementPedido, pedido, cargandoProductos } = usePedido()
    const { id, name, sku, quantity } = producto
    const [cantidadActual, setCantidadActual] = useState()

    const obtenerCantidadActual = () => {
        const productoExistente = pedido.productos.find(p => p.sku === producto.sku);
        if (productoExistente) {
            setCantidadActual(productoExistente.quantity);
        } else {
            // Si el producto no existe en el carrito, establece la cantidad actual en 0
            setCantidadActual(0);
        }
    }

    useEffect(() => {
        obtenerCantidadActual()
    }, [pedido])


    return(
            <div className="flex p-3 justify-between items-center aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:h-28">
                <div className="flex flex-col h-full justify-between">
                    <h3 className="text-sm text-gray-700">{name}</h3>
                    <p className="mt-1 text-lg font-medium text-gray-900">SKU: {sku}</p>
                </div>
                <div className="flex flex-col gap-2 w-3/12 items-end">
                    <div className=" flex flex-col w-3/12 gap-1 justify-center items-end">
                        <button
                            type="button"
                            className="h-8 w-8 justify-center self-center text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br rounded-lg"
                            onClick={() => handleSetPedido({ id, name, sku, quantity })}
                        >
                            +
                        </button>
                        <input
                            className="w-full self-center text-center"
                            type="number"
                            defaultValue={cantidadActual}
                        />
                        <button
                            type="button"
                            className="h-8 w-8 justify-center self-center text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br rounded-lg"
                            onClick={() => handleDecrementPedido({ id, name, sku, quantity })}
                        >
                            -
                        </button>
                    </div>
                </div>
            </div>
    )
}

export default Producto