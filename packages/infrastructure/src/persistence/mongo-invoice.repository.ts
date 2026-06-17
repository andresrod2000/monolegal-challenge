import mongoose, { Schema, type Document, type Model } from 'mongoose';
import {
  Invoice,
  InvoiceNotFoundError,
  type IInvoiceRepository,
  type InvoiceProps,
  type InvoiceSummary,
  type InvoiceUpdateProps,
} from '@monolegal/domain';
import { InvoiceStatus, isValidInvoiceStatus } from '@monolegal/shared';
import { getClientModel } from './mongo-client.repository.js';

export interface InvoiceDocument extends Document {
  clientId: string;
  invoiceNumber: string;
  concept: string;
  amount: number;
  dueDate: Date;
  status: InvoiceStatus;
}

const invoiceSchema = new Schema<InvoiceDocument>(
  {
    clientId: { type: String, required: true, index: true },
    invoiceNumber: { type: String, required: true, unique: true },
    concept: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      required: true,
      enum: Object.values(InvoiceStatus),
      index: true,
    },
  },
  { timestamps: true },
);

invoiceSchema.index({ status: 1, clientId: 1 });
invoiceSchema.index({ status: 1, dueDate: 1 });

function getInvoiceModel(): Model<InvoiceDocument> {
  return (
    (mongoose.models.Invoice as Model<InvoiceDocument>) ||
    mongoose.model<InvoiceDocument>('Invoice', invoiceSchema)
  );
}

function toInvoiceProps(doc: InvoiceDocument): InvoiceProps {
  return {
    id: doc._id.toString(),
    clientId: doc.clientId,
    invoiceNumber: doc.invoiceNumber,
    concept: doc.concept,
    amount: doc.amount,
    dueDate: doc.dueDate,
    status: doc.status,
  };
}

function toDomain(doc: InvoiceDocument): Invoice {
  return Invoice.fromProps(toInvoiceProps(doc));
}

interface SummaryAggregationResult {
  _id: mongoose.Types.ObjectId;
  clientId: string;
  invoiceNumber: string;
  concept: string;
  amount: number;
  dueDate: Date;
  status: InvoiceStatus;
  client?: { name: string; email: string }[];
}

function toInvoiceSummary(doc: SummaryAggregationResult): InvoiceSummary {
  const client = doc.client?.[0];
  return {
    id: doc._id.toString(),
    clientId: doc.clientId,
    clientName: client?.name ?? 'Unknown',
    clientEmail: client?.email ?? '',
    invoiceNumber: doc.invoiceNumber,
    concept: doc.concept,
    amount: doc.amount,
    dueDate: doc.dueDate,
    status: doc.status,
  };
}

export class MongoInvoiceRepository implements IInvoiceRepository {
  private readonly model = getInvoiceModel();

  async findByStatus(statuses: InvoiceStatus[]): Promise<Invoice[]> {
    const docs = await this.model.find({ status: { $in: statuses } }).exec();
    return docs.map(toDomain);
  }

  async findByStatusAndDueDateBefore(
    status: InvoiceStatus,
    dueDateBefore: Date,
  ): Promise<Invoice[]> {
    const docs = await this.model.find({ status, dueDate: { $lt: dueDateBefore } }).exec();
    return docs.map(toDomain);
  }

  async findAllSummaries(): Promise<InvoiceSummary[]> {
    const clientCollection = getClientModel().collection.name;
    const docs = await this.model
      .aggregate<SummaryAggregationResult>([
        { $sort: { dueDate: -1 } },
        {
          $lookup: {
            from: clientCollection,
            localField: 'clientId',
            foreignField: 'clientId',
            as: 'client',
          },
        },
      ])
      .exec();
    return docs.map(toInvoiceSummary);
  }

  async findById(id: string): Promise<Invoice | null> {
    const doc = await this.model.findById(id).exec();
    return doc ? toDomain(doc) : null;
  }

  async findByClientId(clientId: string): Promise<Invoice[]> {
    const docs = await this.model.find({ clientId }).exec();
    return docs.map(toDomain);
  }

  async create(props: Omit<InvoiceProps, 'id'>): Promise<Invoice> {
    const doc = await this.model.create(props);
    return toDomain(doc);
  }

  async update(id: string, props: InvoiceUpdateProps): Promise<Invoice> {
    const doc = await this.model.findByIdAndUpdate(id, { $set: props }, { new: true }).exec();
    if (!doc) {
      throw new InvoiceNotFoundError(`Invoice not found: ${id}`);
    }
    return toDomain(doc);
  }

  async delete(id: string): Promise<void> {
    const result = await this.model.findByIdAndDelete(id).exec();
    if (!result) {
      throw new InvoiceNotFoundError(`Invoice not found: ${id}`);
    }
  }

  async updateStatus(id: string, status: InvoiceStatus): Promise<void> {
    if (!isValidInvoiceStatus(status)) {
      throw new Error(`Invalid status: ${status}`);
    }
    const result = await this.model.findByIdAndUpdate(id, { status }).exec();
    if (!result) {
      throw new InvoiceNotFoundError(`Invoice not found: ${id}`);
    }
  }

  async countByYear(year: number): Promise<number> {
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);
    return this.model.countDocuments({ dueDate: { $gte: start, $lt: end } }).exec();
  }
}

export async function connectMongoDB(uri: string): Promise<void> {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(uri);
}

export async function disconnectMongoDB(): Promise<void> {
  await mongoose.disconnect();
}

export { invoiceSchema, getInvoiceModel };
