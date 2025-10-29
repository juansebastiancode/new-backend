import { Router } from 'express';
import { createProject, getProjectsByUser } from '../controllers/projectController';

const router = Router();

router.post('/projects', createProject);
router.get('/projects/user/:userId', getProjectsByUser);

export default router;


