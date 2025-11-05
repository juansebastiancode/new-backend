import mongoose, { Schema } from 'mongoose';

const inventoryItemSchema = new mongoose.Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  nombre: { type: String, required: true }, // Nombre del artículo
  descripcion: { type: String }, // Descripción del artículo
  categoria: { type: String }, // Categoría del artículo
  cantidad: { type: Number, required: true, default: 0 }, // Cantidad en stock
  stockMinimo: { type: Number, default: 0 }, // Stock mínimo antes de alertar
  unidad: { type: String, default: 'unidad' }, // Unidad de medida (unidad, kg, litro, etc.)
  precioUnitario: { type: Number, default: 0 }, // Precio unitario
  proveedor: { type: String }, // Nombre del proveedor
  ubicacion: { type: String }, // Ubicación física del artículo
  codigo: { type: String }, // Código de barras o SKU
  activo: { type: Boolean, default: true },
  eliminado: { type: Boolean, default: false },
  fechaCreacion: { type: Date, default: Date.now },
  fechaActualizacion: { type: Date, default: Date.now }
});

const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);

export default InventoryItem;


