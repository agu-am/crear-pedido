import { toast } from "react-toastify";

const base = {
  position: "top-center",
  autoClose: 2200,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "light",
};

export const notificarExito = (mensaje, opciones = {}) =>
  toast.success(mensaje, { ...base, ...opciones });

export const notificarError = (mensaje, opciones = {}) =>
  toast.error(mensaje, { ...base, ...opciones });

export const notificarInfo = (mensaje, opciones = {}) =>
  toast.info(mensaje, { ...base, ...opciones });
