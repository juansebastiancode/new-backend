import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  nombre: String,
  imagen: String,
  descripcion: String,
  fecha: Number,
  inicio: Number,
  fin: Number,
  location: String,
  activo: Boolean,
  eliminado: Boolean,
  negocioId: String,
  qr_dj: String,
  qr_publico: String,
  generos: [String],
  peticiones: [String],
});

const Event = mongoose.model("Event", eventSchema);

// Exportación del modelo
export default Event;
