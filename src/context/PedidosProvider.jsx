import React, { useState, useEffect, createContext } from "react";
import axios from "axios";
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';

const PedidosContext = createContext();

const PedidosProvider = ({ children }) => {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [pedido, setPedido] = useState({ product_id: " ", sku: " ", cliente: " ", productos: [] });
  const [modalPedido, setModalPedido] = useState(false);
  const [textoWA, setTextoWA] = useState("");
  const [clientes, setClientes] = useState([]);
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [cargandoProductos, setCargandoProductos] = useState(true)
  const [validarCliente, setValidarCliente] = useState(false)
  const [clienteInputSearch, setClienteInputSearch] = useState("")
  const [error, setError] = useState("")
  const [ordenes, setOredenes] = useState([])
  const [toggleMenu, setToggleMenu] = useState(false)
  const productosPorPagina = 15;

  const url = `https://pedidosprueba.agustinjs.com/wp-json/wc/v3/products?_fields=id,name,sku&search=${busqueda}&per_page=${productosPorPagina}&consumer_key=${import.meta.env.VITE_API_KEY}&consumer_secret=${import.meta.env.VITE_API_KEY_SECRET}`;
  const urlClientes = `https://pedidosprueba.agustinjs.com/wp-json/wc/v3/customers?_fields=id,username&search=${busquedaCliente}&consumer_key=${import.meta.env.VITE_API_KEY}&consumer_secret=${import.meta.env.VITE_API_KEY_SECRET}`;
  const urlOrdenes = `https://pedidosprueba.agustinjs.com/wp-json/wc/v3/orders?_fields=id,billing,line_items,date_created,customer_note&per_page=50&consumer_key=${import.meta.env.VITE_API_KEY}&consumer_secret=${import.meta.env.VITE_API_KEY_SECRET}`;

  const obtenerProductos = async () => {
    try {
      const { data } = await axios.get(url);
      const productosFormateados = data.map(p => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        quantity: 0,
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
          p.sku === producto.sku ? { ...p, quantity: p.quantity + 1 } : p
        );
        return { ...prevPedido, productos: actualizarPedido };
      } else {
        const nuevoProducto = { product_id: producto.id, name: producto.name, sku: producto.sku, quantity: 1 };
        return { ...prevPedido, productos: [...prevPedido.productos, nuevoProducto] };
      }
    });
  };

  const handleDecrementPedido = (producto) => {
    setPedido((prevPedido) => {
      const actualizarPedido = prevPedido.productos
        .map((p) =>
          p.sku === producto.sku
            ? { ...p, quantity: p.quantity - 1 }
            : p
        )
        .filter((p) => p.quantity > 0);

      return { ...prevPedido, productos: actualizarPedido };
    });
  };

  const enviarPedidoWA = (pedido) => {
    let textoArray = [];
    pedido.productos.forEach((p) => textoArray.push(`*${p.quantity}x* ${p.name}%0A`));
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
      crearOrden()
      enviarPedidoWA(pedido)
      setValidarCliente(false)
      setPedido((prevPedido) => ({
        ...prevPedido,
        productos: []
      }));
      setModalPedido(false)
      setClienteInputSearch(" ")
      setObservaciones(" ")
      toast.success('Pedido realizado!', {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        });

    }
  }

  useEffect(() => {
    obtenerClientes();
  }, [busquedaCliente]);

  const obtenerOrdenes = async () => {
    try {
      const { data } = await axios.get(urlOrdenes)
      setOredenes(data)

    } catch (error) {
      console.error("Error al obtener las ordenes de compra", error)
    }
  }

  useEffect(() => {
    obtenerOrdenes()
  }, [])

  const crearOrden = async () => {
    const apiUrl = "https://pedidosprueba.agustinjs.com/wp-json/wc/v3/orders?per_page=50&";

    const orderDatos = {
      payment_method: 'bacs', // Método de pago (puede variar)
      payment_method_title: 'Transferencia bancaria',
      set_paid: true,
      billing: {
        first_name: pedido.cliente.name,
        last_name: 'Apellido del Cliente',
        address_1: 'Dirección de Facturación',
        city: 'Ciudad',
        state: 'Estado',
        postcode: 'Código Postal',
        country: 'País',
        email: 'correo@cliente.com',
        phone: '123456789'
      },
      shipping: {
        first_name: 'Nombre de Envío',
        last_name: 'Apellido de Envío',
        address_1: 'Dirección de Envío',
        city: 'Ciudad de Envío',
        state: 'Estado de Envío',
        postcode: 'Código Postal de Envío',
        country: 'País de Envío'
      },
      line_items: pedido.productos,
      customer_note: observaciones,
    };

    await axios.post(apiUrl, orderDatos, {
      auth: {
        username: import.meta.env.VITE_API_KEY,
        password: import.meta.env.VITE_API_KEY_SECRET
      }
    })
      .then(response => {
        console.log('Orden creada con éxito:', response.data);
      })
      .catch(error => {
        console.error('Error al crear la orden:', error);
      });
  }

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
