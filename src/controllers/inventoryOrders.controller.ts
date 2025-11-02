import { Request, Response } from 'express';
import InventoryOrder from '../models/inventoryOrder.model';
import path from 'path';
import fs from 'fs';

export const createInventoryOrder = async (req: Request, res: Response) => {
  try {
    // Parsear y validar los campos del formulario
    // Multer parsea los campos del FormData en req.body
    const itemNombre = req.body.itemNombre || req.body.articulo || '';
    const proveedor = req.body.proveedor || '';
    
    const orderData: any = {
      projectId: req.body.projectId,
      itemNombre: itemNombre,
      proveedor: proveedor,
      fecha: req.body.fecha || '',
      hora: req.body.hora || '',
      cantidad: req.body.cantidad ? Number(req.body.cantidad) : 0,
      llegada: req.body.llegada || '',
      notas: req.body.notas || '',
      estado: req.body.estado || 'pendiente'
    };
    
    // Si hay un itemId, añadirlo
    if (req.body.itemId) {
      orderData.itemId = req.body.itemId;
    }
    
    // Si hay un archivo subido, guardar el nombre del archivo
    if (req.file) {
      orderData.facturaPdf = req.file.filename;
    } else {
      orderData.facturaPdf = '';
    }
    
    const order = new InventoryOrder(orderData);
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
    
    const invoicesDir = path.join(__dirname, '../../uploads/invoices');
    
    // Normalizar y validar facturas
    const normalizedOrders = orders.map((order: any) => {
      const orderObj = order.toObject();
      
      // Migración: si tiene facturasPdf (array antiguo), tomar el primero
      if (orderObj.facturasPdf && Array.isArray(orderObj.facturasPdf) && orderObj.facturasPdf.length > 0) {
        orderObj.facturaPdf = orderObj.facturasPdf[0];
        // Actualizar BD asíncronamente
        InventoryOrder.findByIdAndUpdate(orderObj._id, { facturaPdf: orderObj.facturaPdf }, { new: true })
          .catch(err => console.error(`❌ Error migrando factura del pedido ${orderObj._id}:`, err));
      }
      
      // Asegurar que facturaPdf es un string
      if (!orderObj.facturaPdf || typeof orderObj.facturaPdf !== 'string') {
        orderObj.facturaPdf = '';
      }
      
      // Validar que la factura existe físicamente
      if (orderObj.facturaPdf && orderObj.facturaPdf.trim() !== '') {
        const filePath = path.join(invoicesDir, orderObj.facturaPdf);
        if (!fs.existsSync(filePath)) {
          // Solo limpiar la referencia si no existe, SIN buscar archivos similares
          console.log(`⚠️ Factura no encontrada físicamente: ${orderObj.facturaPdf} (Pedido ID: ${orderObj._id})`);
          orderObj.facturaPdf = '';
          InventoryOrder.findByIdAndUpdate(orderObj._id, { facturaPdf: '' }, { new: true })
            .catch(err => console.error(`❌ Error limpiando factura del pedido ${orderObj._id}:`, err));
        }
      }
      
      return orderObj;
    });
    
    res.json(normalizedOrders);
  } catch (error) {
    console.error('❌ Error listando pedidos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export const updateInventoryOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const update = { ...req.body };
    
    // Si hay un nuevo archivo subido, reemplazar la factura anterior
    if (req.file) {
      const existingOrder = await InventoryOrder.findById(id);
      // Si hay una factura anterior, eliminarla físicamente
      if (existingOrder && existingOrder.facturaPdf) {
        const invoicesDir = path.join(__dirname, '../../uploads/invoices');
        let oldFilePath = path.join(invoicesDir, existingOrder.facturaPdf);
        
        if (!fs.existsSync(oldFilePath)) {
          // Intentar encontrar un archivo similar
          const dbFilename = existingOrder.facturaPdf;
          try {
            const files = fs.readdirSync(invoicesDir);
            const baseNameMatch = dbFilename.match(/^(.+?)-(\d+)/);
            if (baseNameMatch) {
              const baseName = baseNameMatch[1];
              const firstTimestamp = baseNameMatch[2];
              const foundFile = files.find((f: string) => {
                const fileBaseMatch = f.match(/^(.+?)-(\d+)/);
                if (fileBaseMatch && fileBaseMatch[1] === baseName && fileBaseMatch[2] === firstTimestamp) {
                  return true;
                }
                return false;
              });
              
              if (foundFile) {
                console.log(`✅ Archivo similar encontrado para actualización: ${dbFilename} -> ${foundFile} (Pedido ID: ${id})`);
                oldFilePath = path.join(invoicesDir, foundFile);
              }
            }
          } catch (dirErr) {
            console.error(`❌ Error leyendo directorio de facturas:`, dirErr);
          }
        }
        
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
          console.log('✅ Factura anterior eliminada:', path.basename(oldFilePath));
        }
      }
      // Guardar la nueva factura
      update.facturaPdf = req.file.filename;
    }
    
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

export const downloadInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await InventoryOrder.findById(id);
    
    if (!order) {
      res.status(404).json({ error: 'Pedido no encontrado' });
      return;
    }
    
    if (!order.facturaPdf || order.facturaPdf.trim() === '') {
      res.status(404).json({ error: 'No hay factura asociada a este pedido' });
      return;
    }
    
    const invoicesDir = path.join(__dirname, '../../uploads/invoices');
    let filePath = path.join(invoicesDir, order.facturaPdf);
    
    if (!fs.existsSync(filePath)) {
      // Intentar encontrar un archivo similar
      const dbFilename = order.facturaPdf;
      let foundFile = null;
      
      try {
        const files = fs.readdirSync(invoicesDir);
        const baseNameMatch = dbFilename.match(/^(.+?)-(\d+)/);
        if (baseNameMatch) {
          const baseName = baseNameMatch[1];
          const firstTimestamp = baseNameMatch[2];
          foundFile = files.find((f: string) => {
            const fileBaseMatch = f.match(/^(.+?)-(\d+)/);
            if (fileBaseMatch && fileBaseMatch[1] === baseName && fileBaseMatch[2] === firstTimestamp) {
              return true;
            }
            return false;
          });
          
          if (foundFile) {
            console.log(`✅ Archivo similar encontrado para descarga: ${dbFilename} -> ${foundFile} (Pedido ID: ${id})`);
            filePath = path.join(invoicesDir, foundFile);
          }
        }
      } catch (dirErr) {
        console.error(`❌ Error leyendo directorio de facturas:`, dirErr);
      }
      
      if (!fs.existsSync(filePath)) {
        res.status(404).json({ error: 'Archivo de factura no encontrado' });
        return;
      }
    }
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${path.basename(filePath)}"`);
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    console.error('❌ Error descargando factura:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export const deleteInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await InventoryOrder.findById(id);
    
    if (!order) {
      res.status(404).json({ error: 'Pedido no encontrado' });
      return;
    }
    
    if (!order.facturaPdf || order.facturaPdf.trim() === '') {
      res.status(404).json({ error: 'No hay factura asociada a este pedido' });
      return;
    }
    
    // Eliminar el archivo físico
    const invoicesDir = path.join(__dirname, '../../uploads/invoices');
    let filePath = path.join(invoicesDir, order.facturaPdf);
    
    if (!fs.existsSync(filePath)) {
      // Intentar encontrar un archivo similar
      const dbFilename = order.facturaPdf;
      try {
        const files = fs.readdirSync(invoicesDir);
        const baseNameMatch = dbFilename.match(/^(.+?)-(\d+)/);
        if (baseNameMatch) {
          const baseName = baseNameMatch[1];
          const firstTimestamp = baseNameMatch[2];
          const foundFile = files.find((f: string) => {
            const fileBaseMatch = f.match(/^(.+?)-(\d+)/);
            if (fileBaseMatch && fileBaseMatch[1] === baseName && fileBaseMatch[2] === firstTimestamp) {
              return true;
            }
            return false;
          });
          
          if (foundFile) {
            console.log(`✅ Archivo similar encontrado para eliminación: ${dbFilename} -> ${foundFile} (Pedido ID: ${id})`);
            filePath = path.join(invoicesDir, foundFile);
          }
        }
      } catch (dirErr) {
        console.error(`❌ Error leyendo directorio de facturas:`, dirErr);
      }
    }
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('✅ Archivo físico eliminado:', path.basename(filePath));
    }
    
    // Limpiar la referencia en la BD
    order.facturaPdf = '';
    await order.save();
    
    res.status(200).json({ message: 'Factura eliminada exitosamente', order });
  } catch (error) {
    console.error('❌ Error eliminando factura:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}


