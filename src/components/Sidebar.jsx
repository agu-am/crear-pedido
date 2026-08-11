import usePedido from "../hooks/usePedido";
import Error from "./Error";
import { BsWhatsapp } from "react-icons/bs";
import { FaTrashAlt, FaMinus, FaPlus } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";

const Sidebar = () => {
  const {
    pedido,
    observaciones,
    handleEnviarPedido,
    setObservaciones,
    handleDisminuirProducto,
    handleAumentarProducto,
    setPedido,
    validarCliente,
    total,
  } = usePedido();

  const cantidad = pedido.productos.reduce((acc, p) => acc + p.quantity, 0);

  const handleCantidadChange = (sku, newCantidad) => {
    setPedido((prevPedido) => ({
      ...prevPedido,
      productos: prevPedido.productos.map((producto) =>
        producto.sku === sku ? { ...producto, quantity: Number(newCantidad) } : producto
      ),
    }));
    toast.success("Producto actualizado correctamente!", {
      position: "top-center",
      autoClose: 500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
      toastId: "actualizar",
    });
  };

  const handleBorrarProducto = (producto) => {
    setPedido((prevPedido) => ({
      ...prevPedido,
      productos: prevPedido.productos.filter((p) => p.sku !== producto.sku),
    }));
    toast.error("Producto eliminado correctamente!", {
      position: "top-center",
      autoClose: 500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
      toastId: "actualizar",
    });
  };

  return (
    <div className="sticky top-24 flex max-h-[calc(100vh-7rem)] flex-col rounded-3xl bg-canvas p-6 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-ink">Tu pedido</h2>
        <span className="rounded-full bg-positive-pale px-3 py-1 text-xs font-semibold text-positive-deep">
          {cantidad} {cantidad === 1 ? "producto" : "productos"}
        </span>
      </div>

      {validarCliente && <Error mensaje={"Falta colocar cliente"} />}
      {pedido.productos.length === 0 && <Error mensaje={"No hay productos agregados"} />}

      <ul className="flex-1 divide-y divide-canvas-soft overflow-y-auto">
        {pedido.productos.map((p) => (
          <li key={p.sku} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{p.name}</p>
              <p className="mt-0.5 text-xs text-mute">${p.price} c/u</p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => handleDisminuirProducto(p, "Producto actualizado correctamente!")}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-ink text-ink transition hover:bg-canvas-soft"
                aria-label="Disminuir"
              >
                <FaMinus size="0.6rem" />
              </button>
              <input
                type="number"
                value={p.quantity === 0 ? "" : p.quantity}
                onChange={(e) => handleCantidadChange(p.sku, e.target.value)}
                className="h-8 w-10 border-0 text-center text-sm font-bold text-ink focus:outline-none"
                aria-label="Cantidad"
              />
              <button
                type="button"
                onClick={() => handleAumentarProducto(p, "Producto actualizado correctamente!")}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700"
                aria-label="Aumentar"
              >
                <FaPlus size="0.7rem" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleBorrarProducto(p)}
              className="shrink-0 text-negative transition hover:opacity-80"
              aria-label="Eliminar producto"
            >
              <FaTrashAlt size="1rem" />
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-4">
        <label
          htmlFor="observaciones-desktop"
          className="mb-1 block text-xs font-semibold uppercase tracking-wide text-mute"
        >
          Observaciones
        </label>
        <textarea
          id="observaciones-desktop"
          rows={2}
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          className="w-full resize-none rounded-xl border border-ink bg-canvas p-3 text-sm text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <div className="mt-4 border-t border-canvas-soft pt-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm text-mute">Total</p>
          <p className="text-2xl font-extrabold text-ink">${total}</p>
        </div>
        <button
          onClick={(e) => handleEnviarPedido(e)}
          className="flex w-full items-center justify-center gap-2 rounded-3xl bg-brand-600 py-4 text-base font-semibold text-white transition hover:bg-brand-700 active:scale-[0.99]"
        >
          Enviar pedido <BsWhatsapp size="1.3rem" />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
