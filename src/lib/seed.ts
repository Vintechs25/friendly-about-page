import type {
  Customer,
  Supplier,
  Product,
  Sale,
  Quotation,
  Invoice,
  CreditNote,
  PurchaseOrder,
  User,
  Notification,
  AuditEntry,
} from "./types";

const today = new Date();
const daysAgo = (n: number) =>
  new Date(today.getTime() - n * 86400000).toISOString();
const daysAhead = (n: number) =>
  new Date(today.getTime() + n * 86400000).toISOString();

export const seedUsers: User[] = [
  { id: "U-001", name: "James Mwangi", email: "james@travotech.co.ke", phone: "0722112233", role: "Super Admin", branch: "Nairobi Branch", active: true },
  { id: "U-002", name: "Grace Wanjiku", email: "grace@travotech.co.ke", phone: "0733445566", role: "Branch Manager", branch: "Nairobi Branch", active: true },
  { id: "U-003", name: "Peter Otieno", email: "peter@travotech.co.ke", phone: "0711223344", role: "Sales Rep", branch: "Nairobi Branch", active: true },
  { id: "U-004", name: "Mary Achieng", email: "mary@travotech.co.ke", phone: "0700998877", role: "Cashier", branch: "Nairobi Branch", active: true },
  { id: "U-005", name: "Daniel Kiprop", email: "daniel@travotech.co.ke", phone: "0712345678", role: "Accountant", branch: "Nairobi Branch", active: true },
  { id: "U-006", name: "Susan Njeri", email: "susan@travotech.co.ke", phone: "0723456789", role: "Procurement Officer", branch: "Nairobi Branch", active: true },
  { id: "U-007", name: "Brian Kamau", email: "brian@travotech.co.ke", phone: "0734567890", role: "Auditor", branch: "Nairobi Branch", active: false },
];

export const seedCustomers: Customer[] = [
  { id: "CUST-0001", name: "Kenyatta National Hospital", type: "Hospital", phone: "0709854000", email: "procurement@knh.or.ke", address: "Hospital Road, Upper Hill, Nairobi", contactPerson: "Dr. Lucy Mwangi", kraPin: "P051234567A", creditLimit: 2500000, outstandingBalance: 845000, creditStatus: "Approved", createdAt: daysAgo(180) },
  { id: "CUST-0002", name: "Aga Khan University Hospital", type: "Hospital", phone: "0203662000", email: "supplies@aku.edu", address: "3rd Parklands Avenue, Nairobi", contactPerson: "John Kariuki", kraPin: "P051345678B", creditLimit: 3000000, outstandingBalance: 1230000, creditStatus: "Approved", createdAt: daysAgo(220) },
  { id: "CUST-0003", name: "Lancet Laboratories Kenya", type: "Lab", phone: "0709691000", email: "orders@lancet.co.ke", address: "Fortis Tower, Woodvale Grove, Westlands", contactPerson: "Esther Wambui", kraPin: "P051456789C", creditLimit: 1500000, outstandingBalance: 420000, creditStatus: "Approved", createdAt: daysAgo(150) },
  { id: "CUST-0004", name: "University of Nairobi - School of Medicine", type: "University", phone: "0204910000", email: "med-procurement@uonbi.ac.ke", address: "Chiromo Campus, Nairobi", contactPerson: "Prof. Samuel Otieno", kraPin: "P051567890D", creditLimit: 2000000, outstandingBalance: 0, creditStatus: "Approved", createdAt: daysAgo(95) },
  { id: "CUST-0005", name: "Pathologists Lancet Kenya - Mombasa", type: "Lab", phone: "0414475000", email: "mombasa@lancet.co.ke", address: "Nyerere Avenue, Mombasa", contactPerson: "Ali Hassan", creditLimit: 800000, outstandingBalance: 215000, creditStatus: "Approved", createdAt: daysAgo(60) },
  { id: "CUST-0006", name: "Mater Misericordiae Hospital", type: "Hospital", phone: "0205310000", email: "stores@materkenya.com", address: "Dunga Road, South B, Nairobi", contactPerson: "Sister Anne Wairimu", kraPin: "P051678901E", creditLimit: 1800000, outstandingBalance: 95000, creditStatus: "Approved", createdAt: daysAgo(120) },
  { id: "CUST-0007", name: "Avenue Healthcare Parklands", type: "Hospital", phone: "0202726000", email: "supplies@avenuehealthcare.com", address: "1st Parklands Avenue, Nairobi", contactPerson: "Dr. Naomi Wanjiru", creditLimit: 1000000, outstandingBalance: 320000, creditStatus: "Approved", createdAt: daysAgo(80) },
  { id: "CUST-0008", name: "Metropolitan Hospital", type: "Hospital", phone: "0709810000", email: "procurement@metropolitan.co.ke", address: "Buruburu, Nairobi", contactPerson: "George Mutiso", creditLimit: 600000, outstandingBalance: 0, creditStatus: "Pending", createdAt: daysAgo(15) },
  { id: "CUST-0009", name: "Kenyatta University Teaching Hospital", type: "University", phone: "0202726300", email: "kuth@ku.ac.ke", address: "Thika Road, Kahawa, Nairobi", contactPerson: "Dr. Emmanuel Cheruiyot", creditLimit: 1500000, outstandingBalance: 540000, creditStatus: "Approved", createdAt: daysAgo(200) },
  { id: "CUST-0010", name: "Walk-in Customer", type: "Walk-in", phone: "—", email: "—", address: "—", contactPerson: "—", creditLimit: 0, outstandingBalance: 0, creditStatus: "None", createdAt: daysAgo(365) },
];

export const seedSuppliers: Supplier[] = [
  { id: "SUP-0001", name: "Roche Diagnostics East Africa", contactPerson: "Mark Ouma", phone: "0722334455", email: "ke.orders@roche.com", address: "ABC Place, Waiyaki Way, Nairobi", kraPin: "P052100001A", createdAt: daysAgo(400) },
  { id: "SUP-0002", name: "Abbott Laboratories Kenya", contactPerson: "Caroline Njeri", phone: "0733556677", email: "kenya@abbott.com", address: "Eden Square, Westlands, Nairobi", kraPin: "P052100002B", createdAt: daysAgo(380) },
  { id: "SUP-0003", name: "Beckman Coulter (via Phillips)", contactPerson: "David Kamau", phone: "0711889900", email: "info@phillips.co.ke", address: "Industrial Area, Nairobi", kraPin: "P052100003C", createdAt: daysAgo(300) },
  { id: "SUP-0004", name: "Mindray Medical Kenya", contactPerson: "Linda Akinyi", phone: "0720987654", email: "kenya@mindray.com", address: "Riverside Drive, Nairobi", kraPin: "P052100004D", createdAt: daysAgo(250) },
  { id: "SUP-0005", name: "Surgipharm Limited", contactPerson: "Joseph Maina", phone: "0700112233", email: "sales@surgipharm.co.ke", address: "Mombasa Road, Nairobi", kraPin: "P052100005E", createdAt: daysAgo(500) },
];

export const seedProducts: Product[] = [
  { id: "P-001", sku: "REA-CBC-500", name: "CBC Analyzer Reagents (500 tests)", category: "Reagents", price: 28500, cost: 19000, stock: 42, reorderLevel: 20, unit: "Pack", batches: [{ batchNumber: "RB2410-A", expiry: daysAhead(75), quantity: 18 }, { batchNumber: "RB2412-B", expiry: daysAhead(220), quantity: 24 }] },
  { id: "P-002", sku: "RDT-HIV-25", name: "Rapid HIV Test Kits (25/box)", category: "Rapid Diagnostic Kits", price: 4200, cost: 2700, stock: 12, reorderLevel: 30, unit: "Box", batches: [{ batchNumber: "HIV2503-A", expiry: daysAhead(310), quantity: 12 }] },
  { id: "P-003", sku: "SC-GLV-L100", name: "Latex Gloves (Large) Box of 100", category: "Surgical Consumables", price: 950, cost: 620, stock: 320, reorderLevel: 100, unit: "Box", batches: [{ batchNumber: "GL2502-X", expiry: daysAhead(540), quantity: 320 }] },
  { id: "P-004", sku: "RDT-MAL-50", name: "Malaria Rapid Test Kit (50/box)", category: "Rapid Diagnostic Kits", price: 6800, cost: 4400, stock: 58, reorderLevel: 20, unit: "Box", batches: [{ batchNumber: "ML2501-A", expiry: daysAhead(60), quantity: 22 }, { batchNumber: "ML2504-B", expiry: daysAhead(400), quantity: 36 }] },
  { id: "P-005", sku: "LE-MS-CX23", name: "Olympus CX23 Binocular Microscope", category: "Lab Equipment", price: 215000, cost: 165000, stock: 4, reorderLevel: 2, unit: "Unit", batches: [] },
  { id: "P-006", sku: "MI-BPM-OMR", name: "Omron Digital BP Monitor HEM-7156", category: "Medical Instruments", price: 8900, cost: 5800, stock: 35, reorderLevel: 10, unit: "Unit", batches: [] },
  { id: "P-007", sku: "REA-GLU-100", name: "Glucose Test Strips (100/box)", category: "Reagents", price: 2400, cost: 1500, stock: 88, reorderLevel: 40, unit: "Box", batches: [{ batchNumber: "GS2503-A", expiry: daysAhead(85), quantity: 40 }, { batchNumber: "GS2505-B", expiry: daysAhead(280), quantity: 48 }] },
  { id: "P-008", sku: "SC-SYR-5ML", name: "Disposable Syringe 5ml (100/pack)", category: "Surgical Consumables", price: 780, cost: 480, stock: 410, reorderLevel: 150, unit: "Pack", batches: [{ batchNumber: "SY2412-A", expiry: daysAhead(450), quantity: 410 }] },
  { id: "P-009", sku: "MI-STET-LIT", name: "Littmann Classic III Stethoscope", category: "Medical Instruments", price: 14500, cost: 9800, stock: 18, reorderLevel: 5, unit: "Unit", batches: [] },
  { id: "P-010", sku: "LE-CFG-MR", name: "Mindray BC-3000 Plus Hematology Analyzer", category: "Lab Equipment", price: 480000, cost: 360000, stock: 2, reorderLevel: 1, unit: "Unit", batches: [] },
  { id: "P-011", sku: "RDT-COV-20", name: "COVID-19 Antigen Test Kit (20/box)", category: "Rapid Diagnostic Kits", price: 5500, cost: 3400, stock: 8, reorderLevel: 25, unit: "Box", batches: [{ batchNumber: "CV2502-A", expiry: daysAhead(40), quantity: 8 }] },
  { id: "P-012", sku: "SC-MASK-N95", name: "N95 Respirator Masks (20/box)", category: "Surgical Consumables", price: 2200, cost: 1300, stock: 145, reorderLevel: 50, unit: "Box", batches: [{ batchNumber: "MK2501-A", expiry: daysAhead(720), quantity: 145 }] },
];

const mkSale = (id: number, custIdx: number, items: { p: number; q: number }[], pay: any, ago: number): Sale => {
  const c = seedCustomers[custIdx];
  const lis = items.map(({ p, q }) => {
    const prod = seedProducts[p];
    return { productId: prod.id, name: prod.name, quantity: q, price: prod.price };
  });
  const subtotal = lis.reduce((s, i) => s + i.price * i.quantity, 0);
  return {
    id: `SALE-${String(id).padStart(4, "0")}`,
    customerId: c.id, customerName: c.name, items: lis,
    subtotal, discount: 0, tax: 0, total: subtotal,
    payment: pay, cashier: "Mary Achieng", createdAt: daysAgo(ago),
  };
};

export const seedSales: Sale[] = [
  mkSale(1, 0, [{ p: 0, q: 4 }, { p: 6, q: 10 }], "Credit", 1),
  mkSale(2, 9, [{ p: 2, q: 2 }, { p: 7, q: 5 }], "M-Pesa", 1),
  mkSale(3, 2, [{ p: 1, q: 6 }], "Credit", 2),
  mkSale(4, 3, [{ p: 5, q: 3 }, { p: 8, q: 2 }], "Bank", 3),
  mkSale(5, 5, [{ p: 11, q: 8 }], "Cash", 4),
  mkSale(6, 6, [{ p: 3, q: 5 }], "Credit", 5),
  mkSale(7, 1, [{ p: 4, q: 1 }], "Bank", 7),
  mkSale(8, 8, [{ p: 0, q: 2 }, { p: 6, q: 5 }], "Credit", 10),
  mkSale(9, 9, [{ p: 2, q: 1 }], "Cash", 12),
  mkSale(10, 0, [{ p: 9, q: 1 }], "Credit", 18),
];

export const seedQuotations: Quotation[] = [
  { id: "QTN-0001", customerId: "CUST-0001", customerName: "Kenyatta National Hospital", items: [{ productId: "P-010", name: seedProducts[9].name, quantity: 1, price: 480000 }], total: 480000, validUntil: daysAhead(20), status: "Sent", createdAt: daysAgo(3) },
  { id: "QTN-0002", customerId: "CUST-0003", customerName: "Lancet Laboratories Kenya", items: [{ productId: "P-000", name: seedProducts[0].name, quantity: 10, price: 28500 }], total: 285000, validUntil: daysAhead(14), status: "Accepted", createdAt: daysAgo(6) },
  { id: "QTN-0003", customerId: "CUST-0006", customerName: "Mater Misericordiae Hospital", items: [{ productId: "P-006", name: seedProducts[5].name, quantity: 20, price: 8900 }], total: 178000, validUntil: daysAhead(7), status: "Draft", createdAt: daysAgo(1) },
  { id: "QTN-0004", customerId: "CUST-0002", customerName: "Aga Khan University Hospital", items: [{ productId: "P-005", name: seedProducts[4].name, quantity: 2, price: 215000 }], total: 430000, validUntil: daysAgo(5), status: "Expired", createdAt: daysAgo(35) },
];

export const seedInvoices: Invoice[] = [
  { id: "INV-0001", customerId: "CUST-0001", customerName: "Kenyatta National Hospital", items: [{ productId: "P-001", name: seedProducts[0].name, quantity: 4, price: 28500 }, { productId: "P-007", name: seedProducts[6].name, quantity: 10, price: 8900 }], total: 203000, paid: 100000, status: "Partial", dueDate: daysAhead(15), createdAt: daysAgo(15), payments: [{ id: "PMT-1", amount: 100000, method: "Bank", date: daysAgo(10), reference: "FT24287HQ" }] },
  { id: "INV-0002", customerId: "CUST-0002", customerName: "Aga Khan University Hospital", items: [{ productId: "P-005", name: seedProducts[4].name, quantity: 4, price: 215000 }], total: 860000, paid: 0, status: "Unpaid", dueDate: daysAhead(8), createdAt: daysAgo(22), payments: [] },
  { id: "INV-0003", customerId: "CUST-0003", customerName: "Lancet Laboratories Kenya", items: [{ productId: "P-001", name: seedProducts[0].name, quantity: 6, price: 28500 }], total: 171000, paid: 171000, status: "Paid", dueDate: daysAgo(2), createdAt: daysAgo(32), payments: [{ id: "PMT-2", amount: 171000, method: "M-Pesa", date: daysAgo(5), reference: "QFA8H2KL3M" }] },
  { id: "INV-0004", customerId: "CUST-0006", customerName: "Mater Misericordiae Hospital", items: [{ productId: "P-003", name: seedProducts[2].name, quantity: 100, price: 950 }], total: 95000, paid: 0, status: "Overdue", dueDate: daysAgo(8), createdAt: daysAgo(48), payments: [] },
  { id: "INV-0005", customerId: "CUST-0009", customerName: "Kenyatta University Teaching Hospital", items: [{ productId: "P-001", name: seedProducts[0].name, quantity: 2, price: 28500 }, { productId: "P-007", name: seedProducts[6].name, quantity: 5, price: 8900 }], total: 101500, paid: 50000, status: "Partial", dueDate: daysAhead(20), createdAt: daysAgo(10), payments: [{ id: "PMT-3", amount: 50000, method: "Bank", date: daysAgo(4) }] },
];

export const seedCreditNotes: CreditNote[] = [
  { id: "CN-0001", invoiceId: "INV-0003", customerId: "CUST-0003", customerName: "Lancet Laboratories Kenya", amount: 14250, reason: "Damaged reagent vials on delivery", status: "Approved", createdBy: "Peter Otieno", approvedBy: "Grace Wanjiku", createdAt: daysAgo(8), history: [{ at: daysAgo(8), by: "Peter Otieno", action: "Created" }, { at: daysAgo(7), by: "Peter Otieno", action: "Submitted for approval" }, { at: daysAgo(6), by: "Grace Wanjiku", action: "Approved" }] },
  { id: "CN-0002", invoiceId: "INV-0001", customerId: "CUST-0001", customerName: "Kenyatta National Hospital", amount: 8900, reason: "BP monitor unit returned — wrong model", status: "Pending Approval", createdBy: "Peter Otieno", createdAt: daysAgo(1), history: [{ at: daysAgo(1), by: "Peter Otieno", action: "Created" }, { at: daysAgo(1), by: "Peter Otieno", action: "Submitted for approval" }] },
  { id: "CN-0003", invoiceId: "INV-0002", customerId: "CUST-0002", customerName: "Aga Khan University Hospital", amount: 21500, reason: "Pricing dispute — needs review", status: "Draft", createdBy: "Peter Otieno", createdAt: daysAgo(0), history: [{ at: daysAgo(0), by: "Peter Otieno", action: "Created" }] },
];

export const seedPOs: PurchaseOrder[] = [
  { id: "LPO-0001", supplierId: "SUP-0001", supplierName: "Roche Diagnostics East Africa", items: [{ productId: "P-001", name: seedProducts[0].name, quantity: 50, price: 19000 }], total: 950000, status: "Sent", createdAt: daysAgo(4), expectedDate: daysAhead(7) },
  { id: "LPO-0002", supplierId: "SUP-0002", supplierName: "Abbott Laboratories Kenya", items: [{ productId: "P-002", name: seedProducts[1].name, quantity: 80, price: 2700 }], total: 216000, status: "Received", createdAt: daysAgo(15), expectedDate: daysAgo(2), grnDate: daysAgo(2) },
  { id: "LPO-0003", supplierId: "SUP-0005", supplierName: "Surgipharm Limited", items: [{ productId: "P-003", name: seedProducts[2].name, quantity: 200, price: 620 }, { productId: "P-008", name: seedProducts[7].name, quantity: 100, price: 480 }], total: 172000, status: "Draft", createdAt: daysAgo(0), expectedDate: daysAhead(10) },
];

export const seedNotifications: Notification[] = [
  { id: "N1", type: "approval", title: "Credit note pending approval", message: "CN-0002 — KES 8,900 awaits your approval", at: daysAgo(1), read: false },
  { id: "N2", type: "stock", title: "Low stock alert", message: "Rapid HIV Test Kits below reorder level (12 / 30)", at: daysAgo(0), read: false },
  { id: "N3", type: "expiry", title: "Near-expiry batch", message: "CBC Analyzer Reagents — batch RB2410-A expires in 75 days", at: daysAgo(0), read: false },
  { id: "N4", type: "approval", title: "Credit limit request", message: "Metropolitan Hospital requesting KES 600,000 limit", at: daysAgo(2), read: true },
];

export const seedAudit: AuditEntry[] = [
  { id: "A1", at: daysAgo(0), user: "Mary Achieng", action: "Created sale", entity: "SALE-0002", details: "KES 20,400 via M-Pesa" },
  { id: "A2", at: daysAgo(1), user: "Peter Otieno", action: "Submitted credit note", entity: "CN-0002" },
  { id: "A3", at: daysAgo(6), user: "Grace Wanjiku", action: "Approved credit note", entity: "CN-0001" },
  { id: "A4", at: daysAgo(2), user: "Susan Njeri", action: "Created LPO", entity: "LPO-0001" },
  { id: "A5", at: daysAgo(8), user: "Daniel Kiprop", action: "Recorded payment", entity: "INV-0001", details: "KES 100,000 via Bank" },
];