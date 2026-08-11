export const estadosOrden = {
  pending: { label: "Pendiente", cls: "bg-warning text-warning-content" },
  processing: { label: "Procesando", cls: "bg-[#e0ecff] text-[#1a4ed8]" },
  "on-hold": { label: "En espera", cls: "bg-canvas-soft text-body" },
  completed: { label: "Completado", cls: "bg-positive-pale text-positive-deep" },
  cancelled: { label: "Cancelado", cls: "bg-negative-bg text-white" },
  refunded: { label: "Devuelto", cls: "bg-canvas-soft text-body" },
  failed: { label: "Falló", cls: "bg-negative-bg text-white" },
}

export const opcionesEstado = Object.entries(estadosOrden).map(([value, e]) => ({
  value,
  label: e.label,
}))
