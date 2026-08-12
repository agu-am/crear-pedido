import { FiPlus } from "react-icons/fi";
import { FaMinus, FaPlus } from "react-icons/fa";

import usePedido from "../hooks/usePedido";

const Producto = ({ producto }) => {
  const { handleAgregarAlCarrito, setPedido, pedido } = usePedido();
  const { id, name, sku, price, description } = producto;

  const existente = pedido.productos?.find((p) => p.product_id === id);
  const cantidad = existente?.quantity || 0;

  const aumentar = () => {
    setPedido((prev) => ({
      ...prev,
      productos: prev.productos.map((p) =>
        p.sku === existente.sku ? { ...p, quantity: p.quantity + 1 } : p
      ),
    }));
  };

  const disminuir = () => {
    setPedido((prev) => ({
      ...prev,
      productos: prev.productos
        .map((p) =>
          p.sku === existente.sku ? { ...p, quantity: p.quantity - 1 } : p
        )
        .filter((p) => p.quantity > 0),
    }));
  };

  const handleCantidadChange = (nuevaCantidad) => {
    const n = Math.max(0, Number(nuevaCantidad) || 0);
    setPedido((prev) => ({
      ...prev,
      productos: prev.productos
        .map((p) => (p.sku === existente.sku ? { ...p, quantity: n } : p))
        .filter((p) => p.quantity > 0),
    }));
  };

  return (
    <article
      className={`flex flex-col rounded-3xl bg-canvas p-4 shadow-card transition ${
        existente ? "ring-2 ring-brand-500" : ""
      }`}
    >
      <h3 className="line-clamp-2 text-sm font-bold leading-tight text-ink">{name}</h3>
      <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-mute">Cod. {sku}</p>

      <div className="mt-auto flex items-center justify-between gap-2 pt-3">
        <p className="min-w-0 truncate text-lg font-extrabold text-ink">${price}</p>
        {existente ? (
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={disminuir}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink text-ink transition hover:bg-canvas-soft"
              aria-label={`Disminuir cantidad de ${name}`}
            >
              <FaMinus size="0.6rem" />
            </button>
            <input
              type="number"
              value={cantidad}
              onChange={(e) => handleCantidadChange(e.target.value)}
              className="h-8 w-10 shrink-0 border-0 text-center text-sm font-bold text-ink focus:outline-none"
              aria-label={`Cantidad de ${name}`}
            />
            <button
              type="button"
              onClick={aumentar}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700"
              aria-label={`Aumentar cantidad de ${name}`}
            >
              <FaPlus size="0.7rem" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() =>
              handleAgregarAlCarrito(
                { id, name, sku, quantity: 0, price, description },
                "Producto agregado correctamente!"
              )
            }
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700 active:scale-95"
            aria-label={`Agregar ${name}`}
          >
            <FiPlus size="1.1rem" />
          </button>
        )}
      </div>
    </article>
  );
};

export default Producto;
