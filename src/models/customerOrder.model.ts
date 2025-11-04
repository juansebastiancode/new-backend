import mongoose, { Schema } from 'mongoose';

const customerOrderSchema = new mongoose.Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
  customerNombre: { type: String, default: '' }, // Nombre del cliente
  productos: { type: String, default: '' }, // Productos o servicios solicitados
  fecha: { type: String, required: true }, // YYYY-MM-DD
  hora: { type: String, required: true }, // HH:mm
  cantidad: { type: Number, required: true },
  entrega: { type: String, default: '' }, // YYYY-MM-DD opcional (fecha de entrega)
  notas: { type: String, default: '' },
  estado: { type: String, enum: ['pendiente', 'enviado', 'completado', 'cancelado'], default: 'pendiente', index: true },
  facturaPdf: { type: String, default: '' }, // Nombre del archivo PDF de la factura
  eliminado: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const CustomerOrder = mongoose.model('CustomerOrder', customerOrderSchema);

export default CustomerOrder;

