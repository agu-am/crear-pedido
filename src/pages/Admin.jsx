import { Link } from "react-router-dom"

const Admin = () => {
  return (
    <div className="flex flex-col gap-5">
      <Link
        className="text-center text-xl p-2 rounded-lg uppercase text-white font-bold bg-gradient-to-r from-green-400 via-green-500 to-green-600"
        to="/ordenes"
      >
        Ordenes
      </Link>
      <Link
        className="text-center text-xl p-2 rounded-lg uppercase text-white font-bold bg-gradient-to-r from-green-400 via-green-500 to-green-600"
        to="/clientes"
      >
        Clientes
      </Link>
    </div>
  )
}

export default Admin