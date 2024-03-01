import React, { useState, useEffect, createContext } from "react";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";

const PedidosContext = createContext();

const PedidosProvider = ({ children }) => {
  const [productos, setProductos] = useState([]);
  const [total, setTotal] = useState();
  const [busqueda, setBusqueda] = useState("");
  const [pedido, setPedido] = useState({
    product_id: " ",
    sku: " ",
    cliente: " ",
    productos: [],
    total,
  });
  const [modalPedido, setModalPedido] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [cargandoProductos, setCargandoProductos] = useState(true);
  const [validarCliente, setValidarCliente] = useState(false);
  const [clienteInputSearch, setClienteInputSearch] = useState("");
  const [ordenes, setOredenes] = useState([]);
  const [toggleMenu, setToggleMenu] = useState(false);

  const productosPorPagina = 25;

  const url = `https://pedidosprueba.agustinjs.com/wp-json/wc/v3/products?_fields=id,name,sku,price,description&search=${busqueda}&per_page=${productosPorPagina}&consumer_key=${import.meta.env.VITE_API_KEY
    }&consumer_secret=${import.meta.env.VITE_API_KEY_SECRET}`;
  const urlClientes = `https://pedidosprueba.agustinjs.com/wp-json/wc/v3/customers?_fields=id,username,billing&search=${busquedaCliente}&consumer_key=${import.meta.env.VITE_API_KEY
    }&consumer_secret=${import.meta.env.VITE_API_KEY_SECRET}`;
  const urlOrdenes = `https://pedidosprueba.agustinjs.com/wp-json/wc/v3/orders?_fields=id,billing,line_items,date_created,customer_note&per_page=50&consumer_key=${import.meta.env.VITE_API_KEY
    }&consumer_secret=${import.meta.env.VITE_API_KEY_SECRET}`;

  const obtenerProductos = async () => {
    try {
      const { data } = await axios.get(url);
      const productosFormateados = data.map((p) => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        quantity: 0,
        price: p.price,
        description: p.description.replace(/<\/?[^>]+(>|$)/g, ""),
      }));
      setCargandoProductos(false);
      setProductos(productosFormateados);
    } catch (error) {
      console.error("Error al obtener productos:", error);
    }
  };

  useEffect(() => {
    obtenerProductos();
  }, [busqueda]);

  const handleAumentarProducto = (producto, mensaje) => {
    setPedido((prevPedido) => {
      const productoExistente = prevPedido.productos?.find(
        (p) => p.sku === producto.sku
      );
      if (productoExistente) {
        const actualizarPedido = prevPedido.productos.map((p) =>
          p.sku === producto.sku ? { ...p, quantity: p.quantity + 1 } : p
        );
        return { ...prevPedido, productos: actualizarPedido };
      } else {
        const nuevoProducto = {
          product_id: producto.id,
          name: producto.name,
          sku: producto.sku,
          quantity: 1,
          price: producto.price,
          description: producto.description,
        };
        return {
          ...prevPedido,
          productos: [...prevPedido.productos, nuevoProducto],
        };
      }
    });
    toast.success(mensaje, {
      position: "top-center",
      limit: 1,
      autoClose: 300,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
      toastId: 'actualizar',
    });
  };

  const handleAgregarAlCarrito = (producto, mensaje) => {
    setPedido((prevPedido) => {
      const productoExistente = prevPedido.productos?.find(
        (p) => p.sku === producto.sku
      );
      if (!productoExistente) {
        const nuevoProducto = {
          product_id: producto.id,
          name: producto.name,
          sku: producto.sku,
          quantity: 1,
          price: producto.price,
          description: producto.description,
        };
        return {
          ...prevPedido,
          productos: [...prevPedido.productos, nuevoProducto],
        };
      }
      return { ...prevPedido };
    });
    setBusqueda(" ");
    toast.success(mensaje, {
      position: "top-center",
      limit: 1,
      autoClose: 300,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    });
  };


  const handleDisminuirProducto = (producto, mensaje) => {
    setPedido((prevPedido) => {
      const actualizarPedido = prevPedido.productos
        .map((p) =>
          p.sku === producto.sku ? { ...p, quantity: p.quantity - 1 } : p
        )
        .filter((p) => p.quantity > 0);

      return { ...prevPedido, productos: actualizarPedido };
    })
    toast.success(mensaje, {
      position: "top-center",
      limit: 1,
      autoClose: 300,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
      toastId: 'actualizar'
    })
  }

  const obtenerClientes = async () => {
    try {
      const { data } = await axios.get(urlClientes);
      const clientesFormateados = data.map((c) => ({
        id: c.id,
        name: c.username,
        phone: c.billing.phone,
      }));
      setClientes(clientesFormateados);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
    }
  };
  const handleEnviarPedido = (e) => {
    if (!pedido.cliente || (typeof pedido.cliente === 'string' && pedido.cliente.trim() === "")) {
      e.preventDefault();
      setValidarCliente(true);
    } else {
      let textoArray = [];
      pedido.productos.forEach((p) =>
        textoArray.push(`*${p.quantity}x* ${p.name}%0A`)
      );
      const textoParaWA = textoArray.join("");
      crearOrden();
      window.open(
        `https://wa.me/${pedido.cliente.phone ? pedido.cliente.phone : "543413384599"}?text=Pedido de *${pedido.cliente.name}*%0A%0A${textoParaWA}%0A*Observaciones:*%0A${observaciones}&app`,
        e.target.href,
        "_blank"
      );
      setValidarCliente(false);
      pedido.productos = []
      pedido.cliente = "";
      setModalPedido(false);
      setBusqueda(" ")
      setClienteInputSearch(" ");
      setObservaciones(" ");
      toast.success("Pedido realizado!", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        limit: 1,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }
  };

  useEffect(() => {
    obtenerClientes();
  }, [busquedaCliente]);

  const obtenerOrdenes = async () => {
    try {
      const { data } = await axios.get(urlOrdenes);
      setOredenes(data);
    } catch (error) {
      console.error("Error al obtener las ordenes de compra", error);
    }
  };

  useEffect(() => {
    obtenerOrdenes();
  }, []);

  const crearOrden = async () => {
    const apiUrl =
      "https://pedidosprueba.agustinjs.com/wp-json/wc/v3/orders?per_page=50&";

    const orderDatos = {
      payment_method: "bacs", // Método de pago (puede variar)
      payment_method_title: "Transferencia bancaria",
      set_paid: true,
      billing: {
        first_name: pedido.cliente.name,
        last_name: "Apellido del Cliente",
        address_1: "Dirección de Facturación",
        city: "Ciudad",
        state: "Estado",
        postcode: "Código Postal",
        country: "País",
        email: "correo@cliente.com",
        phone: "123456789",
      },
      shipping: {
        first_name: "Nombre de Envío",
        last_name: "Apellido de Envío",
        address_1: "Dirección de Envío",
        city: "Ciudad de Envío",
        state: "Estado de Envío",
        postcode: "Código Postal de Envío",
        country: "País de Envío",
      },
      line_items: pedido.productos,
      customer_note: observaciones,
    };

    await axios
      .post(apiUrl, orderDatos, {
        auth: {
          username: import.meta.env.VITE_API_KEY,
          password: import.meta.env.VITE_API_KEY_SECRET,
        },
      })
      .then((response) => {
        console.log("Orden creada con éxito:", response.data);
      })
      .catch((error) => {
        console.error("Error al crear la orden:", error);
      });
  };

  const obtenerTotal = () => {
    const total = pedido.productos.reduce((total, producto) => total + producto.quantity * parseFloat(producto.price), 0);
    return total.toFixed(2);
  };

  useEffect(() => {
    setTotal(obtenerTotal());
  }, [pedido]);

  return (
    <PedidosContext.Provider
      value={{
        productos,
        pedido,
        handleAumentarProducto,
        handleDisminuirProducto,
        setBusqueda,
        busqueda,
        modalPedido,
        setModalPedido,
        clientes,
        busquedaCliente,
        setBusquedaCliente,
        setObservaciones,
        observaciones,
        setPedido,
        cargandoProductos,
        validarCliente,
        setValidarCliente,
        clienteInputSearch,
        setClienteInputSearch,
        handleEnviarPedido,
        ordenes,
        crearOrden,
        toggleMenu,
        setToggleMenu,
        handleAgregarAlCarrito,
        total
      }}
    >
      {children}
    </PedidosContext.Provider>
  );
};

export { PedidosProvider };
export default PedidosContext;
