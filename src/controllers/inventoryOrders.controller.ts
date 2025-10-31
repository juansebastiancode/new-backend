import { Request, Response } from 'express';
import InventoryOrder from '../models/inventoryOrder.model';

export const createInventoryOrder = async (req: Request, res: Response) => {
  try {
    const order = new InventoryOrder(req.body);
    const saved = await order.save();
    res.status(201).json({ message: 'Pedido registrado', order: saved });
  } catch (error) {
    console.error('❌ Error creando pedido:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export const listInventoryOrders = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    const query: any = { eliminado: false };
    if (projectId) query.projectId = projectId;
    const orders = await InventoryOrder.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('❌ Error listando pedidos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export const updateInventoryOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const update = req.body || {};
    const updated = await InventoryOrder.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!updated) {
      res.status(404).json({ error: 'Pedido no encontrado' });
      return;
    }
    res.status(200).json(updated);
  } catch (error) {
    console.error('❌ Error actualizando pedido:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}


