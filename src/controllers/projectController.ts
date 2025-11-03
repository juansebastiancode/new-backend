import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { ProjectModel } from '../models/projectModel';
import Usuario from '../models/usuariosModel';

export const createProject = async (req: Request, res: Response) => {
  try {
    const { name, sector, description, type } = req.body;
    const rawUserId = req.body?.userId ?? req.body?.uid;
    const userId = typeof rawUserId === 'string' ? rawUserId : String(rawUserId || '').trim();
    if (!userId || !name) {
      res.status(400).json({ error: 'userId y name son requeridos' });
      return;
    }
    let userObjectId: mongoose.Types.ObjectId;
    try {
      userObjectId = new mongoose.Types.ObjectId(userId);
    } catch {
      res.status(400).json({ error: 'userId no es un ObjectId válido' });
      return;
    }
    const enabledTabsDefault = [
      'roadmap',
      'tasks',
      'map',
      'events',
      'inventory',
      'suppliers',
      'customers',
      'orders',
      'invoices',
      'statistics'
    ];
    const project = await ProjectModel.create({ userId: userObjectId, name, sector, description, type, enabledTabs: enabledTabsDefault });
    // Añadir referencia al usuario
    await Usuario.findByIdAndUpdate(userObjectId, { $addToSet: { proyectos: project._id } });
    res.status(201).json(project);
  } catch (error: any) {
    console.error('Error creando proyecto:', error);
    res.status(500).json({ error: 'Error al crear proyecto' });
  }
};

export const getProjectsByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      res.status(400).json({ error: 'userId es requerido' });
      return;
    }
    let userObjectId: mongoose.Types.ObjectId;
    try {
      userObjectId = new mongoose.Types.ObjectId(userId);
    } catch {
      res.status(400).json({ error: 'userId no es un ObjectId válido' });
      return;
    }
    const projects = await ProjectModel.find({ userId: userObjectId }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error: any) {
    console.error('Error listando proyectos:', error);
    res.status(500).json({ error: 'Error al listar proyectos' });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params as any;
    if (!projectId) {
      res.status(400).json({ error: 'projectId es requerido' });
      return;
    }
    const proj = await ProjectModel.findById(projectId).lean();
    if (!proj) {
      res.status(404).json({ error: 'Proyecto no encontrado' });
      return;
    }
    res.json(proj);
  } catch (error: any) {
    console.error('Error obteniendo proyecto:', error);
    res.status(500).json({ error: 'Error al obtener proyecto' });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params as any;
    const { name, sector, description, type, enabledTabs } = req.body;
    const update: any = {};
    if (typeof name === 'string') update.name = name;
    if (typeof sector === 'string') update.sector = sector;
    if (typeof description === 'string') update.description = description;
    if (typeof type === 'string') update.type = type;
    if (Array.isArray(enabledTabs)) update.enabledTabs = enabledTabs.filter((x: any) => typeof x === 'string');
    const proj = await ProjectModel.findByIdAndUpdate(projectId, update, { new: true });
    if (!proj) { res.status(404).json({ error: 'Proyecto no encontrado' }); return; }
    res.json(proj);
  } catch (error: any) {
    console.error('Error actualizando proyecto:', error);
    res.status(500).json({ error: 'Error al actualizar proyecto' });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params as any;
    if (!projectId) {
      res.status(400).json({ error: 'projectId es requerido' });
      return;
    }
    const deleted = await ProjectModel.findByIdAndDelete(projectId);
    if (!deleted) {
      res.status(404).json({ error: 'Proyecto no encontrado' });
      return;
    }
    // Opcional: Quitar referencia en usuarios
    await Usuario.updateMany({ proyectos: projectId }, { $pull: { proyectos: projectId } });
    res.status(204).send();
  } catch (error: any) {
    console.error('Error eliminando proyecto:', error);
    res.status(500).json({ error: 'Error al eliminar proyecto' });
  }
};


