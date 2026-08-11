import Producto from "./Producto"
import usePedido from "../hooks/usePedido"
import CardProductoSkeleton from "./CardProductoSkeleton"
import Error from "./Error"

const ListadoProductos = () => {

    const {
        productos,
        busqueda,
        setBusqueda,
        cargandoProductos,
        cargandoMasProductos,
        cargarMasProductos,
        hayMasProductos,
        errorProductos,
    } = usePedido()

    return (
        <div className=" flex flex-col xl:w-full row-start-2 p-2">
            <div className="w-10/12 mb-2 self-center bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white rounded pb-1 xl:w-6/12">
                <input
                    type="text"
                    value={busqueda}
                    placeholder="Buscar producto aquí..."
                    className="flex w-full bg-white text-xl text-black rounded border-white pt-2"
                    onChange={e => setBusqueda(e.target.value)}
                />
            </div>
            {errorProductos && (
                <Error mensaje={"No se pudieron cargar los productos"} />
            )}
            <div className="w-full grid gap-2 content-center sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-2">
                {cargandoProductos ? <CardProductoSkeleton cards={15} /> : productos.map(producto => (
                    <Producto key={producto.sku} producto={producto} />
                ))}
            </div>
            {!cargandoProductos && hayMasProductos && (
                <button
                    type="button"
                    onClick={cargarMasProductos}
                    disabled={cargandoMasProductos}
                    className="self-center mt-4 w-6/12 p-2 rounded-md font-bold text-white uppercase bg-gradient-to-r from-green-400 via-green-500 to-green-600 disabled:opacity-60"
                >
                    {cargandoMasProductos ? "Cargando..." : "Cargar más"}
                </button>
            )}
        </div>
    )
}

export default ListadoProductos
