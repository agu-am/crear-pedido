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
