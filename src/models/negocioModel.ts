import mongoose from "mongoose";

const negocioSchema = new mongoose.Schema({
  nombre: { type: String, required: true }, // Nombre del negocio
  descripcion: { type: String }, // Descripción opcional
  imagen: { type: String }, 
  ubicacion: { type: String }, // Dirección o ubicación
  contacto_telefono: { type: String }, // Número de contacto
  contacto_correo: { type: String }, // Email del negocio
  contacto_nombre: { type: String },
  activo: { type: Boolean, default: true }, // Si el negocio está activo
  eliminado: { type: Boolean, default: false }, // Si el negocio está eliminado
  fechaCreacion: { type: Number }, // Fecha en que se creó el negocio
});

const Negocio = mongoose.model("Negocio", negocioSchema);

export default Negocio;
