import { create } from "zustand";
import {
  seedUsers, seedCustomers, seedSuppliers, seedProducts, seedSales,
  seedQuotations, seedInvoices, seedCreditNotes, seedPOs,
  seedNotifications, seedAudit,
} from "./seed";
import type {
  User, Customer, Supplier, Product, Sale, Quotation, Invoice,
  CreditNote, PurchaseOrder, Notification, AuditEntry, Role,
  LineItem, PaymentMethod, CreditNoteStatus,
} from "./types";
import { padId } from "./format";

interface State {
  currentUser: User;
  branch: string;
  users: User[];
  customers: Customer[];
  suppliers: Supplier[];
  products: Product[];
  sales: Sale[];
  quotations: Quotation[];
  invoices: Invoice[];
  creditNotes: CreditNote[];
  purchaseOrders: PurchaseOrder[];
  notifications: Notification[];
  audit: AuditEntry[];
  setCurrentUser: (u: User) => void;
  addAudit: (a: Omit<AuditEntry, "id" | "at">) => void;
  // sales
  createSale: (s: Omit<Sale, "id" | "createdAt" | "cashier">) => Sale;
  // quotations
  addQuotation: (q: Omit<Quotation, "id" | "createdAt">) => Quotation;
  updateQuotationStatus: (id: string, status: Quotation["status"]) => void;
  convertQuotationToInvoice: (id: string) => Invoice | null;
  // invoices
  addInvoice: (i: Omit<Invoice, "id" | "createdAt" | "payments" | "paid" | "status">) => Invoice;
  recordPayment: (invoiceId: string, amount: number, method: PaymentMethod, reference?: string) => void;
  // credit notes
  addCreditNote: (cn: Omit<CreditNote, "id" | "createdAt" | "history" | "status" | "createdBy">) => CreditNote;
  setCreditNoteStatus: (id: string, status: CreditNoteStatus, note?: string) => void;
  // customers
  addCustomer: (c: Omit<Customer, "id" | "createdAt">) => Customer;
  setCustomerCreditStatus: (id: string, status: Customer["creditStatus"]) => void;
  // suppliers
  addSupplier: (s: Omit<Supplier, "id" | "createdAt">) => Supplier;
  // products
  addProduct: (p: Omit<Product, "id">) => Product;
  // POs
  addPO: (po: Omit<PurchaseOrder, "id" | "createdAt">) => PurchaseOrder;
  receivePO: (id: string) => void;
  // notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  // users
  addUser: (u: Omit<User, "id">) => User;
  toggleUserActive: (id: string) => void;
}

const APPROVE_ROLES: Role[] = ["Super Admin", "Branch Manager", "Accountant"];
export const canApprove = (role: Role) => APPROVE_ROLES.includes(role);
export const canSeeFinance = (role: Role) =>
  ["Super Admin", "Branch Manager", "Accountant", "Auditor"].includes(role);

export const useStore = create<State>((set, get) => ({
  currentUser: seedUsers[0],
  branch: "Nairobi Branch",
  users: seedUsers,
  customers: seedCustomers,
  suppliers: seedSuppliers,
  products: seedProducts,
  sales: seedSales,
  quotations: seedQuotations,
  invoices: seedInvoices,
  creditNotes: seedCreditNotes,
  purchaseOrders: seedPOs,
  notifications: seedNotifications,
  audit: seedAudit,

  setCurrentUser: (u) => set({ currentUser: u }),

  addAudit: (a) =>
    set((s) => ({
      audit: [
        { ...a, id: `A${s.audit.length + 1}`, at: new Date().toISOString() },
        ...s.audit,
      ],
    })),

  createSale: (input) => {
    const s = get();
    const sale: Sale = {
      ...input,
      id: padId("SALE", s.sales.length + 1),
      createdAt: new Date().toISOString(),
      cashier: s.currentUser.name,
    };
    // decrement stock
    const products = s.products.map((p) => {
      const li = input.items.find((i) => i.productId === p.id);
      if (!li) return p;
      return { ...p, stock: Math.max(0, p.stock - li.quantity) };
    });
    set({ sales: [sale, ...s.sales], products });
    s.addAudit({ user: s.currentUser.name, action: "Created sale", entity: sale.id, details: `KES ${sale.total.toLocaleString()} via ${sale.payment}` });
    if (sale.payment === "Credit" && input.customerId) {
      set((st) => ({
        customers: st.customers.map((c) => c.id === input.customerId ? { ...c, outstandingBalance: c.outstandingBalance + sale.total } : c),
      }));
    }
    return sale;
  },

  addQuotation: (input) => {
    const s = get();
    const q: Quotation = { ...input, id: padId("QTN", s.quotations.length + 1), createdAt: new Date().toISOString() };
    set({ quotations: [q, ...s.quotations] });
    s.addAudit({ user: s.currentUser.name, action: "Created quotation", entity: q.id });
    return q;
  },

  updateQuotationStatus: (id, status) =>
    set((s) => ({ quotations: s.quotations.map((q) => q.id === id ? { ...q, status } : q) })),

  convertQuotationToInvoice: (id) => {
    const s = get();
    const q = s.quotations.find((x) => x.id === id);
    if (!q) return null;
    const inv = s.addInvoice({
      customerId: q.customerId,
      customerName: q.customerName,
      items: q.items,
      total: q.total,
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      quotationId: q.id,
    });
    s.updateQuotationStatus(id, "Accepted");
    return inv;
  },

  addInvoice: (input) => {
    const s = get();
    const inv: Invoice = {
      ...input,
      id: padId("INV", s.invoices.length + 1),
      createdAt: new Date().toISOString(),
      paid: 0,
      status: "Unpaid",
      payments: [],
    };
    set({ invoices: [inv, ...s.invoices] });
    set((st) => ({
      customers: st.customers.map((c) => c.id === input.customerId ? { ...c, outstandingBalance: c.outstandingBalance + inv.total } : c),
    }));
    s.addAudit({ user: s.currentUser.name, action: "Created invoice", entity: inv.id });
    return inv;
  },

  recordPayment: (invoiceId, amount, method, reference) => {
    const s = get();
    const inv = s.invoices.find((i) => i.id === invoiceId);
    if (!inv) return;
    const newPaid = inv.paid + amount;
    const status = newPaid >= inv.total ? "Paid" : "Partial";
    const updated: Invoice = {
      ...inv,
      paid: newPaid, status,
      payments: [...inv.payments, { id: `PMT-${Date.now()}`, amount, method, date: new Date().toISOString(), reference }],
    };
    set({ invoices: s.invoices.map((i) => i.id === invoiceId ? updated : i) });
    set((st) => ({
      customers: st.customers.map((c) => c.id === inv.customerId ? { ...c, outstandingBalance: Math.max(0, c.outstandingBalance - amount) } : c),
    }));
    s.addAudit({ user: s.currentUser.name, action: "Recorded payment", entity: inv.id, details: `KES ${amount.toLocaleString()} via ${method}` });
  },

  addCreditNote: (input) => {
    const s = get();
    const cn: CreditNote = {
      ...input,
      id: padId("CN", s.creditNotes.length + 1),
      createdAt: new Date().toISOString(),
      status: "Draft",
      createdBy: s.currentUser.name,
      history: [{ at: new Date().toISOString(), by: s.currentUser.name, action: "Created" }],
    };
    set({ creditNotes: [cn, ...s.creditNotes] });
    s.addAudit({ user: s.currentUser.name, action: "Created credit note", entity: cn.id });
    return cn;
  },

  setCreditNoteStatus: (id, status, note) => {
    const s = get();
    set({
      creditNotes: s.creditNotes.map((cn) =>
        cn.id === id
          ? {
              ...cn, status,
              approvedBy: status === "Approved" ? s.currentUser.name : cn.approvedBy,
              history: [...cn.history, { at: new Date().toISOString(), by: s.currentUser.name, action: status, note }],
            }
          : cn,
      ),
    });
    s.addAudit({ user: s.currentUser.name, action: `Credit note: ${status}`, entity: id, details: note });
  },

  addCustomer: (input) => {
    const s = get();
    const c: Customer = { ...input, id: padId("CUST", s.customers.length + 1), createdAt: new Date().toISOString() };
    set({ customers: [c, ...s.customers] });
    s.addAudit({ user: s.currentUser.name, action: "Created customer", entity: c.id });
    return c;
  },

  setCustomerCreditStatus: (id, status) => {
    const s = get();
    set({ customers: s.customers.map((c) => c.id === id ? { ...c, creditStatus: status } : c) });
    s.addAudit({ user: s.currentUser.name, action: `Customer credit: ${status}`, entity: id });
  },

  addSupplier: (input) => {
    const s = get();
    const sup: Supplier = { ...input, id: padId("SUP", s.suppliers.length + 1), createdAt: new Date().toISOString() };
    set({ suppliers: [sup, ...s.suppliers] });
    s.addAudit({ user: s.currentUser.name, action: "Created supplier", entity: sup.id });
    return sup;
  },

  addProduct: (input) => {
    const s = get();
    const p: Product = { ...input, id: `P-${String(s.products.length + 1).padStart(3, "0")}` };
    set({ products: [p, ...s.products] });
    s.addAudit({ user: s.currentUser.name, action: "Created product", entity: p.sku });
    return p;
  },

  addPO: (input) => {
    const s = get();
    const po: PurchaseOrder = { ...input, id: padId("LPO", s.purchaseOrders.length + 1), createdAt: new Date().toISOString() };
    set({ purchaseOrders: [po, ...s.purchaseOrders] });
    s.addAudit({ user: s.currentUser.name, action: "Created LPO", entity: po.id });
    return po;
  },

  receivePO: (id) => {
    const s = get();
    const po = s.purchaseOrders.find((p) => p.id === id);
    if (!po) return;
    set({
      purchaseOrders: s.purchaseOrders.map((p) => p.id === id ? { ...p, status: "Received", grnDate: new Date().toISOString() } : p),
      products: s.products.map((p) => {
        const li = po.items.find((i) => i.productId === p.id);
        if (!li) return p;
        return { ...p, stock: p.stock + li.quantity };
      }),
    });
    s.addAudit({ user: s.currentUser.name, action: "Received GRN", entity: id });
  },

  markNotificationRead: (id) =>
    set((s) => ({ notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n) })),
  markAllNotificationsRead: () =>
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

  addUser: (input) => {
    const s = get();
    const u: User = { ...input, id: `U-${String(s.users.length + 1).padStart(3, "0")}` };
    set({ users: [u, ...s.users] });
    s.addAudit({ user: s.currentUser.name, action: "Created user", entity: u.id });
    return u;
  },
  toggleUserActive: (id) =>
    set((s) => ({ users: s.users.map((u) => u.id === id ? { ...u, active: !u.active } : u) })),
}));