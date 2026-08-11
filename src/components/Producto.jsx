import { FiPlus } from "react-icons/fi";
import { FaCheck } from "react-icons/fa";

import usePedido from "../hooks/usePedido";

const Producto = ({ producto }) => {
  const { handleAgregarAlCarrito, pedido } = usePedido();
  const { id, name, sku, price, description } = producto;

  const existente = pedido.productos?.find((p) => p.product_id === id);
  const cantidad = existente?.quantity || 0;

  return (
    <article
      className={`flex flex-col rounded-3xl bg-canvas p-4 shadow-card transition ${
        existente ? "ring-2 ring-brand-500" : ""
      }`}
    >
      <h3 className="line-clamp-2 text-sm font-bold leading-tight text-ink">{name}</h3>
      <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-mute">Cod. {sku}</p>

      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-lg font-extrabold text-ink">${price}</p>
        {existente ? (
          <span className="flex items-center gap-1 rounded-full bg-positive-pale px-3 py-1.5 text-xs font-semibold text-positive-deep">
            <FaCheck size="0.7rem" /> {cantidad}
          </span>
        ) : (
          <button
            type="button"
            onClick={() =>
              handleAgregarAlCarrito(
                { id, name, sku, quantity: 0, price, description },
                "Producto agregado correctamente!"
              )
            }
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700 active:scale-95"
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
