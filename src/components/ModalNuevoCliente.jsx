import { useState } from "react";
import api from "../helpers/api";
import { RiCloseCircleLine } from "react-icons/ri";
import { notificarExito, notificarError } from "../helpers/toast";

const ModalNuevoCliente = ({ modalNuevoCliente, setModalNuevoCliente, onGuardado }) => {
    const [codigo, setCodigo] = useState('');
    const [razon_social, setRazon_social] = useState('');
    const [local, setLocal] = useState('');
    const [email, setEmail] = useState('');
    const [cargando, setCargando] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setCargando(true);

        try {
            await api.post('/clientes', { codigo_interno: codigo, razon_social, local, email });
            setModalNuevoCliente(false);
            setCodigo('');
            setRazon_social('');
            setLocal('');
            setEmail('');
            notificarExito('Cliente agregado exitosamente');
            onGuardado?.();
        } catch (error) {
            notificarError(error?.response?.data?.message || 'Error al agregar cliente');
        } finally {
            setCargando(false);
        }
    };

    const inputCls =
        "w-full rounded-xl border border-ink bg-canvas px-4 py-3 text-sm text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-brand-500";
    const labelCls = "mb-1 block text-xs font-semibold uppercase tracking-wide text-mute";

    return (
        <div
            className={modalNuevoCliente ? "fixed inset-0 z-40 flex items-center justify-center p-4" : "hidden"}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="absolute inset-0 bg-ink/50"
                onClick={() => setModalNuevoCliente(false)}
            ></div>
            <div className="relative w-full max-w-md rounded-3xl bg-canvas p-6 shadow-sheet">
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-ink">Nuevo cliente</h2>
                    <button
                        onClick={() => setModalNuevoCliente(false)}
                        className="text-mute transition hover:text-ink"
                        aria-label="Cerrar"
                    >
                        <RiCloseCircleLine size="1.5rem" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label htmlFor="nuevo-codigo" className={labelCls}>Código</label>
                        <input
                            id="nuevo-codigo"
                            type="text"
                            value={codigo}
                            onChange={(e) => setCodigo(e.target.value)}
                            className={inputCls}
                        />
                    </div>

                    <div>
                        <label htmlFor="nuevo-razon" className={labelCls}>Razón social</label>
                        <input
                            id="nuevo-razon"
                            type="text"
                            value={razon_social}
                            onChange={(e) => setRazon_social(e.target.value)}
                            required
                            className={inputCls}
                        />
                    </div>

                    <div>
                        <label htmlFor="nuevo-local" className={labelCls}>Local</label>
                        <input
                            id="nuevo-local"
                            type="text"
                            value={local}
                            onChange={(e) => setLocal(e.target.value)}
                            className={inputCls}
                        />
                    </div>

                    <div>
                        <label htmlFor="nuevo-email" className={labelCls}>Email</label>
                        <input
                            id="nuevo-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={inputCls}
                        />
                    </div>

                    <button
                        className="mt-1 w-full rounded-3xl bg-brand-600 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-700 active:scale-[0.99] disabled:opacity-60"
                        type="submit"
                        disabled={cargando}
                    >
                        {cargando ? 'Agregando...' : 'Agregar Cliente'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ModalNuevoCliente;
