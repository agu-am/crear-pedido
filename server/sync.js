import { supabase } from "./supabase.js";
import { wcFetchPaginado } from "./lib/wc.js";

// Ejecuta `fn` sobre los items con un pool de concurrencia acotado
async function paralelo(items, fn, conc = 8) {
  const resultados = [];
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const i = index++;
      resultados[i] = await fn(items[i]);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(conc, items.length) }, worker)
  );
  return resultados;
}

async function traerTodoParalelo(path, queryParams = {}) {
  const primera = await wcFetchPaginado(path, {
    query: { per_page: 100, page: 1, ...queryParams },
  });
  const items = [...primera.items];
  const totalPages = primera.totalPages;
  if (totalPages > 1) {
    const paginas = [];
    for (let p = 2; p <= totalPages; p++) paginas.push(p);
    const resultados = await paralelo(paginas, (p) =>
      wcFetchPaginado(path, { query: { per_page: 100, page: p, ...queryParams } })
    );
    resultados.forEach((r) => items.push(...r.items));
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
export async function sincronizarOrdenesDesdeWooCommerce() {
  if (!supabase) throw new Error("Supabase no configurado");

  const ordenes = await traerTodoParalelo("orders", {
    _fields: "id,billing,line_items,date_created,customer_note,status,total,customer_id",
  });

  const [{ data: cliDb }, { data: prodDb }] = await Promise.all([
    supabase.from("clientes").select("id,woocommerce_id"),
    supabase.from("productos").select("id,woocommerce_id"),
  ]);
  const cliMap = new Map((cliDb || []).map((c) => [c.woocommerce_id, c.id]));
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

  const insertados = await paralelo(lotes(rows, 100), async (lote) => {
    const { data, error } = await supabase
      .from("ordenes")
      .upsert(lote, { onConflict: "woocommerce_id" })
      .select("id,woocommerce_id");
    if (error) throw error;
    return data || [];
  });
  const ids = insertados.flat();
  const ordMap = new Map(ids.map((o) => [o.woocommerce_id, o.id]));
  const ordenesSupabaseIds = ids.map((o) => o.id);

  if (ordenesSupabaseIds.length) {
    await supabase.from("orden_items").delete().in("orden_id", ordenesSupabaseIds);
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
  await paralelo(lotes(itemsRows, 500), async (lote) => {
    const { error } = await supabase.from("orden_items").insert(lote);
    if (error) throw error;
  });

  return { ordenes: ordenes.length, items: itemsRows.length };
}
