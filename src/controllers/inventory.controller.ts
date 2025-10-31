import { Request, Response } from 'express';
import InventoryItem from '../models/inventoryModel';

export const createInventoryItem = async (req: Request, res: Response) => {
  try {
    const { projectId, nombre, descripcion, categoria, cantidad, stockMinimo, unidad, precioUnitario, proveedor, ubicacion, codigo } = req.body;
    
    const newItem = new InventoryItem({
      projectId,
      nombre,
      descripcion: descripcion || '',
      categoria: categoria || '',
      cantidad: cantidad || 0,
      stockMinimo: stockMinimo || 0,
      unidad: unidad || 'unidad',
      precioUnitario: precioUnitario || 0,
      proveedor: proveedor || '',
      ubicacion: ubicacion || '',
      codigo: codigo || '',
      activo: true,
      eliminado: false
    });

    const savedItem = await newItem.save();
    console.log('✅ Artículo de inventario guardado:', savedItem.nombre);
    
    res.status(201).json({ 
      message: 'Artículo creado exitosamente', 
      item: savedItem 
    });
  } catch (error: any) {
    console.error('❌ Error al crear artículo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getInventoryItems = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    
    const query: any = { eliminado: false };
    if (projectId) query.projectId = projectId;
    
    const items = await InventoryItem.find(query).sort({ fechaCreacion: -1 });
    
    res.status(200).json(items);
  } catch (error: any) {
    console.error('❌ Error al obtener artículos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const updateInventoryItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, fechaActualizacion: new Date() };
    
    const updatedItem = await InventoryItem.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedItem) {
      res.status(404).json({ error: 'Artículo no encontrado' });
      return;
    }
    
    console.log('✅ Artículo actualizado:', updatedItem.nombre);
    res.status(200).json({ 
      message: 'Artículo actualizado exitosamente', 
      item: updatedItem 
    });
  } catch (error: any) {
    console.error('❌ Error al actualizar artículo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const deleteInventoryItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const deletedItem = await InventoryItem.findByIdAndUpdate(
      id,
      { eliminado: true, activo: false },
      { new: true }
    );
    
    if (!deletedItem) {
      res.status(404).json({ error: 'Artículo no encontrado' });
      return;
    }
    
    console.log('✅ Artículo eliminado:', deletedItem.nombre);
    res.status(200).json({ 
      message: 'Artículo eliminado exitosamente', 
      item: deletedItem 
    });
  } catch (error: any) {
    console.error('❌ Error al eliminar artículo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

