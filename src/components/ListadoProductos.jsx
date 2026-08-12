import Producto from "./Producto"
import usePedido from "../hooks/usePedido"
import CardProductoSkeleton from "./CardProductoSkeleton"
import Error from "./Error"
import { FaSearch } from "react-icons/fa"

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
        categorias,
        categoriaSeleccionada,
        setCategoriaSeleccionada,
        errorCategorias,
    } = usePedido()

    const chipCls = (activa) =>
        `shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
            activa
                ? "border-transparent bg-positive-pale text-positive-deep"
                : "border-ink bg-canvas text-ink hover:bg-canvas-soft"
        }`

    return (
        <section>
            <div className="relative mb-3">
                <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mute" size="0.9rem" />
                <input
                    type="text"
                    value={busqueda}
                    placeholder="Buscar producto..."
                    onChange={e => setBusqueda(e.target.value)}
                    className="w-full rounded-xl border border-ink bg-canvas py-3 pl-11 pr-4 text-sm text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
            </div>

            {!errorCategorias && categorias.length > 0 && (
                <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <button
                        type="button"
                        onClick={() => setCategoriaSeleccionada("")}
                        className={chipCls(categoriaSeleccionada === "")}
                    >
                        Todas
                    </button>
                    {categorias.map(c => (
                        <button
                            key={c.id}
                            type="button"
                            onClick={() => setCategoriaSeleccionada(String(c.id))}
                            className={chipCls(categoriaSeleccionada === String(c.id))}
                        >
                            {c.name}
                        </button>
                    ))}
                </div>
            )}

            {errorProductos && <Error mensaje={"No se pudieron cargar los productos"} />}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {cargandoProductos
                    ? Array.from({ length: 12 }).map((_, i) => <CardProductoSkeleton key={i} />)
                    : productos.map(producto => (
                        <Producto key={producto.sku} producto={producto} />
                    ))}
            </div>

            {!cargandoProductos && hayMasProductos && (
                <button
                    type="button"
                    onClick={cargarMasProductos}
                    disabled={cargandoMasProductos}
                    className="mt-5 block w-full rounded-3xl border border-ink bg-canvas py-3 text-sm font-semibold text-ink transition hover:bg-canvas-soft disabled:opacity-60 sm:mx-auto sm:w-auto sm:px-8"
                >
                    {cargandoMasProductos ? "Cargando..." : "Cargar más"}
                </button>
            )}
        </section>
    )
}

export default ListadoProductos
