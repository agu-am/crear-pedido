
const Error = ({ mensaje }) => {
    return (
        <div
            className="border text-center border-red-400 bg-red-100 text-red-700 py-3 my-2 rounded-md uppercase"
        >
            <p>
                {mensaje}
            </p>
        </div>
    )
}

export default Error