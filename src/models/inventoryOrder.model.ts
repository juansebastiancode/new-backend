import mongoose, { Schema } from 'mongoose';

const inventoryOrderSchema = new mongoose.Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  itemId: { type: Schema.Types.ObjectId, ref: 'InventoryItem' },
  itemNombre: { type: String, default: '' }, // Ahora opcional
  proveedor: { type: String, default: '' }, // Ahora opcional
  fecha: { type: String, required: true }, // YYYY-MM-DD
  hora: { type: String, required: true }, // HH:mm
  cantidad: { type: Number, required: true },
  llegada: { type: String, default: '' }, // YYYY-MM-DD opcional
  notas: { type: String, default: '' },
  estado: { type: String, enum: ['pendiente', 'completado', 'cancelado'], default: 'pendiente', index: true },
  facturaPdf: { type: String, default: '' }, // Nombre del archivo PDF de la factura (una sola factura por pedido)
  eliminado: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const InventoryOrder = mongoose.model('InventoryOrder', inventoryOrderSchema);

export default InventoryOrder;


