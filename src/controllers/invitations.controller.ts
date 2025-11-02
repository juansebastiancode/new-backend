import { Request, Response } from 'express';
import Invitation from '../models/invitation.model';
import Usuario from '../models/usuariosModel';
import { ProjectModel } from '../models/projectModel';

export const createInvitation = async (req: Request, res: Response) => {
  try {
    const { projectId, inviterEmail, inviteeEmail } = req.body;

    if (!projectId || !inviterEmail || !inviteeEmail) {
      res.status(400).json({ error: 'Faltan datos requeridos' });
      return;
    }

    // Verificar si el usuario que recibe la invitación existe
    const inviteeUser = await Usuario.findOne({ email: inviteeEmail });
    if (!inviteeUser) {
      res.status(404).json({ error: 'No existe usuario registrado con ese correo' });
      return;
    }

    // Verificar si ya existe una invitación pendiente para este proyecto y usuario
    const existingInvitation = await Invitation.findOne({
      projectId,
      inviteeEmail,
      status: 'pending'
    });

    if (existingInvitation) {
      res.status(400).json({ error: 'Ya existe una invitación pendiente para este usuario' });
      return;
    }

    // Verificar que el invitado no sea ya miembro del proyecto
    const project = await ProjectModel.findById(projectId);
    if (!project) {
      res.status(404).json({ error: 'Proyecto no encontrado' });
      return;
    }

    // Verificar si el usuario ya está en proyectosInvitados del invitado
    if (inviteeUser.proyectosInvitados && inviteeUser.proyectosInvitados.some((pid: any) => pid.toString() === projectId)) {
      // El usuario ya tiene el proyecto en su lista de invitados
      res.status(400).json({ error: 'Este usuario ya es miembro del proyecto' });
      return;
    }

    // Crear la invitación
    const invitation = new Invitation({
      projectId,
      inviterEmail,
      inviteeEmail,
      status: 'pending'
    });

    const savedInvitation = await invitation.save();
    res.status(201).json({ message: 'Invitación creada', invitation: savedInvitation });
  } catch (error: any) {
    console.error('❌ Error creando invitación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getInvitationsByProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    if (!projectId) {
      res.status(400).json({ error: 'projectId requerido' });
      return;
    }

    const invitations = await Invitation.find({ projectId, status: 'pending' })
      .sort({ createdAt: -1 });

    res.status(200).json(invitations);
  } catch (error) {
    console.error('❌ Error obteniendo invitaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getInvitationsByUser = async (req: Request, res: Response) => {
  try {
    const { email } = req.query;
    if (!email) {
      res.status(400).json({ error: 'email requerido' });
      return;
    }

    const invitations = await Invitation.find({ inviteeEmail: email, status: 'pending' })
      .populate('projectId')
      .sort({ createdAt: -1 });

    res.status(200).json(invitations);
  } catch (error) {
    console.error('❌ Error obteniendo invitaciones del usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const acceptInvitation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'email requerido' });
      return;
    }

    const invitation = await Invitation.findById(id);
    if (!invitation) {
      res.status(404).json({ error: 'Invitación no encontrada' });
      return;
    }

    // Verificar que el email coincida con el invitado
    if (invitation.inviteeEmail !== email) {
      res.status(403).json({ error: 'No autorizado para aceptar esta invitación' });
      return;
    }

    // Actualizar invitación
    invitation.status = 'accepted';
    invitation.respondedAt = new Date();
    await invitation.save();

    // Añadir proyecto a proyectosInvitados del usuario
    const user = await Usuario.findOne({ email });
    if (user) {
      if (!user.proyectosInvitados.includes(invitation.projectId)) {
        user.proyectosInvitados.push(invitation.projectId);
        await user.save();
      }
    }

    res.status(200).json({ message: 'Invitación aceptada', invitation });
  } catch (error) {
    console.error('❌ Error aceptando invitación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const rejectInvitation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'email requerido' });
      return;
    }

    const invitation = await Invitation.findById(id);
    if (!invitation) {
      res.status(404).json({ error: 'Invitación no encontrada' });
      return;
    }

    // Verificar que el email coincida con el invitado
    if (invitation.inviteeEmail !== email) {
      res.status(403).json({ error: 'No autorizado para rechazar esta invitación' });
      return;
    }

    // Actualizar invitación
    invitation.status = 'rejected';
    invitation.respondedAt = new Date();
    await invitation.save();

    res.status(200).json({ message: 'Invitación rechazada', invitation });
  } catch (error) {
    console.error('❌ Error rechazando invitación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getProjectMembers = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    if (!projectId) {
      res.status(400).json({ error: 'projectId requerido' });
      return;
    }

    // Primero obtener el proyecto para saber quién es el creador
    const project = await ProjectModel.findById(projectId);
    
    const members = [];
    
    // Agregar el creador del proyecto primero
    if (project && project.userId) {
      const creator = await Usuario.findById(project.userId)
        .select('nombre email instagram telefono pais ciudad');
      if (creator) {
        members.push(creator);
      }
    }

    // Obtener todos los usuarios invitados
    const invitedMembers = await Usuario.find({
      proyectosInvitados: projectId,
      eliminado: false
    }).select('nombre email instagram telefono pais ciudad');

    // Agregar los invitados después del creador
    members.push(...invitedMembers);

    res.status(200).json(members);
  } catch (error) {
    console.error('❌ Error obteniendo miembros del proyecto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const leaveProject = async (req: Request, res: Response) => {
  try {
    const { projectId, email } = req.body;

    if (!projectId || !email) {
      res.status(400).json({ error: 'projectId y email requeridos' });
      return;
    }

    const user = await Usuario.findOne({ email });
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    // Remover el proyecto de proyectosInvitados
    user.proyectosInvitados = user.proyectosInvitados.filter((id: any) => id.toString() !== projectId);
    await user.save();

    res.status(200).json({ message: 'Proyecto abandonado exitosamente' });
  } catch (error) {
    console.error('❌ Error abandonando proyecto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

