import { useEffect, useState } from "react";
import api from "../helpers/api";
import { RiCloseCircleLine } from "react-icons/ri";
import { notificarExito, notificarError } from "../helpers/toast";
import { vendedores } from "../helpers/vendedores";

const ModalEditarCliente = ({ cliente, setCliente, onGuardado }) => {
    const [form, setForm] = useState({ first_name: "", last_name: "", email: "", telefono: "" });
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        if (cliente) {
            setForm({
                first_name: cliente.first_name || "",
                last_name: cliente.last_name || "",
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
                        <label htmlFor="c-nombre" className={labelCls}>Nombre</label>
                        <input id="c-nombre" type="text" value={form.first_name} onChange={set("first_name")} className={inputCls} />
                    </div>

                    <div>
                        <label htmlFor="c-apellido" className={labelCls}>Apellido</label>
                        <input id="c-apellido" type="text" value={form.last_name} onChange={set("last_name")} className={inputCls} />
                    </div>

                    <div>
                        <label htmlFor="c-email" className={labelCls}>Email</label>
                        <input id="c-email" type="email" value={form.email} onChange={set("email")} className={inputCls} />
                    </div>

                    <div>
                        <label htmlFor="c-vendedor" className={labelCls}>Vendedor</label>
                        <select id="c-vendedor" value={form.telefono} onChange={set("telefono")} className={inputCls}>
                            <option value="">Sin vendedor</option>
                            {vendedores.map((v) => (
                                <option key={v.value} value={v.value}>{v.label}</option>
                            ))}
                        </select>
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
