import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  CircleDollarSign, 
  Activity, 
  Sparkles,
  Scissors,
  ArrowRight,
  Clock,
  Shirt
} from 'lucide-react';
import { Order, Client, OrderStatus } from '../types';

interface Stats {
  activeOrders: number;
  totalClientCount: number;
  garmentStitchedCount: number;
  totalRevenue: number;
  receivedRevenue: number;
  outstandingRevenue: number;
  statusStats: Record<OrderStatus, number>;
}

interface DashboardOverviewProps {
  orders: Order[];
  clients: Client[];
  setActiveTab: (tab: string) => void;
  setSelectedOrderForView: (order: Order | null) => void;
}

export default function DashboardOverview({ orders, clients, setActiveTab, setSelectedOrderForView }: DashboardOverviewProps) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    // Generate accurate stats from full listings
    const active = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'COMPLETED').length;
    const garCount = orders.filter(o => o.status === 'COMPLETED' || o.status === 'DELIVERED').length;
    const totalRev = orders.reduce((sum, o) => sum + o.total, 0);
    const paidRev = orders.reduce((sum, o) => sum + o.amountPaid, 0);
    const outstanding = Math.max(0, totalRev - paidRev);

    const counts: Record<OrderStatus, number> = {
      PENDING: 0,
      FABRIC_RECEIVED: 0,
      CUTTING: 0,
      STITCHING: 0,
      TRIAL: 0,
      COMPLETED: 0,
      DELIVERED: 0
    };

    orders.forEach(o => {
      if (counts[o.status] !== undefined) {
        counts[o.status]++;
      }
    });

    setStats({
      activeOrders: active,
      totalClientCount: clients.length,
      garmentStitchedCount: garCount,
      totalRevenue: totalRev,
      receivedRevenue: paidRev,
      outstandingRevenue: outstanding,
      statusStats: counts
    });
  }, [orders, clients]);

  // Helper for progress color tags
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-natural-panel text-natural-muted border-natural-border';
      case 'FABRIC_RECEIVED':
        return 'bg-white text-natural-muted border-natural-border';
      case 'CUTTING':
        return 'bg-natural-panel text-natural-text border-natural-border';
      case 'STITCHING':
        return 'bg-natural-accent text-white border-transparent';
      case 'TRIAL':
        return 'bg-natural-secondary text-white border-transparent';
      case 'COMPLETED':
        return 'bg-natural-secondary text-white border-transparent';
      case 'DELIVERED':
        return 'bg-natural-panel text-natural-muted border-natural-border';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Hero Workspace Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-natural-accent text-white border border-natural-border shadow-md group">
        <div className="absolute inset-0 bg-gradient-to-r from-natural-accent/95 via-natural-accent/80 to-transparent z-10" />
        <img
          src="/src/assets/images/tailor_studio_banner_1781754127790.jpg"
          alt="Bespoke atelier banner"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-35 object-center transition-transform duration-700 group-hover:scale-105"
        />

        <div className="relative p-10 md:p-12 z-20 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 border border-white/35 text-white font-mono text-xs mb-5"
          >
            <Sparkles className="h-4 w-4 text-white" />
            <span>Master Atelier Workspace</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight"
          >
            Crafting Bespoke <br />
            <span className="text-white/90 font-serif italic font-normal">Sartorial Masterpieces</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-natural-bg font-sans text-sm leading-relaxed mt-4 opacity-90"
          >
            Welcome back to your tailoring control hub. Monitor live garment workflows, review customer fitting charts, and generate automated invoice sheets in real-time.
          </motion.p>
        </div>
      </div>

      {/* 2. Analytical Statistics Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-2xl border border-natural-border shadow-xs flex items-center justify-between"
          >
            <div>
              <p className="font-mono text-[11px] font-bold text-natural-muted uppercase tracking-wider">Active Fittings</p>
              <h3 className="font-serif text-3xl font-extrabold text-natural-text mt-1">{stats.activeOrders}</h3>
              <p className="text-xs text-natural-accent font-medium mt-1.5 flex items-center gap-1">
                <span>In-production</span>
              </p>
            </div>
            <div className="p-4 bg-natural-panel border border-natural-border rounded-xl text-natural-accent">
              <Activity className="h-6 w-6" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-2xl border border-natural-border shadow-xs flex items-center justify-between"
          >
            <div>
              <p className="font-mono text-[11px] font-bold text-natural-muted uppercase tracking-wider">Registered Clients</p>
              <h3 className="font-serif text-3xl font-extrabold text-natural-text mt-1">{stats.totalClientCount}</h3>
              <p className="text-xs text-natural-muted mt-1.5">Secure measurement profiles</p>
            </div>
            <div className="p-4 bg-natural-panel border border-natural-border rounded-xl text-natural-accent">
              <Users className="h-6 w-6" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-2xl border border-natural-border shadow-xs flex items-center justify-between"
          >
            <div>
              <p className="font-mono text-[11px] font-bold text-natural-muted uppercase tracking-wider">Total Revenue Generated</p>
              <h3 className="font-serif text-3xl font-extrabold text-natural-secondary mt-1">₹{stats.totalRevenue.toLocaleString()}</h3>
              <p className="text-xs text-natural-muted mt-1.5">₹{stats.receivedRevenue.toLocaleString()} collected sync</p>
            </div>
            <div className="p-4 bg-natural-panel border border-natural-border rounded-xl text-natural-secondary">
              <CircleDollarSign className="h-6 w-6" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-2xl border border-natural-border shadow-xs flex items-center justify-between"
          >
            <div>
              <p className="font-mono text-[11px] font-bold text-natural-muted uppercase tracking-wider">Outstanding Balances</p>
              <h3 className="font-serif text-3xl font-extrabold text-[#A0522D] mt-1">₹{stats.outstandingRevenue.toLocaleString()}</h3>
              <p className="text-xs text-[#A0522D] font-medium mt-1.5">Awaiting final trial releases</p>
            </div>
            <div className="p-4 bg-red-50/50 border border-red-100 rounded-xl text-[#A0522D]">
              <TrendingUp className="h-6 w-6" />
            </div>
          </motion.div>
        </div>
      )}

      {/* 4. Live Progress Table Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Live Active Fitting Queue */}
        <div className="bg-white p-6 rounded-2xl border border-natural-border shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="font-serif font-bold text-natural-text text-base">Active Order fitting queue</h4>
                <p className="text-natural-muted text-xs mt-0.5">Top urgent bespoke tailoring contracts</p>
              </div>
              <button 
                onClick={() => setActiveTab('orders')}
                className="text-natural-accent hover:text-natural-muted font-sans font-bold text-xs flex items-center gap-1 group cursor-pointer"
              >
                <span>Full Board</span>
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {orders.slice(0, 4).map((order) => {
                const daysRemaining = Math.max(0, Math.ceil((new Date(order.dueDate).getTime() - Date.now()) / (1000 * 3600 * 24)));
                
                return (
                  <div 
                    key={order.id}
                    onClick={() => {
                      setSelectedOrderForView(order);
                      setActiveTab('orders');
                    }}
                    className="p-4 rounded-xl border border-natural-border hover:bg-natural-panel/30 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <div className="h-10 w-10 bg-natural-panel rounded-xl flex items-center justify-center text-natural-accent border border-natural-border group-hover:bg-natural-panel shrink-0">
                        <Shirt className="h-5 w-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className="font-serif font-bold text-natural-text text-sm truncate">
                            {order.clientName}
                          </h5>
                          <span className="font-mono text-[10px] text-natural-muted">
                            {order.orderNumber}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-natural-muted truncate block max-w-md">
                            {order.clothingType} ({order.fabricDetails ? order.fabricDetails.substring(0, 40) : ''}...)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {/* Due Indicators */}
                      <div className="text-right hidden sm:block">
                        <p className="text-xs font-sans font-semibold text-natural-text flex items-center gap-1 justify-end">
                          <Clock className="h-3.5 w-3.5 text-natural-muted" />
                          <span>{daysRemaining === 0 ? 'Due Today' : `${daysRemaining} days left`}</span>
                        </p>
                        <p className="font-mono text-[9px] text-natural-muted mt-0.5">
                          Limit: {new Date(order.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                      </div>

                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-mono font-medium border ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                );
              })}

              {orders.length === 0 && (
                <div className="py-12 text-center text-natural-muted text-sm">
                  No active orders in queue. Create orders to monitor fits.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Client Interactions Quick-list */}
        <div className="bg-white p-6 rounded-2xl border border-natural-border shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="font-serif font-bold text-natural-text text-base">Atelier Client Registry</h4>
                <p className="text-natural-muted text-xs mt-0.5">Latest measurement folders updated</p>
              </div>
              <button 
                onClick={() => setActiveTab('clients')}
                className="text-natural-accent hover:text-natural-muted font-sans font-bold text-xs flex items-center gap-1 group cursor-pointer"
              >
                <span>Full List</span>
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            <div className="space-y-4">
              {clients.slice(0, 4).map((client) => {
                const measCount = Object.keys(client.measurements).filter(m => m !== 'notes').length;
                return (
                  <div 
                    key={client.id}
                    onClick={() => setActiveTab('clients')}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-natural-panel/40 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 bg-natural-panel text-natural-text rounded-lg flex items-center justify-center font-bold font-sans text-xs shrink-0 border border-natural-border">
                        {client.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="min-w-0">
                        <h5 className="font-serif font-bold text-natural-text text-sm truncate">
                          {client.name}
                        </h5>
                        <p className="text-[11px] font-mono text-natural-muted mt-0.5">
                          {client.phone}
                        </p>
                      </div>
                    </div>

                    <span className="shrink-0 px-2.5 py-1 rounded-full bg-natural-panel text-[10px] font-mono font-medium text-natural-accent border border-natural-border">
                      {measCount} params
                    </span>
                  </div>
                );
              })}

              {clients.length === 0 && (
                <div className="py-12 text-center text-natural-muted text-sm">
                  Atelier registry is empty. Register clients to track profiles.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
