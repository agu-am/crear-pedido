import { useEffect, useRef, useState } from "react";
import { FaChevronDown, FaSearch } from "react-icons/fa";

const SelectCategoria = ({ categorias, value, onChange }) => {
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState("");
  const ref = useRef(null);

  const seleccionada = categorias.find((c) => String(c.id) === String(value));

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtradas = categorias.filter((c) =>
    c.name.toLowerCase().includes(texto.toLowerCase())
  );

  const elegir = (id) => {
    onChange(id);
    setAbierto(false);
    setTexto("");
  };

  return (
    <div className="relative mb-4" ref={ref}>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl border border-ink bg-canvas px-4 py-3 text-sm font-semibold text-ink transition focus:outline-none focus:ring-2 focus:ring-brand-500"
        aria-haspopup="listbox"
        aria-expanded={abierto}
      >
        <span className="truncate">
          {seleccionada ? seleccionada.name : "Todas las categorías"}
        </span>
        <FaChevronDown
          className={`ml-2 shrink-0 text-mute transition ${abierto ? "rotate-180" : ""}`}
          size="0.8rem"
        />
      </button>

      {abierto && (
        <div className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-2xl border border-canvas-soft bg-canvas shadow-sheet">
          <div className="relative border-b border-canvas-soft">
            <FaSearch
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mute"
              size="0.8rem"
            />
            <input
              type="text"
              autoFocus
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Buscar categoría..."
              className="w-full rounded-none border-0 bg-canvas py-3 pl-9 pr-4 text-sm text-ink placeholder:text-mute focus:outline-none focus:ring-0"
            />
          </div>
          <ul className="max-h-64 overflow-y-auto py-1" role="listbox">
            <li>
              <button
                type="button"
                onClick={() => elegir("")}
                className={`block w-full px-4 py-2.5 text-left text-sm transition hover:bg-canvas-soft ${
                  value === "" ? "font-bold text-positive-deep" : "text-ink"
                }`}
              >
                Todas las categorías
              </button>
            </li>
            {filtradas.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => elegir(String(c.id))}
                  className={`block w-full px-4 py-2.5 text-left text-sm transition hover:bg-canvas-soft ${
                    String(c.id) === String(value)
                      ? "font-bold text-positive-deep"
                      : "text-ink"
                  }`}
                >
                  {c.name}
                </button>
              </li>
            ))}
            {filtradas.length === 0 && (
              <li className="px-4 py-3 text-sm text-mute">Sin resultados</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SelectCategoria;
