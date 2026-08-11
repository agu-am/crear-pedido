import { useState } from "react";
import api from "../helpers/api";
import { RiCloseCircleLine } from "react-icons/ri";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";

const ModalNuevoCliente = ({ modalNuevoCliente, setModalNuevoCliente }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [cargando, setCargando] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setCargando(true);

        try {
            await api.post('/clientes', { username, email });
            setModalNuevoCliente(false);
            setUsername('');
            setEmail('');
            toast.success('Cliente agregado exitosamente', {
                position: 'top-center',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'colored',
            });
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Error al agregar cliente', {
                position: 'top-center',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'colored',
            });
        } finally {
            setCargando(false);
        }
    };

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
                        <label
                            htmlFor="nuevo-username"
                            className="mb-1 block text-xs font-semibold uppercase tracking-wide text-mute"
                        >
                            Username
                        </label>
                        <input
                            id="nuevo-username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full rounded-xl border border-ink bg-canvas px-4 py-3 text-sm text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="nuevo-email"
                            className="mb-1 block text-xs font-semibold uppercase tracking-wide text-mute"
                        >
                            Email
                        </label>
                        <input
                            id="nuevo-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full rounded-xl border border-ink bg-canvas px-4 py-3 text-sm text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-brand-500"
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
