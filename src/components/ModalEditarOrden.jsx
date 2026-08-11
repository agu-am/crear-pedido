import { useEffect, useState } from "react";
import usePedido from "../hooks/usePedido";
import { RiCloseCircleLine } from "react-icons/ri";
import { notificarExito, notificarError } from "../helpers/toast";
import { opcionesEstado } from "../helpers/estados";

const ModalEditarOrden = ({ orden, setOrden, onGuardado }) => {
    const { actualizarOrden } = usePedido();
    const [cliente, setCliente] = useState("");
    const [telefono, setTelefono] = useState("");
    const [estado, setEstado] = useState("processing");
    const [observaciones, setObservaciones] = useState("");
    const [items, setItems] = useState([]);
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        if (orden) {
            setCliente(orden.billing?.first_name || "");
            setTelefono(orden.billing?.phone || "");
            setEstado(orden.status || "processing");
            setObservaciones(orden.customer_note || "");
            setItems((orden.line_items || []).map((i) => ({ id: i.id, name: i.name, quantity: i.quantity })));
        }
    }, [orden]);

    if (!orden) return null;

    const cambiarCantidad = (id, cantidad) => {
        setItems((prev) =>
            prev.map((i) => (i.id === id ? { ...i, quantity: Number(cantidad) } : i))
        );
    };

    const handleGuardar = async () => {
        setCargando(true);
        try {
            await actualizarOrden(orden.id, {
                billing: { first_name: cliente, phone: telefono },
                customer_note: observaciones,
                status: estado,
                line_items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
            });
            setOrden(null);
            notificarExito("Orden actualizada con éxito");
            onGuardado?.();
        } catch (error) {
            notificarError(error?.response?.data?.message || "Hubo un error al actualizar la orden");
        } finally {
            setCargando(false);
        }
    };

    const inputCls =
        "w-full rounded-xl border border-ink bg-canvas px-4 py-3 text-sm text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-brand-500"
    const labelCls = "mb-1 block text-xs font-semibold uppercase tracking-wide text-mute"

    return (
        <div
            className="fixed inset-0 z-40 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
        >
            <div
                className="absolute inset-0 bg-ink/50"
                onClick={() => setOrden(null)}
            ></div>
            <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-canvas p-6 shadow-sheet">
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-ink">Editar orden</h2>
                    <button
                        onClick={() => setOrden(null)}
                        className="text-mute transition hover:text-ink"
                        aria-label="Cerrar"
                    >
                        <RiCloseCircleLine size="1.5rem" />
                    </button>
                </div>

                <div className="flex flex-col gap-4">
                    <div>
                        <label htmlFor="o-cliente" className={labelCls}>Cliente</label>
                        <input id="o-cliente" type="text" value={cliente} onChange={(e) => setCliente(e.target.value)} className={inputCls} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="o-telefono" className={labelCls}>Teléfono</label>
                            <input id="o-telefono" type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label htmlFor="o-estado" className={labelCls}>Estado</label>
                            <select id="o-estado" value={estado} onChange={(e) => setEstado(e.target.value)} className={inputCls}>
                                {opcionesEstado.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="o-obs" className={labelCls}>Observaciones</label>
                        <textarea id="o-obs" rows={2} value={observaciones} onChange={(e) => setObservaciones(e.target.value)} className={`${inputCls} resize-none`} />
                    </div>

                    <div>
                        <p className={labelCls}>Productos</p>
                        <div className="divide-y divide-canvas-soft rounded-xl border border-canvas-soft">
                            {items.map((i) => (
                                <div key={i.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                                    <p className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{i.name}</p>
                                    <input
                                        type="number"
                                        min="1"
                                        value={i.quantity}
                                        onChange={(e) => cambiarCantidad(i.id, e.target.value)}
                                        className="h-9 w-16 rounded-lg border border-ink bg-canvas text-center text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-brand-500"
                                        aria-label={`Cantidad de ${i.name}`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleGuardar}
                        disabled={cargando}
                        className="w-full rounded-3xl bg-brand-600 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-700 active:scale-[0.99] disabled:opacity-60"
                    >
                        {cargando ? "Guardando..." : "Guardar cambios"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalEditarOrden;
