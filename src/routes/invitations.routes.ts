import { Router } from 'express';
import {
  createInvitation,
  getInvitationsByProject,
  getInvitationsByUser,
  acceptInvitation,
  rejectInvitation,
  getProjectMembers,
  leaveProject
} from '../controllers/invitations.controller';

const router = Router();

router.post('/invitations', createInvitation);
router.get('/invitations/by-project', getInvitationsByProject);
router.get('/invitations/by-user', getInvitationsByUser);
router.post('/invitations/:id/accept', acceptInvitation);
router.post('/invitations/:id/reject', rejectInvitation);
router.get('/invitations/members', getProjectMembers);
router.post('/invitations/leave-project', leaveProject);

export default router;

