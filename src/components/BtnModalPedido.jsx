import usePedido from "../hooks/usePedido"
import { BsFillBasket2Fill } from 'react-icons/bs'


const BtnModalPedido = () => {

    const { setModalPedido, pedido, total } = usePedido()

    if (pedido.productos.length === 0) return null

    const cantidad = pedido.productos.reduce((acc, p) => acc + p.quantity, 0)

    return (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-canvas-soft bg-canvas/95 px-4 py-3 backdrop-blur lg:hidden">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-positive-pale text-ink-deep">
                        <BsFillBasket2Fill size="1.2rem" />
                        <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-600 px-1 text-[11px] font-bold text-white">
                            {cantidad}
                        </span>
                    </span>
                    <div>
                        <p className="text-xs text-mute">Tu pedido</p>
                        <p className="text-base font-extrabold text-ink">${total}</p>
                    </div>
                </div>
                <button
                    onClick={() => setModalPedido(true)}
                    className="rounded-3xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 active:scale-95"
                >
                    Ver pedido
                </button>
            </div>
        </div>
    )
}

export default BtnModalPedido
