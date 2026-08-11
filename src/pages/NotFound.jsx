import { Link } from "react-router-dom";
import { FaExclamationCircle } from "react-icons/fa";

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas-soft px-4 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-canvas text-ink shadow-card">
        <FaExclamationCircle size="1.8rem" />
      </span>
      <h1 className="mt-5 text-2xl font-bold text-ink">Página no encontrada</h1>
      <p className="mt-2 text-sm text-mute">La página que buscás no existe.</p>
      <Link
        to="/"
        className="mt-6 rounded-3xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
      >
        Volver al inicio
      </Link>
    </div>
  );
};

export default NotFound;
