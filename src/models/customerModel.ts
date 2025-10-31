import mongoose, { Schema } from 'mongoose';

const customerSchema = new mongoose.Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true }, // Referencia al proyecto
  nombre: { type: String, required: true }, // Nombre del cliente
  email: { type: String }, // Email de contacto
  telefono: { type: String }, // Teléfono de contacto
  ubicacion: { type: String }, // Dirección o ubicación
  ciudad: { type: String }, // Ciudad
  pais: { type: String }, // País
  notas: { type: String }, // Notas adicionales
  esCliente: { type: Boolean, default: true }, // true para cliente, false para lead
  activo: { type: Boolean, default: true }, // Si está activo
  eliminado: { type: Boolean, default: false }, // Si fue eliminado
  fechaCreacion: { type: Date, default: Date.now }, // Fecha de creación
});

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;

