import { Request, Response } from 'express';
import CustomerOrder from '../models/customerOrder.model';
import Customer from '../models/customerModel';
import path from 'path';
import fs from 'fs';

export const createCustomerOrder = async (req: Request, res: Response) => {
  try {
    const customerNombre = (req.body.customerNombre || '').trim();
    const productos = req.body.productos || '';
    const projectId = req.body.projectId;
    
    let customerId = req.body.customerId;
    
    // Si no hay customerId pero hay customerNombre (no vacío), buscar o crear el cliente
    if (!customerId && customerNombre && projectId) {
      // Buscar si ya existe un cliente con ese nombre en este proyecto
      const existingCustomer = await Customer.findOne({
        projectId: projectId,
        nombre: customerNombre,
        eliminado: false
      });
      
      if (existingCustomer) {
        // Si existe, usar su ID
        customerId = existingCustomer._id;
      } else {
        // Si no existe, crear el cliente automáticamente
        const newCustomer = new Customer({
          projectId: projectId,
          nombre: customerNombre,
          esCliente: true,
          activo: true,
          eliminado: false
        });
        
        const savedCustomer = await newCustomer.save();
        customerId = savedCustomer._id;
        console.log('✅ Cliente creado automáticamente:', savedCustomer.nombre);
      }
    }
    // Si no hay customerNombre, simplemente no se asocia ningún cliente (customerId queda undefined)
    
    const orderData: any = {
      projectId: projectId,
      customerNombre: customerNombre || '',
      productos: productos,
      fecha: req.body.fecha || '',
      hora: req.body.hora || '',
      cantidad: req.body.cantidad ? Number(req.body.cantidad) : 0,
      entrega: req.body.entrega || '',
      notas: req.body.notas || '',
      estado: req.body.estado || 'pendiente'
    };
    
    if (customerId) {
      orderData.customerId = customerId;
    }
    
    if (req.file) {
      orderData.facturaPdf = req.file.filename;
    } else {
      orderData.facturaPdf = '';
    }
    
    const order = new CustomerOrder(orderData);
    const saved = await order.save();
    res.status(201).json({ message: 'Pedido registrado', order: saved });
  } catch (error) {
    console.error('❌ Error creando pedido de cliente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export const listCustomerOrders = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    const query: any = { eliminado: false };
    if (projectId) query.projectId = projectId;
    const orders = await CustomerOrder.find(query).sort({ createdAt: -1 });
    
    const invoicesDir = path.join(__dirname, '../../uploads/invoices');
    const idsToUnset: string[] = [];
    
    const normalizedOrders = orders.map((order: any) => {
      const o = order.toObject();

      if (!o.facturaPdf || typeof o.facturaPdf !== 'string') {
        o.facturaPdf = '';
      }

      if (o.facturaPdf.trim() !== '') {
        const filePath = path.join(invoicesDir, o.facturaPdf);
        if (!fs.existsSync(filePath)) {
          idsToUnset.push(String(o._id));
          o.facturaPdf = '';
        }
      }

      return o;
    });

    if (idsToUnset.length > 0) {
      await CustomerOrder.updateMany({ _id: { $in: idsToUnset } }, { $set: { facturaPdf: '' } });
    }

    res.json(normalizedOrders);
  } catch (error) {
    console.error('❌ Error listando pedidos de clientes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export const updateCustomerOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const update = { ...req.body };
    
    if (req.file) {
      const existingOrder = await CustomerOrder.findById(id);
      if (existingOrder && existingOrder.facturaPdf) {
        const invoicesDir = path.join(__dirname, '../../uploads/invoices');
        const oldFilePath = path.join(invoicesDir, existingOrder.facturaPdf);

        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
          console.log('✅ Factura anterior eliminada:', path.basename(oldFilePath));
        }
      }
      update.facturaPdf = req.file.filename;
    }

    const updated = await CustomerOrder.findByIdAndUpdate(id, update, { new: true, runValidators: true });
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

export const deleteCustomerOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await CustomerOrder.findById(id);
    
    if (!order) {
      res.status(404).json({ error: 'Pedido no encontrado' });
      return;
    }
    
    order.eliminado = true;
    await order.save();
    
    res.status(200).json({ message: 'Pedido eliminado' });
  } catch (error) {
    console.error('❌ Error eliminando pedido:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export const downloadInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await CustomerOrder.findById(id);
    
    if (!order || !order.facturaPdf) {
      res.status(404).json({ error: 'Factura no encontrada' });
      return;
    }
    
    const invoicesDir = path.join(__dirname, '../../uploads/invoices');
    const filePath = path.join(invoicesDir, order.facturaPdf);
    
    if (!fs.existsSync(filePath)) {
      // Buscar archivo similar si el exacto no existe
      const files = fs.readdirSync(invoicesDir);
      const baseName = order.facturaPdf.split('-').slice(0, -1).join('-');
      const similarFile = files.find(f => f.startsWith(baseName));
      
      if (similarFile) {
        const similarFilePath = path.join(invoicesDir, similarFile);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(similarFile)}"`);
        return res.sendFile(path.resolve(similarFilePath));
      }
      
      res.status(404).json({ error: 'Archivo de factura no encontrado' });
      return;
    }
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(order.facturaPdf)}"`);
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    console.error('❌ Error descargando factura:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export const deleteInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await CustomerOrder.findById(id);
    
    if (!order || !order.facturaPdf) {
      res.status(404).json({ error: 'Factura no encontrada' });
      return;
    }
    
    const invoicesDir = path.join(__dirname, '../../uploads/invoices');
    const filePath = path.join(invoicesDir, order.facturaPdf);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('✅ Factura eliminada:', path.basename(filePath));
    } else {
      // Buscar archivo similar si el exacto no existe
      const files = fs.readdirSync(invoicesDir);
      const baseName = order.facturaPdf.split('-').slice(0, -1).join('-');
      const similarFile = files.find(f => f.startsWith(baseName));
      
      if (similarFile) {
        const similarFilePath = path.join(invoicesDir, similarFile);
        fs.unlinkSync(similarFilePath);
        console.log('✅ Factura similar eliminada:', similarFile);
      }
    }
    
    order.facturaPdf = '';
    await order.save();
    
    res.status(200).json({ message: 'Factura eliminada' });
  } catch (error) {
    console.error('❌ Error eliminando factura:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

