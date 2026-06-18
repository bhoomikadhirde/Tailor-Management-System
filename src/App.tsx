import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scissors, 
  Lock, 
  Mail, 
  Key, 
  User as UserIcon, 
  AlertCircle,
  Sparkle
} from 'lucide-react';

import { Client, Order, Invoice, User, UserRole, Measurements, PaymentStatus } from './types';
import Sidebar from './components/Sidebar';
import DashboardOverview from './components/DashboardOverview';
import ClientProfiles from './components/ClientProfiles';
import MeasurementsForm from './components/MeasurementsForm';
import OrdersTracker from './components/OrdersTracker';
import InvoicesList from './components/InvoicesList';
import SpringBootExplorer from './components/SpringBootExplorer';
import ClientCommunications from './components/ClientCommunications';
import AtelierAssistant from './components/AtelierAssistant';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedClientForMeasurements, setSelectedClientForMeasurements] = useState<Client | null>(null);
  const [selectedOrderForView, setSelectedOrderForView] = useState<Order | null>(null);

  // Core full-stack state lists
  const [clients, setClients] = useState<Client[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Sign-in states
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Sync state lists from the Express backend APIs
  const fetchAllData = async () => {
    try {
      const clientsRes = await fetch('/api/clients');
      if (clientsRes.ok) {
        const data = await clientsRes.json();
        setClients(data);
      }

      const ordersRes = await fetch('/api/orders');
      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders(data);
      }

      const invoicesRes = await fetch('/api/invoices');
      if (invoicesRes.ok) {
        const data = await invoicesRes.json();
        setInvoices(data);
      }
    } catch (err) {
      console.warn('Network fetching error, utilizing in-memory seed models.');
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchAllData();
    }
  }, [currentUser]);

  // Auth Action
  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthenticating(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passwordInput })
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        setCurrentUser(resData.user);
      } else {
        setAuthError(resData.message || 'Verification rejected. Check credentials.');
      }
    } catch (err) {
      // Offline fallback credentials
      if (emailInput === 'admin@tailor.com' && passwordInput === 'admin123') {
        setCurrentUser({
          id: 'user_admin',
          username: 'admin_owner',
          email: 'admin@tailor.com',
          role: UserRole.ADMIN,
          fullName: 'Bhoomika Sterling'
        });
      } else if (emailInput === 'tailor@tailor.com' && passwordInput === 'tailor123') {
        setCurrentUser({
          id: 'user_tailor',
          username: 'master_cutter',
          email: 'tailor@tailor.com',
          role: UserRole.TAILOR,
          fullName: 'Master Cutter Ramesh'
        });
      } else {
        setAuthError('Network Offline. Preset fallback options: admin@tailor.com / admin123');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleShortcutLogin = (email: string, pass: string) => {
    setEmailInput(email);
    setPasswordInput(pass);
    setAuthError('');
  };

  // 1. Client CRUD Operations linked to full-stack Express
  const handleAddClient = async (clientData: Partial<Client>) => {
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData)
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (err) {
      // In-memory fallback
      const mockNew: Client = {
        id: 'client_' + Date.now(),
        name: clientData.name || '',
        phone: clientData.phone || '',
        email: clientData.email || '',
        address: clientData.address || '',
        gender: clientData.gender || 'FEMALE',
        measurements: {},
        notes: clientData.notes || '',
        createdAt: new Date().toISOString()
      };
      setClients(prev => [mockNew, ...prev]);
    }
  };

  const handleUpdateClient = async (clientId: string, clientData: Partial<Client>) => {
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData)
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (err) {
      setClients(prev => prev.map(c => c.id === clientId ? { ...c, ...clientData } : c));
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (err) {
      setClients(prev => prev.filter(c => c.id !== clientId));
    }
  };

  // 2. Measurements Fit modifier
  const handleUpdateMeasurements = async (clientId: string, measurements: Measurements) => {
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ measurements })
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (err) {
      setClients(prev => prev.map(c => c.id === clientId ? { ...c, measurements } : c));
    }
  };

  // 3. Orders Production Workflows with Auto-Billing Sync
  const handleAddOrder = async (orderData: Partial<Order>) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (err) {
      // In-memory fallback
      const client = clients.find(c => c.id === orderData.clientId);
      if (!client) return;

      const total = (orderData.price || 0) - (orderData.discount || 0) + (orderData.tax || 0);
      const paid = orderData.amountPaid || 0;
      let paymentStatus: PaymentStatus = 'UNPAID';
      if (paid >= total && total > 0) {
        paymentStatus = 'PAID';
      } else if (paid > 0) {
        paymentStatus = 'PARTIAL';
      }

      const mockOrderId = 'order_' + Date.now();
      const mockInvId = 'inv_' + Date.now();

      const mockOrder: Order = {
        id: mockOrderId,
        clientId: client.id,
        clientName: client.name,
        orderNumber: 'ORD-2026-' + (1000 + orders.length + 1),
        clothingType: orderData.clothingType || 'Suit',
        fabricDetails: orderData.fabricDetails || '',
        status: 'PENDING',
        measurementSnapshot: { ...client.measurements },
        orderDate: new Date().toISOString(),
        dueDate: orderData.dueDate || new Date().toISOString(),
        price: orderData.price || 0,
        discount: orderData.discount || 0,
        tax: orderData.tax || 0,
        total,
        amountPaid: paid,
        paymentStatus,
        notes: orderData.notes,
        invoiceId: mockInvId
      };

      const mockInv: Invoice = {
        id: mockInvId,
        invoiceNumber: 'INV-2026-' + (2000 + invoices.length + 1),
        orderId: mockOrderId,
        orderNumber: mockOrder.orderNumber,
        clientId: client.id,
        clientName: client.name,
        issueDate: mockOrder.orderDate,
        dueDate: mockOrder.dueDate,
        items: [{ id: 'itm_1', description: `Bespoke Stitching of ${mockOrder.clothingType}`, qty: 1, unitPrice: mockOrder.price, amount: mockOrder.price }],
        subtotal: mockOrder.price,
        discount: mockOrder.discount,
        tax: mockOrder.tax,
        total,
        amountPaid: paid,
        paymentStatus
      };

      setOrders(prev => [mockOrder, ...prev]);
      setInvoices(prev => [mockInv, ...prev]);
    }
  };

  const handleUpdateOrder = async (orderId: string, orderData: Partial<Order>) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (err) {
      // In-memory fallback
      setOrders(prev => prev.map(o => {
        if (o.id === orderId) {
          const updated = { ...o, ...orderData };
          // Sync billing formulas
          const total = updated.price - updated.discount + updated.tax;
          updated.total = total;
          if (updated.amountPaid >= total && total > 0) {
            updated.paymentStatus = 'PAID';
          } else if (updated.amountPaid > 0) {
            updated.paymentStatus = 'PARTIAL';
          } else {
            updated.paymentStatus = 'UNPAID';
          }
          return updated;
        }
        return o;
      }));
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (err) {
      const targetO = orders.find(o => o.id === orderId);
      setOrders(prev => prev.filter(o => o.id !== orderId));
      if (targetO?.invoiceId) {
        setInvoices(prev => prev.filter(i => i.id !== targetO.invoiceId));
      }
    }
  };

  // 4. Ledger Payments Sync
  const handleTriggerPayment = async (invoiceId: string, amountPaid: number) => {
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountPaid })
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (err) {
      setInvoices(prev => prev.map(i => {
        if (i.id === invoiceId) {
          let paymentStatus: PaymentStatus = 'UNPAID';
          if (amountPaid >= i.total) paymentStatus = 'PAID';
          else if (amountPaid > 0) paymentStatus = 'PARTIAL';
          return { ...i, amountPaid, paymentStatus };
        }
        return i;
      }));
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
    setSelectedClientForMeasurements(null);
    setSelectedOrderForView(null);
  };

  // Active rendering director
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardOverview
            orders={orders}
            clients={clients}
            setActiveTab={setActiveTab}
            setSelectedOrderForView={setSelectedOrderForView}
          />
        );
      case 'clients':
        return (
          <ClientProfiles
            clients={clients}
            currentUser={currentUser}
            onAddClient={handleAddClient}
            onUpdateClient={handleUpdateClient}
            onDeleteClient={handleDeleteClient}
            setActiveTab={setActiveTab}
            setSelectedClientForMeasurements={setSelectedClientForMeasurements}
          />
        );
      case 'measurements':
        return (
          <MeasurementsForm
            clients={clients}
            selectedClient={selectedClientForMeasurements}
            onUpdateMeasurements={handleUpdateMeasurements}
            setSelectedClient={setSelectedClientForMeasurements}
          />
        );
      case 'orders':
        return (
          <OrdersTracker
            orders={orders}
            clients={clients}
            currentUser={currentUser}
            onAddOrder={handleAddOrder}
            onUpdateOrder={handleUpdateOrder}
            onDeleteOrder={handleDeleteOrder}
            selectedOrderForView={selectedOrderForView}
            setSelectedOrderForView={setSelectedOrderForView}
          />
        );
      case 'invoices':
        return (
          <InvoicesList
            invoices={invoices}
            onTriggerPayment={handleTriggerPayment}
          />
        );
      case 'springboot':
        return <SpringBootExplorer />;
      case 'communications':
        return <ClientCommunications clients={clients} />;
      case 'assistant':
        return <AtelierAssistant clients={clients} onDataUpdate={fetchAllData} />;
      default:
        return <div className="text-stone-500">View panel initialization error.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50/70 text-stone-900 flex select-none font-sans overflow-x-hidden antialiased">
      
      <AnimatePresence mode="wait">
        {!currentUser ? (
          /* Login Portal page with micro textures */
          <motion.div
            key="login-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 min-h-screen relative flex items-center justify-center p-6 bg-stone-100"
          >
            {/* Grid pattern drafting sheet visual background */}
            <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />

            <div className="w-full max-w-md bg-white border border-stone-200/80 p-8 rounded-3xl shadow-xl space-y-6 relative z-10 overflow-hidden">
              {/* Dotted seam borders across login boundaries */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500/80 via-amber-200 to-amber-700/80" />

              <div className="text-center space-y-2">
                <div className="inline-flex h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 items-center justify-center text-amber-600 shadow-sm mb-2 transform -rotate-12 hover:rotate-0 transition-transform">
                  <Scissors className="h-7 w-7" />
                </div>
                <h1 className="font-sans text-2xl font-black text-stone-950 tracking-tight leading-tight">
                  Bespoke <span className="text-amber-500 hover:text-amber-600 cursor-pointer">Atelier</span> Login
                </h1>
                <p className="text-xs text-stone-500 leading-normal max-w-xs mx-auto">
                  Access custom measurement drafting files, invoice records, and Spring Boot rest controllers securely.
                </p>
              </div>

              {authError && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-2 text-xs"
                >
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5 text-red-600" />
                  <span>{authError}</span>
                </motion.div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold text-stone-500 uppercase tracking-widest">
                    Atelier Registered Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-stone-400" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. admin@tailor.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-sans text-sm focus:outline-none placeholder-stone-400"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold text-stone-500 uppercase tracking-widest">
                    Atelier Access Key
                  </label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-stone-400" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-sans text-sm focus:outline-none placeholder-stone-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-stone-950 hover:bg-stone-900 text-white rounded-xl font-sans font-bold text-xs uppercase tracking-widest transition-all shadow-md active:scale-95"
                >
                  <Lock className="h-4 w-4" />
                  <span>{isAuthenticating ? 'Authorizing access...' : 'Access Workspace'}</span>
                </button>
              </form>

              {/* Quick Preset Buttons */}
              <div className="pt-4 border-t border-stone-100">
                <p className="text-center font-mono text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-2.5">
                  Atelier Role Simulation Keyrings
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleShortcutLogin('admin@tailor.com', 'admin123')}
                    className="p-2 border border-stone-200 hover:border-amber-400 hover:bg-amber-500/5 rounded-xl text-center text-[11px] font-sans transition-all"
                  >
                    <span className="font-bold text-stone-800 block">Owner Keys</span>
                    <span className="text-[10px] text-amber-600 uppercase font-bold font-serif">Admin</span>
                  </button>
                  <button
                    onClick={() => handleShortcutLogin('tailor@tailor.com', 'tailor123')}
                    className="p-2 border border-stone-200 hover:border-amber-400 hover:bg-amber-500/5 rounded-xl text-center text-[11px] font-sans transition-all"
                  >
                    <span className="font-bold text-stone-800 block">Master Tailor</span>
                    <span className="text-[10px] text-amber-600 uppercase font-bold font-serif">Tailor</span>
                  </button>
                  <button
                    onClick={() => handleShortcutLogin('customer@tailor.com', 'customer123')}
                    className="p-2 border border-stone-200 hover:border-amber-400 hover:bg-amber-500/5 rounded-xl text-center text-[11px] font-sans transition-all"
                  >
                    <span className="font-bold text-stone-800 block">Arthur Pendelton</span>
                    <span className="text-[10px] text-amber-600 uppercase font-bold font-serif">Customer</span>
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        ) : (
          /* Main Workspace Dashboard */
          <motion.div
            key="dashboard-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 min-h-screen flex"
          >
            {/* Sidebar component */}
            <Sidebar
              currentUser={currentUser}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onLogout={handleLogout}
            />

            {/* Main view scroll container */}
            <main className="flex-1 p-8 lg:p-12 overflow-y-auto custom-scrollbar relative">
              
              {/* Dynamic decorative top-right chalk thread seams */}
              <div className="absolute top-12 right-12 flex gap-1 opacity-10 select-none pointer-events-none">
                <Sparkle className="h-4 w-4 font-serif italic" />
                <span className="h-[1px] w-20 border-b border-dashed border-stone-900 self-center" />
              </div>

              {renderActiveTab()}
            </main>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
