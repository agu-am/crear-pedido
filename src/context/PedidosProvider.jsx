import React, { useState, useEffect, createContext } from "react";
import axios from "axios";

const PedidosContext = createContext();

const PedidosProvider = ({ children }) => {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [pedido, setPedido] = useState({ id: " ", sku: " ", cliente: " ", productos: [] });
  const [modalPedido, setModalPedido] = useState(false);
  const [textoWA, setTextoWA] = useState("");
  const [clientes, setClientes] = useState([]);
  const [clienteActual, setClienteActual] = useState({});
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [cargandoProductos, setCargandoProductos] = useState(true)
  const [validarCliente, setValidarCliente] = useState(false)
  const [clienteInputSearch, setClienteInputSearch] = useState("")
  const [error, setError] = useState("")
  const productosPorPagina = 15;

  const url = `https://pedidosprueba.agustinjs.com/wp-json/wc/v3/products?_fields=id,name,sku&search=${busqueda}&per_page=${productosPorPagina}&consumer_key=${import.meta.env.VITE_API_KEY}&consumer_secret=${import.meta.env.VITE_API_KEY_SECRET}`;
  const urlClientes = `https://pedidosprueba.agustinjs.com/wp-json/wc/v3/customers?_fields=id,username&search=${busquedaCliente}&consumer_key=${import.meta.env.VITE_API_KEY}&consumer_secret=${import.meta.env.VITE_API_KEY_SECRET}`;

  const obtenerProductos = async () => {
    try {
      const { data } = await axios.get(url);
      const productosFormateados = data.map(p => ({
        id: p.sku,
        sku: p.sku,
        nombre: p.name,
        cantidad: 0,
      }));
      setCargandoProductos(false)
      setProductos(productosFormateados);
    } catch (error) {
      console.error("Error al obtener productos:", error);
    }
  };

  useEffect(() => {
    obtenerProductos();
  }, [busqueda]);

  const handleSetPedido = (producto) => {
    setPedido((prevPedido) => {
      const productoExistente = prevPedido.productos?.find((p) => p.sku === producto.sku);
      if (productoExistente) {
        const actualizarPedido = prevPedido.productos.map((p) =>
          p.sku === producto.sku ? { ...p, cantidad: p.cantidad + 1 } : p
        );
        return { ...prevPedido, productos: actualizarPedido };
      } else {
        const nuevoProducto = { nombre: producto.nombre, sku: producto.sku, cantidad: 1 };
        return { ...prevPedido, productos: [...prevPedido.productos, nuevoProducto] };
      }
    });
  };

  const handleDecrementPedido = (producto) => {
    setPedido((prevPedido) => {
      const actualizarPedido = prevPedido.productos
        .map((p) =>
          p.sku === producto.sku
            ? { ...p, cantidad: p.cantidad - 1 }
            : p
        )
        .filter((p) => p.cantidad > 0);

      return { ...prevPedido, productos: actualizarPedido };
    });
  };

  const enviarPedidoWA = (pedido) => {
    let textoArray = [];
      pedido.productos.forEach((p) => textoArray.push(`*${p.cantidad}x* ${p.nombre}%0A`));
      setTextoWA(textoArray.join(""));
    }

  const obtenerClientes = async () => {
    try {
      const { data } = await axios.get(urlClientes);
      const clientesFormateados = data.map((c) => ({
        id: c.id,
        name: c.username,
      }));
      setClientes(clientesFormateados);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
    }
  };
  const handleEnviarPedido = (e) => {
    if (pedido.cliente === " ") {
        e.preventDefault()
        setError("Falta colocar cliente")
        setValidarCliente(true)
    } else {
        enviarPedidoWA(pedido)
        setValidarCliente(false)
        setPedido((prevPedido) => ({
            ...prevPedido,
            productos: []
        }));
        setModalPedido(false)
        setClienteInputSearch(" ")
    }
}

  useEffect(() => {
    obtenerClientes();
  }, [busquedaCliente]);

  return (
    <PedidosContext.Provider
      value={{
        productos,
        pedido,
        handleSetPedido,
        handleDecrementPedido,
        setBusqueda,
        busqueda,
        modalPedido,
        setModalPedido,
        enviarPedidoWA,
        textoWA,
        clientes,
        busquedaCliente,
        setBusquedaCliente,
        clienteActual,
        setClienteActual,
        setObservaciones,
        observaciones,
        setPedido,
        cargandoProductos,
        validarCliente,
        setValidarCliente,
        clienteInputSearch,
        setClienteInputSearch,
        handleEnviarPedido,
        error,
        setError
      }}
    >
      {children}
    </PedidosContext.Provider>
  );
};

export { PedidosProvider };
export default PedidosContext;
