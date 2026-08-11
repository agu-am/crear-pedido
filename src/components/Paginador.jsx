const Paginador = ({ pagina, totalPaginas, onCambiar }) => (
  <div className="flex items-center justify-center gap-3 py-4">
    <button
      type="button"
      disabled={pagina <= 1}
      onClick={() => onCambiar(pagina - 1)}
      className="rounded-full border border-ink px-4 py-2 text-sm font-semibold text-ink transition hover:bg-canvas-soft disabled:opacity-40 disabled:hover:bg-transparent"
    >
      ‹ Anterior
    </button>
    <span className="text-sm text-mute">
      Página {pagina} de {totalPaginas || 1}
    </span>
    <button
      type="button"
      disabled={pagina >= totalPaginas}
      onClick={() => onCambiar(pagina + 1)}
      className="rounded-full border border-ink px-4 py-2 text-sm font-semibold text-ink transition hover:bg-canvas-soft disabled:opacity-40 disabled:hover:bg-transparent"
    >
      Siguiente ›
    </button>
  </div>
)

export default Paginador
