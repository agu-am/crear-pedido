import { useEffect, useState } from "react"
import usePedido from "../hooks/usePedido"
import { formatearFecha, formatearHora } from "../helpers"
import { estadosOrden } from "../helpers/estados"
import { notificarError } from "../helpers/toast"
import Error from "./Error"
import ModalEditarOrden from "./ModalEditarOrden"
import ConfirmarModal from "./ConfirmarModal"
import { FaClipboardList, FaEdit, FaTrashAlt } from "react-icons/fa"

const INTERVALO_REFRESCO = 30000

const ListadoOrdenes = () => {
    const {
        ordenes,
        errorOrdenes,
        cargandoOrdenes,
        eliminarOrden,
        obtenerOrdenes,
        filtroDesde,
        setFiltroDesde,
        filtroHasta,
        setFiltroHasta,
    } = usePedido()
    const [editando, setEditando] = useState(null)
    const [eliminando, setEliminando] = useState(null)
    const [cargandoEliminar, setCargandoEliminar] = useState(false)

    useEffect(() => {
        obtenerOrdenes()
        const id = setInterval(() => {
            obtenerOrdenes()
        }, INTERVALO_REFRESCO)
        return () => clearInterval(id)
    }, [obtenerOrdenes])

    const handleEliminar = (o) => {
        setEliminando(o)
    }

    const confirmarEliminar = async () => {
        setCargandoEliminar(true)
        try {
            await eliminarOrden(eliminando.id)
            setEliminando(null)
        } catch (error) {
            notificarError(error?.response?.data?.message || "No se pudo eliminar la orden")
        } finally {
            setCargandoEliminar(false)
        }
    }

    if (errorOrdenes) {
        return (
            <div className="mx-auto max-w-6xl px-4 py-8">
                <Error mensaje={"No se pudieron cargar las órdenes"} />
            </div>
        )
    }

    if (cargandoOrdenes && ordenes.length === 0) {
        return (
            <div className="mx-auto max-w-6xl px-4 py-8">
                <h1 className="mb-6 text-display-xs text-ink">Órdenes</h1>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-48 animate-pulse rounded-3xl bg-canvas-soft" />
                    ))}
                </div>
            </div>
        )
    }

    if (ordenes.length === 0) {
        return (
            <div className="mx-auto max-w-6xl px-4 py-8">
                <h1 className="mb-6 text-display-xs text-ink">Órdenes</h1>
                <div className="rounded-3xl bg-canvas-soft px-6 py-12 text-center">
                    <FaClipboardList className="mx-auto mb-3 text-mute" size="2rem" />
                    <p className="text-sm font-semibold text-ink">Sin órdenes todavía</p>
                    <p className="mt-1 text-sm text-mute">Los pedidos aparecerán acá.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <h1 className="text-display-xs text-ink">Órdenes</h1>
                <div className="flex flex-wrap items-end gap-3">
                    <div>
                        <label htmlFor="filtro-desde" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-mute">Desde</label>
                        <input
                            id="filtro-desde"
                            type="date"
                            value={filtroDesde}
                            onChange={(e) => setFiltroDesde(e.target.value)}
                            className="rounded-xl border border-ink bg-canvas px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="filtro-hasta" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-mute">Hasta</label>
                        <input
                            id="filtro-hasta"
                            type="date"
                            value={filtroHasta}
                            onChange={(e) => setFiltroHasta(e.target.value)}
                            className="rounded-xl border border-ink bg-canvas px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                    </div>
                    {(filtroDesde || filtroHasta) && (
                        <button
                            type="button"
                            onClick={() => { setFiltroDesde(""); setFiltroHasta("") }}
                            className="rounded-full border border-ink px-3 py-2 text-sm font-semibold text-ink transition hover:bg-canvas-soft"
                        >
                            Limpiar
                        </button>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {ordenes.map(o => {
                    const nombreCliente = o.billing?.first_name || ""
                    const estado = estadosOrden[o.status] || estadosOrden.pending
                    return (
                        <article
                            key={o.id}
                            className="flex flex-col rounded-3xl bg-canvas p-5 shadow-card"
                        >
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-mute">
                                    {formatearFecha(o.date_created)}
                                </p>
                                <p className="text-xs font-bold text-ink">
                                    {formatearHora(o.date_created)}
                                </p>
                            </div>

                            <div className="mb-3 flex items-center justify-between gap-3">
                                {nombreCliente ? (
                                    <h2 className="min-w-0 truncate text-base font-bold text-ink">{nombreCliente}</h2>
                                ) : <span />}
                                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${estado.cls}`}>
                                    {estado.label}
                                </span>
                            </div>

                            <ul className="flex-1 divide-y divide-canvas-soft">
                                {o.line_items.map(i => (
                                    <li
                                        key={i.id}
                                        className="flex items-center justify-between gap-3 py-2 text-sm"
                                    >
                                        <p className="min-w-0 truncate font-medium text-ink">{i.name}</p>
                                        <p className="shrink-0 text-mute">x{i.quantity}</p>
                                    </li>
                                ))}
                            </ul>

                            {o.customer_note && (
                                <div className="mt-3 rounded-xl bg-canvas-soft p-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-mute">
                                        Observaciones
                                    </p>
                                    <p className="mt-1 text-sm text-body">{o.customer_note}</p>
                                </div>
                            )}

                            <div className="mt-4 flex items-center justify-end gap-2 border-t border-canvas-soft pt-3">
                                <button
                                    onClick={() => setEditando(o)}
                                    className="flex items-center gap-1.5 rounded-full border border-ink px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-canvas-soft"
                                >
                                    <FaEdit size="0.7rem" /> Editar
                                </button>
                                <button
                                    onClick={() => handleEliminar(o)}
                                    disabled={eliminando}
                                    className="flex items-center gap-1.5 rounded-full bg-negative-bg px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                                >
                                    <FaTrashAlt size="0.7rem" /> Eliminar
                                </button>
                            </div>
                        </article>
                    )
                })}
            </div>

            <ModalEditarOrden orden={editando} setOrden={setEditando} />

            <ConfirmarModal
                abierto={!!eliminando}
                titulo="Eliminar orden"
                mensaje={`¿Eliminar la orden de ${eliminando?.billing?.first_name || "cliente"}? Esta acción no se puede deshacer.`}
                onConfirmar={confirmarEliminar}
                onCancelar={() => setEliminando(null)}
                cargando={cargandoEliminar}
            />
        </div>
    )
}

export default ListadoOrdenes
