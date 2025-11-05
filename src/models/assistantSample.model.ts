import mongoose, { Schema } from 'mongoose';

const assistantSampleSchema = new mongoose.Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const AssistantSample = mongoose.model('AssistantSample', assistantSampleSchema);
export default AssistantSample;



