const ConfirmarModal = ({
  abierto,
  titulo,
  mensaje,
  confirmarLabel = "Eliminar",
  onConfirmar,
  onCancelar,
  cargando = false,
}) => {
  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-ink/50" onClick={onCancelar}></div>
      <div className="relative w-full max-w-sm rounded-3xl bg-canvas p-6 shadow-sheet">
        <h2 className="text-lg font-bold text-ink">{titulo}</h2>
        <p className="mt-2 text-sm text-body">{mensaje}</p>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancelar}
            className="flex-1 rounded-3xl border border-ink py-3 text-sm font-semibold text-ink transition hover:bg-canvas-soft"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={cargando}
            className="flex-1 rounded-3xl bg-negative-bg py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {cargando ? "Procesando..." : confirmarLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmarModal;
