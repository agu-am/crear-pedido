import usePedido from "../hooks/usePedido"

const Sidebar = () => {

    const { pedido } = usePedido()

    return (
        <div className="hidden  flex-col border rounded-md m-5 xl:flex w-full row-start-1 row-end-3">
            <div className="text-center text-3xl uppercase font-bold bg-slate-400">Pedido</div>
            <div className="flex-row">
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
        </div>
    )
}

export default Sidebar