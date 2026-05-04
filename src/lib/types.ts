export type Role =
  | "Super Admin"
  | "Branch Manager"
  | "Sales Rep"
  | "Cashier"
  | "Accountant"
  | "Procurement Officer"
  | "Auditor";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  branch: string;
  active: boolean;
}

export type CustomerType = "Hospital" | "Lab" | "University" | "Walk-in";
export type CreditStatus = "None" | "Pending" | "Approved" | "Rejected";

export interface Customer {
  id: string; // CUST-0001
  name: string;
  type: CustomerType;
  phone: string;
  email: string;
  address: string;
  contactPerson: string;
  kraPin?: string;
  notes?: string;
  creditLimit: number;
  outstandingBalance: number;
  creditStatus: CreditStatus;
  createdAt: string;
}

export interface Supplier {
  id: string; // SUP-0001
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  kraPin: string;
  createdAt: string;
}

export type ProductCategory =
  | "Medical Instruments"
  | "Lab Equipment"
  | "Reagents"
  | "Surgical Consumables"
  | "Rapid Diagnostic Kits";

export interface ProductBatch {
  batchNumber: string;
  expiry: string;
  quantity: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  price: number;
  cost: number;
  stock: number;
  reorderLevel: number;
  unit: string;
  batches: ProductBatch[];
}

export interface LineItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  discount?: number;
}

export type PaymentMethod = "Cash" | "M-Pesa" | "Credit" | "Bank";

export interface Sale {
  id: string;
  customerId: string | null;
  customerName: string;
  items: LineItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payment: PaymentMethod;
  cashier: string;
  createdAt: string;
}

export type QuotationStatus = "Draft" | "Sent" | "Accepted" | "Expired";

export interface Quotation {
  id: string; // QTN-0001
  customerId: string;
  customerName: string;
  items: LineItem[];
  total: number;
  validUntil: string;
  status: QuotationStatus;
  createdAt: string;
}

export type InvoiceStatus = "Paid" | "Partial" | "Unpaid" | "Overdue";

export interface Payment {
  id: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  reference?: string;
}

export interface Invoice {
  id: string; // INV-0001
  customerId: string;
  customerName: string;
  items: LineItem[];
  total: number;
  paid: number;
  status: InvoiceStatus;
  dueDate: string;
  createdAt: string;
  payments: Payment[];
  quotationId?: string;
}

export type CreditNoteStatus =
  | "Draft"
  | "Pending Approval"
  | "Approved"
  | "Rejected";

export interface CreditNote {
  id: string; // CN-0001
  invoiceId: string;
  customerId: string;
  customerName: string;
  amount: number;
  reason: string;
  status: CreditNoteStatus;
  createdBy: string;
  approvedBy?: string;
  createdAt: string;
  history: { at: string; by: string; action: string; note?: string }[];
}

export type LPOStatus = "Draft" | "Sent" | "Received";

export interface PurchaseOrder {
  id: string; // LPO-0001
  supplierId: string;
  supplierName: string;
  items: LineItem[];
  total: number;
  status: LPOStatus;
  createdAt: string;
  expectedDate: string;
  grnDate?: string;
}

export interface AuditEntry {
  id: string;
  at: string;
  user: string;
  action: string;
  entity: string;
  details?: string;
}

export interface Notification {
  id: string;
  type: "approval" | "stock" | "expiry" | "info";
  title: string;
  message: string;
  at: string;
  read: boolean;
}