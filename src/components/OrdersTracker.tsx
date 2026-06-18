import { useState, FormEvent, MouseEvent } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  ChevronRight, 
  Calendar, 
  CircleDollarSign, 
  Activity, 
  HelpCircle, 
  User as UserIcon, 
  Scissors, 
  ShoppingBag,
  Clock,
  Trash2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { Order, Client, OrderStatus, UserRole, User, ClothingType } from '../types';

interface OrdersTrackerProps {
  orders: Order[];
  clients: Client[];
  currentUser: User | null;
  onAddOrder: (orderData: Partial<Order>) => Promise<void>;
  onUpdateOrder: (orderId: string, orderData: Partial<Order>) => Promise<void>;
  onDeleteOrder: (orderId: string) => Promise<void>;
  selectedOrderForView: Order | null;
  setSelectedOrderForView: (order: Order | null) => void;
}

export default function OrdersTracker({
  orders,
  clients,
  currentUser,
  onAddOrder,
  onUpdateOrder,
  onDeleteOrder,
  selectedOrderForView,
  setSelectedOrderForView
}: OrdersTrackerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Form State
  const [formData, setFormData] = useState({
    clientId: '',
    clothingType: 'Suit' as ClothingType,
    fabricDetails: '',
    dueDate: '',
    price: 350,
    discount: 0,
    tax: 15,
    amountPaid: 0,
    notes: ''
  });

  const columns: { id: OrderStatus; label: string; color: string }[] = [
    { id: 'PENDING', label: 'Order Registered', color: 'bg-natural-panel border-natural-border text-natural-text' },
    { id: 'FABRIC_RECEIVED', label: 'Fabric Received', color: 'bg-natural-accent/10 border-natural-accent/25 text-natural-accent' },
    { id: 'CUTTING', label: 'Pattern Cutting', color: 'bg-natural-accent/15 border-natural-accent/30 text-natural-accent' },
    { id: 'STITCHING', label: 'Main Stitching', color: 'bg-natural-accent/20 border-natural-accent/35 text-natural-accent font-semibold' },
    { id: 'TRIAL', label: 'Trial & Fittings', color: 'bg-natural-accent/10 border-natural-accent/20 text-natural-text' },
    { id: 'COMPLETED', label: 'Trial Approved', color: 'bg-[#9A9B7C]/15 border-[#9A9B7C]/30 text-[#4A5D4E] font-semibold' },
    { id: 'DELIVERED', label: 'Released / Dispatched', color: 'bg-natural-panel/80 border-natural-border text-natural-muted' }
  ];

  const handleCreateOrderSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.clientId || !formData.clothingType) {
      alert('Validation Error: Please select an active client for this order.');
      return;
    }

    try {
      await onAddOrder(formData);
      setIsAdding(false);
      // Reset
      setFormData({
        clientId: '',
        clothingType: 'Suit',
        fabricDetails: '',
        dueDate: '',
        price: 350,
        discount: 0,
        tax: 15,
        amountPaid: 0,
        notes: ''
      });
    } catch (err) {
      console.error('Error adding order:', err);
    }
  };

  const handleNextStatus = async (order: Order, e: MouseEvent) => {
    e.stopPropagation();
    if (currentUser?.role === UserRole.CUSTOMER) {
      alert('Security Protection: Viewer credentials cannot modify production workflows.');
      return;
    }

    const currentIndex = columns.findIndex(col => col.id === order.status);
    if (currentIndex === -1 || currentIndex === columns.length - 1) return;

    const nextStatus = columns[currentIndex + 1].id;
    try {
      await onUpdateOrder(order.id, { status: nextStatus });
    } catch (err) {
      console.error('Error shifting status:', err);
    }
  };

  const handleStatusSelectChange = async (order: Order, newStatus: OrderStatus) => {
    if (currentUser?.role === UserRole.CUSTOMER) {
      alert('Security Protection: Viewer credentials cannot modify production workflows.');
      return;
    }
    try {
      await onUpdateOrder(order.id, { status: newStatus });
    } catch (err) {
      console.error('Error setting status:', err);
    }
  };

  const handleDelete = async (orderId: string, e: MouseEvent) => {
    e.stopPropagation();
    if (currentUser?.role !== UserRole.ADMIN) {
      alert('Privileged Error: Delete credentials limited to ADMIN-level security keys.');
      return;
    }
    if (confirm('Verify: Deleting this garment contract will permanently delete the invoice as well. Continue?')) {
      try {
        await onDeleteOrder(orderId);
        if (selectedOrderForView?.id === orderId) {
          setSelectedOrderForView(null);
        }
      } catch (err) {
        console.error('Error deleting order:', err);
      }
    }
  };

  const filteredOrders = orders.filter(o => {
    if (statusFilter === 'ALL') return true;
    return o.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Tracker Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-natural-text tracking-tight">Atelier Order Workflows</h2>
          <p className="text-natural-muted text-xs mt-0.5">Track stitching milestones from raw fabric to delivered items.</p>
        </div>

        {currentUser?.role !== UserRole.CUSTOMER && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-5 py-3 rounded-xl bg-natural-accent text-white hover:bg-natural-muted font-sans font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create Stitching Draft</span>
          </button>
        )}
      </div>

      {/* Adding dialog panel */}
      {isAdding && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-6 rounded-2xl border border-natural-border shadow-xs space-y-6"
        >
          <div className="flex items-center justify-between pb-4 border-b border-natural-border">
            <h3 className="font-serif font-bold text-natural-text text-base">
              Establish Custom Sewing Order Draft
            </h3>
            <button 
              onClick={() => setIsAdding(false)}
              className="font-sans font-bold text-xs text-natural-muted hover:text-natural-text uppercase cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreateOrderSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div>
                <label className="block text-xs font-mono font-bold text-natural-muted uppercase mb-1.5">
                  Select Registered Client <span className="text-[#A0522D]">*</span>
                </label>
                <select
                  required
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-natural-border focus:border-natural-accent focus:ring-1 focus:ring-natural-accent font-sans text-sm focus:outline-none bg-natural-bg text-natural-text"
                >
                  <option value="">-- Choose client profile --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-natural-muted uppercase mb-1.5">
                  Garment Fit Type <span className="text-[#A0522D]">*</span>
                </label>
                <select
                  value={formData.clothingType}
                  onChange={(e) => setFormData({ ...formData, clothingType: e.target.value as ClothingType })}
                  className="w-full px-4 py-3 rounded-xl border border-natural-border focus:border-natural-accent focus:ring-1 focus:ring-natural-accent font-sans text-sm focus:outline-none bg-natural-bg text-natural-text"
                >
                  <option value="Suit">3-Piece Suit</option>
                  <option value="Shirt">Classic Shirt</option>
                  <option value="Pants">Tailored Trousers</option>
                  <option value="Tuxedo">Velvety Tuxedo</option>
                  <option value="Kurta">Traditional Kurta</option>
                  <option value="Blouse">Classic Saree Blouse</option>
                  <option value="Lehenga">Custom Lehenga</option>
                  <option value="Dress">A-Line Evening Dress</option>
                  <option value="Coat">Chesterfield Overcoat</option>
                  <option value="Sherwani">Wedding Sherwani</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-natural-muted uppercase mb-1.5">
                  Delivery due limit <span className="text-[#A0522D]">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-natural-border focus:border-natural-accent focus:ring-1 focus:ring-natural-accent font-sans text-sm focus:outline-none bg-natural-bg text-natural-text"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-mono font-bold text-natural-muted uppercase mb-1.5">
                  Fabric details description <span className="text-[#A0522D]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 3.5m Italian Wool (Super 120s), Charcoal check pattern, silk interior, hand shoulders."
                  value={formData.fabricDetails}
                  onChange={(e) => setFormData({ ...formData, fabricDetails: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-natural-border focus:border-natural-accent focus:ring-1 focus:ring-natural-accent font-sans text-sm focus:outline-none bg-natural-bg text-natural-text"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-natural-muted uppercase mb-1.5">
                  Bespoke Stiching Fee (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl border border-natural-border focus:border-natural-accent focus:ring-1 focus:ring-natural-accent font-sans text-sm focus:outline-none bg-natural-bg text-natural-text"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-natural-muted uppercase mb-1.5">
                  Down-payment Deposit (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.amountPaid}
                  onChange={(e) => setFormData({ ...formData, amountPaid: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl border border-natural-border focus:border-natural-accent focus:ring-1 focus:ring-natural-accent font-sans text-sm focus:outline-none bg-natural-bg text-natural-text"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-natural-muted uppercase mb-1.5">
                  Atelier Surcharge Taxes (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.tax}
                  onChange={(e) => setFormData({ ...formData, tax: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl border border-natural-border focus:border-natural-accent focus:ring-1 focus:ring-natural-accent font-sans text-sm focus:outline-none bg-natural-bg text-natural-text"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-mono font-bold text-natural-muted uppercase mb-1.5">
                  Tailoring execution notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Master tailor must verify seam balance. Keep sleeves and shoulder alignment verified."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-natural-border focus:border-natural-accent focus:ring-1 focus:ring-natural-accent font-sans text-sm focus:outline-none bg-natural-bg text-natural-text"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-natural-border">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2.5 rounded-xl border border-natural-border hover:bg-natural-panel font-sans text-xs font-bold uppercase transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-natural-accent hover:bg-natural-muted text-white font-sans text-xs font-bold uppercase shadow-sm transition-colors cursor-pointer"
              >
                Launch Production
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Filter Selector Panel */}
      <div className="flex flex-wrap bg-natural-panel p-1.5 rounded-2xl gap-1">
        {['ALL', ...columns.map(c => c.id)].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-xl text-xs font-sans font-bold transition-all uppercase cursor-pointer ${
              statusFilter === status 
                ? 'bg-white text-natural-text shadow-sm border border-natural-border/30' 
                : 'text-natural-muted hover:text-natural-text'
            }`}
          >
            {status === 'ALL' ? 'Total Lane' : status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Display Board in lane design if filtering ALL, or list search otherwise */}
      {statusFilter === 'ALL' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 items-stretch">
          {columns.map((col) => {
            const laneOrders = orders.filter(o => o.status === col.id);

            return (
              <div key={col.id} className="bg-natural-panel/40 p-4 border border-natural-border rounded-2xl flex flex-col min-h-[480px]">
                {/* Lane Header */}
                <div className="pb-3 border-b border-natural-border mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold border uppercase tracking-wider ${col.color}`}>
                    {col.label}
                  </span>
                  <div className="flex items-center justify-between text-[11px] font-mono text-natural-muted font-bold mt-1.5 px-1">
                    <span>Active fits:</span>
                    <span>{laneOrders.length}</span>
                  </div>
                </div>

                {/* Cards stack */}
                <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                  {laneOrders.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrderForView(order)}
                      className="bg-white p-4 rounded-xl border border-natural-border hover:border-natural-accent hover:shadow-xs cursor-pointer transition-all space-y-3 group"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="font-mono text-[9px] text-natural-muted font-bold bg-natural-panel px-1.5 py-0.5 rounded border border-natural-border">
                          {order.orderNumber}
                        </span>
                        {currentUser?.role === UserRole.ADMIN && (
                          <button
                            onClick={(e) => handleDelete(order.id, e)}
                            className="text-natural-muted hover:text-red-600 p-1 rounded hover:bg-natural-panel transition-colors cursor-pointer"
                            title="Delete custom contract"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>

                      <div>
                        <h5 className="font-serif font-bold text-natural-text text-xs truncate">
                          {order.clientName}
                        </h5>
                        <p className="font-sans text-[11px] text-natural-muted mt-0.5 font-semibold">
                          {order.clothingType} Fitting
                        </p>
                      </div>

                      {/* Fabric details snippet */}
                      <p className="text-[10px] text-natural-text line-clamp-2">
                        {order.fabricDetails}
                      </p>

                      <div className="flex items-center gap-1.5 pt-1 text-[10px] text-natural-muted mt-1">
                        <Calendar className="h-3.5 w-3.5 text-natural-muted" />
                        <span>Due {new Date(order.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      </div>

                      {/* Quick progress actions */}
                      <div className="pt-2 border-t border-natural-border flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                        <span className="font-serif font-bold text-natural-accent text-xs">
                          ₹{order.total}
                        </span>

                        {col.id !== 'DELIVERED' && currentUser?.role !== UserRole.CUSTOMER ? (
                          <button
                            onClick={(e) => handleNextStatus(order, e)}
                            title="Shift to next workstation lane"
                            className="bg-natural-panel text-natural-text hover:bg-natural-accent hover:text-white p-1.5 rounded-lg border border-natural-border hover:border-natural-accent flex items-center justify-center transition-all shrink-0 cursor-pointer"
                          >
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        ) : (
                          <span className="text-[9px] font-mono font-semibold uppercase text-natural-muted">
                            Completed
                          </span>
                        )}
                      </div>

                    </div>
                  ))}

                  {laneOrders.length === 0 && (
                    <div className="py-24 text-center text-[10px] text-natural-muted italic">
                      Workstation is cleared
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* List layout if specific status filter selected */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => setSelectedOrderForView(order)}
              className="bg-white p-6 rounded-2xl border border-natural-border hover:border-natural-accent hover:shadow-xs cursor-pointer transition-all space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-natural-muted font-bold bg-natural-panel px-2.5 py-1 rounded border border-natural-border">
                  {order.orderNumber}
                </span>

                <select
                  value={order.status}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => handleStatusSelectChange(order, e.target.value as OrderStatus)}
                  disabled={currentUser?.role === UserRole.CUSTOMER}
                  className="px-2.5 py-1.5 border border-natural-border focus:outline-none focus:border-natural-accent rounded-lg text-xs font-mono bg-natural-panel text-natural-text"
                >
                  {columns.map(c => (
                    <option key={c.id} value={c.id}>{c.id}</option>
                  ))}
                </select>
              </div>

              <div>
                <h4 className="font-serif font-bold text-natural-text text-sm truncate">
                  {order.clientName}
                </h4>
                <p className="text-natural-accent text-xs font-sans font-semibold mt-0.5">
                  Type: {order.clothingType}
                </p>
              </div>

              <div className="p-3 bg-natural-panel border border-natural-border rounded-xl space-y-2">
                <p className="text-natural-text text-[11px] leading-relaxed">
                  <strong className="text-natural-text">Materials:</strong> {order.fabricDetails}
                </p>
                {order.notes && (
                  <p className="text-natural-muted text-[11px] italic">
                    "{order.notes}"
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center text-xs font-sans text-natural-text">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-natural-muted" />
                  <span>Due: {new Date(order.dueDate).toLocaleDateString()}</span>
                </span>
                <span className="font-serif font-bold text-natural-text">
                  Total Charge Fee: ₹{order.total}
                </span>
              </div>
            </div>
          ))}

          {filteredOrders.length === 0 && (
            <div className="col-span-3 py-16 text-center text-natural-muted text-sm border-2 border-dashed border-natural-border rounded-3xl bg-white">
              No orders categorized in this workstation lane. Please adjust your lane filters.
            </div>
          )}
        </div>
      )}

      {/* Selected Order Detailed Sidebar Drawer */}
      {selectedOrderForView && (
        <div 
          className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex justify-end"
          onClick={() => setSelectedOrderForView(null)}
        >
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white h-full shadow-2xl p-6 border-l border-natural-border overflow-y-auto space-y-6"
          >
            <div className="flex items-center justify-between pb-4 border-b border-natural-border">
              <div>
                <span className="font-mono text-[9px] uppercase tracking-wider font-bold text-natural-muted">Order Sheet Viewer</span>
                <h3 className="font-serif font-bold text-natural-text text-base">{selectedOrderForView.orderNumber}</h3>
              </div>
              <button 
                onClick={() => setSelectedOrderForView(null)}
                className="font-sans font-bold text-xs text-natural-muted hover:text-natural-text uppercase cursor-pointer"
              >
                Close View
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-mono font-bold text-natural-muted uppercase tracking-widest mb-1">Contractor Client</p>
                <h4 className="font-serif font-bold text-natural-text text-sm">{selectedOrderForView.clientName}</h4>
              </div>

              <div>
                <p className="text-xs font-mono font-bold text-natural-muted uppercase tracking-widest mb-1">Stitching details spec</p>
                <div className="bg-natural-panel border border-natural-border rounded-xl p-4 space-y-1">
                  <p className="text-xs font-sans text-natural-text"><strong className="text-natural-text font-serif">Garment:</strong> {selectedOrderForView.clothingType}</p>
                  <p className="text-xs text-natural-text leading-relaxed"><strong className="text-natural-text font-serif">Fabric:</strong> {selectedOrderForView.fabricDetails}</p>
                  <p className="text-xs text-natural-muted italic mt-2">"{selectedOrderForView.notes || 'No special modifications notes specified for cutter.'}"</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-mono font-bold text-natural-muted uppercase tracking-widest mb-2">Fits Captured At Registration (inches)</p>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(selectedOrderForView.measurementSnapshot).length > 0 ? (
                    Object.entries(selectedOrderForView.measurementSnapshot).map(([key, val]) => (
                      <div key={key} className="p-2 border border-natural-border rounded-xl text-center bg-white shadow-xs">
                        <p className="text-[9px] text-natural-muted font-mono font-bold uppercase truncate">{key}</p>
                        <p className="text-xs font-serif font-bold text-natural-text mt-0.5">{val}"</p>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-2 text-xs text-natural-muted italic">No snapshot recorded</div>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-mono font-bold text-natural-muted uppercase tracking-widest mb-2">Automated Billing Sync</p>
                <div className="border border-natural-border rounded-xl p-4 text-xs font-sans space-y-2 bg-natural-panel/30">
                  <div className="flex justify-between">
                    <span className="text-natural-muted">Sewing Fee</span>
                    <span className="text-natural-text font-bold">₹{selectedOrderForView.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-natural-muted text-red-700">Discount Applied</span>
                    <span className="text-red-700">-₹{selectedOrderForView.discount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-natural-muted">Taxes Surcharges</span>
                    <span className="text-natural-text font-bold">+₹{selectedOrderForView.tax}</span>
                  </div>
                  <div className="flex justify-between font-bold text-natural-text pt-2 border-t border-natural-border">
                    <span>Total Bill</span>
                    <span className="font-serif">₹{selectedOrderForView.total}</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-1 border-b border-natural-border pb-2 text-natural-accent">
                    <span>Advance Deposited</span>
                    <span className="font-serif">₹{selectedOrderForView.amountPaid}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-mono text-[9px] uppercase font-bold text-natural-muted">Ledger status</span>
                    <span className="font-bold text-natural-accent bg-natural-accent/15 px-2 py-0.5 rounded text-[10px] font-mono border border-natural-accent/20">{selectedOrderForView.paymentStatus}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
