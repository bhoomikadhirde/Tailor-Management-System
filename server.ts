import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { Client, Order, Invoice, UserRole, User, OrderStatus, PaymentStatus, MessageTemplate, CommunicationLog } from './src/types.js';

const app = express();
const PORT = 3000;

// Initialize GoogleGenAI client lazily (handling missing key gracefully)
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    })
  : null;

app.use(express.json());

// Persistent JSON storage paths
const DATA_DIR = path.join(process.cwd(), 'data');
const CLIENTS_FILE = path.join(DATA_DIR, 'clients.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const INVOICES_FILE = path.join(DATA_DIR, 'invoices.json');
const COMMUNICATIONS_FILE = path.join(DATA_DIR, 'communications.json');

// Ensure database data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial/Seed Data helper
function readJsonFile<T>(filePath: string, defaultData: T[]): T[] {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content) as T[];
    } else {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return defaultData;
  }
}

function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error writing to ${filePath}:`, error);
  }
}

// Global Seed Databases
const SEED_CLIENTS: Client[] = [
  {
    id: 'client_1',
    name: 'Margaret Sterling',
    phone: '+1-555-0178',
    email: 'margaret.sterling@example.com',
    address: '742 Evergreen Terrace, Springfield',
    gender: 'FEMALE',
    measurements: {
      bust: 36,
      waist: 28,
      hips: 38,
      shoulder: 15,
      sleeves: 23,
      length: 42,
      neck: 14,
      notes: 'Prefers slightly loose sleeve cuffs'
    },
    notes: 'Premium regular client. Focus on clean collar stiches.',
    createdAt: '2026-06-10T14:30:00Z'
  },
  {
    id: 'client_2',
    name: 'Arthur Pendelton',
    phone: '+1-555-0988',
    email: 'arthur.p@example.com',
    address: '10 Downing St, London',
    gender: 'MALE',
    measurements: {
      chest: 42,
      waist: 34,
      hips: 41,
      neck: 16.5,
      shoulder: 18.5,
      sleeves: 25.5,
      length: 32,
      inseam: 31,
      collar: 16.5,
      notes: 'Heavy tweed wool preference. Slim custom fit pants.'
    },
    notes: 'Likes high armhole fitting on suits.',
    createdAt: '2026-06-12T09:15:00Z'
  },
  {
    id: 'client_3',
    name: 'Seraphina Vance',
    phone: '+1-555-0245',
    email: 'seraphina.vance@example.com',
    address: '99 High Street, Edinburgh',
    gender: 'FEMALE',
    measurements: {
      bust: 34,
      waist: 26,
      hips: 36,
      shoulder: 14,
      sleeves: 22,
      length: 58,
      notes: 'Ankle-length gown fit. Delicate silk stitching.'
    },
    notes: 'Requires dress completed before summer gala.',
    createdAt: '2026-06-15T11:00:00Z'
  }
];

const SEED_ORDERS: Order[] = [
  {
    id: 'order_1',
    clientId: 'client_1',
    clientName: 'Margaret Sterling',
    orderNumber: 'ORD-2026-1001',
    clothingType: 'Lehenga',
    fabricDetails: 'Royal blue velvet, 5 meters, complex gold zardozi hand embroidery on borders.',
    status: 'STITCHING',
    measurementSnapshot: {
      bust: 36,
      waist: 28,
      hips: 38,
      shoulder: 15,
      sleeves: 23,
      length: 42,
      neck: 14
    },
    orderDate: '2026-06-15T10:00:00Z',
    dueDate: '2026-06-25T17:00:00Z',
    price: 1200,
    discount: 100,
    tax: 55,
    total: 1155,
    amountPaid: 600,
    paymentStatus: 'PARTIAL',
    notes: 'Fabric provided by client. Hand-embellish embroidery.',
    invoiceId: 'inv_1'
  },
  {
    id: 'order_2',
    clientId: 'client_2',
    clientName: 'Arthur Pendelton',
    orderNumber: 'ORD-2026-1002',
    clothingType: 'Suit',
    fabricDetails: 'Charcoal grey Italian Merino wool, 3-piece bespoke suit with wine-red satin inner lining.',
    status: 'COMPLETED',
    measurementSnapshot: {
      chest: 42,
      waist: 34,
      hips: 41,
      neck: 16.5,
      shoulder: 18.5,
      sleeves: 25.5,
      length: 32,
      inseam: 31,
      collar: 16.5
    },
    orderDate: '2026-06-02T11:20:00Z',
    dueDate: '2026-06-12T18:00:00Z',
    price: 1800,
    discount: 50,
    tax: 87.5,
    total: 1837.5,
    amountPaid: 1837.5,
    paymentStatus: 'PAID',
    notes: 'Premium stitching completed. Ideal jacket drop fitting.',
    invoiceId: 'inv_2'
  },
  {
    id: 'order_3',
    clientId: 'client_3',
    clientName: 'Seraphina Vance',
    orderNumber: 'ORD-2026-1003',
    clothingType: 'Dress',
    fabricDetails: 'Emerald green premium raw silk, 4 meters with flowy chiffon sash.',
    status: 'PENDING',
    measurementSnapshot: {
      bust: 34,
      waist: 26,
      hips: 36,
      shoulder: 14,
      sleeves: 22,
      length: 58
    },
    orderDate: '2026-06-16T15:45:00Z',
    dueDate: '2026-07-02T12:00:00Z',
    price: 950,
    discount: 0,
    tax: 47.5,
    total: 997.5,
    amountPaid: 0,
    paymentStatus: 'UNPAID',
    notes: 'Client waiting for mock design approval. Silk is on order.',
    invoiceId: 'inv_3'
  }
];

const SEED_INVOICES: Invoice[] = [
  {
    id: 'inv_1',
    invoiceNumber: 'INV-2026-2001',
    orderId: 'order_1',
    orderNumber: 'ORD-2026-1001',
    clientId: 'client_1',
    clientName: 'Margaret Sterling',
    issueDate: '2026-06-15T10:00:00Z',
    dueDate: '2026-06-25T17:00:00Z',
    items: [
      { id: 'itm_1_1', description: 'Royal Blue Velvet Lehenga Custom Stiching', qty: 1, unitPrice: 1000, amount: 1000 },
      { id: 'itm_1_2', description: 'Gold Zardozi Hand Embroidery Surcharge', qty: 1, unitPrice: 200, amount: 200 }
    ],
    subtotal: 1200,
    discount: 100,
    tax: 55,
    total: 1155,
    amountPaid: 600,
    paymentStatus: 'PARTIAL',
    notes: 'Balance to be fully settled during trial fitting session.'
  },
  {
    id: 'inv_2',
    invoiceNumber: 'INV-2026-2002',
    orderId: 'order_2',
    orderNumber: 'ORD-2026-1002',
    clientId: 'client_2',
    clientName: 'Arthur Pendelton',
    issueDate: '2026-06-02T11:20:00Z',
    dueDate: '2026-06-12T18:00:00Z',
    items: [
      { id: 'itm_2_1', description: 'Merino Wool 3-Piece Bespoke Suit Sewing', qty: 1, unitPrice: 1500, amount: 1500 },
      { id: 'itm_2_2', description: 'Satin Wine-Red Premium Inner Lining Material', qty: 1, unitPrice: 300, amount: 300 }
    ],
    subtotal: 1800,
    discount: 50,
    tax: 87.5,
    total: 1837.5,
    amountPaid: 1837.5,
    paymentStatus: 'PAID',
    notes: 'Invoice fully settled. Delightful custom fit suit delivered!'
  },
  {
    id: 'inv_3',
    invoiceNumber: 'INV-2026-2003',
    orderId: 'order_3',
    orderNumber: 'ORD-2026-1003',
    clientId: 'client_3',
    clientName: 'Seraphina Vance',
    issueDate: '2026-06-16T15:45:00Z',
    dueDate: '2026-07-02T12:00:00Z',
    items: [
      { id: 'itm_3_1', description: 'Emerald Green Raw Silk Bespoke Gown Stitching', qty: 1, unitPrice: 950, amount: 950 }
    ],
    subtotal: 950,
    discount: 0,
    tax: 47.5,
    total: 997.5,
    amountPaid: 0,
    paymentStatus: 'UNPAID',
    notes: 'Deposit pending pattern cutting approval.'
  }
];

// Helper to load/save local databases
let clients: Client[] = readJsonFile(CLIENTS_FILE, SEED_CLIENTS);
let orders: Order[] = readJsonFile(ORDERS_FILE, SEED_ORDERS);
let invoices: Invoice[] = readJsonFile(INVOICES_FILE, SEED_INVOICES);

const SEED_TEMPLATES: MessageTemplate[] = [
  {
    id: "order_completion",
    label: "Order Completion Alert",
    channel: "SMS",
    content: "Dear {clientName}, we are pleased to inform you that your custom garment {clothingType} ({orderNumber}) is completed and ready for pickup! Total: ₹{total}. Paid: ₹{amountPaid}. Balance Due: ₹{balance}."
  },
  {
    id: "appointment_confirmation",
    label: "Fitting Trial Confirmation",
    channel: "EMAIL",
    content: "Subject: Fitting Trial Confirmation - Bespoke Atelier\n\nDear {clientName},\n\nThis is to confirm your fitting trial session for your custom {clothingType} order ({orderNumber}) scheduled on {dueDate}.\n\nOur custom tailors will have your garment basted and prepared for fit adjustments. Please let us know if you need to reschedule.\n\nWarm regards,\nBespoke Atelier Boutique\n742 Luxury Row Sewing"
  },
  {
    id: "upcoming_promotions",
    label: "Upcoming Promotions Invitation",
    channel: "SMS",
    content: "Exclusive Promotion: Hello {clientName}, unlock a premium 15% discount on custom coats and raw silk dresses at Bespoke Atelier! Book an appointment in June."
  }
];

interface CommunicationDbStructure {
  history: CommunicationLog[];
  templates: MessageTemplate[];
}

function readCommunicationsFile(): CommunicationDbStructure {
  try {
    if (fs.existsSync(COMMUNICATIONS_FILE)) {
      const content = fs.readFileSync(COMMUNICATIONS_FILE, 'utf8');
      return JSON.parse(content) as CommunicationDbStructure;
    } else {
      const defaultComs: CommunicationDbStructure = {
        history: [
          {
            id: 'log_seed_1',
            clientId: 'client_2',
            clientName: 'Arthur Pendelton',
            clientPhone: '+1-555-0988',
            clientEmail: 'arthur.p@example.com',
            event: 'order_completion',
            channel: 'SMS',
            message: 'Dear Arthur Pendelton, we are pleased to inform you that your custom garment Suit (ORD-2026-1002) is completed and ready for pickup! Total: ₹1837.5. Paid: ₹1837.5. Balance Due: ₹0.',
            sentAt: '2026-06-12T18:15:00Z',
            status: 'SENT',
            orderNumber: 'ORD-2026-1002'
          },
          {
            id: 'log_seed_2',
            clientId: 'client_1',
            clientName: 'Margaret Sterling',
            clientPhone: '+1-555-0178',
            clientEmail: 'margaret.sterling@example.com',
            event: 'appointment_confirmation',
            channel: 'EMAIL',
            message: 'Subject: Fitting Trial Confirmation - Bespoke Atelier\n\nDear Margaret Sterling,\n\nThis is to confirm your fitting trial session for your custom Lehenga order (ORD-2026-1001) scheduled on 2026-06-25.\n\nOur custom tailors will have your garment basted and prepared for fit adjustments. Please let us know if you need to reschedule.\n\nWarm regards,\nBespoke Atelier Boutique\n742 Luxury Row Sewing',
            sentAt: '2026-06-15T10:10:00Z',
            status: 'SENT',
            orderNumber: 'ORD-2026-1001'
          }
        ],
        templates: SEED_TEMPLATES
      };
      fs.writeFileSync(COMMUNICATIONS_FILE, JSON.stringify(defaultComs, null, 2));
      return defaultComs;
    }
  } catch (error) {
    console.error(`Error reading ${COMMUNICATIONS_FILE}:`, error);
    return { history: [], templates: SEED_TEMPLATES };
  }
}

let communicationsDb = readCommunicationsFile();

function formatTemplate(content: string, vars: { [key: string]: any }): string {
  let formatted = content;
  for (const [key, val] of Object.entries(vars)) {
    formatted = formatted.replace(new RegExp(`{${key}}`, 'g'), String(val ?? ''));
  }
  return formatted;
}

function triggerAutomatedCommunication(templateId: string, client: Client, order: Order) {
  try {
    const templates = communicationsDb.templates || SEED_TEMPLATES;
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const balance = order.total - order.amountPaid;
    const formattedMessage = formatTemplate(template.content, {
      clientName: client.name,
      clothingType: order.clothingType,
      orderNumber: order.orderNumber,
      total: order.total,
      amountPaid: order.amountPaid,
      balance: balance > 0 ? balance.toFixed(2) : '0.00',
      dueDate: order.dueDate ? new Date(order.dueDate).toLocaleDateString() : 'N/A',
    });

    const newLog: CommunicationLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      clientId: client.id,
      clientName: client.name,
      clientPhone: client.phone,
      clientEmail: client.email,
      event: templateId as any,
      channel: template.channel,
      message: formattedMessage,
      sentAt: new Date().toISOString(),
      status: 'SENT',
      orderNumber: order.orderNumber
    };

    communicationsDb.history.unshift(newLog);
    writeJsonFile(COMMUNICATIONS_FILE, communicationsDb);
  } catch (error) {
    console.error('Error triggering automated communication:', error);
  }
}

// --- REST API ENDPOINTS ---

// 1. Role-based Authentication API (Simulated secure authentication)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (email === 'admin@tailor.com' && password === 'admin123') {
    return res.json({
      success: true,
      user: {
        id: 'user_admin',
        username: 'admin_owner',
        email: 'admin@tailor.com',
        role: UserRole.ADMIN,
        fullName: 'Bhoomika Sterling'
      }
    });
  } else if (email === 'tailor@tailor.com' && password === 'tailor123') {
    return res.json({
      success: true,
      user: {
        id: 'user_tailor',
        username: 'master_cutter',
        email: 'tailor@tailor.com',
        role: UserRole.TAILOR,
        fullName: 'Master Cutter Ramesh'
      }
    });
  } else if (email === 'customer@tailor.com' && password === 'customer123') {
    return res.json({
      success: true,
      user: {
        id: 'user_customer',
        username: 'arthur_p',
        email: 'customer@tailor.com',
        role: UserRole.CUSTOMER,
        fullName: 'Arthur Pendelton'
      }
    });
  }

  return res.status(401).json({ success: false, message: 'Invalid credentials. Try: admin@tailor.com / admin123' });
});

// 2. Client API
app.get('/api/clients', (req, res) => {
  res.json(clients);
});

app.post('/api/clients', (req, res) => {
  const newClient: Client = {
    id: 'client_' + Date.now(),
    name: req.body.name,
    phone: req.body.phone,
    email: req.body.email || '',
    address: req.body.address || '',
    gender: req.body.gender || 'MALE',
    measurements: req.body.measurements || {},
    notes: req.body.notes || '',
    createdAt: new Date().toISOString()
  };

  clients.unshift(newClient);
  writeJsonFile(CLIENTS_FILE, clients);
  res.status(201).json(newClient);
});

app.put('/api/clients/:id', (req, res) => {
  const { id } = req.params;
  const index = clients.findIndex(c => c.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Client not found' });
  }

  // Update client
  clients[index] = {
    ...clients[index],
    name: req.body.name || clients[index].name,
    phone: req.body.phone || clients[index].phone,
    email: req.body.email !== undefined ? req.body.email : clients[index].email,
    address: req.body.address !== undefined ? req.body.address : clients[index].address,
    gender: req.body.gender || clients[index].gender,
    measurements: req.body.measurements || clients[index].measurements,
    notes: req.body.notes !== undefined ? req.body.notes : clients[index].notes
  };

  // Sync client profile name across their existing order records as well
  orders = orders.map(ord => {
    if (ord.clientId === id) {
      return { ...ord, clientName: clients[index].name };
    }
    return ord;
  });
  invoices = invoices.map(inv => {
    if (inv.clientId === id) {
      return { ...inv, clientName: clients[index].name };
    }
    return inv;
  });

  writeJsonFile(CLIENTS_FILE, clients);
  writeJsonFile(ORDERS_FILE, orders);
  writeJsonFile(INVOICES_FILE, invoices);

  res.json(clients[index]);
});

app.delete('/api/clients/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = clients.length;
  clients = clients.filter(c => c.id !== id);

  if (clients.length === initialLength) {
    return res.status(404).json({ message: 'Client not found' });
  }

  writeJsonFile(CLIENTS_FILE, clients);
  res.json({ success: true, message: 'Client profile deleted successfully' });
});

// 3. Order Tracking API
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

app.post('/api/orders', (req, res) => {
  const { clientId, clothingType, fabricDetails, dueDate, price, discount, tax, amountPaid, notes } = req.body;

  const client = clients.find(c => c.id === clientId);
  if (!clientId || !client) {
    return res.status(400).json({ message: 'Valid Client ID is required for a tailoring order' });
  }

  const orderNum = 'ORD-2026-' + (1000 + orders.length + 1);
  const orderId = 'order_' + Date.now();
  const invoiceId = 'inv_' + Date.now();

  const subtotal = Number(price) || 0;
  const discVal = Number(discount) || 0;
  const taxVal = Number(tax) || 0;
  const total = subtotal - discVal + taxVal;
  const paid = Number(amountPaid) || 0;

  let paymentStatus: PaymentStatus = 'UNPAID';
  if (paid >= total && total > 0) {
    paymentStatus = 'PAID';
  } else if (paid > 0) {
    paymentStatus = 'PARTIAL';
  }

  // Snapshot active measurements
  const measurementSnapshot = { ...client.measurements };

  const newOrder: Order = {
    id: orderId,
    clientId,
    clientName: client.name,
    orderNumber: orderNum,
    clothingType: clothingType || 'Suit',
    fabricDetails: fabricDetails || '',
    status: 'PENDING',
    measurementSnapshot,
    orderDate: new Date().toISOString(),
    dueDate: dueDate || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    price: subtotal,
    discount: discVal,
    tax: taxVal,
    total,
    amountPaid: paid,
    paymentStatus,
    notes,
    invoiceId
  };

  // Generate automated invoice concurrently
  const newInvoice: Invoice = {
    id: invoiceId,
    invoiceNumber: 'INV-2026-' + (2000 + invoices.length + 1),
    orderId,
    orderNumber: orderNum,
    clientId,
    clientName: client.name,
    issueDate: newOrder.orderDate,
    dueDate: newOrder.dueDate,
    items: [
      {
        id: 'itm_' + Date.now() + '_1',
        description: `Bespoke Stitching of ${clothingType}`,
        qty: 1,
        unitPrice: subtotal,
        amount: subtotal
      }
    ],
    subtotal,
    discount: discVal,
    tax: taxVal,
    total,
    amountPaid: paid,
    paymentStatus,
    notes: `Automated Invoice generated for tailoring draft order ${orderNum}.`
  };

  orders.unshift(newOrder);
  invoices.unshift(newInvoice);

  writeJsonFile(ORDERS_FILE, orders);
  writeJsonFile(INVOICES_FILE, invoices);

  res.status(201).json(newOrder);
});

app.put('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const index = orders.findIndex(o => o.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Order not found' });
  }

  const currentOrder = orders[index];

  // Update order tracking fields
  const updatedStatus: OrderStatus = req.body.status || currentOrder.status;
  const price = req.body.price !== undefined ? Number(req.body.price) : currentOrder.price;
  const discount = req.body.discount !== undefined ? Number(req.body.discount) : currentOrder.discount;
  const tax = req.body.tax !== undefined ? Number(req.body.tax) : currentOrder.tax;
  const amountPaid = req.body.amountPaid !== undefined ? Number(req.body.amountPaid) : currentOrder.amountPaid;
  const total = price - discount + tax;

  let paymentStatus: PaymentStatus = currentOrder.paymentStatus;
  if (amountPaid >= total && total > 0) {
    paymentStatus = 'PAID';
  } else if (amountPaid > 0) {
    paymentStatus = 'PARTIAL';
  } else if (total > 0) {
    paymentStatus = 'UNPAID';
  }

  const updatedOrder: Order = {
    ...currentOrder,
    clothingType: req.body.clothingType || currentOrder.clothingType,
    fabricDetails: req.body.fabricDetails !== undefined ? req.body.fabricDetails : currentOrder.fabricDetails,
    status: updatedStatus,
    dueDate: req.body.dueDate || currentOrder.dueDate,
    price,
    discount,
    tax,
    total,
    amountPaid,
    paymentStatus,
    notes: req.body.notes !== undefined ? req.body.notes : currentOrder.notes
  };

  orders[index] = updatedOrder;

  // Also update corresponding Invoice automatically!
  const invoiceIndex = invoices.findIndex(i => i.orderId === id || i.id === currentOrder.invoiceId);
  if (invoiceIndex !== -1) {
    const currentInv = invoices[invoiceIndex];
    invoices[invoiceIndex] = {
      ...currentInv,
      dueDate: updatedOrder.dueDate,
      items: [
        {
          id: currentInv.items[0]?.id || 'itm_auto',
          description: `Bespoke Stitching of ${updatedOrder.clothingType}`,
          qty: 1,
          unitPrice: price,
          amount: price
        }
      ],
      subtotal: price,
      discount,
      tax,
      total,
      amountPaid,
      paymentStatus
    };
  }

  // Trigger automated notification on key event status transitions
  if (req.body.status && req.body.status !== currentOrder.status) {
    const client = clients.find(c => c.id === updatedOrder.clientId);
    if (client) {
      if (updatedStatus === 'COMPLETED') {
        triggerAutomatedCommunication('order_completion', client, updatedOrder);
      } else if (updatedStatus === 'TRIAL') {
        triggerAutomatedCommunication('appointment_confirmation', client, updatedOrder);
      }
    }
  }

  writeJsonFile(ORDERS_FILE, orders);
  writeJsonFile(INVOICES_FILE, invoices);

  res.json(updatedOrder);
});

app.delete('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const orderIndex = orders.findIndex(o => o.id === id);

  if (orderIndex === -1) {
    return res.status(404).json({ message: 'Order not found' });
  }

  const invoiceId = orders[orderIndex].invoiceId;

  // Filter out
  orders = orders.filter(o => o.id !== id);
  if (invoiceId) {
    invoices = invoices.filter(i => i.id !== invoiceId);
  }

  writeJsonFile(ORDERS_FILE, orders);
  writeJsonFile(INVOICES_FILE, invoices);

  res.json({ success: true, message: 'Order and automated invoice deleted successfully' });
});

// 4. Invoice APIs
app.get('/api/invoices', (req, res) => {
  res.json(invoices);
});

app.put('/api/invoices/:id/payment', (req, res) => {
  const { id } = req.params;
  const { amountPaid } = req.body;

  const invoiceIndex = invoices.findIndex(i => i.id === id);
  if (invoiceIndex === -1) {
    return res.status(404).json({ message: 'Invoice not found' });
  }

  const inv = invoices[invoiceIndex];
  const newAmountPaid = Number(amountPaid);

  let paymentStatus: PaymentStatus = 'UNPAID';
  if (newAmountPaid >= inv.total) {
    paymentStatus = 'PAID';
  } else if (newAmountPaid > 0) {
    paymentStatus = 'PARTIAL';
  }

  invoices[invoiceIndex] = {
    ...inv,
    amountPaid: newAmountPaid,
    paymentStatus
  };

  // Sync payments back to orders database
  const orderIndex = orders.findIndex(o => o.id === inv.orderId);
  if (orderIndex !== -1) {
    orders[orderIndex] = {
      ...orders[orderIndex],
      amountPaid: newAmountPaid,
      paymentStatus
    };
  }

  writeJsonFile(INVOICES_FILE, invoices);
  writeJsonFile(ORDERS_FILE, orders);

  res.json(invoices[invoiceIndex]);
});

// --- 4.5 CLIENT COMMUNICATIONS & VOICE ASSISTANT API ---

// GET communication templates
app.get('/api/communications/templates', (req, res) => {
  res.json(communicationsDb.templates || SEED_TEMPLATES);
});

// UPDATE communication templates
app.put('/api/communications/templates', (req, res) => {
  if (Array.isArray(req.body)) {
    communicationsDb.templates = req.body;
    writeJsonFile(COMMUNICATIONS_FILE, communicationsDb);
    return res.json(communicationsDb.templates);
  }
  res.status(400).json({ message: 'Invalid templates format' });
});

// GET communication history
app.get('/api/communications/history', (req, res) => {
  res.json(communicationsDb.history || []);
});

// POST to manually trigger generic campaign/individual memo
app.post('/api/communications/send', (req, res) => {
  const { clientId, templateId, customMessage } = req.body;
  const client = clients.find(c => c.id === clientId);
  
  if (!client) {
    return res.status(404).json({ message: 'Client not found' });
  }

  let finalMessage = customMessage || '';
  let channel: 'SMS' | 'EMAIL' = 'SMS';
  let eventName = 'manual';

  if (templateId) {
    const template = (communicationsDb.templates || SEED_TEMPLATES).find(t => t.id === templateId);
    if (template) {
      channel = template.channel;
      eventName = template.id;
      if (!customMessage) {
        // find if there is an active order for variables
        const clientOrder = orders.find(o => o.clientId === clientId) || orders[0];
        const balance = clientOrder ? (clientOrder.total - clientOrder.amountPaid) : 0;
        finalMessage = formatTemplate(template.content, {
          clientName: client.name,
          clothingType: clientOrder?.clothingType || 'garment',
          orderNumber: clientOrder?.orderNumber || 'ORD-NEW',
          total: clientOrder?.total || 350,
          amountPaid: clientOrder?.amountPaid || 150,
          balance: balance > 0 ? balance.toFixed(2) : '0.00',
          dueDate: clientOrder?.dueDate ? new Date(clientOrder.dueDate).toLocaleDateString() : 'N/A'
        });
      }
    }
  }

  const newLog: CommunicationLog = {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    clientId: client.id,
    clientName: client.name,
    clientPhone: client.phone,
    clientEmail: client.email,
    event: eventName as any,
    channel,
    message: finalMessage,
    sentAt: new Date().toISOString(),
    status: 'SENT'
  };

  communicationsDb.history.unshift(newLog);
  writeJsonFile(COMMUNICATIONS_FILE, communicationsDb);
  res.status(201).json({ success: true, log: newLog });
});

// POST voice assistant processor with Gemini integration
app.post('/api/assistant/process', async (req, res) => {
  const { transcript } = req.body;
  if (!transcript || typeof transcript !== 'string') {
    return res.status(400).json({ message: 'Transcript parameter is required' });
  }

  try {
    let parsedResult;

    if (ai) {
      try {
        const clientSummaries = clients.map(c => ({ id: c.id, name: c.name }));
        const prompt = `
You are the AI Assistant for a premium bespoke tailor management system called "Bespoke Atelier".
Your goal is to parse user spoken instructions / conversational commands into operations.

Our registered Client list:
${JSON.stringify(clientSummaries)}

User Statement: "${transcript}"

Parse and return a raw JSON response. It MUST strictly follow this exact JSON structure:
{
  "intent": "CREATE_ORDER" | "UPDATE_MEASUREMENTS" | "INFO_RETRIEVAL" | "UNKNOWN",
  "clientNameMatched": "the name from client lists above that fits the sentence",
  "clientId": "the matched client's ID",
  "clothingType": "Suit" | "Shirt" | "Pants" | "Tuxedo" | "Kurta" | "Blouse" | "Lehenga" | "Dress" | "Coat" | "Sherwani" | null,
  "measurements": {
    "chest": number | null,
    "waist": number | null,
    "hips": number | null,
    "neck": number | null,
    "shoulder": number | null,
    "sleeves": number | null,
    "length": number | null,
    "inseam": number | null,
    "collar": number | null
  },
  "price": number | null,
  "fabricDetails": string | null,
  "speakResponse": "Friendly tailor-focused notification text summarizing what you parsed or adjusted, using elegant bespoke atelier terms."
}
`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const rawText = response.text || '';
        parsedResult = JSON.parse(rawText);
      } catch (gem_err) {
        console.error('Gemini call errored, falling back onto local parser:', gem_err);
        parsedResult = localVoiceParser(transcript);
      }
    } else {
      parsedResult = localVoiceParser(transcript);
    }

    // Now execute parsedResult side effects
    const { intent, clientId, clientNameMatched, measurements, clothingType, price, fabricDetails } = parsedResult;
    let targetClient = clients.find(c => c.id === clientId || (clientNameMatched && c.name.toLowerCase() === clientNameMatched.toLowerCase()));

    if (!targetClient && clients.length > 0) {
      // search closest match by matching name
      const transWords = transcript.toLowerCase();
      targetClient = clients.find(c => transWords.includes(c.name.split(' ')[0].toLowerCase())) || clients[0];
    }

    if (intent === 'UPDATE_MEASUREMENTS' && targetClient) {
      const clientIndex = clients.findIndex(c => c.id === targetClient!.id);
      if (clientIndex !== -1) {
        const activeMeas = { ...clients[clientIndex].measurements };
        
        // update fields
        const validUpdatedRecord: string[] = [];
        if (measurements) {
          for (const [key, value] of Object.entries(measurements)) {
            if (value !== null && value !== undefined) {
              (activeMeas as any)[key] = Number(value);
              validUpdatedRecord.push(`${key} = ${value}"`);
            }
          }
        }

        clients[clientIndex].measurements = activeMeas;
        writeJsonFile(CLIENTS_FILE, clients);
        // Sync return
        parsedResult.speakResponse = `I have successfully updated the stitching fit record for client ${targetClient.name}. Updated details: ${validUpdatedRecord.join(', ')}.`;
      }
    } else if (intent === 'CREATE_ORDER' && targetClient) {
      const cType = clothingType || 'Suit';
      const orderPrice = Number(price) || 450;
      const orderId = 'order_' + Date.now();
      const orderNum = 'ORD-2026-' + (1004 + orders.length);
      const invoiceId = 'inv_' + Date.now();
      const invoiceNum = 'INV-2026-' + (2004 + invoices.length);

      const newOrder: Order = {
        id: orderId,
        orderNumber: orderNum,
        clientId: targetClient.id,
        clientName: targetClient.name,
        clothingType: cType,
        fabricDetails: fabricDetails || 'Premium House Fabric selection',
        status: 'PENDING',
        orderDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 weeks out
        price: orderPrice,
        discount: 0,
        tax: orderPrice * 0.05,
        total: orderPrice * 1.05,
        amountPaid: 0,
        paymentStatus: 'UNPAID',
        measurementSnapshot: targetClient.measurements,
        invoiceId
      };

      const newInvoice: Invoice = {
        id: invoiceId,
        invoiceNumber: invoiceNum,
        orderId,
        orderNumber: orderNum,
        clientId: targetClient.id,
        clientName: targetClient.name,
        issueDate: new Date().toISOString(),
        dueDate: newOrder.dueDate,
        items: [
          { id: 'itm_' + Date.now(), description: `Bespoke tailoring of custom designed ${cType}`, qty: 1, unitPrice: orderPrice, amount: orderPrice }
        ],
        subtotal: orderPrice,
        discount: 0,
        tax: orderPrice * 0.05,
        total: orderPrice * 1.05,
        amountPaid: 0,
        paymentStatus: 'UNPAID',
        notes: `Voice-initiated booking draft for standard ${cType} design.`
      };

      orders.unshift(newOrder);
      invoices.unshift(newInvoice);
      writeJsonFile(ORDERS_FILE, orders);
      writeJsonFile(INVOICES_FILE, invoices);

      parsedResult.speakResponse = `I have logged a new Bespoke Order ${orderNum} for custom ${cType} on account of ${targetClient.name}. Ready for pick-up by estimated fitting timeline in 14 days. Value of booking is ₹${orderPrice}.`;
    } else if (intent === 'INFO_RETRIEVAL' && targetClient) {
      const activeOrd = orders.find(o => o.clientId === targetClient!.id);
      parsedResult.speakResponse = `Retrieved fit profile for ${targetClient.name}. Chest measurement is ${targetClient.measurements.chest || 'unrecorded'}, waist is ${targetClient.measurements.waist || 'unrecorded'}. Latest order is ${activeOrd ? activeOrd.orderNumber + ' status ' + activeOrd.status : 'None'}.`;
    }

    res.json(parsedResult);
  } catch (error) {
    console.error('Error processing voice instruction:', error);
    res.status(500).json({ message: 'Internal voice assistant logic error', details: String(error) });
  }
});

// Support parser helper for local offline command execution
function localVoiceParser(transcript: string) {
  const norm = transcript.toLowerCase();
  
  let matchedClient = clients[0];
  for (const c of clients) {
    if (norm.includes(c.name.toLowerCase().split(' ')[0])) {
      matchedClient = c;
      break;
    }
  }

  // Check update measurements
  if (norm.includes('chest') || norm.includes('waist') || norm.includes('hips') || norm.includes('neck') || norm.includes('sleeves') || norm.includes('length')) {
    const measurements: { [key: string]: number } = {};
    const words = norm.replace(/[",.?]/g, '').split(' ');
    const params = ['chest', 'waist', 'hips', 'neck', 'sleeves', 'length', 'shoulder', 'inseam', 'collar'];
    
    for (const p of params) {
      if (norm.includes(p)) {
        const idx = words.indexOf(p);
        let num: number | null = null;
        if (idx !== -1 && idx + 1 < words.length) {
          const val = parseFloat(words[idx + 1]);
          if (!isNaN(val)) num = val;
        }
        if (num === null) {
          const matches = norm.match(/\d+(\.\d+)?/);
          if (matches && matches.length > 0) num = parseFloat(matches[0]);
        }
        if (num !== null) measurements[p] = num;
      }
    }

    if (Object.keys(measurements).length > 0) {
      return {
        intent: "UPDATE_MEASUREMENTS",
        clientId: matchedClient?.id || 'client_1',
        clientNameMatched: matchedClient?.name || 'Margaret Sterling',
        measurements,
        speakResponse: `Local Fallback: Adjusted fit profile for ${matchedClient?.name || 'Margaret'} by modifying ${Object.keys(measurements).join(', ')}.`
      };
    }
  }

  // Create order
  if (norm.includes('order') || norm.includes('new') || norm.includes('place') || norm.includes('take')) {
    let clothingType = 'Suit';
    const types = ['Suit', 'Shirt', 'Pants', 'Tuxedo', 'Kurta', 'Blouse', 'Lehenga', 'Dress', 'Coat', 'Sherwani'];
    for (const t of types) {
      if (norm.includes(t.toLowerCase())) {
        clothingType = t;
        break;
      }
    }

    let price = 500;
    const priceMatch = norm.match(/\d+/);
    if (priceMatch) {
      price = parseInt(priceMatch[0]);
    }

    return {
      intent: "CREATE_ORDER",
      clientId: matchedClient?.id || 'client_1',
      clientNameMatched: matchedClient?.name || 'Margaret Sterling',
      clothingType,
      price,
      speakResponse: `Local Fallback: Created new draft order for ${clothingType} valued at ₹${price} belonging to ${matchedClient?.name || 'Margaret'}.`
    };
  }

  return {
    intent: "INFO_RETRIEVAL",
    clientId: matchedClient?.id || 'client_1',
    clientNameMatched: matchedClient?.name || 'Margaret Sterling',
    speakResponse: `Local Fallback: Found fit record for ${matchedClient?.name || 'Margaret'}. Measurements: chest is ${matchedClient?.measurements.chest || '36'}, waist is ${matchedClient?.measurements.waist || '28'}.`
  };
}

// 5. System Stats API
app.get('/api/stats', (req, res) => {
  const activeOrders = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'COMPLETED').length;
  const totalClientCount = clients.length;
  const garmentStitchedCount = orders.filter(o => o.status === 'COMPLETED' || o.status === 'DELIVERED').length;

  // Revenue analytics
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const receivedRevenue = orders.reduce((sum, o) => sum + o.amountPaid, 0);
  const outstandingRevenue = Math.max(0, totalRevenue - receivedRevenue);

  // Status distributions
  const statusStats = {
    PENDING: orders.filter(o => o.status === 'PENDING').length,
    FABRIC_RECEIVED: orders.filter(o => o.status === 'FABRIC_RECEIVED').length,
    CUTTING: orders.filter(o => o.status === 'CUTTING').length,
    STITCHING: orders.filter(o => o.status === 'STITCHING').length,
    TRIAL: orders.filter(o => o.status === 'TRIAL').length,
    COMPLETED: orders.filter(o => o.status === 'COMPLETED').length,
    DELIVERED: orders.filter(o => o.status === 'DELIVERED').length
  };

  res.json({
    activeOrders,
    totalClientCount,
    garmentStitchedCount,
    totalRevenue,
    receivedRevenue,
    outstandingRevenue,
    statusStats
  });
});

// --- MAIN SERVER / VITE INTEGRATION ---

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    // Development server handling with Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Production serving from compiled bundle
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Tailor Master Server] listening on http://localhost:${PORT}`);
  });
}

start();
