import mongoose from 'mongoose';
import Event from '../models/eventModel';
import moment from 'moment';

class EventService {
    async createEvent(eventData: {
        nombre: string;
        descripcion: string;
        fecha: string;
        inicio: string;
        fin: string;
        location: string;
    }): Promise<any> {
        try {
            // Convertir fecha y horas a timestamps
            const fechaTimestamp = moment(eventData.fecha).valueOf();
            const inicioTimestamp = moment(eventData.inicio, 'HH:mm').valueOf();
            const finTimestamp = moment(eventData.fin, 'HH:mm').valueOf();

            const event = new Event({
                ...eventData,
                fecha: fechaTimestamp,
                inicio: inicioTimestamp,
                fin: finTimestamp,
                activo: true,
                eliminado: false,
                negocioId: 'default',
                generos: [],
                peticiones: []
            });
            
            const savedEvent = await event.save();
            console.log('✅ Evento creado exitosamente');
            return savedEvent;
        } catch (error: any) {
            console.error('❌ Error en el servicio creando el evento:', error.message);
            throw error;
        }
    }

    async getEvents(): Promise<any[]> {
        try {
            const events = await Event.find({ eliminado: false });
            return events;
        } catch (error: any) {
            console.error('❌ Error obteniendo eventos:', error.message);
            throw error;
        }
    }

    async deleteEvent(eventId: string): Promise<void> {
        try {
            await Event.findByIdAndUpdate(eventId, { eliminado: true });
            console.log('✅ Evento eliminado exitosamente');
        } catch (error: any) {
            console.error('❌ Error eliminando el evento:', error.message);
            throw error;
        }
    }
}

export const eventService = new EventService(); 