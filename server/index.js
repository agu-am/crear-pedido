import "dotenv/config";
import express from "express";
import cors from "cors";
import { wcFetch, validarCredenciales } from "./lib/wc.js";
import { emitirToken, authRequerido } from "./lib/auth.js";

const app = express();

const origenesPermitidos = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || origenesPermitidos.includes(origin)) return cb(null, true);
      return cb(null, false);
    },
  })
);
app.use(express.json());

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

const formatearProducto = (p) => ({
  id: p.id,
  sku: p.sku,
  name: p.name,
  price: p.price,
  description: (p.description || "").replace(/<\/?[^>]+(>|$)/g, ""),
});

const formatearCliente = (c) => ({
  id: c.id,
  name: c.billing?.first_name || c.username || c.name || "",
  email: c.email || "",
  phone: c.billing?.phone || "",
});

// Healthcheck (útil para PM2 en Hostinger)
app.get("/api/health", (_req, res) => res.json({ ok: true }));

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
    const key = `productos:${search}:${page}:${perPage}`;
    const cacheado = leerCache(key);
    if (cacheado) return res.json(cacheado);

    const data = await wcFetch("products", {
      query: {
        _fields: "id,name,sku,price,description",
        search,
        per_page: perPage,
        page,
      },
    });
    const resultado = data.map(formatearProducto);
    cachear(key, resultado);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
});

// ---- Clientes (público, solo lectura: id, nombre, email, teléfono) ----
app.get("/api/clientes", async (req, res, next) => {
  try {
    const search = (req.query.search || "").trim();
    const key = `clientes:${search}`;
    const cacheado = leerCache(key);
    if (cacheado) return res.json(cacheado);

    const data = await wcFetch("customers", {
      query: { _fields: "id,username,email,billing", search, per_page: 25 },
    });
    const resultado = data.map(formatearCliente);
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
        _fields: "id,billing,line_items,date_created,customer_note",
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

// ---- Clientes (escritura, protegido) ----
app.post("/api/clientes", authRequerido, async (req, res, next) => {
  try {
    const { username, email } = req.body || {};
    if (!username || !email) {
      return res.status(400).json({ message: "Faltan username o email" });
    }
    const data = await wcFetch("customers", {
      method: "POST",
      body: { username, email, billing: { email } },
    });
    res.status(201).json({ id: data.id, username: data.username, email: data.email });
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

app.use((_req, res) => res.status(404).json({ message: "No encontrado" }));

app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ message: err.message || "Error interno" });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`API de pedidos escuchando en el puerto ${port}`);
});
