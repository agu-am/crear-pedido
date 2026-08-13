-- Agregar las 3 columnas parseadas de `username` a la tabla clientes.
-- Idempotente: seguro para correr en Supabase > SQL Editor.
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS codigo_interno TEXT DEFAULT '';
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS razon_social TEXT DEFAULT '';
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS local TEXT DEFAULT '';
