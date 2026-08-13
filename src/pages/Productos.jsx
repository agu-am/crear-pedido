import { useCallback, useEffect, useState } from "react";
import api from "../helpers/api";
import { notificarExito, notificarError } from "../helpers/toast";
import Error from "../components/Error";
import ModalProducto from "../components/ModalProducto";
import ModalCargaMasiva from "../components/ModalCargaMasiva";
import Paginador from "../components/Paginador";
import { FaPlus, FaSearch, FaEdit, FaUpload, FaTrashAlt } from "react-icons/fa";

const TAMANIO_PAGINA = 50;

const badgeEstado = (p) => {
  if (p.status === "draft") return { label: "Borrador", cls: "bg-canvas-soft text-body" };
  if (p.stock_status === "outofstock") return { label: "Agotado", cls: "bg-negative-bg text-white" };
  return { label: "Publicado", cls: "bg-positive-pale text-positive-deep" };
};

const Productos = () => {
  const [items, setItems] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [modalCarga, setModalCarga] = useState(false);
  const [orden, setOrden] = useState({ clave: "name", dir: "asc" });

  const obtener = useCallback(async (search, page) => {
    try {
      setError(false);
      const { data } = await api.get("/productos", {
        params: { search, page, per_page: TAMANIO_PAGINA },
      });
      setItems(data.items);
      setTotalPaginas(data.totalPages || 1);
    } catch {
      setError(true);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    setCargando(true);
    const timer = setTimeout(() => {
      setPagina(1);
      obtener(busqueda, 1);
    }, 300);
    return () => clearTimeout(timer);
  }, [busqueda, obtener]);

  const cambiarPagina = (p) => {
    if (p < 1 || p > totalPaginas) return;
    setPagina(p);
    obtener(busqueda, p);
  };

  const cambiarOrden = (clave) => {
    setOrden((prev) => ({
      clave,
      dir: prev.clave === clave && prev.dir === "asc" ? "desc" : "asc",
    }));
  };

  const itemsOrdenados = [...items].sort((a, b) => {
    const va = a[orden.clave];
    const vb = b[orden.clave];
    const cmp =
      typeof va === "number" && typeof vb === "number"
        ? va - vb
        : String(va || "").localeCompare(String(vb || ""), "es");
    return orden.dir === "asc" ? cmp : -cmp;
  });

  const abrirNuevo = () => {
    setEditando(null);
    setModalAbierto(true);
  };

  const abrirEditar = (producto) => {
    setEditando(producto);
    setModalAbierto(true);
  };

  const guardar = async (datos) => {
    try {
      if (editando) {
        await api.put(`/productos/${editando.id}`, datos);
        notificarExito("Producto actualizado");
      } else {
        await api.post("/productos", datos);
        notificarExito("Producto creado");
      }
      setModalAbierto(false);
      setEditando(null);
      await obtener(busqueda, pagina);
    } catch (e) {
      notificarError(
        e?.response?.data?.message || "No se pudo guardar el producto"
      );
    }
  };

  const eliminarProducto = async (producto) => {
    if (!window.confirm(`¿Eliminar "${producto.name}"? Esta acción no se puede deshacer.`)) return
    try {
      await api.delete(`/productos/${producto.id}`)
      notificarExito("Producto eliminado")
      await obtener(busqueda, pagina)
    } catch (e) {
      notificarError(e?.response?.data?.message || "No se pudo eliminar el producto")
    }
  };

  const thCls = (clave) =>
    `cursor-pointer select-none px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-mute transition hover:text-ink ${
      orden.clave === clave ? "text-ink" : ""
    }`

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-display-xs text-ink">Productos</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalCarga(true)}
            className="flex items-center justify-center gap-2 rounded-3xl border border-ink px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-canvas-soft"
          >
            <FaUpload size="0.8rem" /> Cargar productos
          </button>
          <button
            onClick={abrirNuevo}
            className="flex items-center justify-center gap-2 rounded-3xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            <FaPlus size="0.8rem" /> Nuevo producto
          </button>
        </div>
      </div>

      <div className="relative mb-4 max-w-md">
        <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mute" size="0.9rem" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar producto..."
          className="w-full rounded-xl border border-ink bg-canvas py-3 pl-11 pr-4 text-sm text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {error && <Error mensaje={"No se pudieron cargar los productos"} />}

      <div className="overflow-hidden rounded-3xl bg-canvas shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead>
              <tr className="border-b border-canvas-soft bg-canvas-soft/50">
                <th className={thCls("name")} onClick={() => cambiarOrden("name")}>Nombre</th>
                <th className={thCls("sku")} onClick={() => cambiarOrden("sku")}>SKU</th>
                <th className={thCls("regular_price")} onClick={() => cambiarOrden("regular_price")}>Precio</th>
                <th className={thCls("sale_price")} onClick={() => cambiarOrden("sale_price")}>Oferta</th>
                <th className={thCls("stock_quantity")} onClick={() => cambiarOrden("stock_quantity")}>Stock</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-mute">Unidad</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-mute">Estado</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-mute">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-mute">Cargando...</td>
                </tr>
              ) : itemsOrdenados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-mute">Sin resultados</td>
                </tr>
              ) : (
                itemsOrdenados.map((p) => {
                  const badge = badgeEstado(p)
                  return (
                    <tr key={p.id} className="border-b border-canvas-soft transition last:border-0 hover:bg-canvas-soft/40">
                      <td className="max-w-[280px] truncate px-4 py-3 text-sm font-medium text-ink">{p.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-mute">{p.sku || "—"}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-ink">
                        {p.regular_price !== undefined && p.regular_price !== "" ? `$${p.regular_price}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-body">
                        {p.sale_price !== undefined && p.sale_price !== "" ? `$${p.sale_price}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-body">
                        {p.stock_quantity !== undefined && p.stock_quantity !== null && p.stock_quantity !== "" ? p.stock_quantity : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-body">{p.unidad_medida || "unidad"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${badge.cls}`}>{badge.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => abrirEditar(p)}
                            className="flex items-center gap-1.5 rounded-full border border-ink px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-canvas-soft"
                          >
                            <FaEdit size="0.7rem" /> Editar
                          </button>
                          <button
                            onClick={() => eliminarProducto(p)}
                            className="flex items-center gap-1.5 rounded-full bg-negative-bg px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                          >
                            <FaTrashAlt size="0.7rem" /> Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Paginador pagina={pagina} totalPaginas={totalPaginas} onCambiar={cambiarPagina} />

      <ModalProducto
        abierto={modalAbierto}
        producto={editando}
        onCerrar={() => setModalAbierto(false)}
        onGuardar={guardar}
      />

      <ModalCargaMasiva
        abierto={modalCarga}
        onCerrar={() => setModalCarga(false)}
        onAplicado={() => obtener(busqueda, pagina)}
      />
    </div>
  )
}

export default Productos
