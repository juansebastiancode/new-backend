import mongoose, { Schema } from 'mongoose';

const proveedorSchema = new mongoose.Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  nombre: { type: String, required: true },
  email: { type: String },
  telefono: { type: String },
  ubicacion: { type: String },
  ciudad: { type: String },
  pais: { type: String },
  notas: { type: String },
  activo: { type: Boolean, default: true },
  eliminado: { type: Boolean, default: false },
  fechaCreacion: { type: Date, default: Date.now },
});

const Proveedor = mongoose.model('Proveedor', proveedorSchema);

export default Proveedor;



