import "dotenv/config";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import { wcFetch, wcFetchPaginado, wcFetchConTotal, validarCredenciales } from "./lib/wc.js";
import { emitirToken, authRequerido } from "./lib/auth.js";
import { routerSupabase } from "./supabase.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../dist");

const app = express();

const origenesPermitidos = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || origenesPermitidos.includes(origin)) return cb(null, true);
      if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return cb(null, true);
      return cb(null, false);
    },
  })
);
app.use(express.json());

// Modo Supabase: la app lee/escribe en la base propia (WooCommerce queda solo para el sitio publico)
const dataSource = (process.env.DATA_SOURCE || "woocommerce").toLowerCase();
if (dataSource === "supabase") {
  app.use(routerSupabase);
}

const cache = new Map();
const CACHE_TTL = Number(process.env.CACHE_TTL || 60) * 1000;

function cachear(key, valor) {
  cache.set(key, { valor, expira: Date.now() + CACHE_TTL });
}

function leerCache(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (item.expira < Date.now()) {
    cache.delete(key);
    return null;
  }
  return item.valor;
}

// Indice de SKUs (id -> { sku, categorias }) para busquedas parciales. Se construye una vez y se cachea.
const indiceSku = new Map();
let indiceSkuCargadoEn = 0;
const INDICE_SKU_TTL = 10 * 60 * 1000;

async function cargarIndiceSkus() {
  if (indiceSkuCargadoEn && Date.now() - indiceSkuCargadoEn < INDICE_SKU_TTL) return;
  const nuevo = new Map();
  let page = 1;
  for (;;) {
    const r = await wcFetchPaginado("products", {
      query: { _fields: "id,sku,categories", per_page: 100, page },
    });
    r.items.forEach((p) => {
      if (p.sku) {
        nuevo.set(p.id, {
          sku: p.sku,
          categorias: (p.categories || []).map((c) => c.id),
        });
      }
    });
    if (page >= r.totalPages || r.items.length === 0) break;
    page++;
  }
  indiceSku.clear();
  nuevo.forEach((v, k) => indiceSku.set(k, v));
  indiceSkuCargadoEn = Date.now();
}

const formatearProducto = (p) => ({
  id: p.id,
  sku: p.sku,
  name: p.name,
  price: p.price,
  regular_price: p.regular_price,
  sale_price: p.sale_price,
  stock_quantity: p.stock_quantity,
  stock_status: p.stock_status,
  status: p.status,
  type: p.type,
  description: (p.description || "").replace(/<\/?[^>]+(>|$)/g, ""),
});

const formatearCliente = (c) => ({
  id: c.id,
  name: c.billing?.first_name || c.username || c.name || "",
  username: c.username,
  first_name: c.billing?.first_name || "",
  last_name: c.billing?.last_name || "",
  email: c.email || "",
  phone: c.billing?.phone || "",
});

function armarProducto(input, esNuevo) {
  if (!input || !input.name || !String(input.name).trim()) {
    return { error: "El nombre es obligatorio" };
  }
  const payload = {};
  if (esNuevo) payload.type = "simple";
  payload.name = String(input.name).trim();
  if (input.sku) payload.sku = String(input.sku).trim();
  if (input.description) payload.description = String(input.description);
  if (input.status) payload.status = input.status;

  const precio =
    input.regular_price !== undefined && input.regular_price !== ""
      ? Number(input.regular_price)
      : null;
  if (precio !== null) {
    if (Number.isNaN(precio) || precio < 0) return { error: "Precio inválido" };
    payload.regular_price = String(precio);
  }
  const oferta =
    input.sale_price !== undefined && input.sale_price !== ""
      ? Number(input.sale_price)
      : null;
  if (oferta !== null) {
    if (Number.isNaN(oferta) || oferta < 0)
      return { error: "Precio de oferta inválido" };
    payload.sale_price = String(oferta);
  }
  const stock =
    input.stock_quantity !== undefined && input.stock_quantity !== ""
      ? Number(input.stock_quantity)
      : null;
  if (stock !== null) {
    if (Number.isNaN(stock) || stock < 0) return { error: "Stock inválido" };
    payload.manage_stock = true;
    payload.stock_quantity = stock;
    payload.stock_status = stock > 0 ? "instock" : "outofstock";
  } else if (input.stock_status) {
    payload.stock_status = input.stock_status;
  }
  return { payload };
}

// Healthcheck (útil para PM2 en Hostinger)
app.get("/api/health", (_req, res) => res.json({ ok: true }));

function topProductos(ordenes) {
  const mapa = {};
  ordenes.forEach((o) => {
    (o.line_items || []).forEach((i) => {
      const nombre = i.name || "Producto";
      mapa[nombre] = (mapa[nombre] || 0) + (i.quantity || 0);
    });
  });
  return Object.entries(mapa)
    .map(([name, cantidad]) => ({ name, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5);
}

function inicioDelDia(offsetDias = 0) {
  const d = new Date();
  d.setDate(d.getDate() - offsetDias);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

async function resumenOrdenesDesde(desdeISO) {
  let page = 1;
  let count = 0;
  let suma = 0;
  for (;;) {
    const r = await wcFetchConTotal("orders", {
      query: {
        per_page: 100,
        page,
        after: desdeISO,
        orderby: "date",
        order: "asc",
        _fields: "id,total",
      },
    });
    (r.data || []).forEach((o) => {
      count++;
      suma += Number(o.total || 0);
    });
    if (page >= r.totalPages || !r.data || r.data.length === 0) break;
    page++;
  }
  return { count, netSales: suma.toFixed(2) };
}

// ---- Estadísticas del dashboard (protegido) ----
app.get("/api/stats", authRequerido, async (req, res, next) => {
  try {
    const resultados = await Promise.allSettled([
      wcFetch("reports/orders/totals"),
      wcFetch("reports/customers/totals"),
      wcFetchConTotal("products", { query: { per_page: 1 } }),
      wcFetchConTotal("products", { query: { status: "publish", per_page: 1 } }),
      wcFetchConTotal("products", { query: { status: "draft", per_page: 1 } }),
      wcFetchConTotal("products", { query: { status: "pending", per_page: 1 } }),
      wcFetchConTotal("products", {
        query: { stock_status: "outofstock", per_page: 1 },
      }),
      wcFetchConTotal("products/categories", { query: { per_page: 1 } }),
      wcFetchConTotal("orders", {
        query: {
          per_page: 100,
          page: 1,
          orderby: "date",
          order: "desc",
          _fields: "id,line_items",
        },
      }),
      resumenOrdenesDesde(inicioDelDia(0)),
      resumenOrdenesDesde(inicioDelDia(7)),
    ]);

    const val = (r) => (r.status === "fulfilled" ? r.value : null);

    const estados = val(resultados[0]) || [];
    const totalOrdenes = estados.reduce((acc, e) => acc + (e.total || 0), 0);
    const enProceso = estados
      .filter((e) => ["pending", "processing", "on-hold"].includes(e.slug))
      .reduce((acc, e) => acc + (e.total || 0), 0);

    const clientes = val(resultados[1]) || [];
    const totalClientes = clientes.reduce((acc, e) => acc + (e.total || 0), 0);

    const hoy = val(resultados[9]) || { count: 0, netSales: "0" };
    const ultimos7 = val(resultados[10]) || { count: 0, netSales: "0" };
    const promedio =
      ultimos7.count > 0
        ? (Number(ultimos7.netSales) / ultimos7.count).toFixed(2)
        : "0";

    res.json({
      ordenes: {
        total: totalOrdenes,
        enProceso,
        hoy,
        ultimos7: { ...ultimos7, promedio },
      },
      productos: {
        total: val(resultados[2])?.total || 0,
        publicados: val(resultados[3])?.total || 0,
        borradores: (val(resultados[4])?.total || 0) + (val(resultados[5])?.total || 0),
        agotados: val(resultados[6])?.total || 0,
        categorias: val(resultados[7])?.total || 0,
      },
      clientes: {
        total: totalClientes,
      },
      masVendidos: topProductos(val(resultados[8])?.data || []),
    });
  } catch (err) {
    next(err);
  }
});

// ---- Auth ----
app.post("/api/login", async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: "Faltan usuario o contraseña" });
    }
    const info = await validarCredenciales(username, password);
    const token = emitirToken({
      username,
      email: info.user_email,
      name: info.user_display_name,
    });
    res.json({
      token,
      user: {
        username,
        email: info.user_email,
        name: info.user_display_name,
      },
    });
  } catch (err) {
    next(err);
  }
});

app.get("/api/me", authRequerido, (req, res) => {
  res.json({ usuario: req.usuario });
});

// ---- Productos (público, solo lectura) ----
app.get("/api/productos", async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const perPage = Number(req.query.per_page || 25);
    const search = (req.query.search || "").trim();
    const categoria = (req.query.categoria || "").trim();
    const key = `productos:${search}:${categoria}:${page}:${perPage}`;
    const cacheado = leerCache(key);
    if (cacheado) return res.json(cacheado);

    const resultado = await wcFetchPaginado("products", {
      query: {
        _fields:
          "id,name,sku,regular_price,sale_price,price,stock_quantity,stock_status,status,type,description",
        search,
        category: categoria || undefined,
        per_page: perPage,
        page,
      },
    });
    let items = resultado.items.map(formatearProducto);

    // La busqueda de WooCommerce por `search` no cubre el SKU en este sitio:
    // se agregan resultados por SKU (exacto y coincidencia parcial) en la primera pagina.
    if (search && page === 1) {
      const CAMPOS =
        "id,name,sku,regular_price,sale_price,price,stock_quantity,stock_status,status,type,description";
      const yaExiste = (id) => items.some((i) => i.id === id);
      const enCategoria = (categorias) =>
        !categoria || (categorias || []).includes(Number(categoria));

      try {
        const porSku = await wcFetchPaginado("products", {
          query: {
            _fields: CAMPOS + ",categories",
            sku: search,
            per_page: 1,
            page: 1,
          },
        });
        porSku.items.forEach((p) => {
          if (!enCategoria((p.categories || []).map((c) => c.id))) return;
          const fp = formatearProducto(p);
          if (!yaExiste(fp.id)) items.unshift(fp);
        });
      } catch {
        // filtro sku no disponible: se ignora
      }

      // Coincidencia parcial de SKU (codigos con digitos): usa el indice cacheado.
      if (/\d{3,}/.test(search)) {
        try {
          await cargarIndiceSkus();
          const term = search.toLowerCase();
          const ids = [];
          for (const [id, info] of indiceSku) {
            if (
              info.sku.toLowerCase().includes(term) &&
              enCategoria(info.categorias)
            ) {
              ids.push(id);
              if (ids.length >= 25) break;
            }
          }
          if (ids.length) {
            const encontrados = await wcFetchPaginado("products", {
              query: { include: ids.join(","), per_page: 100, _fields: CAMPOS },
            });
            const extra = encontrados.items
              .map(formatearProducto)
              .filter((p) => !yaExiste(p.id));
            items = [...extra, ...items];
          }
        } catch {
          // si el indice no puede construirse, se ignora
        }
      }
    }

    resultado.items = items;
    cachear(key, resultado);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
});

// ---- Categorías (público, solo lectura) ----
app.get("/api/categorias", async (req, res, next) => {
  try {
    const key = "categorias";
    const cacheado = leerCache(key);
    if (cacheado) return res.json(cacheado);

    const resultado = await wcFetchPaginado("products/categories", {
      query: {
        hide_empty: true,
        per_page: 100,
        _fields: "id,name,slug,count",
      },
    });
    resultado.items = resultado.items.sort((a, b) =>
      a.name.localeCompare(b.name, "es")
    );
    cachear(key, resultado);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
});

// ---- Clientes (público, solo lectura: id, nombre, email, teléfono) ----
app.get("/api/clientes", async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const perPage = Number(req.query.per_page || 25);
    const search = (req.query.search || "").trim();
    const key = `clientes:${search}:${page}:${perPage}`;
    const cacheado = leerCache(key);
    if (cacheado) return res.json(cacheado);

    const resultado = await wcFetchPaginado("customers", {
      query: {
        _fields: "id,username,email,billing",
        search,
        per_page: perPage,
        page,
      },
    });
    resultado.items = resultado.items.map(formatearCliente);
    cachear(key, resultado);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
});

// ---- Órdenes (protegido) ----
app.get("/api/ordenes", authRequerido, async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const data = await wcFetch("orders", {
      query: {
        _fields:
          "id,billing,line_items,date_created,customer_note,status,total",
        per_page: 50,
        page,
      },
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

app.post("/api/ordenes", authRequerido, async (req, res, next) => {
  try {
    const { billing, shipping, line_items, customer_note } = req.body || {};
    if (!line_items || !Array.isArray(line_items) || line_items.length === 0) {
      return res.status(400).json({ message: "El pedido no tiene productos" });
    }
    const data = await wcFetch("orders", {
      method: "POST",
      body: {
        payment_method: "bacs",
        payment_method_title: "Transferencia bancaria",
        set_paid: true,
        billing,
        shipping,
        line_items,
        customer_note: customer_note || "",
      },
    });
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

app.put("/api/ordenes/:id", authRequerido, async (req, res, next) => {
  try {
    const { billing, status, customer_note, line_items } = req.body || {};
    const body = {};
    if (billing) body.billing = billing;
    if (status) body.status = status;
    if (customer_note !== undefined) body.customer_note = customer_note;
    if (line_items && Array.isArray(line_items)) body.line_items = line_items;
    if (Object.keys(body).length === 0) {
      return res.status(400).json({ message: "No hay datos para actualizar" });
    }
    const data = await wcFetch(`orders/${req.params.id}`, {
      method: "PUT",
      body,
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

app.delete("/api/ordenes/:id", authRequerido, async (req, res, next) => {
  try {
    await wcFetch(`orders/${req.params.id}`, { method: "DELETE" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ---- Clientes (escritura, protegido) ----
app.post("/api/clientes", authRequerido, async (req, res, next) => {
  try {
    const { username, email, first_name } = req.body || {};
    if (!username || !email) {
      return res.status(400).json({ message: "Faltan username o email" });
    }
    const billing = { email };
    if (first_name) billing.first_name = String(first_name);
    const data = await wcFetch("customers", {
      method: "POST",
      body: { username, email, billing },
    });
    res.status(201).json(formatearCliente(data));
  } catch (err) {
    next(err);
  }
});

app.put("/api/clientes/:id/telefono", authRequerido, async (req, res, next) => {
  try {
    const { telefono } = req.body || {};
    if (!telefono) {
      return res.status(400).json({ message: "Falta el teléfono" });
    }
    const data = await wcFetch(`customers/${req.params.id}`, {
      method: "PUT",
      body: { billing: { phone: telefono } },
    });
    res.json({ id: data.id, phone: data.billing?.phone });
  } catch (err) {
    next(err);
  }
});

app.put("/api/clientes/:id", authRequerido, async (req, res, next) => {
  try {
    const { first_name, last_name, email, telefono } = req.body || {};
    if (!first_name && !last_name && !email && !telefono) {
      return res.status(400).json({ message: "No hay datos para actualizar" });
    }
    const body = {};
    const billing = {};
    if (first_name !== undefined) billing.first_name = String(first_name);
    if (last_name !== undefined) billing.last_name = String(last_name);
    if (telefono !== undefined) billing.phone = String(telefono);
    if (email !== undefined) body.email = String(email);
    if (Object.keys(billing).length) body.billing = billing;

    const data = await wcFetch(`customers/${req.params.id}`, {
      method: "PUT",
      body,
    });
    res.json(formatearCliente(data));
  } catch (err) {
    next(err);
  }
});

// ---- Productos (escritura, protegido) ----
app.post("/api/productos", authRequerido, async (req, res, next) => {
  try {
    const { error, payload } = armarProducto(req.body, true);
    if (error) return res.status(400).json({ message: error });
    const data = await wcFetch("products", { method: "POST", body: payload });
    res.status(201).json(formatearProducto(data));
  } catch (err) {
    next(err);
  }
});

app.put("/api/productos/:id", authRequerido, async (req, res, next) => {
  try {
    const { error, payload } = armarProducto(req.body, false);
    if (error) return res.status(400).json({ message: error });
    const data = await wcFetch(`products/${req.params.id}`, {
      method: "PUT",
      body: payload,
    });
    res.json(formatearProducto(data));
  } catch (err) {
    next(err);
  }
});

// Sirve el frontend compilado (dist/) en el mismo dominio (deploy todo-en-uno)
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(distDir, "index.html")));
}

app.use((_req, res) => res.status(404).json({ message: "No encontrado" }));

app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ message: err.message || "Error interno" });
});
export default app;
