import { Request, Response } from 'express';
import Customer from '../models/customerModel';

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const { projectId, nombre, email, telefono, ubicacion, ciudad, pais, notas, esCliente } = req.body;
    
    const newCustomer = new Customer({
      projectId,
      nombre,
      email: email || '',
      telefono: telefono || '',
      ubicacion: ubicacion || '',
      ciudad: ciudad || '',
      pais: pais || '',
      notas: notas || '',
      esCliente: esCliente !== undefined ? esCliente : true,
      activo: true,
      eliminado: false
    });

    const savedCustomer = await newCustomer.save();
    console.log('✅ Cliente guardado:', savedCustomer.nombre);
    
    res.status(201).json({ 
      message: 'Cliente creado exitosamente', 
      customer: savedCustomer 
    });
  } catch (error: any) {
    console.error('❌ Error al crear cliente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const { projectId, esCliente } = req.query;
    
    const query: any = { eliminado: false };
    if (projectId) query.projectId = projectId;
    if (esCliente !== undefined) query.esCliente = esCliente === 'true';
    
    const customers = await Customer.find(query).sort({ fechaCreacion: -1 });
    
    res.status(200).json(customers);
  } catch (error: any) {
    console.error('❌ Error al obtener clientes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedCustomer) {
      res.status(404).json({ error: 'Cliente no encontrado' });
      return;
    }
    
    console.log('✅ Cliente actualizado:', updatedCustomer.nombre);
    res.status(200).json({ 
      message: 'Cliente actualizado exitosamente', 
      customer: updatedCustomer 
    });
  } catch (error: any) {
    console.error('❌ Error al actualizar cliente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const deletedCustomer = await Customer.findByIdAndUpdate(
      id,
      { eliminado: true, activo: false },
      { new: true }
    );
    
    if (!deletedCustomer) {
      res.status(404).json({ error: 'Cliente no encontrado' });
      return;
    }
    
    console.log('✅ Cliente eliminado:', deletedCustomer.nombre);
    res.status(200).json({ 
      message: 'Cliente eliminado exitosamente', 
      customer: deletedCustomer 
    });
  } catch (error: any) {
    console.error('❌ Error al eliminar cliente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

