import mysql from "mysql2/promise";

const config = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export const dbDisponible = Boolean(
  config.host && config.user && config.database
);

let pool = null;

export function getPool() {
  if (!dbDisponible) return null;
  if (!pool) {
    pool = mysql.createPool({
      ...config,
      waitForConnections: true,
      connectionLimit: 5,
      charset: "utf8mb4",
    });
  }
  return pool;
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(60) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(120) DEFAULT '',
    telefono VARCHAR(40) DEFAULT '',
    rol VARCHAR(20) NOT NULL DEFAULT 'vendedor',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    woocommerce_id INT UNIQUE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    woocommerce_id INT UNIQUE,
    sku VARCHAR(100) DEFAULT '',
    name VARCHAR(255) NOT NULL,
    image_url VARCHAR(500) DEFAULT '',
    unidad_medida VARCHAR(40) DEFAULT 'unidad',
    regular_price DECIMAL(15,2) NULL,
    sale_price DECIMAL(15,2) NULL,
    price DECIMAL(15,2) NULL,
    stock_quantity INT NULL,
    stock_status VARCHAR(20) DEFAULT '',
    status VARCHAR(20) DEFAULT 'publish',
    type VARCHAR(20) DEFAULT 'simple',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_productos_name (name),
    INDEX idx_productos_sku (sku)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS producto_categorias (
    producto_id INT NOT NULL,
    categoria_id INT NOT NULL,
    PRIMARY KEY (producto_id, categoria_id),
    CONSTRAINT fk_pc_producto FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    CONSTRAINT fk_pc_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    woocommerce_id INT UNIQUE,
    username VARCHAR(60) DEFAULT '',
    first_name VARCHAR(120) DEFAULT '',
    last_name VARCHAR(120) DEFAULT '',
    email VARCHAR(190) DEFAULT '',
    phone VARCHAR(40) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_clientes_email (email)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS ordenes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    woocommerce_id INT UNIQUE,
    cliente_id INT NULL,
    cliente_nombre VARCHAR(255) DEFAULT '',
    telefono VARCHAR(40) DEFAULT '',
    status VARCHAR(30) DEFAULT 'processing',
    total DECIMAL(15,2) DEFAULT 0,
    customer_note TEXT,
    fecha DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_ordenes_cliente (cliente_id),
    INDEX idx_ordenes_fecha (fecha),
    CONSTRAINT fk_orden_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS orden_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    orden_id INT NOT NULL,
    producto_id INT NULL,
    name VARCHAR(255) DEFAULT '',
    sku VARCHAR(100) DEFAULT '',
    price DECIMAL(15,2) DEFAULT 0,
    quantity INT DEFAULT 0,
    total DECIMAL(15,2) DEFAULT 0,
    INDEX idx_oi_orden (orden_id),
    CONSTRAINT fk_oi_orden FOREIGN KEY (orden_id) REFERENCES ordenes(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
];

export async function initDb() {
  if (!dbDisponible) return false;
  const p = getPool();
  const conn = await p.getConnection();
  try {
    for (const sql of SCHEMA) {
      await conn.query(sql);
    }
    return true;
  } finally {
    conn.release();
  }
}

export async function query(sql, params = []) {
  const p = getPool();
  if (!p) throw new Error("MySQL no configurado");
  const [rows] = await p.execute(sql, params);
  return rows;
}
