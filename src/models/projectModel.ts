import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProject extends Document {
  userId: Types.ObjectId;
  name: string;
  sector: string;
  createdAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  userId: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true, index: true },
  name: { type: String, required: true },
  sector: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

export const ProjectModel = mongoose.model<IProject>('Project', ProjectSchema);


