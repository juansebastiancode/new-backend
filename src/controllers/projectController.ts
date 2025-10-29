import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { ProjectModel } from '../models/projectModel';
import Usuario from '../models/usuariosModel';

export const createProject = async (req: Request, res: Response) => {
  try {
    const { name, sector } = req.body;
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
    const project = await ProjectModel.create({ userId: userObjectId, name, sector });
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


