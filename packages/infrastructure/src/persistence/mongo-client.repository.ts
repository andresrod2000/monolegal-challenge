import mongoose, { Schema, type Document, type Model } from 'mongoose';
import { Client, type ClientProps, type IClientRepository } from '@monolegal/domain';
import { ClientNotFoundError } from '@monolegal/domain';

export interface ClientDocument extends Document {
  clientId: string;
  name: string;
  email: string;
}

const clientSchema = new Schema<ClientDocument>(
  {
    clientId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

function getClientModel(): Model<ClientDocument> {
  return (
    (mongoose.models.Client as Model<ClientDocument>) ||
    mongoose.model<ClientDocument>('Client', clientSchema)
  );
}

function toClientProps(doc: ClientDocument): ClientProps {
  return {
    id: doc.clientId,
    name: doc.name,
    email: doc.email,
  };
}

function toDomain(doc: ClientDocument): Client {
  return Client.fromProps(toClientProps(doc));
}

export class MongoClientRepository implements IClientRepository {
  private readonly model = getClientModel();

  async findAll(): Promise<Client[]> {
    const docs = await this.model.find().sort({ name: 1 }).exec();
    return docs.map(toDomain);
  }

  async findById(id: string): Promise<Client | null> {
    const doc = await this.model.findOne({ clientId: id }).exec();
    return doc ? toDomain(doc) : null;
  }

  async create(props: ClientProps): Promise<Client> {
    const doc = await this.model.create({
      clientId: props.id,
      name: props.name,
      email: props.email,
    });
    return toDomain(doc);
  }

  async update(id: string, props: Partial<Pick<ClientProps, 'name' | 'email'>>): Promise<Client> {
    const doc = await this.model
      .findOneAndUpdate({ clientId: id }, { $set: props }, { new: true })
      .exec();
    if (!doc) {
      throw new ClientNotFoundError(`Client not found: ${id}`);
    }
    return toDomain(doc);
  }

  async delete(id: string): Promise<void> {
    const result = await this.model.deleteOne({ clientId: id }).exec();
    if (result.deletedCount === 0) {
      throw new ClientNotFoundError(`Client not found: ${id}`);
    }
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.model.countDocuments({ clientId: id }).exec();
    return count > 0;
  }
}

export { clientSchema, getClientModel };
