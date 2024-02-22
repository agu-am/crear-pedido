import usePedido from "../hooks/usePedido";
import Error from "./Error";
import { BsWhatsapp } from "react-icons/bs";
import { FaTrashAlt, FaMinus, FaPlus } from "react-icons/fa";
import { RiCloseCircleLine } from "react-icons/ri";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";

const Modal = () => {
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
  } = usePedido();

  const handleCantidadChange = (sku, newCantidad) => {
    setPedido((prevPedido) => {
      const actualizarPedido = prevPedido.productos.map((producto) => {
        if (producto.sku === sku) {
          return { ...producto, quantity: Number(newCantidad) };
        }
        return producto;
      });

      return {
        ...prevPedido,
        productos: actualizarPedido,
      };
    });
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
    setPedido((prevPedido) => {
      const nuevoPedido = prevPedido.productos.filter(
        (p) => p.sku !== producto.sku
      );
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

      return { ...prevPedido, productos: nuevoPedido };
    });
  };
  return (
    <div
      className={
        modalPedido
          ? `fixed inset-0 z-30 overflow-y-auto`
          : `hidden fixed inset-0 z-10 overflow-y-auto`
      }
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-start justify-center min- px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          aria-hidden="true"
        ></div>
        <span
          className="hidden sm:inline-block sm:align-middle sm:"
          aria-hidden="true"
        >
          ​
        </span>
        <div className="flex flex-col w-11/12 p-5 pt-10 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-2xl lg:p-16 sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
          <button
            className="absolute right-1 top-1"
            onClick={() => setModalPedido(false)}
          >
            <RiCloseCircleLine size={"2rem"} className="text-red-600" />
          </button>
          <div className="flex flex-col xl:w-4/12">
            {validarCliente && <Error mensaje={"FALTA COLOCAR CLIENTE"} />}

            <div className="text-center text-3xl uppercase text-white font-bold bg-gradient-to-r from-green-400 via-green-500 to-green-600">
              Pedido
            </div>

            {pedido.productos.length === 0 && (
              <Error mensaje={"No hay productos agregados"} />
            )}

            <div className="flex-row">
              {pedido.productos?.map((p) => (
                <div
                  key={p.sku}
                  className="grid grid-cols-[1fr_30px] justify-items-center border"
                >
                  <button
                    className="col-start-2 row-start-1 row-span-2 text-red-600"
                    onClick={() => handleBorrarProducto(p)}
                  >
                    <FaTrashAlt size="1.5rem" />
                  </button>
                  <p className="text-xl text-center font-medium uppercase xl:truncate">
                    {p.name}
                  </p>
                  <div>
                    <label htmlFor="quantity" className="sr-only">
                      {" "}
                      Cantidad{" "}
                    </label>

                    <div className="flex justify-center items-center border-gray-200 rounded">
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center self-center text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br rounded-lg"
                        onClick={() =>
                          handleDisminuirProducto(
                            p,
                            "Producto actualizado correctamente!"
                          )
                        }
                      >
                        <FaMinus size={".9rem"} />
                      </button>

                      <input
                        type="number"
                        id="quantity"
                        value={p.quantity === 0 ? "" : p.quantity}
                        onChange={(e) =>
                          handleCantidadChange(p.sku, e.target.value)
                        }
                        className="h-10 w-16 border-transparent text-center sm:text-sm"
                      />

                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center self-center text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br rounded-lg"
                        onClick={() =>
                          handleAumentarProducto(
                            p,
                            "Producto actualizado correctamente!"
                          )
                        }
                      >
                        <FaPlus size={".9rem"} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2">
            <h2 className="font-bold uppercase">Observaciones</h2>
            <textarea
              type="text"
              className="w-full border"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />
          </div>
          <div className="w-full mx-auto mt-4 overflow-hidden rounded-lg wt-10 sm:flex">
            <div className="flex justify-center w-full">
              <a
                onClick={(e) => handleEnviarPedido(e)}
                className="flex items-center justify-center py-2 rounded-md w-10/12 text-xl uppercase font-bold text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 sm:text-2xl"
              >
                Enviar pedido{" "}
                <span className="ml-2">
                  <BsWhatsapp size="2rem" />
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
