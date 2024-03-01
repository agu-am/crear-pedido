import { FiPlusCircle } from "react-icons/fi";
import { FaCheckCircle } from "react-icons/fa";

import usePedido from "../hooks/usePedido";

const Producto = ({ producto }) => {
  const { handleAgregarAlCarrito, pedido, } = usePedido();
  const { id, name, sku, quantity, price, description } = producto;

  const productoExistente = pedido.productos?.find((p) => p.product_id === id);

  return (
    <div className={`grid grid-cols-[1fr_.2fr_.15fr] grid-rows-2 p-3 h-24 shadow-lg items-center justify-items-center w-full overflow-hidden rounded-lg  xl:h-28 ${productoExistente ? "bg-gradient-to-r from-green-400 via-green-500 to-green-600" : "bg-gray-200"}`}>
      <div className="flex flex-col row-start-1 row-end-3 w-full items-start justify-between h-full">
        <h3 className="text-sm font-bold text-gray-700 xl:text-lg">{name}</h3>
        <p className="mt-1 text-sm font-bold text-gray-900 xl:text-lg">CODIGO: {sku}</p>
      </div>
      <div className="flex flex-col p-2 items-center col-start-2 row-start-2">
        <p className="text-sm font-bold text-gray-900">${price}</p>
        <p className="text-sm font-bold text-gray-900">{description}</p>
      </div>
      <div className="col-start-3 row-start-2 gap-2 w-7">
        <button
          type="button"
          disabled={productoExistente}
          className="flex h-8 w-8 items-center justify-center self-center text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br rounded-lg"
          onClick={() =>
            handleAgregarAlCarrito(
              { id, name, sku, quantity, price, description },
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
  );
};

export default Producto;
