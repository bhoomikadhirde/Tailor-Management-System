export enum UserRole {
  ADMIN = 'ADMIN', // Admin/Owner
  TAILOR = 'TAILOR', // Master Tailor / Cutter
  CUSTOMER = 'CUSTOMER' // Customer / Viewer
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  fullName: string;
}

export type ClothingType =
  | 'Suit'
  | 'Shirt'
  | 'Pants'
  | 'Tuxedo'
  | 'Kurta'
  | 'Blouse'
  | 'Lehenga'
  | 'Dress'
  | 'Coat'
  | 'Sherwani';

export type OrderStatus =
  | 'PENDING'
  | 'FABRIC_RECEIVED'
  | 'CUTTING'
  | 'STITCHING'
  | 'TRIAL'
  | 'COMPLETED'
  | 'DELIVERED';

export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID';

export interface Measurements {
  neck?: number;
  chest?: number;
  bust?: number;
  waist?: number;
  hips?: number;
  shoulder?: number;
  sleeves?: number;
  length?: number;
  inseam?: number;
  cuff?: number;
  collar?: number;
  upperArm?: number;
  notes?: string;
  updatedAt?: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  measurements: Measurements;
  notes?: string;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  orderNumber: string;
  clientId: string;
  clientName: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  amountPaid: number;
  paymentStatus: PaymentStatus;
  notes?: string;
}

export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  orderNumber: string;
  clothingType: ClothingType;
  fabricDetails: string;
  status: OrderStatus;
  measurementSnapshot: Measurements;
  orderDate: string;
  dueDate: string;
  price: number;
  discount: number;
  tax: number;
  total: number;
  amountPaid: number;
  paymentStatus: PaymentStatus;
  notes?: string;
  invoiceId?: string;
}

export interface MessageTemplate {
  id: string;
  label: string;
  channel: 'EMAIL' | 'SMS';
  content: string;
}

export interface CommunicationLog {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  event: 'order_completion' | 'appointment_confirmation' | 'upcoming_promotions' | 'manual';
  channel: 'EMAIL' | 'SMS';
  message: string;
  sentAt: string;
  status: 'SENT' | 'FAILED';
  orderNumber?: string;
}

export interface SpringBootFile {
  name: string;
  path: string;
  content: string;
  type: 'CONTROLLER' | 'MODEL' | 'SERVICE' | 'REPOSITORY' | 'CONFIG' | 'SQL' | 'PROPERTIES';
  description: string;
}
