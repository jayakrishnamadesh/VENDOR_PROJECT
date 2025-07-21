// Vendor Login Model
export interface VendorLogin {
  username: string;
  password: string;
}

export interface VendorLoginResponse {
  success: boolean;
  message: string;
  vendorId?: string;
  token?: string;
}

// Vendor Profile Model
export interface VendorProfile {
  vendorId: string;
  vendorName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  taxId: string;
  bankAccount: string;
  paymentTerms: string;
  createdDate: string;
  status: string;
}

// RFQ Model
export interface RFQ {
  rfqId: string;
  rfqNumber: string;
  description: string;
  requestDate: string;
  dueDate: string;
  status: string;
  totalAmount: number;
  currency: string;
  items: RFQItem[];
}

export interface RFQItem {
  itemId: string;
  materialId: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

// Purchase Order Model
export interface PurchaseOrder {
  poId: string;
  poNumber: string;
  vendorId: string;
  description: string;
  orderDate: string;
  deliveryDate: string;
  status: string;
  totalAmount: number;
  currency: string;
  items: POItem[];
}

export interface POItem {
  itemId: string;
  materialId: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  deliveredQty: number;
  pendingQty: number;
}

// Goods Receipt Model
export interface GoodsReceipt {
  grId: string;
  grNumber: string;
  poId: string;
  poNumber: string;
  receiptDate: string;
  status: string;
  items: GRItem[];
}

export interface GRItem {
  itemId: string;
  materialId: string;
  description: string;
  orderedQty: number;
  receivedQty: number;
  unit: string;
  storageLocation: string;
}

// Invoice Model
export interface Invoice {
  invoiceId: string;
  invoiceNumber: string;
  vendorId: string;
  poId: string;
  invoiceDate: string;
  dueDate: string;
  status: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  currency: string;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  itemId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxAmount: number;
}

// Payment Model
export interface Payment {
  paymentId: string;
  vendorId: string;
  invoiceId: string;
  paymentDate: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  referenceNumber: string;
}

// Aging Model
export interface Aging {
  vendorId: string;
  invoiceId: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  daysOverdue: number;
  agingBucket: string;
  currency: string;
}

// Common Response Model
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
}