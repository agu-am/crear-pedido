const WC_URL = (process.env.WC_URL || "").replace(/\/+$/, "");

const basicAuth = () =>
  "Basic " +
  Buffer.from(
    `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
  ).toString("base64");

async function wcFetchRaw(path, { method = "GET", query = {}, body } = {}) {
  const url = new URL(`${WC_URL}/wp-json/wc/v3/${path}`);
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
  });

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: basicAuth(),
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const err = new Error(
      data?.message || data?.data?.message || `WooCommerce ${res.status}`
    );
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return { data, res };
}

export async function wcFetch(path, opts = {}) {
  const { data } = await wcFetchRaw(path, opts);
  return data;
}

export async function wcFetchPaginado(path, opts = {}) {
  const { data, res } = await wcFetchRaw(path, opts);
  return {
    items: data,
    page: Number(opts.query?.page || 1),
    totalPages: Number(res.headers.get("x-wp-totalpages") || 0),
  };
}

export async function wcFetchConTotal(path, opts = {}) {
  const { data, res } = await wcFetchRaw(path, opts);
  return {
    data,
    total: Number(res.headers.get("x-wp-total") || 0),
    totalPages: Number(res.headers.get("x-wp-totalpages") || 0),
  };
}

export async function validarCredenciales(username, password) {
  const tokenUrl = process.env.JWT_TOKEN_URL;
  if (!tokenUrl) {
    const err = new Error("JWT_TOKEN_URL no configurado en el servidor");
    err.status = 500;
    throw err;
  }
  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.message || "Credenciales inválidas");
    err.status = res.status;
    throw err;
  }
  return data;
}
