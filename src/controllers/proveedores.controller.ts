import { Request, Response } from 'express';
import Proveedor from '../models/proveedorModel';

export const createProveedor = async (req: Request, res: Response) => {
  try {
    const { projectId, nombre, email, telefono, ubicacion, ciudad, pais, notas } = req.body;

    const nuevo = new Proveedor({
      projectId,
      nombre,
      email: email || '',
      telefono: telefono || '',
      ubicacion: ubicacion || '',
      ciudad: ciudad || '',
      pais: pais || '',
      notas: notas || '',
      activo: true,
      eliminado: false
    });

    const guardado = await nuevo.save();
    res.status(201).json({ message: 'Proveedor creado exitosamente', proveedor: guardado });
  } catch (error) {
    console.error('❌ Error al crear proveedor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getProveedores = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    const query: any = { eliminado: false };
    if (projectId) query.projectId = projectId;
    const proveedores = await Proveedor.find(query).sort({ fechaCreacion: -1 });
    res.status(200).json(proveedores);
  } catch (error) {
    console.error('❌ Error al obtener proveedores:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const updateProveedor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const actualizado = await Proveedor.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!actualizado) { res.status(404).json({ error: 'Proveedor no encontrado' }); return; }
    res.status(200).json({ message: 'Proveedor actualizado exitosamente', proveedor: actualizado });
  } catch (error) {
    console.error('❌ Error al actualizar proveedor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const deleteProveedor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const eliminado = await Proveedor.findByIdAndUpdate(id, { eliminado: true, activo: false }, { new: true });
    if (!eliminado) { res.status(404).json({ error: 'Proveedor no encontrado' }); return; }
    res.status(200).json({ message: 'Proveedor eliminado exitosamente', proveedor: eliminado });
  } catch (error) {
    console.error('❌ Error al eliminar proveedor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};



