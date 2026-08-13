import { useEffect, useState } from "react";
import api from "../helpers/api";
import { RiCloseCircleLine } from "react-icons/ri";
import { notificarExito, notificarError } from "../helpers/toast";

const ModalEditarCliente = ({ cliente, setCliente, onGuardado }) => {
    const [form, setForm] = useState({ codigo_interno: "", razon_social: "", local: "", email: "", telefono: "" });
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        if (cliente) {
            setForm({
                codigo_interno: cliente.codigo_interno || "",
                razon_social: cliente.razon_social || "",
                local: cliente.local || "",
                email: cliente.email || "",
                telefono: cliente.phone || "",
            });
        }
    }, [cliente]);

    if (!cliente) return null;

    const abierto = Boolean(cliente)

    const set = (clave) => (e) => setForm((prev) => ({ ...prev, [clave]: e.target.value }))

    const handleGuardar = async () => {
        setCargando(true);
        try {
            await api.put(`/clientes/${cliente.id}`, form);
            setCliente(null);
            notificarExito("Cliente actualizado con éxito");
            onGuardado?.();
        } catch (error) {
            notificarError(error?.response?.data?.message || "Hubo un error al actualizar el cliente");
        } finally {
            setCargando(false);
        }
    };

    const inputCls =
        "w-full rounded-xl border border-ink bg-canvas px-4 py-3 text-sm text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-brand-500"
    const labelCls = "mb-1 block text-xs font-semibold uppercase tracking-wide text-mute"

    return (
        <div
            className={abierto ? "fixed inset-0 z-40 flex items-center justify-center p-4" : "hidden"}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="absolute inset-0 bg-ink/50"
                onClick={() => setCliente(null)}
            ></div>
            <div className="relative w-full max-w-md rounded-3xl bg-canvas p-6 shadow-sheet">
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-ink">Editar cliente</h2>
                    <button
                        onClick={() => setCliente(null)}
                        className="text-mute transition hover:text-ink"
                        aria-label="Cerrar"
                    >
                        <RiCloseCircleLine size="1.5rem" />
                    </button>
                </div>

                <div className="flex flex-col gap-4">
                    <div>
                        <label htmlFor="c-codigo" className={labelCls}>Código</label>
                        <input id="c-codigo" type="text" value={form.codigo_interno} onChange={set("codigo_interno")} className={inputCls} />
                    </div>

                    <div>
                        <label htmlFor="c-razon" className={labelCls}>Razón social</label>
                        <input id="c-razon" type="text" value={form.razon_social} onChange={set("razon_social")} className={inputCls} />
                    </div>

                    <div>
                        <label htmlFor="c-local" className={labelCls}>Local</label>
                        <input id="c-local" type="text" value={form.local} onChange={set("local")} className={inputCls} />
                    </div>

                    <div>
                        <label htmlFor="c-email" className={labelCls}>Email</label>
                        <input id="c-email" type="email" value={form.email} onChange={set("email")} className={inputCls} />
                    </div>

                    <div>
                        <label htmlFor="c-telefono" className={labelCls}>Teléfono</label>
                        <input id="c-telefono" type="text" value={form.telefono} onChange={set("telefono")} className={inputCls} />
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

export default ModalEditarCliente;
