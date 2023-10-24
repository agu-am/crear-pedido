import usePedido from "../hooks/usePedido"

const Error = () => {
    const { error } = usePedido()
    return (
        <div
            className="border text-center border-red-400 bg-red-100 text-red-700 py-3 mb-2 rounded-md uppercase"
        >
            <p>
                {error}
            </p>
        </div>
    )
}

export default Error