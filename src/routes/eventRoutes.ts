import { Router } from 'express';
import { eventController } from '../controllers/eventController';

const router = Router();

router.post('/create', eventController.createEvent);
router.get('/', eventController.getEvents);
router.delete('/:id', eventController.deleteEvent);

export default router; 