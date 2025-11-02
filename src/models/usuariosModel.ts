import mongoose, { Schema } from "mongoose";

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true }, // Nombre del usuario
  email: { type: String, required: true, unique: true }, // Email único
  fechaRegistro: { type: Number }, // Fecha en que se registró
  eliminado: { type: Boolean, default: false }, // Si su cuenta fue eliminada
  instagram: { type: String }, // Instagram del usuario
  telefono: { type: String }, // Teléfono del usuario
  pais: { type: String }, // País del usuario
  ciudad: { type: String }, // Ciudad del usuario
  proyectos: [{ type: Schema.Types.ObjectId, ref: 'Project', default: [] }], // Referencias a proyectos
  proyectosInvitados: [{ type: Schema.Types.ObjectId, ref: 'Project', default: [] }], // Proyectos donde fue invitado
});

const Usuario = mongoose.model("Usuario", usuarioSchema);

export default Usuario;