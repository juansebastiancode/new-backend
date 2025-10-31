import { Router } from 'express';
import { 
  createCredential, 
  getCredentials, 
  getCredential, 
  updateCredential, 
  deleteCredential,
  getCredentialPassword
} from '../controllers/credentials.controller';

const router = Router();

router.post('/credentials', createCredential);
router.get('/credentials', getCredentials);
router.get('/credentials/:id', getCredential);
router.put('/credentials/:id', updateCredential);
router.delete('/credentials/:id', deleteCredential);
router.get('/credentials/:id/password', getCredentialPassword);

export default router;

