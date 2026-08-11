import { useState } from "react";
import usePedido from "../hooks/usePedido";
import api from "../helpers/api";
import { RiCloseCircleLine } from "react-icons/ri";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
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
            toast.success('Número de teléfono actualizado con éxito', {
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
            toast.error('Hubo un error al hacer las solicitudes', {
                position: 'top-center',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'colored',
            });
        }
    };

    return (
        <div
            className={
                modalEditarCliente
                    ? `fixed inset-0 z-30 overflow-y-auto flex items-center justify-center`
                    : `hidden`
            }
        >
            <div className="flex items-start justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                    aria-hidden="true"
                ></div>
                <div className="flex flex-col max-w-xs p-8 text-left align-bottom transition-all transform bg-white rounded-lg shadow-2xl lg:p-10 sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
                    <button
                        className="absolute right-1 top-1"
                        onClick={() => setModalEditarCliente(false)}
                    >
                        <RiCloseCircleLine size={"2rem"} className="text-gray-400" />
                    </button>
                    <div className="flex flex-col gap-5 xl:w-full ">
                        <div className="text-center text-3xl p-3 rounded-lg uppercase text-white font-bold bg-gradient-to-r from-green-400 via-green-500 to-green-600">
                            Editar Cliente
                        </div>
                        <div className="flex-row">
                            <AsyncSelect
                                isMulti
                                options={clientes.map(cliente => ({
                                    value: cliente.id,
                                    label: cliente.name,
                                }))}
                                loadOptions={loadOptions}
                                onChange={(value) => setIdsClientes(value)}
                            />
                        </div>

                        <label htmlFor="vendedor">Vendedor</label>
                        <select id="vendedor" value={telefono} onChange={(e) => setTelefono(e.target.value)}>
                            <option value="">Seleccionar...</option>
                            {vendedores.map((v) => (
                                <option key={v.value} value={v.value}>{v.label}</option>
                            ))}
                        </select>
                        <button
                            className="text-center text-xl p-2 rounded-lg uppercase text-white font-bold bg-gradient-to-r from-green-400 via-green-500 to-green-600"
                            onClick={() => { actualizarTelefonos(telefono) }}
                        >
                            Guardar cambios
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalEditarCliente;
