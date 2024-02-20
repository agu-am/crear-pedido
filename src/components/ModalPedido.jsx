import usePedido from "../hooks/usePedido"
import Error from "./Error";
import { BsWhatsapp } from 'react-icons/bs'
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';

const Modal = () => {

    const {
        modalPedido,
        setModalPedido,
        pedido,
        handleDecrementPedido,
        handleSetPedido,
        textoWA,
        setObservaciones,
        observaciones,
        setPedido,
        validarCliente,
        handleEnviarPedido
    } = usePedido()

    const handleCantidadChange = (sku, newCantidad) => {
        setPedido((prevPedido) => {
            const actualizarPedido = prevPedido.productos.map((producto) => {
                if (producto.sku === sku) {
                    return { ...producto, quantity: Number(newCantidad) };
                }
                return producto;
            });
    
            return {
                ...prevPedido,
                productos: actualizarPedido,
            };
        });
        toast.success('Producto actualizado correctamente!', {
            position: "bottom-center",
            autoClose: 500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
            });
    };

    return (
        <div className={modalPedido ? `fixed inset-0 z-30 overflow-y-auto` : `hidden fixed inset-0 z-10 overflow-y-auto`} aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-start justify-center min- px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" aria-hidden="true"></div>
                <span className="hidden sm:inline-block sm:align-middle sm:" aria-hidden="true">​</span>
                <div className="flex flex-col p-5 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-2xl lg:p-16 sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
                    <button
                        className="self-end"
                        onClick={() => setModalPedido(false)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-x" width="30" height="30" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                            <path d="M18 6l-12 12"></path>
                            <path d="M6 6l12 12"></path>
                        </svg>
                    </button>
                    <div className="flex flex-col xl:w-4/12">
                        {validarCliente && <Error />}
                        <div className="text-center text-3xl uppercase text-white font-bold bg-gradient-to-r from-green-400 via-green-500 to-green-600">Pedido</div>
                        <div className="flex-row">
                            {pedido.productos?.map(p => (
                                <div key={p.sku} className="flex flex-col border">
                                    <p
                                        className="text-xl text-center font-medium uppercase xl:truncate"
                                    >
                                        {p.name}
                                    </p>
                                    <div>
                                        <label htmlFor="quantity" className="sr-only"> Cantidad </label>

                                        <div className="flex justify-center items-center border-gray-200 rounded">
                                            <button
                                                type="button"
                                                className="w-10 h-10 leading-10 text-gray-600 transition hover:opacity-75"
                                                onClick={() => handleDecrementPedido(p)}
                                            >
                                                -
                                            </button>

                                            <input
                                                type="number"
                                                id="quantity"
                                                value={p.quantity === 0 ? '' : p.quantity}
                                                // value={p.quantity}
                                                onChange={(e) => handleCantidadChange(p.sku, e.target.value)}
                                                className="h-10 w-16 border-transparent text-center sm:text-sm"/>

                                            <button
                                                type="button"
                                                className="w-10 h-10 leading-10 text-gray-600 transition hover:opacity-75"
                                                onClick={() => handleSetPedido(p,'Producto actualizado correctamente!')}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                    <div className="mt-2">
                        <h2 className="font-bold uppercase">Observaciones</h2>
                        <textarea
                            type="text"
                            className="w-full border"
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                        />
                    </div>
                    <div className="w-full mx-auto mt-4 overflow-hidden rounded-lg wt-10 sm:flex">
                        <div className="flex justify-center w-full">
                            <a
                                // href={`https://wa.me/543412286236?text=Pedido de *${pedido.cliente.name}*%0A%0A${textoWA}%0A*Observaciones:*%0A${observaciones}&app`}
                                onClick={(e) => handleEnviarPedido(e)}
                                // target="_blank"
                                className="flex items-center justify-center py-2 rounded-md w-10/12 text-xl uppercase font-bold text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 sm:text-2xl"
                            >
                                Enviar pedido <span className="ml-2"><BsWhatsapp size="2rem" /></span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Modal