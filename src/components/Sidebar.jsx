import usePedido from "../hooks/usePedido";
import Error from "./Error";
import { BsWhatsapp } from "react-icons/bs";
import { FaTrashAlt, FaMinus, FaPlus } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";

const Sidebar = () => {
  const {
    pedido,
    textoWA,
    observaciones,
    handleEnviarPedido,
    setObservaciones,
    handleDisminuirProducto,
    handleAumentarProducto,
    setPedido,
    validarCliente,
    clientes,
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
    <div className="hidden flex-col xl:flex justify-between py-2 h-screen w-full row-start-1 row-end-3">
      {validarCliente && <Error mensaje={"FALTA COLOCAR CLIENTE"} />}
      <div className="text-center text-3xl uppercase text-white font-bold bg-gradient-to-r from-green-400 via-green-500 to-green-600">
        Pedido
      </div>
      <div className="flex-row overflow-auto h-4/5">
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
            <p className="text-xl text-center font-medium uppercase">
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
                  onChange={(e) => handleCantidadChange(p.sku, e.target.value)}
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
      <div className="mt-2">
        <h2 className="font-bold  text-center uppercase">Observaciones</h2>
        <textarea
          type="text"
          className="w-full border"
          onChange={(e) => setObservaciones(e.target.value)}
        />
      </div>
      <div className="flex items-center justify-center w-full">
        <a
          onClick={(e) => handleEnviarPedido(e)}
          className="flex items-center justify-center w-10/12 uppercase text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-bold rounded-lg text-xl px-5 py-2.5 text-center"
        >
          Enviar pedido{" "}
          <span className="ml-2">
            <BsWhatsapp size="2rem" />
          </span>
        </a>
      </div>
    </div>
  );
};

export default Sidebar;
