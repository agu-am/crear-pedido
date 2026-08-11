import { useState } from "react";
import { FaUserPlus, FaUserEdit } from "react-icons/fa";

import ModalEditarCliente from "../components/ModalEditarCliente";
import ModalNuevoCliente from "../components/ModalNuevoCliente";

const Clientes = () => {

    const [modalEditarCliente, setModalEditarCliente] = useState(false);
    const [modalNuevoCliente, setModalNuevoCliente] = useState(false);

    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            <h1 className="mb-6 text-display-xs text-ink">Clientes</h1>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <button
                    onClick={() => setModalNuevoCliente(true)}
                    className="rounded-3xl bg-canvas-soft p-6 text-left transition hover:bg-canvas hover:shadow-card"
                >
                    <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-positive-pale text-positive-deep">
                        <FaUserPlus size="1.4rem" />
                    </span>
                    <span className="block text-base font-bold text-ink">Nuevo cliente</span>
                    <span className="mt-1 block text-sm text-mute">Crear un cliente nuevo</span>
                </button>

                <button
                    onClick={() => setModalEditarCliente(true)}
                    className="rounded-3xl bg-canvas-soft p-6 text-left transition hover:bg-canvas hover:shadow-card"
                >
                    <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-canvas text-ink shadow-card">
                        <FaUserEdit size="1.4rem" />
                    </span>
                    <span className="block text-base font-bold text-ink">Editar cliente</span>
                    <span className="mt-1 block text-sm text-mute">Asignar vendedor a clientes</span>
                </button>
            </div>

            <ModalNuevoCliente modalNuevoCliente={modalNuevoCliente} setModalNuevoCliente={setModalNuevoCliente} />
            <ModalEditarCliente modalEditarCliente={modalEditarCliente} setModalEditarCliente={setModalEditarCliente} />
        </div>
    );
}

export default Clientes
