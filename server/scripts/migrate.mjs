import "dotenv/config";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { initDb, query } from "../db.js";
import { wcFetchPaginado } from "../lib/wc.js";
import { vendedores } from "../vendedores.js";

const CAMPOS_PRODUCTO =
  "id,name,sku,regular_price,sale_price,price,stock_quantity,stock_status,status,type,description,images,categories";

async function traerTodo(path, queryParams = {}) {
  const items = [];
  let page = 1;
  for (;;) {
    const r = await wcFetchPaginado(path, {
      query: { per_page: 100, page, ...queryParams },
    });
    items.push(...r.items);
    if (page >= r.totalPages || r.items.length === 0) break;
    page++;
  }
  return items;
}

function numero(v) {
  return v === null || v === undefined || v === "" ? null : Number(v);
}

const upsertCategoria = async (c) => {
  await query(
    `INSERT INTO categorias (woocommerce_id, name, slug)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE name = VALUES(name), slug = VALUES(slug)`,
    [c.id, c.name, c.slug || ""]
  );
};

const upsertProducto = async (p) => {
  const imageUrl = p.images?.[0]?.src || "";
  await query(
    `INSERT INTO productos
       (woocommerce_id, sku, name, image_url, unidad_medida, regular_price, sale_price, price, stock_quantity, stock_status, status, type, description)
     VALUES (?, ?, ?, ?, 'unidad', ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       sku = VALUES(sku), name = VALUES(name), image_url = VALUES(image_url),
       regular_price = VALUES(regular_price), sale_price = VALUES(sale_price), price = VALUES(price),
       stock_quantity = VALUES(stock_quantity), stock_status = VALUES(stock_status),
       status = VALUES(status), type = VALUES(type), description = VALUES(description)`,
    [
      p.id,
      p.sku || "",
      p.name,
      imageUrl,
      numero(p.regular_price),
      numero(p.sale_price),
      numero(p.price),
      numero(p.stock_quantity),
      p.stock_status || "",
      p.status || "publish",
      p.type || "simple",
      p.description || "",
    ]
  );

  if (p.categories?.length) {
    const filas = await query("SELECT id, woocommerce_id FROM categorias");
    const map = new Map(filas.map((f) => [f.woocommerce_id, f.id]));
    const prod = await query("SELECT id FROM productos WHERE woocommerce_id = ?", [p.id]);
    if (prod.length) {
      await query("DELETE FROM producto_categorias WHERE producto_id = ?", [prod[0].id]);
      for (const c of p.categories) {
        const catId = map.get(c.id);
        if (catId) {
          await query(
            "INSERT IGNORE INTO producto_categorias (producto_id, categoria_id) VALUES (?, ?)",
            [prod[0].id, catId]
          );
        }
      }
    }
  }
};

const upsertCliente = async (c) => {
  await query(
    `INSERT INTO clientes (woocommerce_id, username, first_name, last_name, email, phone)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       username = VALUES(username), first_name = VALUES(first_name),
       last_name = VALUES(last_name), email = VALUES(email), phone = VALUES(phone)`,
    [
      c.id,
      c.username || "",
      c.billing?.first_name || "",
      c.billing?.last_name || "",
      c.email || "",
      c.billing?.phone || "",
    ]
  );
};

const upsertOrden = async (o, clientesMap, productosMap) => {
  const clienteId = o.customer_id ? clientesMap.get(o.customer_id) || null : null;
  await query(
    `INSERT INTO ordenes (woocommerce_id, cliente_id, cliente_nombre, telefono, status, total, customer_note, fecha)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       cliente_id = VALUES(cliente_id), cliente_nombre = VALUES(cliente_nombre),
       telefono = VALUES(telefono), status = VALUES(status), total = VALUES(total),
       customer_note = VALUES(customer_note), fecha = VALUES(fecha)`,
    [
      o.id,
      clienteId,
      o.billing?.first_name || "",
      o.billing?.phone || "",
      o.status || "processing",
      numero(o.total) || 0,
      o.customer_note || "",
      o.date_created ? new Date(o.date_created) : null,
    ]
  );

  const fila = await query("SELECT id FROM ordenes WHERE woocommerce_id = ?", [o.id]);
  if (!fila.length) return;
  const ordenId = fila[0].id;

  await query("DELETE FROM orden_items WHERE orden_id = ?", [ordenId]);
  for (const i of o.line_items || []) {
    await query(
      `INSERT INTO orden_items (orden_id, producto_id, name, sku, price, quantity, total)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        ordenId,
        i.product_id ? productosMap.get(i.product_id) || null : null,
        i.name || "",
        i.sku || "",
        numero(i.price) || 0,
        i.quantity || 0,
        numero(i.total) || 0,
      ]
    );
  }
};

function generarPassword() {
  return crypto.randomBytes(6).toString("base64url").slice(0, 9);
}

async function migrarUsuarios() {
  const adminUser = process.env.ADMIN_USERNAME;
  const adminPass = process.env.ADMIN_PASSWORD;
  if (!adminUser || !adminPass) {
    throw new Error(
      "Faltan ADMIN_USERNAME y ADMIN_PASSWORD en el entorno para crear el admin"
    );
  }
  await query(
    `INSERT INTO usuarios (username, password_hash, nombre, telefono, rol)
     VALUES (?, ?, ?, '', 'admin')
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), nombre = VALUES(nombre), rol = 'admin'`,
    [adminUser, bcrypt.hashSync(adminPass, 10), adminUser]
  );

  const resultados = [];
  for (const v of vendedores) {
    const pass = generarPassword();
    await query(
      `INSERT INTO usuarios (username, password_hash, nombre, telefono, rol)
       VALUES (?, ?, ?, ?, 'vendedor')
       ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), telefono = VALUES(telefono)`,
      [v.nombre.toLowerCase().replace(/\s+/g, ""), bcrypt.hashSync(pass, 10), v.nombre, v.telefono]
    );
    resultados.push({ vendedor: v.nombre, usuario: v.nombre.toLowerCase().replace(/\s+/g, ""), password: pass });
  }
  return resultados;
}

console.log("Iniciando migración WooCommerce -> MySQL...");
if (!(await initDb())) {
  console.error("MySQL no configurado. Revisar DB_* en el entorno.");
  process.exit(1);
}

const categorias = await traerTodo("products/categories", { _fields: "id,name,slug" });
for (const c of categorias) await upsertCategoria(c);
console.log(`Categorías migradas: ${categorias.length}`);

const productos = await traerTodo("products", { _fields: CAMPOS_PRODUCTO });
for (const p of productos) await upsertProducto(p);
console.log(`Productos migrados: ${productos.length}`);

const clientes = await traerTodo("customers", { _fields: "id,username,email,billing" });
for (const c of clientes) await upsertCliente(c);
const filasClientes = await query("SELECT id, woocommerce_id FROM clientes");
const clientesMap = new Map(filasClientes.map((f) => [f.woocommerce_id, f.id]));
const filasProductos = await query("SELECT id, woocommerce_id FROM productos");
const productosMap = new Map(filasProductos.map((f) => [f.woocommerce_id, f.id]));
console.log(`Clientes migrados: ${clientes.length}`);

const ordenes = await traerTodo("orders", {
  _fields: "id,billing,line_items,date_created,customer_note,status,total,customer_id",
});
for (const o of ordenes) await upsertOrden(o, clientesMap, productosMap);
console.log(`Órdenes migradas: ${ordenes.length}`);

const passwords = await migrarUsuarios();
console.log("Usuarios migrados (admin + vendedores).");

console.log("\n========== RESUMEN ==========");
console.log(`Categorías: ${categorias.length}`);
console.log(`Productos:  ${productos.length}`);
console.log(`Clientes:   ${clientes.length}`);
console.log(`Órdenes:    ${ordenes.length}`);
console.log("\n========== VENDEDORES (contraseñas iniciales) ==========");
for (const r of passwords) {
  console.log(`- ${r.vendedor}: usuario "${r.usuario}" | contraseña: ${r.password}`);
}
console.log(`\nAdmin: usuario "${process.env.ADMIN_USERNAME}" | contraseña: la que definiste en ADMIN_PASSWORD`);
console.log("\nMigración completada.");
