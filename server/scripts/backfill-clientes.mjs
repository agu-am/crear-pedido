import "dotenv/config";
import { supabase } from "../supabase.js";
import { parsearUsername } from "../lib/parse.js";

if (!supabase) {
  console.error("Supabase no configurado. Revisar SUPABASE_URL y SUPABASE_API_KEY en el entorno.");
  process.exit(1);
}

const { data: clientes, error } = await supabase.from("clientes").select("id,username");
if (error) throw error;

let ok = 0;
let sinCodigo = 0;
const fallos = [];

for (const c of clientes) {
  const { codigo_interno, razon_social, local } = parsearUsername(c.username);
  if (!codigo_interno) sinCodigo++;
  const { error: e } = await supabase
    .from("clientes")
    .update({ codigo_interno, razon_social, local })
    .eq("id", c.id);
  if (e) {
    fallos.push({ id: c.id, error: e.message });
  } else {
    ok++;
  }
}

console.log(`Clientes procesados: ${clientes.length}`);
console.log(`Actualizados: ${ok}`);
console.log(`Sin código: ${sinCodigo}`);
if (fallos.length) {
  console.log(`Fallos: ${fallos.length}`);
  for (const f of fallos) console.log(`  - id ${f.id}: ${f.error}`);
}
