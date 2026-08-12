import { supabase } from "./supabase.js";
import { wcFetchPaginado } from "./lib/wc.js";

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

// Trae las órdenes de WooCommerce a Supabase (upsert por woocommerce_id) y reconstruye sus items.
// Solo toca las órdenes que vienen de WooCommerce (las de la app no se borran).
export async function sincronizarOrdenesDesdeWooCommerce() {
  if (!supabase) throw new Error("Supabase no configurado");

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
  const ordenesSupabaseIds = ids.map((o) => o.id);

  // Reconstruir items SOLO de las órdenes sincronizadas
  if (ordenesSupabaseIds.length) {
    const { error: del } = await supabase
      .from("orden_items")
      .delete()
      .in("orden_id", ordenesSupabaseIds);
    if (del) throw del;
  }

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

  return { ordenes: ordenes.length, items: itemsRows.length };
}
