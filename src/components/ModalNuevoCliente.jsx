import { useState } from "react";
import usePedido from "../hooks/usePedido";
import Error from "./Error";
import axios from "axios";
import { RiCloseCircleLine } from "react-icons/ri";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import AsyncSelect from 'react-select/async'

const ModalNuevoCliente = ({ modalNuevoCliente, setModalNuevoCliente }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const predefinedPassword = 'Bplmcfc10';
    const token = localStorage.getItem('token');

    const handleSubmit = async (event) => {
        event.preventDefault();

        const data = {
            username: username,
            password: predefinedPassword,
            email: email,
            roles: ['customer']
        };

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        try {
            const response = await axios.post('https://pedidosprueba.agustinjs.com/wp-json/wp/v2/users', data, config);
            console.log('User added successfully', response.data);
            toast.success('Cliente agregado exitosamente');

        } catch (error) {
            console.error('Error adding user', error);
            console.error(error.response.data.message);
        }
    }
    return (
        <div
            className={
                modalNuevoCliente
                    ? `fixed inset-0 z-30 overflow-y-auto flex items-center justify-center`
                    : `hidden`
            }
        >
            <div className="flex items-start justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                    aria-hidden="true"
                ></div>
                <div className="flex flex-col w-10/12 p-8 text-left align-bottom transition-all transform bg-white rounded-lg shadow-2xl lg:p-10 sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
                    <button
                        className="absolute right-1 top-1"
                        onClick={() => setModalNuevoCliente(false)}
                    >
                        <RiCloseCircleLine size={"2rem"} className="text-gray-400" />
                    </button>
                    <div className="flex flex-col gap-5 xl:w-full ">

                        <div className="text-center text-3xl p-3 rounded-lg uppercase text-white font-bold bg-gradient-to-r from-green-400 via-green-500 to-green-600">
                            Añadir Cliente
                        </div>
                        <div className="flex justify-center items-center w-full">
                            <form
                                className="flex flex-col gap-2 items-center justify-center xl: h-2/4"
                                onSubmit={handleSubmit}
                            >
                                <div className="mb-2 self-center bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white rounded pb-1">
                                    <input
                                        className="flex bg-white text-xl text-black rounded border-white pt-2"
                                        type="text"
                                        placeholder="Username"
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="mb-2 self-center bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white rounded pb-1">
                                    <input
                                        className="flex bg-white text-xl text-black rounded border-white pt-2"
                                        type="email"
                                        placeholder="Email"
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <button
                                    className='w-full rounded-md font-bold text-white uppercase p-2 bg-gradient-to-r from-green-400 via-green-500 to-green-600'
                                    type="submit"
                                >
                                    Agregar Cliente
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ModalNuevoCliente