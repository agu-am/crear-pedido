import { FiPlusCircle } from "react-icons/fi";
import { FaCheckCircle } from "react-icons/fa";

import usePedido from "../hooks/usePedido";

const Producto = ({ producto }) => {
  const { handleAgregarAlCarrito, pedido } = usePedido();
  const { id, name, sku, quantity } = producto;

  const productoExistente = pedido.productos?.find((p) => p.product_id === id);

  return (
    <div className={productoExistente ? "flex p-3 h-24 justify-between items-center w-full overflow-hidden rounded-lg bg-gradient-to-r from-green-400 via-green-500 to-green-600 xl:h-28" : "flex p-3 h-24 justify-between items-center w-full overflow-hidden rounded-lg bg-gray-200 xl:h-28"}>
      <div className="flex flex-col h-full justify-between">
        <h3 className="text-sm font-bold text-gray-700">{name}</h3>
        <p className="mt-1 text-lg font-bold text-gray-900">CODIGO: {sku}</p>
      </div>
      <div className="flex flex-col gap-2 w-3/12 items-end">
        <div className=" flex flex-col w-3/12 gap-1 justify-center items-end">
          <button
            type="button"
            disabled={productoExistente}
            className="flex h-8 w-8 items-center justify-center self-center text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br rounded-lg"
            onClick={() =>
              handleAgregarAlCarrito(
                { id, name, sku, quantity },
                "Producto agregado correctamente!"
              )
            }
          >
            {productoExistente ? (
              <FaCheckCircle size={"1.5rem"} />
            ) : (
              <FiPlusCircle size={"1.5rem"} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Producto;
