import mongoose from "mongoose";

const peticionSchema = new mongoose.Schema({
  eventoId: { type: String, required: true }, // Referencia al evento
  cancionId: String, // ID de Spotify o nombre de la canción
  nombreUsuario: String, // Opcional, nombre del usuario que mandó la petición
  esPremium: { type: Boolean, default: false }, // Si la petición es premium
  fechaCreacion: Number, // Fecha y hora en la que se creó la petición
});

const Peticion = mongoose.model("Peticion", peticionSchema);

export default Peticion;
