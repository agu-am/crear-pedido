import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../helpers/api";
import { formatearMoneda } from "../helpers";
import { statsEjemplo } from "../helpers/statsEjemplo";
import Error from "../components/Error";
import { FaInfoCircle } from "react-icons/fa";
import {
  FaBoxOpen,
  FaClipboardList,
  FaUsers,
  FaTruck,
  FaBoxes,
  FaCheckCircle,
  FaFire,
} from "react-icons/fa";

const Kpi = ({ icono: Icono, label, valor, acento }) => (
  <div className="rounded-3xl bg-canvas p-5 shadow-card">
    <span className={`mb-3 flex h-10 w-10 items-center justify-center rounded-2xl ${acento || "bg-canvas-soft text-ink"}`}>
      <Icono size="1.1rem" />
    </span>
    <p className="text-2xl font-extrabold leading-tight text-ink">{valor}</p>
    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-mute">{label}</p>
  </div>
)

const Fila = ({ etiqueta, valor, destacado }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm text-body">{etiqueta}</span>
    <span className={`text-sm font-bold ${destacado ? "text-ink" : "text-ink"}`}>{valor}</span>
  </div>
)

const usarStatsEjemplo = import.meta.env.VITE_MOCK_STATS === "true";

const Admin = () => {
  const [stats, setStats] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(false)

  const cargar = async () => {
    setCargando(true)
    if (usarStatsEjemplo) {
      setTimeout(() => {
        setStats(statsEjemplo)
        setError(false)
        setCargando(false)
      }, 400)
      return
    }
    try {
      const { data } = await api.get("/stats")
      setStats(data)
      setError(false)
    } catch {
      setError(true)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const accesos = [
    { to: "/productos", icon: FaBoxOpen, iconCls: "bg-positive-pale text-positive-deep", titulo: "Productos", texto: "Gestionar el catálogo" },
    { to: "/ordenes", icon: FaClipboardList, iconCls: "bg-canvas text-ink", titulo: "Órdenes", texto: "Ver los pedidos" },
    { to: "/clientes", icon: FaUsers, iconCls: "bg-canvas text-ink", titulo: "Clientes", texto: "Crear y asignar vendedores" },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-display-xs text-ink">Panel</h1>
          {usarStatsEjemplo && (
            <span className="flex items-center gap-1.5 rounded-full bg-warning px-3 py-1 text-xs font-semibold text-warning-content">
              <FaInfoCircle size="0.75rem" /> Datos de ejemplo
            </span>
          )}
        </div>
        <button
          onClick={cargar}
          className="rounded-full border border-ink px-4 py-2 text-sm font-semibold text-ink transition hover:bg-canvas-soft disabled:opacity-50"
          disabled={cargando}
        >
          {cargando ? "Cargando..." : "Actualizar"}
        </button>
      </div>

      {error && (
        <div className="mb-4">
          <Error mensaje={"No se pudieron cargar las estadísticas"} />
        </div>
      )}

      {cargando && !stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-3xl bg-canvas-soft" />
          ))}
        </div>
      )}

      {stats && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi icono={FaTruck} label="Ventas 7 días" valor={formatearMoneda(stats.ordenes.ultimos7.netSales)} acento="bg-positive-pale text-positive-deep" />
            <Kpi icono={FaClipboardList} label="Órdenes 7 días" valor={stats.ordenes.ultimos7.count} acento="bg-canvas-soft text-ink" />
            <Kpi icono={FaCheckCircle} label="Pedido promedio" valor={formatearMoneda(stats.ordenes.ultimos7.promedio)} acento="bg-canvas-soft text-ink" />
            <Kpi icono={FaBoxes} label="Productos" valor={stats.productos.total} acento="bg-canvas-soft text-ink" />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <section className="rounded-3xl bg-canvas p-6 shadow-card">
              <h2 className="mb-2 text-base font-bold text-ink">Órdenes</h2>
              <div className="divide-y divide-canvas-soft">
                <Fila etiqueta="Órdenes de hoy" valor={stats.ordenes.hoy.count} />
                <Fila etiqueta="Ventas de hoy" valor={formatearMoneda(stats.ordenes.hoy.netSales)} />
                <Fila etiqueta="Órdenes en proceso" valor={stats.ordenes.enProceso} />
                <Fila etiqueta="Órdenes totales" valor={stats.ordenes.total} />
                <Fila etiqueta="Clientes" valor={stats.clientes.total} />
              </div>
            </section>

            <section className="rounded-3xl bg-canvas p-6 shadow-card">
              <h2 className="mb-2 text-base font-bold text-ink">Productos</h2>
              <div className="divide-y divide-canvas-soft">
                <Fila etiqueta="Publicados" valor={stats.productos.publicados} />
                <Fila etiqueta="Borradores" valor={stats.productos.borradores} />
                <Fila etiqueta="Agotados" valor={stats.productos.agotados} />
                <Fila etiqueta="Categorías" valor={stats.productos.categorias} />
                <Fila etiqueta="Total en catálogo" valor={stats.productos.total} />
              </div>
            </section>

            <section className="rounded-3xl bg-canvas p-6 shadow-card">
              <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-ink">
                <FaFire className="text-negative" /> Más vendidos
              </h2>
              {stats.masVendidos.length === 0 ? (
                <p className="text-sm text-mute">Sin datos todavía</p>
              ) : (
                <ol className="divide-y divide-canvas-soft">
                  {stats.masVendidos.map((p, i) => (
                    <li key={p.name} className="flex items-center justify-between gap-3 py-2.5">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-canvas-soft text-xs font-bold text-ink">
                          {i + 1}
                        </span>
                        <p className="truncate text-sm font-medium text-ink">{p.name}</p>
                      </div>
                      <span className="shrink-0 text-sm font-bold text-ink">x{p.cantidad}</span>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {accesos.map((c) => (
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
        </>
      )}
    </div>
  )
}

export default Admin
