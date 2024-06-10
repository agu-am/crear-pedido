import { useState } from "react";
import usePedido from "../hooks/usePedido";
import Error from "./Error";
import axios from "axios";
import { RiCloseCircleLine } from "react-icons/ri";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import AsyncSelect from 'react-select/async'
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
    }
    const actualizarTelefonoCliente = async (clienteId, telefono) => {
        try {
            const response = await axios.put(`https://pedidosprueba.agustinjs.com/wp-json/wc/v3/customers/${clienteId}`, {
                billing: {
                    phone: telefono
                }
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.status === 200) {
                setModalEditarCliente(false)
            } else {
                console.log('Hubo un problema al actualizar el número de teléfono');
            }
        } catch (error) {
            console.error('Hubo un error al hacer la solicitud:', error);
        }
    }

    const actualizarTelefonos = async (nuevoTelefono) => {
        const promesas = idsClientes.map(clientes => actualizarTelefonoCliente(clientes.value, nuevoTelefono));
        try {
            await Promise.all(promesas);
            toast.success('Número de teléfono actualizado con éxito');
        } catch (error) {
            console.error('Hubo un error al hacer las solicitudes:', error);
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
                        <select name="" id="vendedor" value={telefono} onChange={(e) => setTelefono(e.target.value)}>
                            <option value="543415617384">Santiago</option>
                            <option value="543416369777">Luis Ramirez</option>
                            <option value="543416520721">JUANJO</option>
                            <option value="543412641951">Javier</option>
                            <option value="543416525090">Emanuel</option>
                            <option value="543413384599">Paul</option>
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
    )
}

export default ModalEditarCliente