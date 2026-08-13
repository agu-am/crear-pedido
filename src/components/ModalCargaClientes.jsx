import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import api from "../helpers/api";
import { RiCloseCircleLine } from "react-icons/ri";
import { FaFileUpload, FaFileDownload } from "react-icons/fa";
import { notificarExito, notificarError } from "../helpers/toast";

const quitarAcentos = (s) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

const normalizar = (raw) => {
  const row = {};
  for (const [k, v] of Object.entries(raw)) {
    row[quitarAcentos(k)] = String(v ?? "").trim();
  }
  return {
    codigo_interno: row.codigointerno || row.codigo || row.cod,
    razon_social: row.razonsocial || row.razon || row.nombre || row.name,
    local: row.local,
    email: row.email || row.correo,
    phone: row.telefono || row.phone || row.tel,
  };
};

const ModalCargaClientes = ({ abierto, onCerrar, onAplicado }) => {
  const fileRef = useRef(null);
  const [filas, setFilas] = useState([]);
  const [preview, setPreview] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [aplicando, setAplicando] = useState(false);
  const [nombreArchivo, setNombreArchivo] = useState("");

  if (!abierto) return null;

  const handleArchivo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCargando(true);
    setPreview(null);
    setNombreArchivo(file.name);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf);
      const hoja = wb.Sheets[wb.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json(hoja, { defval: "" });
      const filas = raw.map(normalizar).filter((r) => r.codigo_interno || r.razon_social);
      setFilas(filas);
      if (!filas.length) {
        notificarError("No se encontraron filas válidas en el archivo");
        setCargando(false);
        return;
      }
      const { data } = await api.post("/admin/clientes/preview", { clientes: filas });
      setPreview(data);
    } catch (err) {
      notificarError(err?.response?.data?.message || "No se pudo leer el archivo");
    } finally {
      setCargando(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const descargarEjemplo = () => {
    const datos = [
      {
        Código: "01538",
        "Razón social": "DARDI NORMA",
        Local: "DISTINCION AV.REAL",
        Email: "ejemplo@dominio.com",
        Teléfono: "3413384599",
      },
      {
        Código: "99999",
        "Razón social": "CLIENTE NUEVO S.A.",
        Local: "LOCAL EJEMPLO",
        Email: "nuevo@dominio.com",
        Teléfono: "",
      },
    ];
    const hoja = XLSX.utils.json_to_sheet(datos);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Clientes");
    XLSX.writeFile(libro, "clientes-ejemplo.xlsx");
  };

  const aplicar = async () => {
    setAplicando(true);
    try {
      const { data } = await api.post("/admin/clientes/aplicar", { clientes: filas });
      notificarExito(`Actualizados ${data.actualizados} · Creados ${data.creados}`);
      setPreview(null);
      setFilas([]);
      onCerrar();
      onAplicado?.();
    } catch (err) {
      notificarError(err?.response?.data?.message || "No se pudieron aplicar los cambios");
    } finally {
      setAplicando(false);
    }
  };

  const total = (preview?.aActualizar?.length || 0) + (preview?.aCrear?.length || 0);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/50" onClick={onCerrar}></div>
      <div className="relative w-full max-w-lg rounded-3xl bg-canvas p-6 shadow-sheet">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Cargar clientes</h2>
          <button onClick={onCerrar} className="text-mute transition hover:text-ink" aria-label="Cerrar">
            <RiCloseCircleLine size="1.5rem" />
          </button>
        </div>

        <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleArchivo} className="hidden" />

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink px-4 py-6 text-sm font-semibold text-ink transition hover:bg-canvas-soft"
        >
          <FaFileUpload size="1.1rem" /> {nombreArchivo || "Seleccionar archivo (Excel / CSV)"}
        </button>

        <button
          type="button"
          onClick={descargarEjemplo}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-canvas-soft px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-canvas"
        >
          <FaFileDownload size="0.9rem" /> Descargar plantilla de ejemplo
        </button>

        {cargando && (
          <p className="mt-4 text-center text-sm text-mute">Analizando archivo...</p>
        )}

        {preview && (
          <div className="mt-5">
            <p className="mb-3 text-sm text-body">
              {nombreArchivo}: {filas.length} filas leídas.
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-positive-pale p-4 text-center">
                <p className="text-2xl font-extrabold text-positive-deep">{preview.aActualizar?.length || 0}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-positive-deep">Actualizar</p>
              </div>
              <div className="rounded-2xl bg-canvas-soft p-4 text-center">
                <p className="text-2xl font-extrabold text-ink">{preview.aCrear?.length || 0}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-mute">Crear nuevos</p>
              </div>
              <div className="rounded-2xl bg-negative-bg p-4 text-center">
                <p className="text-2xl font-extrabold text-white">{preview.errores?.length || 0}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-white">Errores</p>
              </div>
            </div>

            {preview.errores?.length > 0 && (
              <div className="mt-3 max-h-32 overflow-y-auto rounded-xl bg-canvas-soft p-3">
                {preview.errores.slice(0, 20).map((err, i) => (
                  <p key={i} className="text-xs text-body">
                    Fila {err.fila}: {err.motivo}
                  </p>
                ))}
                {preview.errores.length > 20 && (
                  <p className="text-xs text-mute">...y {preview.errores.length - 20} más</p>
                )}
              </div>
            )}

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={onCerrar}
                className="flex-1 rounded-3xl border border-ink py-3 text-sm font-semibold text-ink transition hover:bg-canvas-soft"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={aplicar}
                disabled={aplicando || total === 0}
                className="flex-1 rounded-3xl bg-brand-600 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
              >
                {aplicando ? "Aplicando..." : `Aplicar (${total})`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalCargaClientes;
