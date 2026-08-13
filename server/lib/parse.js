// Separa el `username` de WooCommerce (formato "CODIGO - RAZON SOCIAL - LOCAL")
// en sus 3 partes sin perder el username original.
export function parsearUsername(u = "") {
  const s = (u || "").trim();
  const m = s.match(/^(\d+)\s*-\s*(.*)$/);
  const codigo = m ? m[1] : "";
  const resto = m ? m[2] : s;

  const n = resto.match(/^(.+?)\s*-\s*(.*)$/);
  const razonSocial = n ? n[1].trim() : resto.trim();
  const local = n ? n[2].trim() : "";

  return { codigo_interno: codigo, razon_social: razonSocial, local };
}
