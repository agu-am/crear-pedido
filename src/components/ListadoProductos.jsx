import Producto from "./Producto"
import usePedido from "../hooks/usePedido"
import CardProductoSkeleton from "./CardProductoSkeleton"

const ListadoProductos = () => {

    const { productos, busqueda, setBusqueda, cargandoProductos } = usePedido()

    return (
        <div className=" flex flex-col justify-center xl:w-full row-start-2 p-2">
            <div className="w-10/12 mb-2 self-center bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white rounded pb-1 xl:w-6/12">
                <input
                    type="text"
                    placeholder="Buscar producto aquí..."
                    className="flex w-full bg-white text-xl text-black rounded border-white pt-2"
                    onChange={e => setBusqueda(e.target.value.toString())}
                />
            </div>
            <div className="w-full grid gap-2 content-center sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-2">

                {cargandoProductos ? <CardProductoSkeleton cards={15} /> : productos.map(producto => (
                    <Producto key={producto.sku} producto={producto} />
                ))}
            </div>
        </div>
    )
}

export default ListadoProductos