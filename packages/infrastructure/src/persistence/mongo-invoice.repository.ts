import mongoose, { Schema, type Document, type Model } from 'mongoose';
import { Invoice, type IInvoiceRepository, type InvoiceProps, type InvoiceSummary } from '@monolegal/domain';
import { InvoiceStatus, isValidInvoiceStatus } from '@monolegal/shared';

export interface InvoiceDocument extends Document {
  clientId: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  dueDate: Date;
  status: InvoiceStatus;
}

const invoiceSchema = new Schema<InvoiceDocument>(
  {
    clientId: { type: String, required: true, index: true },
    clientName: { type: String, required: true },
    clientEmail: { type: String, required: true },
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
    clientName: doc.clientName,
    clientEmail: doc.clientEmail,
    amount: doc.amount,
    dueDate: doc.dueDate,
    status: doc.status,
  };
}

function toDomain(doc: InvoiceDocument): Invoice {
  return Invoice.fromProps(toInvoiceProps(doc));
}

function toInvoiceSummary(doc: InvoiceDocument): InvoiceSummary {
  return {
    id: doc._id.toString(),
    clientId: doc.clientId,
    clientName: doc.clientName,
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

  async findAll(): Promise<InvoiceSummary[]> {
    const docs = await this.model.find().sort({ dueDate: -1 }).exec();
    return docs.map(toInvoiceSummary);
  }

  async updateStatus(id: string, status: InvoiceStatus): Promise<void> {
    if (!isValidInvoiceStatus(status)) {
      throw new Error(`Invalid status: ${status}`);
    }
    const result = await this.model.findByIdAndUpdate(id, { status }).exec();
    if (!result) {
      throw new Error(`Invoice not found: ${id}`);
    }
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
