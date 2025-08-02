import { Schema, model, Document } from 'mongoose';

export interface Restaurante extends Document {
  nome: string;
}

const RestauranteSchema = new Schema<Restaurante>({
  nome: { type: String, required: true, unique: true }
});

export default model<Restaurante>('Restaurante', RestauranteSchema);
