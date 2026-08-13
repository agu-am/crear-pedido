import { Router } from "express";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import { emitirToken, authRequerido } from "./lib/auth.js";
import { wcFetch } from "./lib/wc.js";
import { sincronizarOrdenesDesdeWooCommerce } from "./sync.js";

const supabaseDisponible = Boolean(
  process.env.SUPABASE_URL && process.env.SUPABASE_API_KEY
);

export const supabase = supabaseDisponible
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_API_KEY, {
      auth: { persistSession: false },
    })
  : null;

const router = Router();

// ---------- helpers ----------

const num = (v) =>
  v === null || v === undefined ? "" : String(Number(v).toFixed(2));

function formatearProducto(p) {
  return {
    id: p.id,
    sku: p.sku || "",
    name: p.name,
    image_url: p.image_url || "",
    unidad_medida: p.unidad_medida || "unidad",
    price: p.price !== null && p.price !== undefined ? num(p.price) : "",
    regular_price:
      p.regular_price !== null && p.regular_price !== undefined
        ? num(p.regular_price)
        : "",
    sale_price:
      p.sale_price !== null && p.sale_price !== undefined ? num(p.sale_price) : "",
    stock_quantity: p.stock_quantity,
    stock_status: p.stock_status || "",
    status: p.status || "",
    type: p.type || "",
    description: p.description || "",
  };
}

function formatearCliente(c) {
  return {
    id: c.id,
    name: c.first_name || c.username || "",
    username: c.username || "",
    first_name: c.first_name || "",
    last_name: c.last_name || "",
    email: c.email || "",
    phone: c.phone || "",
  };
}

function formatearOrden(o) {
  return {
    id: o.id,
    billing: { first_name: o.cliente_nombre || "", phone: o.telefono || "" },
    line_items: (o.orden_items || []).map((i) => ({
      id: i.id,
      product_id: i.producto_id,
      name: i.name,
      sku: i.sku,
      price: num(i.price),
      quantity: i.quantity,
      total: num(i.total),
    })),
    date_created: o.fecha ? new Date(o.fecha).toISOString() : null,
    customer_note: o.customer_note || "",
    status: o.status,
    total: num(o.total),
  };
}

// Push a WooCommerce para mantener el sitio publico sincronizado (best-effort)
async function empujarProductoACW(datos, wcId) {
  if (!process.env.WC_URL) return null;
  const body = {
    name: datos.name,
    sku: datos.sku,
    regular_price: datos.regular_price,
    sale_price: datos.sale_price || "",
    stock_quantity: datos.stock_quantity,
    stock_status: datos.stock_status,
    status: datos.status,
    description: datos.description,
  };
  try {
    if (wcId) {
      await wcFetch(`products/${wcId}`, { method: "PUT", body });
      return null;
    }
    const creado = await wcFetch("products", { method: "POST", body });
    return creado.id;
  } catch (e) {
    console.error("Push a WooCommerce fallo:", e.message);
    return null;
  }
}

async function empujarClienteACW(datos, wcId) {
  if (!process.env.WC_URL) return null;
  const body = {
    email: datos.email,
    billing: {
      first_name: datos.first_name || "",
      last_name: datos.last_name || "",
      phone: datos.telefono || "",
      email: datos.email,
    },
  };
  try {
    if (wcId) {
      await wcFetch(`customers/${wcId}`, { method: "PUT", body });
      return null;
    }
    const creado = await wcFetch("customers", {
      method: "POST",
      body: { username: datos.username, ...body },
    });
    return creado.id;
  } catch (e) {
    console.error("Push de cliente a WooCommerce fallo:", e.message);
    return null;
  }
}

async function paralelo(items, fn, conc = 6) {
  const resultados = [];
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const i = index++;
      resultados[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(conc, items.length) }, worker));
  return resultados;
}

// ---------- Auth ----------
router.post("/api/login", async (req, res, next) => {
  try {
    if (!supabase) throw new Error("Supabase no configurado");
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: "Faltan usuario o contraseña" });
    }
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("username", username)
      .maybeSingle();
    if (error) throw error;
    if (!data || !bcrypt.compareSync(password, data.password_hash)) {
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }
    const token = emitirToken({
      username: data.username,
      name: data.nombre,
      rol: data.rol,
      userId: data.id,
    });
    res.json({
      token,
      user: { username: data.username, name: data.nombre, rol: data.rol },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/api/me", authRequerido, (req, res) => res.json({ usuario: req.usuario }));

// ---------- Categorías ----------
router.get("/api/categorias", async (req, res, next) => {
  try {
    if (!supabase) throw new Error("Supabase no configurado");
    const { data, error } = await supabase
      .from("categorias")
      .select("id,name,slug")
      .order("name");
    if (error) throw error;
    res.json({ items: data || [] });
  } catch (err) {
    next(err);
  }
});

// ---------- Productos ----------
router.get("/api/productos", async (req, res, next) => {
  try {
    if (!supabase) throw new Error("Supabase no configurado");
    const page = Math.max(1, Number(req.query.page || 1));
    const perPage = Math.max(1, Number(req.query.per_page || 25));
    const search = (req.query.search || "").trim();
    const categoria = (req.query.categoria || "").trim();

    const campos =
      "id,sku,name,image_url,unidad_medida,regular_price,sale_price,price,stock_quantity,stock_status,status,type,description";

    let query = supabase.from("productos").select(campos, { count: "exact" }).order("name");
    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
    }
    if (categoria) {
      query = supabase
        .from("productos")
        .select(`${campos},producto_categorias!inner(categoria_id)`, { count: "exact" })
        .eq("producto_categorias.categoria_id", Number(categoria))
        .order("name");
      if (search) query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
    }

    const from = (page - 1) * perPage;
    query = query.range(from, from + perPage - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    const total = count || 0;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    res.json({ items: (data || []).map(formatearProducto), page, totalPages });
  } catch (err) {
    next(err);
  }
});

router.post("/api/productos", authRequerido, async (req, res, next) => {
  try {
    if (!supabase) throw new Error("Supabase no configurado");
    const b = req.body || {};
    if (!b.name || !String(b.name).trim()) {
      return res.status(400).json({ message: "El nombre es obligatorio" });
    }
    const regular =
      b.regular_price === "" || b.regular_price === undefined ? null : Number(b.regular_price);
    const sale = b.sale_price === "" || b.sale_price === undefined ? null : Number(b.sale_price);
    const stock =
      b.stock_quantity === "" || b.stock_quantity === undefined ? null : Number(b.stock_quantity);
    if (regular !== null && (Number.isNaN(regular) || regular < 0)) {
      return res.status(400).json({ message: "Precio inválido" });
    }
    const stockStatus =
      b.stock_status || (stock !== null ? (stock > 0 ? "instock" : "outofstock") : "instock");

    const { data: creado, error } = await supabase
      .from("productos")
      .insert([
        {
          woocommerce_id: null,
          sku: b.sku || "",
          name: b.name,
          image_url: "",
          unidad_medida: b.unidad_medida || "unidad",
          regular_price: regular,
          sale_price: sale,
          price: regular,
          stock_quantity: stock,
          stock_status: stockStatus,
          status: b.status || "publish",
          type: "simple",
          description: b.description || "",
        },
      ])
      .select()
      .single();
    if (error) throw error;

    const wcId = await empujarProductoACW(b, null);
    if (wcId) {
      await supabase.from("productos").update({ woocommerce_id: wcId }).eq("id", creado.id);
    }
    res.status(201).json(formatearProducto(creado));
  } catch (err) {
    next(err);
  }
});

router.put("/api/productos/:id", authRequerido, async (req, res, next) => {
  try {
    if (!supabase) throw new Error("Supabase no configurado");
    const id = Number(req.params.id);
    const b = req.body || {};
    const { data: existe } = await supabase
      .from("productos")
      .select("id,woocommerce_id,sku,name,unidad_medida,status,stock_status,description")
      .eq("id", id)
      .maybeSingle();
    if (!existe) return res.status(404).json({ message: "Producto no encontrado" });

    const regular =
      b.regular_price === "" || b.regular_price === undefined ? null : Number(b.regular_price);
    const sale = b.sale_price === "" || b.sale_price === undefined ? null : Number(b.sale_price);
    const stock =
      b.stock_quantity === "" || b.stock_quantity === undefined ? null : Number(b.stock_quantity);
    if (regular !== null && (Number.isNaN(regular) || regular < 0)) {
      return res.status(400).json({ message: "Precio inválido" });
    }
    const stockStatus =
      b.stock_status || (stock !== null ? (stock > 0 ? "instock" : "outofstock") : existe.stock_status || "instock");

    const { data: actualizado, error } = await supabase
      .from("productos")
      .update({
        sku: b.sku ?? existe.sku,
        name: b.name ?? existe.name,
        unidad_medida: b.unidad_medida || existe.unidad_medida || "unidad",
        regular_price: regular,
        sale_price: sale,
        price: regular,
        stock_quantity: stock,
        stock_status: stockStatus,
        status: b.status || existe.status || "publish",
        description: b.description !== undefined ? b.description : existe.description,
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;

    await empujarProductoACW(b, existe.woocommerce_id);
    res.json(formatearProducto(actualizado));
  } catch (err) {
    next(err);
  }
});

// ---------- Carga masiva de productos (match por SKU: actualizar o crear) ----------
function normalizarFilaProducto(r = {}) {
  const sku = String(r.sku ?? "").trim();
  const name = String(r.name ?? "").trim();
  const precio =
    r.price === "" || r.price === undefined || r.price === null ? null : Number(r.price);
  const sale =
    r.sale_price === "" || r.sale_price === undefined || r.sale_price === null
      ? null
      : Number(r.sale_price);
  const stock =
    r.stock_quantity === "" || r.stock_quantity === undefined || r.stock_quantity === null
      ? null
      : Number(r.stock_quantity);
  return {
    sku,
    name,
    precio,
    sale,
    stock,
    stock_status:
      r.stock_status ||
      (stock !== null ? (stock > 0 ? "instock" : "outofstock") : "instock"),
    unidad_medida: r.unidad_medida || "unidad",
    status: r.status || "publish",
    description: r.description || "",
  };
}

router.post("/api/admin/productos/preview", authRequerido, async (req, res, next) => {
  try {
    if (!supabase) throw new Error("Supabase no configurado");
    const filas = Array.isArray(req.body?.productos) ? req.body.productos : [];
    if (!filas.length) return res.status(400).json({ message: "No hay productos para procesar" });

    const aActualizar = [];
    const aCrear = [];
    const errores = [];

    for (let i = 0; i < filas.length; i++) {
      const p = normalizarFilaProducto(filas[i]);
      if (!p.sku) {
        errores.push({ fila: i + 1, motivo: "Falta SKU" });
        continue;
      }
      if (!p.name) {
        errores.push({ fila: i + 1, motivo: "Falta nombre" });
        continue;
      }
      if (p.precio !== null && (Number.isNaN(p.precio) || p.precio < 0)) {
        errores.push({ fila: i + 1, motivo: "Precio inválido" });
        continue;
      }
      const { data } = await supabase.from("productos").select("id").eq("sku", p.sku).limit(1);
      if (data && data.length) aActualizar.push({ fila: i + 1, sku: p.sku, name: p.name });
      else aCrear.push({ fila: i + 1, sku: p.sku, name: p.name });
    }

    res.json({ aActualizar, aCrear, errores });
  } catch (err) {
    next(err);
  }
});

router.post("/api/admin/productos/aplicar", authRequerido, async (req, res, next) => {
  try {
    if (!supabase) throw new Error("Supabase no configurado");
    const filas = Array.isArray(req.body?.productos) ? req.body.productos : [];
    let actualizados = 0;
    let creados = 0;
    const pendientesPush = [];

    for (const fila of filas) {
      const p = normalizarFilaProducto(fila);
      if (!p.sku || !p.name) continue;
      if (p.precio !== null && (Number.isNaN(p.precio) || p.precio < 0)) continue;

      const payload = {
        sku: p.sku,
        name: p.name,
        regular_price: p.precio,
        sale_price: p.sale,
        price: p.precio,
        stock_quantity: p.stock,
        stock_status: p.stock_status,
        unidad_medida: p.unidad_medida,
        status: p.status,
        description: p.description,
      };

      const { data: existente } = await supabase
        .from("productos")
        .select("id,woocommerce_id")
        .eq("sku", p.sku)
        .limit(1);
      if (existente && existente.length) {
        await supabase.from("productos").update(payload).eq("sku", p.sku);
        actualizados++;
        pendientesPush.push({ payload, wcId: existente[0].woocommerce_id, id: existente[0].id });
      } else {
        const { data: creado, error } = await supabase
          .from("productos")
          .insert({ ...payload, woocommerce_id: null, image_url: "", type: "simple" })
          .select()
          .single();
        if (error) throw error;
        creados++;
        pendientesPush.push({ payload, wcId: null, id: creado.id });
      }
    }

    await paralelo(pendientesPush, async (item) => {
      try {
        const wcId = await empujarProductoACW(item.payload, item.wcId);
        if (wcId && item.wcId === null) {
          await supabase.from("productos").update({ woocommerce_id: wcId }).eq("id", item.id);
        }
      } catch {
        // push best-effort
      }
    }, 5);

    res.json({ actualizados, creados });
  } catch (err) {
    next(err);
  }
});

router.delete("/api/productos/:id", authRequerido, async (req, res, next) => {
  try {
    if (!supabase) throw new Error("Supabase no configurado");
    const id = Number(req.params.id);
    const { data: existe } = await supabase
      .from("productos")
      .select("id,woocommerce_id")
      .eq("id", id)
      .maybeSingle();
    if (!existe) return res.status(404).json({ message: "Producto no encontrado" });

    const { error } = await supabase.from("productos").delete().eq("id", id);
    if (error) throw error;

    if (process.env.WC_URL && existe.woocommerce_id) {
      try {
        await wcFetch(`products/${existe.woocommerce_id}`, {
          method: "DELETE",
          query: { force: "true" },
        });
      } catch (e) {
        console.error("Borrado en WooCommerce fallo:", e.message);
      }
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ---------- Clientes ----------
router.get("/api/clientes", async (req, res, next) => {
  try {
    if (!supabase) throw new Error("Supabase no configurado");
    const page = Math.max(1, Number(req.query.page || 1));
    const perPage = Math.max(1, Number(req.query.per_page || 25));
    const search = (req.query.search || "").trim();

    let query = supabase.from("clientes").select("*", { count: "exact" }).order("first_name");
    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,username.ilike.%${search}%`
      );
    }
    const from = (page - 1) * perPage;
    query = query.range(from, from + perPage - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    const totalPages = Math.max(1, Math.ceil((count || 0) / perPage));
    res.json({ items: (data || []).map(formatearCliente), page, totalPages });
  } catch (err) {
    next(err);
  }
});

router.post("/api/clientes", authRequerido, async (req, res, next) => {
  try {
    if (!supabase) throw new Error("Supabase no configurado");
    const { username, email, first_name } = req.body || {};
    if (!username || !email) {
      return res.status(400).json({ message: "Faltan username o email" });
    }
    const { data: creado, error } = await supabase
      .from("clientes")
      .insert([{ woocommerce_id: null, username, first_name: first_name || "", last_name: "", email, phone: "" }])
      .select()
      .single();
    if (error) throw error;

    const wcId = await empujarClienteACW(
      { username, email, first_name: first_name || "", last_name: "", telefono: "" },
      null
    );
    if (wcId) {
      await supabase.from("clientes").update({ woocommerce_id: wcId }).eq("id", creado.id);
    }
    res.status(201).json(formatearCliente(creado));
  } catch (err) {
    next(err);
  }
});

router.put("/api/clientes/:id", authRequerido, async (req, res, next) => {
  try {
    if (!supabase) throw new Error("Supabase no configurado");
    const id = Number(req.params.id);
    const b = req.body || {};
    const { data: existe } = await supabase
      .from("clientes")
      .select("id,woocommerce_id,first_name,last_name,email,phone")
      .eq("id", id)
      .maybeSingle();
    if (!existe) return res.status(404).json({ message: "Cliente no encontrado" });

    const { data: actualizado, error } = await supabase
      .from("clientes")
      .update({
        first_name: b.first_name ?? existe.first_name,
        last_name: b.last_name ?? existe.last_name,
        email: b.email ?? existe.email,
        phone: b.telefono ?? existe.phone,
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;

    await empujarClienteACW(
      {
        first_name: actualizado.first_name,
        last_name: actualizado.last_name,
        email: actualizado.email,
        telefono: actualizado.phone,
      },
      existe.woocommerce_id
    );
    res.json(formatearCliente(actualizado));
  } catch (err) {
    next(err);
  }
});

router.put("/api/clientes/:id/telefono", authRequerido, async (req, res, next) => {
  try {
    if (!supabase) throw new Error("Supabase no configurado");
    const { telefono } = req.body || {};
    if (!telefono) return res.status(400).json({ message: "Falta el teléfono" });
    const { error } = await supabase
      .from("clientes")
      .update({ phone: telefono })
      .eq("id", Number(req.params.id));
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.delete("/api/clientes/:id", authRequerido, async (req, res, next) => {
  try {
    if (!supabase) throw new Error("Supabase no configurado");
    const id = Number(req.params.id);
    const { data: existe } = await supabase
      .from("clientes")
      .select("id,woocommerce_id")
      .eq("id", id)
      .maybeSingle();
    if (!existe) return res.status(404).json({ message: "Cliente no encontrado" });

    const { error } = await supabase.from("clientes").delete().eq("id", id);
    if (error) throw error;

    if (process.env.WC_URL && existe.woocommerce_id) {
      try {
        await wcFetch(`customers/${existe.woocommerce_id}`, {
          method: "DELETE",
          query: { force: "true" },
        });
      } catch (e) {
        console.error("Borrado de cliente en WooCommerce fallo:", e.message);
      }
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ---------- Órdenes ----------
router.get("/api/ordenes", authRequerido, async (req, res, next) => {
  try {
    if (!supabase) throw new Error("Supabase no configurado");
    const { desde, hasta } = req.query;
    let query = supabase
      .from("ordenes")
      .select("*, orden_items(*)")
      .order("fecha", { ascending: false })
      .limit(200);
    if (desde) {
      query = query.gte("fecha", new Date(`${desde}T00:00:00`).toISOString());
    }
    if (hasta) {
      query = query.lte("fecha", new Date(`${hasta}T23:59:59.999`).toISOString());
    }
    const { data, error } = await query;
    if (error) throw error;
    res.json((data || []).map(formatearOrden));
  } catch (err) {
    next(err);
  }
});

router.post("/api/ordenes", authRequerido, async (req, res, next) => {
  try {
    if (!supabase) throw new Error("Supabase no configurado");
    const { billing, line_items, customer_note } = req.body || {};
    if (!line_items || !Array.isArray(line_items) || line_items.length === 0) {
      return res.status(400).json({ message: "El pedido no tiene productos" });
    }
    const total = line_items.reduce(
      (acc, i) => acc + (Number(i.quantity) || 0) * (Number(i.price) || 0),
      0
    );

    let clienteId = null;
    if (billing?.first_name) {
      const { data: cli } = await supabase
        .from("clientes")
        .select("id")
        .eq("first_name", billing.first_name)
        .limit(1);
      if (cli && cli.length) clienteId = cli[0].id;
    }

    const { data: orden, error } = await supabase
      .from("ordenes")
      .insert([
        {
          woocommerce_id: null,
          cliente_id: clienteId,
          cliente_nombre: billing?.first_name || "",
          telefono: billing?.phone || "",
          status: "processing",
          total: total.toFixed(2),
          customer_note: customer_note || "",
          fecha: new Date().toISOString(),
        },
      ])
      .select()
      .single();
    if (error) throw error;

    const itemsRows = line_items.map((i) => ({
      orden_id: orden.id,
      producto_id: i.product_id || null,
      name: i.name || "",
      sku: i.sku || "",
      price: Number(i.price) || 0,
      quantity: i.quantity || 0,
      total: ((Number(i.quantity) || 0) * (Number(i.price) || 0)).toFixed(2),
    }));
    const { error: errItems } = await supabase.from("orden_items").insert(itemsRows);
    if (errItems) throw errItems;

    // Doble escritura: tambien crear la orden en WooCommerce (tienda publica), best-effort
    if (process.env.WC_URL) {
      try {
        const wcOrden = await wcFetch("orders", {
          method: "POST",
          body: {
            payment_method: "bacs",
            payment_method_title: "Transferencia bancaria",
            set_paid: true,
            billing: {
              first_name: billing?.first_name || "",
              phone: billing?.phone || "",
            },
            line_items: line_items.map((i) => ({
              product_id: i.product_id || undefined,
              name: i.name,
              quantity: i.quantity,
              price: i.price,
            })),
            customer_note: customer_note || "",
          },
        });
        if (wcOrden && wcOrden.id) {
          await supabase
            .from("ordenes")
            .update({ woocommerce_id: wcOrden.id })
            .eq("id", orden.id);
        }
      } catch (e) {
        console.error("Push de orden a WooCommerce fallo:", e.message);
      }
    }

    const { data: completo } = await supabase
      .from("ordenes")
      .select("*, orden_items(*)")
      .eq("id", orden.id)
      .single();
    res.status(201).json(formatearOrden(completo));
  } catch (err) {
    next(err);
  }
});

router.put("/api/ordenes/:id", authRequerido, async (req, res, next) => {
  try {
    if (!supabase) throw new Error("Supabase no configurado");
    const id = Number(req.params.id);
    const b = req.body || {};
    const { data: existe } = await supabase.from("ordenes").select("id").eq("id", id).maybeSingle();
    if (!existe) return res.status(404).json({ message: "Orden no encontrada" });

    const { error } = await supabase
      .from("ordenes")
      .update({
        cliente_nombre: b.billing?.first_name,
        telefono: b.billing?.phone,
        status: b.status,
        customer_note: b.customer_note,
      })
      .eq("id", id);
    if (error) throw error;

    if (Array.isArray(b.line_items)) {
      for (const li of b.line_items) {
        const { error: e2 } = await supabase
          .from("orden_items")
          .update({ quantity: li.quantity })
          .eq("id", li.id)
          .eq("orden_id", id);
        if (e2) throw e2;
      }
    }

    const { data: completo } = await supabase
      .from("ordenes")
      .select("*, orden_items(*)")
      .eq("id", id)
      .single();
    res.json(formatearOrden(completo));
  } catch (err) {
    next(err);
  }
});

router.delete("/api/ordenes/:id", authRequerido, async (req, res, next) => {
  try {
    if (!supabase) throw new Error("Supabase no configurado");
    const { error } = await supabase
      .from("ordenes")
      .delete()
      .eq("id", Number(req.params.id));
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ---------- Sincronización (WooCommerce -> Supabase, órdenes) ----------
router.post("/api/admin/sync", authRequerido, async (req, res, next) => {
  try {
    if (!supabase) throw new Error("Supabase no configurado");
    const resumen = await sincronizarOrdenesDesdeWooCommerce({ dias: 30 });
    res.json(resumen);
  } catch (err) {
    next(err);
  }
});

// ---------- Estadísticas ----------
router.get("/api/stats", authRequerido, async (req, res, next) => {
  try {
    if (!supabase) throw new Error("Supabase no configurado");
    const inicioHoy = new Date();
    inicioHoy.setHours(0, 0, 0, 0);
    const inicio7 = new Date();
    inicio7.setDate(inicio7.getDate() - 6);
    inicio7.setHours(0, 0, 0, 0);

    const [totalO, enProceso, hoy, s7, prods, publ, borr, agot, cats, clis, vendidos] =
      await Promise.all([
        supabase.from("ordenes").select("id", { count: "exact" }),
        supabase.from("ordenes").select("id", { count: "exact" }).in("status", ["pending", "processing", "on-hold"]),
        supabase.from("ordenes").select("total").gte("fecha", inicioHoy.toISOString()),
        supabase.from("ordenes").select("total").gte("fecha", inicio7.toISOString()),
        supabase.from("productos").select("id", { count: "exact" }),
        supabase.from("productos").select("id", { count: "exact" }).eq("status", "publish"),
        supabase.from("productos").select("id", { count: "exact" }).in("status", ["draft", "pending"]),
        supabase.from("productos").select("id", { count: "exact" }).eq("stock_status", "outofstock"),
        supabase.from("categorias").select("id", { count: "exact" }),
        supabase.from("clientes").select("id", { count: "exact" }),
        supabase.from("orden_items").select("name,quantity").limit(20000),
      ]);

    const contar = (r) => (r.error ? 0 : r.count || 0);
    const sumar = (r) =>
      r.error ? 0 : (r.data || []).reduce((a, x) => a + (Number(x.total) || 0), 0);

    const hoyCount = (hoy.data || []).length;
    const hoyVentas = sumar(hoy);
    const s7Count = (s7.data || []).length;
    const s7Ventas = sumar(s7);

    const mapa = {};
    (vendidos.data || []).forEach((x) => {
      mapa[x.name] = (mapa[x.name] || 0) + (x.quantity || 0);
    });
    const masVendidos = Object.entries(mapa)
      .map(([name, cantidad]) => ({ name, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);

    res.json({
      ordenes: {
        total: contar(totalO),
        enProceso: contar(enProceso),
        hoy: { count: hoyCount, netSales: hoyVentas.toFixed(2) },
        ultimos7: {
          count: s7Count,
          netSales: s7Ventas.toFixed(2),
          promedio: s7Count ? (s7Ventas / s7Count).toFixed(2) : "0",
        },
      },
      productos: {
        total: contar(prods),
        publicados: contar(publ),
        borradores: contar(borr),
        agotados: contar(agot),
        categorias: contar(cats),
      },
      clientes: { total: contar(clis) },
      masVendidos,
    });
  } catch (err) {
    next(err);
  }
});

export { router as routerSupabase };
