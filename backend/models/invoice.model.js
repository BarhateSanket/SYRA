import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  invoiceNumber: {
    type: String,
    required: true
  },
  billingPeriod: {
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      required: true
    }
  },
  amount: {
    type: Number,
    required: true // Amount in paisa
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['draft', 'open', 'paid', 'void', 'uncollectible'],
    default: 'draft'
  },
  dueDate: {
    type: Date,
    required: true
  },
  paidAt: {
    type: Date
  },
  pdfUrl: {
    type: String
  },
  items: [{
    description: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      default: 1
    }
  }],
  taxAmount: {
    type: Number,
    default: 0
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, { timestamps: true });

// Indexes
invoiceSchema.index({ userId: 1, createdAt: -1 });
invoiceSchema.index({ subscriptionId: 1 });
invoiceSchema.index({ invoiceNumber: 1 }, { unique: true });
invoiceSchema.index({ status: 1, dueDate: 1 });

const Invoice = mongoose.model("Invoice", invoiceSchema);
export default Invoice;
