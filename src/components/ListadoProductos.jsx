import Producto from "./Producto"
import usePedido from "../hooks/usePedido"

const ListadoProductos = () => {

    const { productos, busqueda, setBusqueda } = usePedido()

    return (
        <div className=" flex flex-col my-6 mx-3 gap-2 justify-center xl:w-8/12">
            <h2
            className="font-bold uppercase text-center text-2xl xl:text-4xl"
            >
                Buscar Producto
            </h2>
            <input
                type="text"
                placeholder="Buscar producto aquí"
                className="w-10/12 self-center outline-none xl:w-6/12 border-b-8 border-b-green-800 border-fo"
                onChange={e => setBusqueda(e.target.value.toString())}
            />
            <div className="w-full grid gap-2 content-center sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-2">

                {productos.map(producto => (

                    <Producto key={producto.sku} producto={producto} />
                ))}
            </div>
        </div>
    )
}

export default ListadoProductos