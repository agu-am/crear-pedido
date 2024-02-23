import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ModalEditarCliente from "../components/ModalEditarCliente";
import ModalNuevoCliente from "../components/ModalNuevoCliente";

const Clientes = () => {

    const [modalEditarCliente, setModalEditarCliente] = useState(false);
    const [modalNuevoCliente, setModalNuevoCliente] = useState(false);

    return (
        <div className="flex flex-col gap-5 justify-center items-center w-full h-[calc(100vh-64px)]">
            <button
                className="text-center text-xl p-2 rounded-lg uppercase text-white font-bold bg-gradient-to-r from-green-400 via-green-500 to-green-600"
                onClick={() => setModalNuevoCliente(true)}
            >
                NUEVO CLIENTE
            </button>
            <ModalNuevoCliente modalNuevoCliente={modalNuevoCliente} setModalNuevoCliente={setModalNuevoCliente} />
            <button
                className="text-center text-xl p-2 rounded-lg uppercase text-white font-bold bg-gradient-to-r from-green-400 via-green-500 to-green-600"
                onClick={() => setModalEditarCliente(true)}
            >
                EDITAR CLIENTE
            </button>
            <ModalEditarCliente modalEditarCliente={modalEditarCliente} setModalEditarCliente={setModalEditarCliente} />
        </div>
    );
}

export default Clientes