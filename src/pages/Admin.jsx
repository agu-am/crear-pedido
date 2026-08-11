import { Link } from "react-router-dom"
import { FaBoxOpen, FaClipboardList, FaUsers } from "react-icons/fa"

const Admin = () => {
  const cards = [
    {
      to: "/productos",
      icon: FaBoxOpen,
      iconCls: "bg-positive-pale text-positive-deep",
      titulo: "Productos",
      texto: "Crear, editar y buscar productos",
    },
    {
      to: "/ordenes",
      icon: FaClipboardList,
      iconCls: "bg-canvas text-ink",
      titulo: "Órdenes",
      texto: "Ver los pedidos realizados",
    },
    {
      to: "/clientes",
      icon: FaUsers,
      iconCls: "bg-canvas text-ink",
      titulo: "Clientes",
      texto: "Crear y asignar vendedores",
    },
  ]

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-display-xs text-ink">Panel</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="group rounded-3xl bg-canvas-soft p-6 transition hover:bg-canvas hover:shadow-card"
          >
            <span className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl shadow-card ${c.iconCls}`}>
              <c.icon size="1.4rem" />
            </span>
            <span className="block text-base font-bold text-ink">{c.titulo}</span>
            <span className="mt-1 block text-sm text-mute">{c.texto}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Admin
