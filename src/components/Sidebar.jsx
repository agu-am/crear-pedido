import usePedido from "../hooks/usePedido"
import { BsWhatsapp } from 'react-icons/bs'

const Sidebar = () => {

    const { pedido, textoWA, observaciones, handleEnviarPedido, setObservaciones } = usePedido()

    return (
        <div className="hidden flex-col h-[calc(100vh-64px)] justify-between p-5 xl:flex w-full row-start-1 row-end-3">
            <div className="text-center text-3xl uppercase text-white font-bold bg-gradient-to-r from-green-400 via-green-500 to-green-600">Pedido</div>
            <div className="h-4/5 overflow-y-scroll m-2 justify-self-start">
                {pedido.productos?.map(p => (
                    <div key={p.sku} className="flex flex-col border-b">
                        <p
                            className="text-xl text-center font-medium uppercase xl:truncate"
                        >
                            {p.name}
                        </p>
                        <p
                            className="text-2xl font-bold text-center"
                        >
                            - x {p.quantity}
                        </p>
                    </div>
                ))}
            </div>
            <div className="mt-2">
                <h2 className="font-bold  text-center uppercase">Observaciones</h2>
                <textarea
                    type="text"
                    className="w-full border"
                    onChange={(e) => setObservaciones(e.target.value)}
                />
            </div>
            <div className="flex items-center justify-center w-full">
                <a
                    href={`https://wa.me/543412286236?text=Pedido de *${pedido.cliente.name}*%0A%0A${textoWA}%0A*Observaciones:*%0A${observaciones}&app`}
                    onClick={(e) => handleEnviarPedido(e)}
                    target="_blank"
                    className="flex items-center justify-center w-10/12 uppercase text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-bold rounded-lg text-xl px-5 py-2.5 text-center"
                >
                    Enviar pedido <span className="ml-2"><BsWhatsapp size="2rem" /></span>
                </a>
            </div>
        </div>
    )
}

export default Sidebar