import mongoose, { Schema, Document } from 'mongoose';

export interface IAssistantSettings extends Document {
  projectId: mongoose.Types.ObjectId;
  systemInstructions: string;
  createdAt: Date;
  updatedAt: Date;
}

const assistantSettingsSchema = new Schema<IAssistantSettings>({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, unique: true, index: true },
  systemInstructions: { type: String, default: '' }
}, { timestamps: true });

const AssistantSettings = mongoose.model<IAssistantSettings>('AssistantSettings', assistantSettingsSchema);
export default AssistantSettings;


