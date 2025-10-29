import { Router } from 'express';
import { createProject, getProjectsByUser, getProjectById, updateProject } from '../controllers/projectController';
import { listAnnotations, createAnnotation, deleteAnnotation } from '../controllers/mapAnnotation.controller';

const router = Router();

router.post('/projects', createProject);
router.get('/projects/user/:userId', getProjectsByUser);
router.get('/projects/:projectId', getProjectById);
router.put('/projects/:projectId', updateProject);
// Map annotations
router.get('/projects/:projectId/annotations', listAnnotations);
router.post('/projects/:projectId/annotations', createAnnotation);
router.delete('/projects/:projectId/annotations/:id', deleteAnnotation);

export default router;


