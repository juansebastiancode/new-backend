import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMapAnnotation extends Document {
  projectId: Types.ObjectId;
  lat: number;
  lng: number;
  text: string;
  createdAt: Date;
}

const MapAnnotationSchema = new Schema<IMapAnnotation>({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  text: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

export const MapAnnotationModel = mongoose.model<IMapAnnotation>('MapAnnotation', MapAnnotationSchema);


