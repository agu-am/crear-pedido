import usePedido from "../hooks/usePedido"
import { formatearFecha, formatearHora } from "../helpers"
import Error from "./Error"
import { FaClipboardList } from "react-icons/fa"

const ListadoOrdenes = () => {
    const { ordenes, errorOrdenes } = usePedido()

    if (errorOrdenes) {
        return (
            <div className="mx-auto max-w-6xl px-4 py-8">
                <Error mensaje={"No se pudieron cargar las órdenes"} />
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
            <h1 className="mb-6 text-display-xs text-ink">Órdenes</h1>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {ordenes.map(o => {
                    const nombreCliente = o.billing?.first_name || ""
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

                            {nombreCliente && (
                                <h2 className="mb-3 text-base font-bold text-ink">{nombreCliente}</h2>
                            )}

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
                        </article>
                    )
                })}
            </div>
        </div>
    )
}

export default ListadoOrdenes
