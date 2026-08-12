import { useEffect, useState } from "react";
import { RiCloseCircleLine } from "react-icons/ri";

const inicial = (producto) => ({
  name: producto?.name || "",
  sku: producto?.sku || "",
  regular_price: producto?.regular_price ?? "",
  sale_price: producto?.sale_price ?? "",
  stock_quantity: producto?.stock_quantity ?? "",
  unidad_medida: producto?.unidad_medida || "unidad",
  estado:
    producto?.status === "draft"
      ? "draft"
      : producto?.stock_status === "outofstock"
        ? "outofstock"
        : "publish",
  description: producto?.description || "",
})

const ModalProducto = ({ abierto, producto, onCerrar, onGuardar }) => {
  const [form, setForm] = useState(inicial(null))
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    if (abierto) setForm(inicial(producto))
  }, [abierto, producto])

  if (!abierto) return null

  const set = (clave) => (e) => setForm((prev) => ({ ...prev, [clave]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCargando(true)
    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      regular_price: form.regular_price === "" ? undefined : form.regular_price,
      sale_price: form.sale_price === "" ? undefined : form.sale_price,
      stock_quantity: form.stock_quantity === "" ? undefined : form.stock_quantity,
      unidad_medida: form.unidad_medida.trim() || "unidad",
      status: form.estado === "draft" ? "draft" : "publish",
      stock_status: form.estado === "outofstock" ? "outofstock" : "instock",
      description: form.description.trim(),
    }
    await onGuardar(payload)
    setCargando(false)
  }

  const inputCls =
    "w-full rounded-xl border border-ink bg-canvas px-4 py-3 text-sm text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-brand-500"
  const labelCls = "mb-1 block text-xs font-semibold uppercase tracking-wide text-mute"

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/50" onClick={onCerrar}></div>
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-canvas p-6 shadow-sheet">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">
            {producto ? "Editar producto" : "Nuevo producto"}
          </h2>
          <button onClick={onCerrar} className="text-mute transition hover:text-ink" aria-label="Cerrar">
            <RiCloseCircleLine size="1.5rem" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="p-nombre" className={labelCls}>Nombre</label>
            <input id="p-nombre" type="text" value={form.name} onChange={set("name")} required className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="p-sku" className={labelCls}>SKU</label>
              <input id="p-sku" type="text" value={form.sku} onChange={set("sku")} className={inputCls} />
            </div>
            <div>
              <label htmlFor="p-estado" className={labelCls}>Estado</label>
              <select id="p-estado" value={form.estado} onChange={set("estado")} className={inputCls}>
                <option value="publish">Publicado</option>
                <option value="draft">Borrador</option>
                <option value="outofstock">Agotado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="p-precio" className={labelCls}>Precio</label>
              <input id="p-precio" type="number" step="0.01" min="0" value={form.regular_price} onChange={set("regular_price")} className={inputCls} />
            </div>
            <div>
              <label htmlFor="p-oferta" className={labelCls}>Precio de oferta</label>
              <input id="p-oferta" type="number" step="0.01" min="0" value={form.sale_price} onChange={set("sale_price")} className={inputCls} />
            </div>
          </div>

          <div>
            <label htmlFor="p-unidad" className={labelCls}>Unidad de medida</label>
            <input id="p-unidad" type="text" value={form.unidad_medida} onChange={set("unidad_medida")} className={inputCls} placeholder="unidad" />
          </div>

          <div>
            <label htmlFor="p-stock" className={labelCls}>Stock</label>
            <input id="p-stock" type="number" min="0" value={form.stock_quantity} onChange={set("stock_quantity")} className={inputCls} />
          </div>

          <div>
            <label htmlFor="p-desc" className={labelCls}>Descripción</label>
            <textarea id="p-desc" rows={3} value={form.description} onChange={set("description")} className={`${inputCls} resize-none`} />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="mt-1 w-full rounded-3xl bg-brand-600 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-700 active:scale-[0.99] disabled:opacity-60"
          >
            {cargando ? "Guardando..." : producto ? "Guardar cambios" : "Crear producto"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ModalProducto
