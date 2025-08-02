import { Schema, model, Document } from 'mongoose';

export interface Cliente extends Document {
  nome: string;
  telefone: string;
}

const ClienteSchema = new Schema<Cliente>({
  nome: { type: String, required: true },
  telefone: { type: String, required: true, unique: true }
});

export default model<Cliente>('Cliente', ClienteSchema);
