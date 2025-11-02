import mongoose, { Schema } from 'mongoose';

const invitationSchema = new mongoose.Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  inviterEmail: { type: String, required: true }, // Email de quien invita
  inviteeEmail: { type: String, required: true }, // Email de quien recibe la invitación
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected'], 
    default: 'pending',
    index: true 
  },
  createdAt: { type: Date, default: Date.now },
  respondedAt: { type: Date } // Fecha cuando aceptó o rechazó
});

const Invitation = mongoose.model('Invitation', invitationSchema);

export default Invitation;

