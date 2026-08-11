import { Link } from "react-router-dom"
import { FaClipboardList, FaUsers } from "react-icons/fa"

const Admin = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-display-xs text-ink">Panel</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          to="/ordenes"
          className="group rounded-3xl bg-canvas-soft p-6 transition hover:bg-canvas hover:shadow-card"
        >
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-canvas text-ink shadow-card">
            <FaClipboardList size="1.4rem" />
          </span>
          <span className="block text-base font-bold text-ink">Órdenes</span>
          <span className="mt-1 block text-sm text-mute">Ver los pedidos realizados</span>
        </Link>

        <Link
          to="/clientes"
          className="group rounded-3xl bg-canvas-soft p-6 transition hover:bg-canvas hover:shadow-card"
        >
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-positive-pale text-positive-deep">
            <FaUsers size="1.4rem" />
          </span>
          <span className="block text-base font-bold text-ink">Clientes</span>
          <span className="mt-1 block text-sm text-mute">Crear y asignar vendedores</span>
        </Link>
      </div>
    </div>
  )
}

export default Admin
