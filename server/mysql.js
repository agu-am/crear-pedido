import { Router } from "express";
import bcrypt from "bcryptjs";
import { emitirToken, authRequerido } from "./lib/auth.js";
import { query } from "./db.js";
import { wcFetch } from "./lib/wc.js";

const router = Router();

// ---------- helpers ----------

function formatearProducto(p, categorias = []) {
  return {
    id: p.id,
    sku: p.sku,
    name: p.name,
    image_url: p.image_url,
    unidad_medida: p.unidad_medida || "unidad",
    price: p.price !== null ? String(p.price) : "",
    regular_price: p.regular_price !== null ? String(p.regular_price) : "",
    sale_price: p.sale_price !== null ? String(p.sale_price) : "",
    stock_quantity: p.stock_quantity,
    stock_status: p.stock_status,
    status: p.status,
    type: p.type,
    description: p.description || "",
    categorias,
  };
}

function formatearCliente(c) {
  return {
    id: c.id,
    name: c.first_name || c.username || "",
    username: c.username,
    first_name: c.first_name || "",
    last_name: c.last_name || "",
    email: c.email || "",
    phone: c.phone || "",
  };
}

function formatearOrden(o, items) {
  return {
    id: o.id,
    billing: { first_name: o.cliente_nombre || "", phone: o.telefono || "" },
    line_items: items.map((i) => ({
      id: i.id,
      product_id: i.producto_id,
      name: i.name,
      sku: i.sku,
      price: String(i.price),
      quantity: i.quantity,
      total: String(i.total),
    })),
    date_created: o.fecha ? o.fecha.toISOString() : null,
    customer_note: o.customer_note || "",
    status: o.status,
    total: String(o.total),
  };
}

// Push a WooCommerce para mantener el sitio publico sincronizado (best-effort)
async function empujarProductoACW(datos, wcId) {
  if (!process.env.WC_URL) return;
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
    } else {
      const creado = await wcFetch("products", { method: "POST", body });
      return creado.id;
    }
  } catch (e) {
    console.error("Push a WooCommerce fallo:", e.message);
  }
  return null;
}

async function empujarClienteACW(datos, wcId) {
  if (!process.env.WC_URL) return;
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
    } else {
      const creado = await wcFetch("customers", {
        method: "POST",
        body: { username: datos.username, ...body },
      });
      return creado.id;
    }
  } catch (e) {
    console.error("Push de cliente a WooCommerce fallo:", e.message);
  }
  return null;
}

// ---------- Auth ----------
router.post("/api/login", async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: "Faltan usuario o contraseña" });
    }
    const filas = await query("SELECT * FROM usuarios WHERE username = ?", [username]);
    if (!filas.length || !bcrypt.compareSync(password, filas[0].password_hash)) {
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }
    const u = filas[0];
    const token = emitirToken({
      username: u.username,
      name: u.nombre,
      rol: u.rol,
      userId: u.id,
    });
    res.json({
      token,
      user: { username: u.username, name: u.nombre, rol: u.rol },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/api/me", authRequerido, (req, res) => res.json({ usuario: req.usuario }));

// ---------- Categorías ----------
router.get("/api/categorias", async (req, res, next) => {
  try {
    const filas = await query("SELECT id, name, slug FROM categorias ORDER BY name");
    res.json({ items: filas.map((f) => ({ id: f.id, name: f.name, slug: f.slug })) });
  } catch (err) {
    next(err);
  }
});

// ---------- Productos ----------
router.get("/api/productos", async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const perPage = Math.max(1, Number(req.query.per_page || 25));
    const search = (req.query.search || "").trim();
    const categoria = (req.query.categoria || "").trim();

    const condiciones = [];
    const params = [];
    if (search) {
      condiciones.push("(p.name LIKE ? OR p.sku LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }
    if (categoria) {
      condiciones.push(
        "EXISTS (SELECT 1 FROM producto_categorias pc WHERE pc.producto_id = p.id AND pc.categoria_id = ?)"
      );
      params.push(Number(categoria));
    }
    const where = condiciones.length ? `WHERE ${condiciones.join(" AND ")}` : "";

    const countRows = await query(`SELECT COUNT(*) AS total FROM productos p ${where}`, params);
    const total = Number(countRows[0].total);
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const offset = (page - 1) * perPage;

    const items = await query(
      `SELECT p.* FROM productos p ${where} ORDER BY p.name LIMIT ? OFFSET ?`,
      [...params, perPage, offset]
    );

    const ids = items.map((i) => i.id);
    const categoriasMap = {};
    if (ids.length) {
      const placeholders = ids.map(() => "?").join(",");
      const rows = await query(
        `SELECT pc.producto_id, c.id, c.name FROM producto_categorias pc
         JOIN categorias c ON c.id = pc.categoria_id
         WHERE pc.producto_id IN (${placeholders})`,
        ids
      );
      rows.forEach((r) => {
        (categoriasMap[r.producto_id] ||= []).push({ id: r.id, name: r.name });
      });
    }

    res.json({
      items: items.map((i) => formatearProducto(i, categoriasMap[i.id] || [])),
      page,
      totalPages,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/api/productos", authRequerido, async (req, res, next) => {
  try {
    const b = req.body || {};
    if (!b.name || !String(b.name).trim()) {
      return res.status(400).json({ message: "El nombre es obligatorio" });
    }
    const regular = b.regular_price === "" || b.regular_price === undefined ? null : Number(b.regular_price);
    const sale = b.sale_price === "" || b.sale_price === undefined ? null : Number(b.sale_price);
    const stock = b.stock_quantity === "" || b.stock_quantity === undefined ? null : Number(b.stock_quantity);
    if (regular !== null && (Number.isNaN(regular) || regular < 0)) {
      return res.status(400).json({ message: "Precio inválido" });
    }
    const stockStatus =
      b.stock_status || (stock !== null ? (stock > 0 ? "instock" : "outofstock") : "instock");

    const r = await query(
      `INSERT INTO productos
         (woocommerce_id, sku, name, image_url, unidad_medida, regular_price, sale_price, price, stock_quantity, stock_status, status, type, description)
       VALUES (NULL, ?, ?, '', ?, ?, ?, ?, ?, ?, ?, 'simple', ?)`,
      [
        b.sku || "",
        b.name,
        b.unidad_medida || "unidad",
        regular,
        sale,
        regular,
        stock,
        stockStatus,
        b.status || "publish",
        b.description || "",
      ]
    );
    const wcId = await empujarProductoACW(b, null);
    if (wcId) {
      await query("UPDATE productos SET woocommerce_id = ? WHERE id = ?", [wcId, r.insertId]);
    }
    const creado = await query("SELECT * FROM productos WHERE id = ?", [r.insertId]);
    res.status(201).json(formatearProducto(creado[0]));
  } catch (err) {
    next(err);
  }
});

router.put("/api/productos/:id", authRequerido, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const b = req.body || {};
    const existe = await query("SELECT * FROM productos WHERE id = ?", [id]);
    if (!existe.length) return res.status(404).json({ message: "Producto no encontrado" });

    const regular = b.regular_price === "" || b.regular_price === undefined ? null : Number(b.regular_price);
    const sale = b.sale_price === "" || b.sale_price === undefined ? null : Number(b.sale_price);
    const stock = b.stock_quantity === "" || b.stock_quantity === undefined ? null : Number(b.stock_quantity);
    if (regular !== null && (Number.isNaN(regular) || regular < 0)) {
      return res.status(400).json({ message: "Precio inválido" });
    }
    const stockStatus =
      b.stock_status || (stock !== null ? (stock > 0 ? "instock" : "outofstock") : existe[0].stock_status || "instock");

    await query(
      `UPDATE productos SET
         sku = ?, name = ?, unidad_medida = ?, regular_price = ?, sale_price = ?, price = ?,
         stock_quantity = ?, stock_status = ?, status = ?, description = ?
       WHERE id = ?`,
      [
        b.sku ?? existe[0].sku,
        b.name ?? existe[0].name,
        b.unidad_medida || existe[0].unidad_medida || "unidad",
        regular,
        sale,
        regular,
        stock,
        stockStatus,
        b.status || existe[0].status || "publish",
        b.description !== undefined ? b.description : existe[0].description,
        id,
      ]
    );
    await empujarProductoACW(b, existe[0].woocommerce_id);
    const actualizado = await query("SELECT * FROM productos WHERE id = ?", [id]);
    res.json(formatearProducto(actualizado[0]));
  } catch (err) {
    next(err);
  }
});

// ---------- Clientes ----------
router.get("/api/clientes", async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const perPage = Math.max(1, Number(req.query.per_page || 25));
    const search = (req.query.search || "").trim();

    const condiciones = [];
    const params = [];
    if (search) {
      condiciones.push("(first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR username LIKE ?)");
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    const where = condiciones.length ? `WHERE ${condiciones.join(" AND ")}` : "";

    const countRows = await query(`SELECT COUNT(*) AS total FROM clientes ${where}`, params);
    const total = Number(countRows[0].total);
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const offset = (page - 1) * perPage;

    const items = await query(
      `SELECT * FROM clientes ${where} ORDER BY first_name LIMIT ? OFFSET ?`,
      [...params, perPage, offset]
    );
    res.json({ items: items.map(formatearCliente), page, totalPages });
  } catch (err) {
    next(err);
  }
});

router.post("/api/clientes", authRequerido, async (req, res, next) => {
  try {
    const { username, email, first_name } = req.body || {};
    if (!username || !email) {
      return res.status(400).json({ message: "Faltan username o email" });
    }
    const r = await query(
      `INSERT INTO clientes (woocommerce_id, username, first_name, last_name, email, phone)
       VALUES (NULL, ?, ?, '', ?, '')`,
      [username, first_name || "", email]
    );
    const wcId = await empujarClienteACW(
      { username, email, first_name: first_name || "", last_name: "", telefono: "" },
      null
    );
    if (wcId) await query("UPDATE clientes SET woocommerce_id = ? WHERE id = ?", [wcId, r.insertId]);
    const fila = await query("SELECT * FROM clientes WHERE id = ?", [r.insertId]);
    res.status(201).json(formatearCliente(fila[0]));
  } catch (err) {
    next(err);
  }
});

router.put("/api/clientes/:id", authRequerido, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const b = req.body || {};
    const existe = await query("SELECT * FROM clientes WHERE id = ?", [id]);
    if (!existe.length) return res.status(404).json({ message: "Cliente no encontrado" });

    await query(
      `UPDATE clientes SET first_name = ?, last_name = ?, email = ?, phone = ? WHERE id = ?`,
      [
        b.first_name ?? existe[0].first_name,
        b.last_name ?? existe[0].last_name,
        b.email ?? existe[0].email,
        b.telefono ?? existe[0].phone,
        id,
      ]
    );
    await empujarClienteACW(
      {
        first_name: b.first_name ?? existe[0].first_name,
        last_name: b.last_name ?? existe[0].last_name,
        email: b.email ?? existe[0].email,
        telefono: b.telefono ?? existe[0].phone,
      },
      existe[0].woocommerce_id
    );
    const fila = await query("SELECT * FROM clientes WHERE id = ?", [id]);
    res.json(formatearCliente(fila[0]));
  } catch (err) {
    next(err);
  }
});

router.put("/api/clientes/:id/telefono", authRequerido, async (req, res, next) => {
  try {
    const { telefono } = req.body || {};
    if (!telefono) return res.status(400).json({ message: "Falta el teléfono" });
    await query("UPDATE clientes SET phone = ? WHERE id = ?", [telefono, Number(req.params.id)]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ---------- Órdenes ----------
router.get("/api/ordenes", authRequerido, async (req, res, next) => {
  try {
    const ordenes = await query("SELECT * FROM ordenes ORDER BY fecha DESC LIMIT 200");
    const resultado = [];
    for (const o of ordenes) {
      const items = await query("SELECT * FROM orden_items WHERE orden_id = ? ORDER BY id", [o.id]);
      resultado.push(formatearOrden(o, items));
    }
    res.json(resultado);
  } catch (err) {
    next(err);
  }
});

router.post("/api/ordenes", authRequerido, async (req, res, next) => {
  try {
    const { billing, line_items, customer_note } = req.body || {};
    if (!line_items || !Array.isArray(line_items) || line_items.length === 0) {
      return res.status(400).json({ message: "El pedido no tiene productos" });
    }
    const total = line_items.reduce(
      (acc, i) => acc + (Number(i.quantity) || 0) * (Number(i.price) || 0),
      0
    );

    const cliente = await query(
      "SELECT id FROM clientes WHERE first_name = ? ORDER BY id LIMIT 1",
      [billing?.first_name || ""]
    );

    const r = await query(
      `INSERT INTO ordenes (woocommerce_id, cliente_id, cliente_nombre, telefono, status, total, customer_note, fecha)
       VALUES (NULL, ?, ?, ?, 'processing', ?, ?, NOW())`,
      [cliente.length ? cliente[0].id : null, billing?.first_name || "", billing?.phone || "", total.toFixed(2), customer_note || ""]
    );
    const ordenId = r.insertId;

    for (const i of line_items) {
      await query(
        `INSERT INTO orden_items (orden_id, producto_id, name, sku, price, quantity, total)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          ordenId,
          i.product_id || null,
          i.name || "",
          i.sku || "",
          Number(i.price) || 0,
          i.quantity || 0,
          ((Number(i.quantity) || 0) * (Number(i.price) || 0)).toFixed(2),
        ]
      );
    }
    const orden = await query("SELECT * FROM ordenes WHERE id = ?", [ordenId]);
    const items = await query("SELECT * FROM orden_items WHERE orden_id = ?", [ordenId]);
    res.status(201).json(formatearOrden(orden[0], items));
  } catch (err) {
    next(err);
  }
});

router.put("/api/ordenes/:id", authRequerido, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const b = req.body || {};
    const existe = await query("SELECT * FROM ordenes WHERE id = ?", [id]);
    if (!existe.length) return res.status(404).json({ message: "Orden no encontrada" });

    await query(
      `UPDATE ordenes SET cliente_nombre = ?, telefono = ?, status = ?, customer_note = ? WHERE id = ?`,
      [
        b.billing?.first_name ?? existe[0].cliente_nombre,
        b.billing?.phone ?? existe[0].telefono,
        b.status || existe[0].status,
        b.customer_note !== undefined ? b.customer_note : existe[0].customer_note,
        id,
      ]
    );
    if (Array.isArray(b.line_items)) {
      for (const li of b.line_items) {
        await query("UPDATE orden_items SET quantity = ? WHERE id = ? AND orden_id = ?", [
          li.quantity,
          li.id,
          id,
        ]);
      }
    }
    const orden = await query("SELECT * FROM ordenes WHERE id = ?", [id]);
    const items = await query("SELECT * FROM orden_items WHERE orden_id = ?", [id]);
    res.json(formatearOrden(orden[0], items));
  } catch (err) {
    next(err);
  }
});

router.delete("/api/ordenes/:id", authRequerido, async (req, res, next) => {
  try {
    await query("DELETE FROM ordenes WHERE id = ?", [Number(req.params.id)]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ---------- Estadísticas ----------
router.get("/api/stats", authRequerido, async (req, res, next) => {
  try {
    const [ordenes] = await query(
      "SELECT COUNT(*) AS total, SUM(status IN ('pending','processing','on-hold')) AS enProceso, COALESCE(SUM(CASE WHEN fecha >= CURDATE() THEN 1 ELSE 0 END),0) AS hoyCount, COALESCE(SUM(CASE WHEN fecha >= CURDATE() THEN total ELSE 0 END),0) AS hoyVentas, COALESCE(SUM(CASE WHEN fecha >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END),0) AS s7Count, COALESCE(SUM(CASE WHEN fecha >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN total ELSE 0 END),0) AS s7Ventas FROM ordenes"
    );
    const [productos] = await query(
      "SELECT COUNT(*) AS total, SUM(status='publish') AS publicados, SUM(status IN ('draft','pending')) AS borradores, SUM(stock_status='outofstock') AS agotados FROM productos"
    );
    const [categorias] = await query("SELECT COUNT(*) AS total FROM categorias");
    const [clientes] = await query("SELECT COUNT(*) AS total FROM clientes");
    const [masVendidos] = await query(
      `SELECT name, SUM(quantity) AS cantidad FROM orden_items
       GROUP BY name ORDER BY cantidad DESC LIMIT 5`
    );

    const o = ordenes[0];
    res.json({
      ordenes: {
        total: Number(o.total || 0),
        enProceso: Number(o.enProceso || 0),
        hoy: { count: Number(o.hoyCount || 0), netSales: String(o.hoyVentas || 0) },
        ultimos7: {
          count: Number(o.s7Count || 0),
          netSales: String(o.s7Ventas || 0),
          promedio: (o.s7Count ? (Number(o.s7Ventas) / Number(o.s7Count)).toFixed(2) : "0"),
        },
      },
      productos: {
        total: Number(productos[0].total || 0),
        publicados: Number(productos[0].publicados || 0),
        borradores: Number(productos[0].borradores || 0),
        agotados: Number(productos[0].agotados || 0),
        categorias: Number(categorias[0].total || 0),
      },
      clientes: { total: Number(clientes[0].total || 0) },
      masVendidos: masVendidos.map((m) => ({ name: m.name, cantidad: Number(m.cantidad) })),
    });
  } catch (err) {
    next(err);
  }
});

export { router as routerMysql };
