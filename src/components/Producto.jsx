import usePedido from "../hooks/usePedido"

const Producto = ({ producto }) => {
    const { handleSetPedido, handleDecrementPedido, pedido } = usePedido()
    const { nombre, sku, cantidad } = producto
    return (
        <div className="flex p-3 justify-between items-center aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:h-28">
            <div>
                <h3 className="text-sm text-gray-700">{nombre}</h3>
                <p className="mt-1 text-lg font-medium text-gray-900">SKU: {sku}</p>
            </div>
            <div className="flex flex-col gap-2">
                <button
                    type="button"
                    className="h-8 w-8 justify-center text-white bg-green-700 hover:bg-green-800 rounded-md text-base text-center items-center font-bold"
                    onClick={() => handleSetPedido({ nombre, sku, cantidad })}
                >
                    + 
                </button>
                <button
                    type="button"
                    className="h-8 w-8 justify-center text-white bg-green-700 hover:bg-green-800 rounded-md text-base text-center items-center font-bold"
                    onClick={() => handleDecrementPedido({ nombre, sku, cantidad })}
                >
                    -
                </button>
            </div>
        </div>
    )
}

export default Producto