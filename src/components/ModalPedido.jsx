import usePedido from "../hooks/usePedido";
import Error from "./Error";
import { BsWhatsapp } from "react-icons/bs";
import { FaTrashAlt, FaMinus, FaPlus } from "react-icons/fa";
import { RiCloseCircleLine } from "react-icons/ri";
import { notificarExito, notificarError } from "../helpers/toast";

const ModalPedido = () => {
  const {
    modalPedido,
    setModalPedido,
    pedido,
    handleDisminuirProducto,
    handleAumentarProducto,
    setObservaciones,
    observaciones,
    setPedido,
    validarCliente,
    handleEnviarPedido,
    total,
  } = usePedido();

  const handleCantidadChange = (sku, newCantidad) => {
    setPedido((prevPedido) => ({
      ...prevPedido,
      productos: prevPedido.productos.map((producto) =>
        producto.sku === sku
          ? { ...producto, quantity: Number(newCantidad) }
          : producto
      ),
    }));
    notificarExito("Producto actualizado correctamente!", { autoClose: 500, toastId: "actualizar" });
  };

  const handleBorrarProducto = (producto) => {
    setPedido((prevPedido) => ({
      ...prevPedido,
      productos: prevPedido.productos.filter((p) => p.sku !== producto.sku),
    }));
    notificarError("Producto eliminado correctamente!", { autoClose: 500, toastId: "actualizar" });
  };

  return (
    <div
      className={modalPedido ? "fixed inset-0 z-40 lg:hidden" : "hidden"}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-pedido-title"
    >
      <div
        className="absolute inset-0 bg-ink/50"
        onClick={() => setModalPedido(false)}
      ></div>

      <div className="absolute inset-x-0 bottom-0 flex max-h-[85vh] animate-slide-up flex-col rounded-t-3xl bg-canvas shadow-sheet">
        <div className="flex justify-center pb-1 pt-3">
          <span className="h-1.5 w-10 rounded-full bg-canvas-soft"></span>
        </div>

        <div className="flex items-center justify-between px-5 pb-2 pt-1">
          <h2 id="modal-pedido-title" className="text-lg font-bold text-ink">
            Tu pedido
          </h2>
          <button
            onClick={() => setModalPedido(false)}
            className="text-mute transition hover:text-ink"
            aria-label="Cerrar"
          >
            <RiCloseCircleLine size="1.6rem" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          {validarCliente && <Error mensaje={"Falta colocar cliente"} />}
          {pedido.productos.length === 0 && (
            <Error mensaje={"No hay productos agregados"} />
          )}

          <ul className="divide-y divide-canvas-soft">
            {pedido.productos.map((p) => (
              <li key={p.sku} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{p.name}</p>
                  <p className="mt-0.5 text-xs text-mute">${p.price} c/u</p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleDisminuirProducto(p, "Producto actualizado correctamente!")
                    }
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
                    onClick={() =>
                      handleAumentarProducto(p, "Producto actualizado correctamente!")
                    }
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

          <div className="py-4">
            <label
              htmlFor="observaciones-mobile"
              className="mb-1 block text-xs font-semibold uppercase tracking-wide text-mute"
            >
              Observaciones
            </label>
            <textarea
              id="observaciones-mobile"
              rows={2}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full resize-none rounded-xl border border-ink bg-canvas p-3 text-sm text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="border-t border-canvas-soft px-5 py-4">
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
    </div>
  );
};

export default ModalPedido;
