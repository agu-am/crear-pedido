import "dotenv/config";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { supabase } from "../supabase.js";
import { wcFetchPaginado } from "../lib/wc.js";
import { vendedores } from "../vendedores.js";

if (!supabase) {
  console.error("Supabase no configurado. Revisar SUPABASE_URL y SUPABASE_API_KEY en el entorno.");
  process.exit(1);
}

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

function lotes(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

async function migrarCategorias() {
  const cats = await traerTodo("products/categories", { _fields: "id,name,slug" });
  const rows = cats.map((c) => ({ woocommerce_id: c.id, name: c.name, slug: c.slug || "" }));
  for (const lote of lotes(rows, 100)) {
    const { error } = await supabase.from("categorias").upsert(lote, { onConflict: "woocommerce_id" });
    if (error) throw error;
  }
  console.log(`Categorías migradas: ${cats.length}`);
  return cats.length;
}

async function migrarProductos() {
  const prods = await traerTodo("products", { _fields: CAMPOS_PRODUCTO });
  const rows = prods.map((p) => ({
    woocommerce_id: p.id,
    sku: p.sku || "",
    name: p.name,
    image_url: p.images?.[0]?.src || "",
    unidad_medida: "unidad",
    regular_price: numero(p.regular_price),
    sale_price: numero(p.sale_price),
    price: numero(p.price),
    stock_quantity: numero(p.stock_quantity),
    stock_status: p.stock_status || "",
    status: p.status || "publish",
    type: p.type || "simple",
    description: p.description || "",
  }));
  for (const lote of lotes(rows, 100)) {
    const { error } = await supabase.from("productos").upsert(lote, { onConflict: "woocommerce_id" });
    if (error) throw error;
  }

  const { data: cats } = await supabase.from("categorias").select("id,woocommerce_id");
  const catMap = new Map((cats || []).map((c) => [c.woocommerce_id, c.id]));
  const { data: prodsDb } = await supabase.from("productos").select("id,woocommerce_id");
  const prodMap = new Map((prodsDb || []).map((p) => [p.woocommerce_id, p.id]));

  const pcRows = [];
  prods.forEach((p) => {
    const pid = prodMap.get(p.id);
    if (!pid) return;
    (p.categories || []).forEach((c) => {
      const cid = catMap.get(c.id);
      if (cid) pcRows.push({ producto_id: pid, categoria_id: cid });
    });
  });
  for (const lote of lotes(pcRows, 500)) {
    const { error } = await supabase.from("producto_categorias").upsert(lote, {
      onConflict: "producto_id,categoria_id",
      ignoreDuplicates: true,
    });
    if (error) throw error;
  }
  console.log(`Productos migrados: ${prods.length} (relaciones categoria: ${pcRows.length})`);
  return prods.length;
}

async function migrarClientes() {
  const clientes = await traerTodo("customers", { _fields: "id,username,email,billing" });
  const rows = clientes.map((c) => ({
    woocommerce_id: c.id,
    username: c.username || "",
    first_name: c.billing?.first_name || "",
    last_name: c.billing?.last_name || "",
    email: c.email || "",
    phone: c.billing?.phone || "",
  }));
  for (const lote of lotes(rows, 100)) {
    const { error } = await supabase.from("clientes").upsert(lote, { onConflict: "woocommerce_id" });
    if (error) throw error;
  }
  console.log(`Clientes migrados: ${clientes.length}`);
  return clientes.length;
}

async function migrarOrdenes() {
  const ordenes = await traerTodo("orders", {
    _fields: "id,billing,line_items,date_created,customer_note,status,total,customer_id",
  });

  const { data: cliDb } = await supabase.from("clientes").select("id,woocommerce_id");
  const cliMap = new Map((cliDb || []).map((c) => [c.woocommerce_id, c.id]));
  const { data: prodDb } = await supabase.from("productos").select("id,woocommerce_id");
  const prodMap = new Map((prodDb || []).map((p) => [p.woocommerce_id, p.id]));

  const rows = ordenes.map((o) => ({
    woocommerce_id: o.id,
    cliente_id: o.customer_id ? cliMap.get(o.customer_id) || null : null,
    cliente_nombre: o.billing?.first_name || "",
    telefono: o.billing?.phone || "",
    status: o.status || "processing",
    total: numero(o.total) || 0,
    customer_note: o.customer_note || "",
    fecha: o.date_created ? new Date(o.date_created).toISOString() : null,
  }));

  const ids = [];
  for (const lote of lotes(rows, 100)) {
    const { data: insertados, error } = await supabase
      .from("ordenes")
      .upsert(lote, { onConflict: "woocommerce_id" })
      .select("id,woocommerce_id");
    if (error) throw error;
    ids.push(...(insertados || []));
  }
  const ordMap = new Map(ids.map((o) => [o.woocommerce_id, o.id]));

  // Reconstruir los items de todas las ordenes
  const { error: delItems } = await supabase.from("orden_items").delete().neq("id", 0);
  if (delItems) throw delItems;

  const itemsRows = [];
  ordenes.forEach((o) => {
    const oid = ordMap.get(o.id);
    if (!oid) return;
    (o.line_items || []).forEach((i) => {
      itemsRows.push({
        orden_id: oid,
        producto_id: i.product_id ? prodMap.get(i.product_id) || null : null,
        name: i.name || "",
        sku: i.sku || "",
        price: numero(i.price) || 0,
        quantity: i.quantity || 0,
        total: numero(i.total) || 0,
      });
    });
  });
  for (const lote of lotes(itemsRows, 500)) {
    const { error } = await supabase.from("orden_items").insert(lote);
    if (error) throw error;
  }
  console.log(`Órdenes migradas: ${ordenes.length} (items: ${itemsRows.length})`);
  return ordenes.length;
}

function generarPassword() {
  return crypto.randomBytes(6).toString("base64url").slice(0, 9);
}

async function migrarUsuarios() {
  const adminUser = process.env.ADMIN_USERNAME;
  const adminPass = process.env.ADMIN_PASSWORD;
  if (!adminUser || !adminPass) {
    throw new Error("Faltan ADMIN_USERNAME y ADMIN_PASSWORD en el entorno para crear el admin");
  }
  const { error: eAdmin } = await supabase.from("usuarios").upsert(
    [
      {
        username: adminUser,
        password_hash: bcrypt.hashSync(adminPass, 10),
        nombre: adminUser,
        telefono: "",
        rol: "admin",
      },
    ],
    { onConflict: "username" }
  );
  if (eAdmin) throw eAdmin;

  const resultados = [];
  for (const v of vendedores) {
    const pass = generarPassword();
    const usuario = v.nombre.toLowerCase().replace(/\s+/g, "");
    const { error } = await supabase.from("usuarios").upsert(
      [
        {
          username: usuario,
          password_hash: bcrypt.hashSync(pass, 10),
          nombre: v.nombre,
          telefono: v.telefono,
          rol: "vendedor",
        },
      ],
      { onConflict: "username" }
    );
    if (error) throw error;
    resultados.push({ vendedor: v.nombre, usuario, password: pass });
  }
  return resultados;
}

console.log("Iniciando migración WooCommerce -> Supabase...");

const nCat = await migrarCategorias();
const nProd = await migrarProductos();
const nCli = await migrarClientes();
const nOrd = await migrarOrdenes();
const passwords = await migrarUsuarios();

console.log("\n========== RESUMEN ==========");
console.log(`Categorías: ${nCat}`);
console.log(`Productos:  ${nProd}`);
console.log(`Clientes:   ${nCli}`);
console.log(`Órdenes:    ${nOrd}`);
console.log("\n========== VENDEDORES (contraseñas iniciales) ==========");
for (const r of passwords) {
  console.log(`- ${r.vendedor}: usuario "${r.usuario}" | contraseña: ${r.password}`);
}
console.log(`\nAdmin: usuario "${process.env.ADMIN_USERNAME}" | contraseña: la que definiste en ADMIN_PASSWORD`);
console.log("\nMigración completada.");
