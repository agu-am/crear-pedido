import { useCallback, useEffect, useState } from "react";
import api from "../helpers/api";
import { notificarExito, notificarError } from "../helpers/toast";
import Error from "../components/Error";
import Paginador from "../components/Paginador";
import ModalNuevoCliente from "../components/ModalNuevoCliente";
import ModalEditarCliente from "../components/ModalEditarCliente";
import ConfirmarModal from "../components/ConfirmarModal";
import { FaUserPlus, FaEdit, FaSearch, FaTrashAlt } from "react-icons/fa";

const TAMANIO_PAGINA = 25;

const Clientes = () => {
    const [items, setItems] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [pagina, setPagina] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(false);
    const [modalNuevo, setModalNuevo] = useState(false);
    const [editando, setEditando] = useState(null);
    const [eliminando, setEliminando] = useState(null);
    const [cargandoEliminar, setCargandoEliminar] = useState(false);

    const obtener = useCallback(async (search, page) => {
        try {
            setError(false);
            const { data } = await api.get("/clientes", {
                params: { search, page, per_page: TAMANIO_PAGINA },
            });
            setItems(data.items);
            setTotalPaginas(data.totalPages || 1);
        } catch {
            setError(true);
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        setCargando(true);
        const timer = setTimeout(() => {
            setPagina(1);
            obtener(busqueda, 1);
        }, 300);
        return () => clearTimeout(timer);
    }, [busqueda, obtener]);

    const cambiarPagina = (p) => {
        if (p < 1 || p > totalPaginas) return;
        setPagina(p);
        obtener(busqueda, p);
    };

    const handleGuardadoCliente = async () => {
        setEditando(null);
        await obtener(busqueda, pagina);
    };

    const confirmarEliminar = async () => {
        setCargandoEliminar(true);
        try {
            await api.delete(`/clientes/${eliminando.id}`);
            setEliminando(null);
            notificarExito("Cliente eliminado");
            await obtener(busqueda, pagina);
        } catch (e) {
            notificarError(e?.response?.data?.message || "No se pudo eliminar el cliente");
        } finally {
            setCargandoEliminar(false);
        }
    };

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-display-xs text-ink">Clientes</h1>
                <button
                    onClick={() => setModalNuevo(true)}
                    className="flex items-center justify-center gap-2 rounded-3xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
                >
                    <FaUserPlus size="0.8rem" /> Nuevo cliente
                </button>
            </div>

            <div className="relative mb-4 max-w-md">
                <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mute" size="0.9rem" />
                <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar cliente..."
                    className="w-full rounded-xl border border-ink bg-canvas py-3 pl-11 pr-4 text-sm text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
            </div>

            {error && <Error mensaje={"No se pudieron cargar los clientes"} />}

            <div className="overflow-hidden rounded-3xl bg-canvas shadow-card">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] border-collapse text-left">
                        <thead>
                            <tr className="border-b border-canvas-soft bg-canvas-soft/50">
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-mute">Nombre</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-mute">Email</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-mute">Vendedor</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-mute">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cargando ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-10 text-center text-sm text-mute">Cargando...</td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-10 text-center text-sm text-mute">Sin resultados</td>
                                </tr>
                            ) : (
                                items.map((c) => (
                                    <tr key={c.id} className="border-b border-canvas-soft transition last:border-0 hover:bg-canvas-soft/40">
                                        <td className="px-4 py-3 text-sm font-medium text-ink">{c.name}</td>
                                        <td className="px-4 py-3 text-sm text-body">{c.email}</td>
                                        <td className="px-4 py-3 text-sm text-body">{c.phone}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setEditando(c)}
                                                    className="flex items-center gap-1.5 rounded-full border border-ink px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-canvas-soft"
                                                >
                                                    <FaEdit size="0.7rem" /> Editar
                                                </button>
                                                <button
                                                    onClick={() => setEliminando(c)}
                                                    className="flex items-center gap-1.5 rounded-full bg-negative-bg px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                                                >
                                                    <FaTrashAlt size="0.7rem" /> Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Paginador pagina={pagina} totalPaginas={totalPaginas} onCambiar={cambiarPagina} />

            <ModalNuevoCliente modalNuevoCliente={modalNuevo} setModalNuevoCliente={setModalNuevo} />
            <ModalEditarCliente cliente={editando} setCliente={setEditando} onGuardado={handleGuardadoCliente} />

            <ConfirmarModal
                abierto={!!eliminando}
                titulo="Eliminar cliente"
                mensaje={`¿Eliminar "${eliminando?.name}"? Esta acción no se puede deshacer.`}
                onConfirmar={confirmarEliminar}
                onCancelar={() => setEliminando(null)}
                cargando={cargandoEliminar}
            />
        </div>
    );
}

export default Clientes
