import usePedido from "../hooks/usePedido"


const ListadoOrdenes = () => {
    const { ordenes } = usePedido()
    return (
        <div className="">
            {ordenes.map(o => (
                <div
                    className="flex flex-col m-3"
                    key={o.id}
                >
                    <div className="p-3 text-white font-bold text-center bg-gradient-to-r from-green-400 via-green-500 to-green-600 rounded-t-xl"
                    >
                        <p>{o.date_created}</p>
                        <p>{o.billing.state}</p>
                    </div>
                    <ul className="p-3 bg-slate-200 rounded-b-xl">
                        {o.line_items.map(i => (
                            <li
                                key={i.id}
                                className="flex gap-10 justify-between border-b-2 m-1 border-slate-300"
                            >
                                <p className="inline-block font-bold">{i.name}</p>
                                <p className="inline-block">x{i.quantity}</p>
                            </li>
                        ))
                        }
                    </ul>
                </div>
            ))}
        </div>
    )
}

export default ListadoOrdenes