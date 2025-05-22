import { Request, Response } from 'express';
import { eventService } from '../services/eventService';

export const eventController = {
    async createEvent(req: Request, res: Response): Promise<void> {
        const { nombre, descripcion, fecha, inicio, fin, location } = req.body;

        if (!nombre || !fecha || !inicio || !fin || !location) {
            res.status(400).json({ error: 'Faltan campos requeridos' });
            return;
        }

        try {
            const newEvent = await eventService.createEvent({
                nombre,
                descripcion,
                fecha,
                inicio,
                fin,
                location
            });

            console.log('✅ Evento creado:', newEvent);
            res.status(201).json(newEvent);
        } catch (error: any) {
            console.error('❌ Error creando el evento:', error.response?.data || error.message);
            res.status(500).json({ error: 'Error al crear el evento' });
        }
    },

    async getEvents(req: Request, res: Response): Promise<void> {
        try {
            const events = await eventService.getEvents();
            res.json(events);
        } catch (error: any) {
            console.error('❌ Error obteniendo eventos:', error.response?.data || error.message);
            res.status(500).json({ error: 'Error al obtener los eventos' });
        }
    },

    async deleteEvent(req: Request, res: Response): Promise<void> {
        const { id } = req.params;

        if (!id) {
            res.status(400).json({ error: 'ID del evento requerido' });
            return;
        }

        try {
            await eventService.deleteEvent(id);
            res.status(204).send();
        } catch (error: any) {
            console.error('❌ Error eliminando el evento:', error.response?.data || error.message);
            res.status(500).json({ error: 'Error al eliminar el evento' });
        }
    }
}; 