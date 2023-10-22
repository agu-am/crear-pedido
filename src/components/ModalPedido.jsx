import usePedido from "../hooks/usePedido"

const Modal = () => {

    const {
        modalPedido,
        setModalPedido,
        pedido,
        handleDecrementPedido,
        handleSetPedido,
        enviarPedidoWA,
        textoWA
    } = usePedido()

    return (
        // < !---- -
        //     add this code to this very first div:
        // fixed inset - 0 z - 10
        // -->
        <div class={modalPedido ? `fixed inset-0 z-10 overflow-y-auto` : `hidden fixed inset-0 z-10 overflow-y-auto`} aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div class="flex items-start justify-center min- px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* <!--This is the background that overlays when the modal is active. It  has opacity, and that's why the background looks gray.-->
                <!-----
                add this code to this very first div:
                fixed inset-0
  --> */}
                <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" aria-hidden="true"></div>
                <span class="hidden sm:inline-block sm:align-middle sm:" aria-hidden="true">​</span>
                {/* <!--Modal panel : This is where you put the pop-up's content, the div on top this coment is the wrapper --> */}
                <div class="flex flex-col p-5 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-2xl lg:p-16 sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
                    <button
                        className="self-end"
                        onClick={() => setModalPedido(false)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-x" width="30" height="30" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                            <path d="M18 6l-12 12"></path>
                            <path d="M6 6l12 12"></path>
                        </svg>
                    </button>
                    <div className="flex flex-col border rounded-md xl:w-4/12">
                        <div className="text-center text-3xl uppercase font-bold bg-slate-400">Pedido</div>
                        <div className="flex-row">
                            {pedido.map(p => (
                                <div key={p.sku} className="flex flex-col border">
                                    <p
                                        className="text-xl text-center font-medium uppercase xl:truncate"
                                    >
                                        {p.name}
                                    </p>
                                    <div>
                                        <label for="Quantity" class="sr-only"> Quantity </label>

                                        <div class="flex justify-center items-center border-gray-200 rounded">
                                            <button
                                                type="button"
                                                class="w-10 h-10 leading-10 text-gray-600 transition hover:opacity-75"
                                                onClick={() => handleDecrementPedido(p)}
                                            >
                                                &minus;
                                            </button>

                                            <input
                                                type="number"
                                                id="Quantity"
                                                value={p.quantitie}
                                                class="h-10 w-16 border-transparent text-center [-moz-appearance:_textfield] sm:text-sm [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none"
                                            />

                                            <button
                                                type="button"
                                                class="w-10 h-10 leading-10 text-gray-600 transition hover:opacity-75"
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
                    <div class="w-full mx-auto mt-4 overflow-hidden rounded-lg wt-10 sm:flex">
                        <div class="flex justify-center w-full">
                            <a
                                href={`https://wa.me/?3412286236&text=${textoWA}`}
                                onClick={() => enviarPedidoWA(pedido)}
                                class="flex items-center justify-center py-2 rounded-md w-10/12 text-xl uppercase font-bold text-white bg-green-700 border border-transparent lg:hover:bg-green-800 sm:text-2xl">
                                Realizar pedido
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Modal