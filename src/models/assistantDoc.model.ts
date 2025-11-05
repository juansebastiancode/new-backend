import mongoose, { Schema } from 'mongoose';

const assistantDocSchema = new mongoose.Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  text: { type: String, required: true },
  embedding: { type: [Number], required: true },
  metadata: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now }
});

const AssistantDoc = mongoose.model('AssistantDoc', assistantDocSchema);
export default AssistantDoc;



