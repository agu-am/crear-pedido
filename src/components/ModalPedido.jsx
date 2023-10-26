import usePedido from "../hooks/usePedido"
import Error from "./Error";
import { BsWhatsapp } from 'react-icons/bs'

const Modal = () => {

    const {
        modalPedido,
        setModalPedido,
        pedido,
        handleDecrementPedido,
        handleSetPedido,
        enviarPedidoWA,
        textoWA,
        setObservaciones,
        observaciones,
        setPedido,
        validarCliente,
        setError,
        setValidarCliente,
        setClienteInputSearch
    } = usePedido()

    const handleCantidadChange = (sku, newCantidad) => {
        const actualizarPedido = pedido.productos.map((producto) => {
            if (producto.sku === sku) {
                return { ...producto, cantidad: Number(newCantidad) };
            }
            return producto;
        });

        setPedido((prevPedido) => ({
            ...prevPedido,
            productos: actualizarPedido,
        }));
    };

    const handleEnviarPedido = (e) => {
        if (pedido.cliente === " ") {
            e.preventDefault()
            setError("Falta colocar cliente")
            setValidarCliente(true)
        } else {
            enviarPedidoWA(pedido)
            setValidarCliente(false)
            setPedido((prevPedido) => ({
                ...prevPedido,
                productos: []
            }));
            setModalPedido(false)
            setClienteInputSearch(" ")
        }
    }

    return (
        // < !---- -
        //     add this code to this very first div:
        // fixed inset - 0 z - 10
        // -->
        <div className={modalPedido ? `fixed inset-0 z-10 overflow-y-auto` : `hidden fixed inset-0 z-10 overflow-y-auto`} aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-start justify-center min- px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* <!--This is the background that overlays when the modal is active. It  has opacity, and that's why the background looks gray.-->
                <!-----
                add this code to this very first div:
                fixed inset-0
  --> */}
                <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" aria-hidden="true"></div>
                <span className="hidden sm:inline-block sm:align-middle sm:" aria-hidden="true">​</span>
                {/* <!--Modal panel : This is where you put the pop-up's content, the div on top this coment is the wrapper --> */}
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
                        <div className="text-center text-3xl uppercase font-bold bg-slate-400">Pedido</div>
                        <div className="flex-row">
                            {pedido.productos?.map(p => (
                                <div key={p.sku} className="flex flex-col border">
                                    <p
                                        className="text-xl text-center font-medium uppercase xl:truncate"
                                    >
                                        {p.nombre}
                                    </p>
                                    <div>
                                        <label htmlFor="Quantity" className="sr-only"> Quantity </label>

                                        <div className="flex justify-center items-center border-gray-200 rounded">
                                            <button
                                                type="button"
                                                className="w-10 h-10 leading-10 text-gray-600 transition hover:opacity-75"
                                                onClick={() => handleDecrementPedido(p)}
                                            >
                                                &minus;
                                            </button>

                                            <input
                                                type="number"
                                                id="Quantity"
                                                value={p.cantidad}
                                                onChange={(e) => handleCantidadChange(p.sku, e.target.value)}
                                                className="h-10 w-16 border-transparent text-center [-moz-appearance:_textfield] sm:text-sm [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none"
                                            />

                                            <button
                                                type="button"
                                                className="w-10 h-10 leading-10 text-gray-600 transition hover:opacity-75"
                                                onClick={() => handleSetPedido(p)}
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
                            onChange={(e) => setObservaciones(e.target.value)}
                        />
                    </div>
                    <div className="w-full mx-auto mt-4 overflow-hidden rounded-lg wt-10 sm:flex">
                        <div className="flex justify-center w-full">
                            <a
                                href={`https://wa.me/543412286236?text=Pedido de *${pedido.cliente.name}*%0A%0A${textoWA}%0A*Observaciones:*%0A${observaciones}&app`}
                                onClick={(e) => handleEnviarPedido(e)}
                                target="_blank"
                                className="flex items-center justify-center py-2 rounded-md w-10/12 text-xl uppercase font-bold text-white bg-green-700 border border-transparent lg:hover:bg-green-800 sm:text-2xl">
                                Enviar pedido <span className="ml-2"><BsWhatsapp size="2rem"/></span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Modal