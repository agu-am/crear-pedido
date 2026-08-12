-- ============================================================
-- Pedidos Paul - Schema PostgreSQL (Supabase)
-- Pegar en: Supabase > SQL Editor > Run
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS usuarios (
  id BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  nombre TEXT DEFAULT '',
  telefono TEXT DEFAULT '',
  rol TEXT NOT NULL DEFAULT 'vendedor',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categorias (
  id BIGSERIAL PRIMARY KEY,
  woocommerce_id BIGINT UNIQUE,
  name TEXT NOT NULL,
  slug TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS productos (
  id BIGSERIAL PRIMARY KEY,
  woocommerce_id BIGINT UNIQUE,
  sku TEXT DEFAULT '',
  name TEXT NOT NULL,
  image_url TEXT DEFAULT '',
  unidad_medida TEXT DEFAULT 'unidad',
  regular_price DECIMAL(15,2),
  sale_price DECIMAL(15,2),
  price DECIMAL(15,2),
  stock_quantity INT,
  stock_status TEXT DEFAULT '',
  status TEXT DEFAULT 'publish',
  type TEXT DEFAULT 'simple',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_productos_name ON productos USING gin (name gin_trgm_ops);
CREATE INDEX idx_productos_sku ON productos USING gin (sku gin_trgm_ops);

CREATE TABLE IF NOT EXISTS producto_categorias (
  producto_id BIGINT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  categoria_id BIGINT NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
  PRIMARY KEY (producto_id, categoria_id)
);

CREATE TABLE IF NOT EXISTS clientes (
  id BIGSERIAL PRIMARY KEY,
  woocommerce_id BIGINT UNIQUE,
  username TEXT DEFAULT '',
  first_name TEXT DEFAULT '',
  last_name TEXT DEFAULT '',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_clientes_email ON clientes (email);

CREATE TABLE IF NOT EXISTS ordenes (
  id BIGSERIAL PRIMARY KEY,
  woocommerce_id BIGINT UNIQUE,
  cliente_id BIGINT REFERENCES clientes(id) ON DELETE SET NULL,
  cliente_nombre TEXT DEFAULT '',
  telefono TEXT DEFAULT '',
  status TEXT DEFAULT 'processing',
  total DECIMAL(15,2) DEFAULT 0,
  customer_note TEXT,
  fecha TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_ordenes_cliente ON ordenes (cliente_id);
CREATE INDEX idx_ordenes_fecha ON ordenes (fecha);

CREATE TABLE IF NOT EXISTS orden_items (
  id BIGSERIAL PRIMARY KEY,
  orden_id BIGINT NOT NULL REFERENCES ordenes(id) ON DELETE CASCADE,
  producto_id BIGINT,
  name TEXT DEFAULT '',
  sku TEXT DEFAULT '',
  price DECIMAL(15,2) DEFAULT 0,
  quantity INT DEFAULT 0,
  total DECIMAL(15,2) DEFAULT 0
);
CREATE INDEX idx_oi_orden ON orden_items (orden_id);
