import usePedido from "../hooks/usePedido"
import { BsWhatsapp } from 'react-icons/bs'

const Sidebar = () => {

    const { pedido, textoWA, observaciones, handleEnviarPedido } = usePedido()

    return (
        <div className="flex-col h-screen justify-between border rounded-md p-5 xl:flex w-full row-start-1 row-end-3">
            <div className="text-center text-3xl uppercase font-bold bg-slate-400">Pedido</div>
            <div className="h-full overflow-y-scroll m-2 justify-self-start">
                {pedido.productos?.map(p => (
                    <div key={p.sku} className="flex flex-col border-b">
                        <p
                            className="text-xl text-center font-medium uppercase xl:truncate"
                        >
                            {p.nombre}
                        </p>
                        <p
                            className="text-2xl font-bold text-center"
                        >
                            - x {p.cantidad}
                        </p>
                    </div>
                ))}
            </div>
            <div className="flex justify-center w-full">
                <a
                    href={`https://wa.me/543412286236?text=Pedido de *${pedido.cliente.name}*%0A%0A${textoWA}%0A*Observaciones:*%0A${observaciones}&app`}
                    onClick={(e) => handleEnviarPedido(e)}
                    target="_blank"
                    className="flex items-center justify-center w-10/12 uppercase text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-bold rounded-lg text-xl px-5 py-2.5 text-center mr-2 mb-2"
                >
                    Enviar pedido <span className="ml-2"><BsWhatsapp size="2rem" /></span>
                </a>
            </div>
        </div>
    )
}

export default Sidebar