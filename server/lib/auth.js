import jwt from "jsonwebtoken";

export function emitirToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "8h" });
}

export function verificarToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

export function authRequerido(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: "No autorizado" });
  }
  try {
    req.usuario = verificarToken(token);
    next();
  } catch {
    return res.status(401).json({ message: "Sesión inválida o expirada" });
  }
}
