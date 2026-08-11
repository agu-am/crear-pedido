export const formatearFecha = (fechaYHora) => {
    const fecha = new Date(fechaYHora);
    const fechaString = fecha.toISOString().split('T')[0];
    return fechaString
}

export const formatearHora = (fechaYHora) => { 
    const fecha = new Date(fechaYHora);
    const horaString = fecha.toTimeString().split(' ')[0];
    return horaString
}

export const formatearMoneda = (valor) => {
    const n = Number(valor || 0);
    return "$" + n.toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}
