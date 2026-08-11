import { useState, useEffect, createContext, useCallback } from "react";
import api from "../helpers/api";
import { notificarExito, notificarError } from "../helpers/toast";
import { ordenesEjemplo } from "../helpers/ordenesEjemplo";

const usarPedidosEjemplo = import.meta.env.VITE_MOCK_ORDENES === "true";

const PedidosContext = createContext();

const PEDIDO_VACIO = {
  product_id: "",
  sku: "",
  cliente: "",
  productos: [],
  total: 0,
};

const PedidosProvider = ({ children }) => {
  const [productos, setProductos] = useState([]);
  const [total, setTotal] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [pedido, setPedido] = useState(PEDIDO_VACIO);
  const [modalPedido, setModalPedido] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [cargandoProductos, setCargandoProductos] = useState(true);
  const [cargandoMasProductos, setCargandoMasProductos] = useState(false);
  const [errorProductos, setErrorProductos] = useState(false);
  const [errorClientes, setErrorClientes] = useState(false);
  const [validarCliente, setValidarCliente] = useState(false);
  const [clienteInputSearch, setClienteInputSearch] = useState("");
  const [ordenes, setOrdenes] = useState([]);
  const [errorOrdenes, setErrorOrdenes] = useState(false);
  const [toggleMenu, setToggleMenu] = useState(false);
  const [paginaProductos, setPaginaProductos] = useState(1);
  const [hayMasProductos, setHayMasProductos] = useState(false);

  const productosPorPagina = 25;

  const obtenerProductos = useCallback(
    async (pagina = 1, acumular = false) => {
      try {
        setErrorProductos(false);
        const { data } = await api.get("/productos", {
          params: {
            search: busqueda,
            page: pagina,
            per_page: productosPorPagina,
          },
        });
        setProductos((prev) =>
          acumular ? [...prev, ...data] : data
        );
        setHayMasProductos(data.length === productosPorPagina);
      } catch (error) {
        setErrorProductos(true);
      } finally {
        setCargandoProductos(false);
        setCargandoMasProductos(false);
      }
    },
    [busqueda]
  );

  useEffect(() => {
    setCargandoProductos(true);
    const timer = setTimeout(() => {
      setPaginaProductos(1);
      obtenerProductos(1, false);
    }, 300);
    return () => clearTimeout(timer);
  }, [busqueda, obtenerProductos]);

  const cargarMasProductos = () => {
    if (cargandoMasProductos) return;
    const siguiente = paginaProductos + 1;
    setPaginaProductos(siguiente);
    setCargandoMasProductos(true);
    obtenerProductos(siguiente, true);
  };

  const obtenerClientes = useCallback(async () => {
    try {
      setErrorClientes(false);
      const { data } = await api.get("/clientes", {
        params: { search: busquedaCliente },
      });
      setClientes(data);
    } catch (error) {
      setErrorClientes(true);
    }
  }, [busquedaCliente]);

  useEffect(() => {
    const timer = setTimeout(() => {
      obtenerClientes();
    }, 300);
    return () => clearTimeout(timer);
  }, [busquedaCliente, obtenerClientes]);

  const obtenerOrdenes = useCallback(async () => {
    if (usarPedidosEjemplo) {
      setOrdenes(ordenesEjemplo);
      setErrorOrdenes(false);
      return;
    }
    try {
      setErrorOrdenes(false);
      const { data } = await api.get("/ordenes");
      setOrdenes(data);
    } catch (error) {
      setErrorOrdenes(true);
    }
  }, []);

  useEffect(() => {
    obtenerOrdenes();
  }, [obtenerOrdenes]);

  const handleAumentarProducto = (producto, mensaje) => {
    setPedido((prevPedido) => {
      const productoExistente = prevPedido.productos.find(
        (p) => p.sku === producto.sku
      );
      if (productoExistente) {
        return {
          ...prevPedido,
          productos: prevPedido.productos.map((p) =>
            p.sku === producto.sku ? { ...p, quantity: p.quantity + 1 } : p
          ),
        };
      }
      return {
        ...prevPedido,
        productos: [
          ...prevPedido.productos,
          {
            product_id: producto.id,
            name: producto.name,
            sku: producto.sku,
            quantity: 1,
            price: producto.price,
            description: producto.description,
          },
        ],
      };
    });
    notificarExito(mensaje, { autoClose: 300, toastId: "actualizar" });
  };

  const handleAgregarAlCarrito = (producto, mensaje) => {
    setPedido((prevPedido) => {
      const productoExistente = prevPedido.productos.find(
        (p) => p.sku === producto.sku
      );
      if (productoExistente) return prevPedido;
      return {
        ...prevPedido,
        productos: [
          ...prevPedido.productos,
          {
            product_id: producto.id,
            name: producto.name,
            sku: producto.sku,
            quantity: 1,
            price: producto.price,
            description: producto.description,
          },
        ],
      };
    });
    setBusqueda("");
    notificarExito(mensaje, { autoClose: 300 });
  };

  const handleDisminuirProducto = (producto, mensaje) => {
    setPedido((prevPedido) => ({
      ...prevPedido,
      productos: prevPedido.productos
        .map((p) =>
          p.sku === producto.sku ? { ...p, quantity: p.quantity - 1 } : p
        )
        .filter((p) => p.quantity > 0),
    }));
    notificarExito(mensaje, { autoClose: 300, toastId: "actualizar" });
  };

  const crearOrden = async () => {
    const cliente = pedido.cliente || {};
    const orderDatos = {
      billing: {
        first_name: cliente.name || "",
        last_name: "",
        address_1: "",
        city: "",
        state: "",
        postcode: "",
        country: "AR",
        email: cliente.email || "",
        phone: cliente.phone || "",
      },
      shipping: {
        first_name: cliente.name || "",
        last_name: "",
        address_1: "",
        city: "",
        state: "",
        postcode: "",
        country: "AR",
      },
      line_items: pedido.productos,
      customer_note: observaciones,
    };
    return api.post("/ordenes", orderDatos);
  };

  const handleEnviarPedido = async (e) => {
    if (e) e.preventDefault();
    const cliente = pedido.cliente || {};

    if (!cliente || (typeof cliente === "string" && cliente.trim() === "")) {
      setValidarCliente(true);
      return;
    }
    if (pedido.productos.length === 0) {
      notificarError("No hay productos en el pedido");
      return;
    }
    setValidarCliente(false);

    try {
      await crearOrden();
    } catch (error) {
      notificarError("No se pudo crear la orden. Revisá la conexión.");
      return;
    }

    const textoParaWA = pedido.productos
      .map((p) => `*${p.quantity}x* ${p.name}%0A`)
      .join("");
    const telefono = cliente.phone || "543413384599";
    const texto = `Pedido de *${cliente.name}*%0A%0A${textoParaWA}%0A*Observaciones:*%0A${observaciones}`;
    window.open(`https://wa.me/${telefono}?text=${texto}`, "_blank");

    setPedido(PEDIDO_VACIO);
    setObservaciones("");
    setModalPedido(false);
    setBusqueda("");
    setClienteInputSearch("");

    notificarExito("Pedido realizado!", { autoClose: 5000 });
  };

  useEffect(() => {
    const total = pedido.productos.reduce(
      (acc, producto) =>
        acc + producto.quantity * parseFloat(producto.price || 0),
      0
    );
    setTotal(total.toFixed(2));
  }, [pedido.productos]);

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
        cargandoMasProductos,
        cargarMasProductos,
        hayMasProductos,
        errorProductos,
        errorClientes,
        errorOrdenes,
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
        total,
      }}
    >
      {children}
    </PedidosContext.Provider>
  );
};

export { PedidosProvider };
export default PedidosContext;
