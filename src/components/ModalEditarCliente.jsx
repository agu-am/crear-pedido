import { useState } from "react";
import usePedido from "../hooks/usePedido";
import api from "../helpers/api";
import { RiCloseCircleLine } from "react-icons/ri";
import { notificarExito, notificarError } from "../helpers/toast";
import AsyncSelect from "react-select/async";
import { vendedores } from "../helpers/vendedores";

const ModalEditarCliente = ({ modalEditarCliente, setModalEditarCliente }) => {
    const { clientes, setBusquedaCliente } = usePedido();

    const [idsClientes, setIdsClientes] = useState({});
    const [telefono, setTelefono] = useState("");

    const loadOptions = (searchValue, callback) => {
        setBusquedaCliente(searchValue);
        callback(clientes.map(cliente => ({
            value: cliente.id,
            label: cliente.name,
        })));
    };

    const actualizarTelefonoCliente = async (clienteId, telefono) => {
        await api.put(`/clientes/${clienteId}/telefono`, { telefono });
    };

    const actualizarTelefonos = async (nuevoTelefono) => {
        const promesas = idsClientes.map(cliente =>
            actualizarTelefonoCliente(cliente.value, nuevoTelefono)
        );
        try {
            await Promise.all(promesas);
            setModalEditarCliente(false);
            notificarExito('Número de teléfono actualizado con éxito');
        } catch (error) {
            notificarError('Hubo un error al hacer las solicitudes');
        }
    };

    return (
        <div
            className={modalEditarCliente ? "fixed inset-0 z-40 flex items-center justify-center p-4" : "hidden"}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="absolute inset-0 bg-ink/50"
                onClick={() => setModalEditarCliente(false)}
            ></div>
            <div className="relative w-full max-w-md rounded-3xl bg-canvas p-6 shadow-sheet">
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-ink">Editar cliente</h2>
                    <button
                        onClick={() => setModalEditarCliente(false)}
                        className="text-mute transition hover:text-ink"
                        aria-label="Cerrar"
                    >
                        <RiCloseCircleLine size="1.5rem" />
                    </button>
                </div>

                <div className="flex flex-col gap-4">
                    <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-mute">
                            Clientes
                        </label>
                        <AsyncSelect
                            isMulti
                            options={clientes.map(cliente => ({
                                value: cliente.id,
                                label: cliente.name,
                            }))}
                            loadOptions={loadOptions}
                            onChange={(value) => setIdsClientes(value)}
                            classNamePrefix="select"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="vendedor"
                            className="mb-1 block text-xs font-semibold uppercase tracking-wide text-mute"
                        >
                            Vendedor
                        </label>
                        <select
                            id="vendedor"
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value)}
                            className="w-full rounded-xl border border-ink bg-canvas px-4 py-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-500"
                        >
                            <option value="">Seleccionar...</option>
                            {vendedores.map((v) => (
                                <option key={v.value} value={v.value}>{v.label}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={() => { actualizarTelefonos(telefono) }}
                        className="w-full rounded-3xl bg-brand-600 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-700 active:scale-[0.99]"
                    >
                        Guardar cambios
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalEditarCliente;
