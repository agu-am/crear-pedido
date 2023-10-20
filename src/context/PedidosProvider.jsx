import { useState, useEffect, createContext } from "react";
import axios from "axios";

const PedidosContext = createContext()

const PedidosProvider = ({ children }) => {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("")
  const [pedido, setPedido] = useState([])
  const productosPorPagina = 100;

  const url = `https://pedidosprueba.agustinjs.com/wp-json/wc/v3/products?_fields=id,name,sku&search=${busqueda}&per_page=${productosPorPagina}&consumer_key=${import.meta.env.VITE_API_KEY}&consumer_secret=${import.meta.env.VITE_API_KEY_SECRET}`;
  console.log(url)
  const obtenerProductos = async (pagina) => {

    try {
      const { data } = await axios(url);
      setProductos(data);

    } catch (error) {
      console.error("Error al obtener productos:", error);
    }
  };

  useEffect(() => {
    obtenerProductos(); // Iniciar la carga de productos al montar el componente
  }, [busqueda]);




  const handleSetPedido = (producto) => {
    setPedido((prevPedido) => {
      const productoExistente = prevPedido.find((p) => p.sku === producto.sku);

      if (productoExistente) {
        // Si el producto ya existe, aumenta la cantidad en 1
        const actualizarPedido = prevPedido.map((p) =>
          p.sku === producto.sku ? { ...p, quantitie: p.quantitie + 1 } : p
        );
        return actualizarPedido;
      } else {
        // Si el producto no existe, agrégalo al carrito con una cantidad inicial de 1
        return [...prevPedido, { name: producto.name, sku: producto.sku, quantitie: 1 }];
      }
    });
  };

  const handleDecrementPedido = (producto) => {
    setPedido((prevPedido) => {
      const actualizarPedido = prevPedido
        .map((p) =>
          p.sku === producto.sku
            ? { ...p, quantitie: p.quantitie - 1 }
            : p
        )
        .filter((p) => p.quantitie > 0);

      return actualizarPedido;
    });
  };

  return (
    <PedidosContext.Provider
      value={{
        productos,
        setProductos,
        pedido,
        handleSetPedido,
        handleDecrementPedido,
        setBusqueda,
        busqueda,
      }}
    >
      {children}
    </PedidosContext.Provider>
  )
}

export {
  PedidosProvider
}

export default PedidosContext