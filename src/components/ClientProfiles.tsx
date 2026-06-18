import { useState, FormEvent, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  User as UserIcon, 
  Phone, 
  Mail, 
  MapPin, 
  Trash2, 
  Edit3, 
  Eye, 
  Check, 
  Lock, 
  ArrowRight,
  Info
} from 'lucide-react';
import { Client, User, UserRole, Measurements } from '../types';

interface ClientProfilesProps {
  clients: Client[];
  currentUser: User | null;
  onAddClient: (clientData: Partial<Client>) => Promise<void>;
  onUpdateClient: (clientId: string, clientData: Partial<Client>) => Promise<void>;
  onDeleteClient: (clientId: string) => Promise<void>;
  setActiveTab: (tab: string) => void;
  setSelectedClientForMeasurements: (client: Client) => void;
}

export default function ClientProfiles({
  clients,
  currentUser,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
  setActiveTab,
  setSelectedClientForMeasurements
}: ClientProfilesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    gender: 'FEMALE' as 'MALE' | 'FEMALE' | 'OTHER',
    notes: ''
  });

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      gender: 'FEMALE',
      notes: ''
    });
    setIsAdding(false);
    setEditingClientId(null);
  };

  const handleEditClick = (client: Client, e: MouseEvent) => {
    e.stopPropagation();
    setEditingClientId(client.id);
    setFormData({
      name: client.name,
      phone: client.phone,
      email: client.email || '',
      address: client.address || '',
      gender: client.gender,
      notes: client.notes || ''
    });
    setIsAdding(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;

    try {
      if (editingClientId) {
        await onUpdateClient(editingClientId, formData);
        resetForm();
      } else {
        await onAddClient(formData);
        resetForm();
      }
    } catch (err) {
      console.error('Error submitting form:', err);
    }
  };

  const handleDeleteClick = async (clientId: string, e: MouseEvent) => {
    e.stopPropagation();
    if (currentUser?.role !== UserRole.ADMIN) {
      alert('Security Alert: Only Admin/Owner roles hold systemic privileges to delete client folders.');
      return;
    }
    if (confirm('Are you absolutely certain you wish to delete this client profile? All associated historical measurements will be permanently wiped.')) {
      try {
        await onDeleteClient(clientId);
        if (expandedClientId === clientId) setExpandedClientId(null);
      } catch (err) {
        console.error('Error deleting client:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Table Header Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-natural-text tracking-tight">Atelier Client Profiles</h2>
          <p className="text-natural-muted text-xs mt-0.5">Manage custom fabric sizes and contact profiles securely.</p>
        </div>

        <button
          onClick={() => { resetForm(); setIsAdding(true); }}
          className="px-5 py-3 rounded-xl bg-natural-accent text-white hover:bg-natural-muted font-sans font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 self-start md:self-auto hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Register New Client</span>
        </button>
      </div>

      {/* Role Notice Security Shield */}
      <div className="bg-natural-panel border border-natural-border rounded-xl p-4 flex items-center gap-3">
        <div className="p-2 bg-natural-accent/10 rounded-lg text-natural-accent shrink-0">
          <Lock className="h-4 w-4" />
        </div>
        <div className="text-natural-text text-xs leading-normal">
          <span className="font-sans font-bold text-natural-text decoration-natural-accent">Role Level Security Activated:</span> Your account is certified as <strong className="text-natural-accent">{currentUser?.fullName} ({currentUser?.role})</strong>. Only <strong>ADMIN</strong> users can delete profiles, safeguarding historical tailor datasets.
        </div>
      </div>

      {/* Adding / Editing Modal Form */}
      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl border border-natural-border shadow-xs space-y-6"
        >
          <div className="flex items-center justify-between pb-4 border-b border-natural-border">
            <h3 className="font-serif font-bold text-natural-text text-base">
              {editingClientId ? 'Update Client Folder Specifications' : 'Register New Client Profile'}
            </h3>
            <button 
              onClick={resetForm}
              className="font-sans font-bold text-xs text-natural-muted hover:text-natural-text uppercase cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-natural-muted uppercase mb-1.5">
                  Client Full Name <span className="text-[#A0522D]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Margaret Sterling"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-natural-border focus:border-natural-accent focus:ring-1 focus:ring-natural-accent font-sans text-sm focus:outline-none bg-natural-bg text-natural-text"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-natural-muted uppercase mb-1.5">
                  Secure Phone Contact <span className="text-[#A0522D]">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +1-555-0178"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-natural-border focus:border-natural-accent focus:ring-1 focus:ring-natural-accent font-sans text-sm focus:outline-none bg-natural-bg text-natural-text"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-natural-muted uppercase mb-1.5">
                  Client Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. margaret.s@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-natural-border focus:border-natural-accent focus:ring-1 focus:ring-natural-accent font-sans text-sm focus:outline-none bg-natural-bg text-natural-text"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-natural-muted uppercase mb-1.5">
                  Gender Target Fitting
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full px-4 py-3 rounded-xl border border-natural-border focus:border-natural-accent focus:ring-1 focus:ring-natural-accent font-sans text-sm focus:outline-none bg-natural-bg text-natural-text"
                >
                  <option value="FEMALE">Female Fitting Profile</option>
                  <option value="MALE">Male Fitting Profile</option>
                  <option value="OTHER">Other Unisex Profile</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-mono font-bold text-natural-muted uppercase mb-1.5">
                  Billing & Shipping Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. 742 Evergreen Terrace, Springfield"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-natural-border focus:border-natural-accent focus:ring-1 focus:ring-natural-accent font-sans text-sm focus:outline-none bg-natural-bg text-natural-text"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-mono font-bold text-natural-muted uppercase mb-1.5">
                  Profile Style Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Prefers classic collars, highly sensitive to wool itch, premium finishes."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-natural-border focus:border-natural-accent focus:ring-1 focus:ring-natural-accent font-sans text-sm focus:outline-none bg-natural-bg text-natural-text"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 justify-end pt-4 border-t border-natural-border">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2.5 rounded-xl border border-natural-border hover:bg-natural-panel font-sans text-xs font-bold uppercase transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-natural-accent hover:bg-natural-muted text-white font-sans text-xs font-bold uppercase shadow-sm transition-colors cursor-pointer"
              >
                {editingClientId ? 'Update Client' : 'Save Registry'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Grid Client Listings Search Control */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-natural-muted" />
        <input
          type="text"
          placeholder="Filtering custom registries... (search name, phone, or email)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-natural-border bg-white focus:border-natural-accent focus:ring-1 focus:ring-natural-accent font-sans text-sm focus:outline-none placeholder-natural-muted shadow-xs text-natural-text"
        />
      </div>

      {/* Profiles Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => {
          const isExpanded = expandedClientId === client.id;
          const measurementsList = Object.entries(client.measurements).filter(([k]) => k !== 'notes' && k !== 'updatedAt');

          return (
            <motion.div
              layout
              key={client.id}
              onClick={() => setExpandedClientId(isExpanded ? null : client.id)}
              className={`bg-white rounded-2xl border transition-all overflow-hidden cursor-pointer flex flex-col justify-between ${
                isExpanded 
                  ? 'border-natural-accent shadow-md ring-1 ring-natural-accent/20' 
                  : 'border-natural-border hover:border-natural-accent shadow-xs'
              }`}
            >
              {/* Card Title Box */}
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-natural-panel text-natural-text border border-natural-border font-serif font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                      {client.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-serif font-bold text-natural-text text-sm truncate group-hover:text-natural-accent">
                        {client.name}
                      </h4>
                      <p className="text-[10px] font-mono font-bold text-natural-muted uppercase tracking-widest mt-0.5">
                        {client.gender} Fitting Folder
                      </p>
                    </div>
                  </div>

                  {/* Operational Settings and Privileges */}
                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleEditClick(client, e)}
                      title="Edit Client Information"
                      className="p-2 text-natural-muted hover:text-natural-accent hover:bg-natural-panel rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(client.id, e)}
                      title="Delete Client Profile"
                      className={`p-2 rounded-lg transition-colors cursor-pointer ${
                        currentUser?.role === UserRole.ADMIN 
                          ? 'text-natural-muted hover:text-red-600 hover:bg-red-50/50' 
                          : 'text-natural-border cursor-not-allowed'
                      }`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Registry Details Specs */}
                <div className="space-y-2.5 mt-5">
                  <div className="flex items-center gap-2.5 text-xs text-natural-text">
                    <Phone className="h-4 w-4 text-natural-muted shrink-0" />
                    <span className="font-mono">{client.phone}</span>
                  </div>
                  {client.email && (
                    <div className="flex items-center gap-2.5 text-xs text-natural-text truncate">
                      <Mail className="h-4 w-4 text-natural-muted shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-center gap-2.5 text-xs text-natural-text truncate">
                      <MapPin className="h-4 w-4 text-natural-muted shrink-0" />
                      <span className="truncate">{client.address}</span>
                    </div>
                  )}
                </div>

                {client.notes && (
                  <div className="mt-4 p-3 rounded-xl bg-natural-panel border border-natural-border text-xs text-natural-muted italic">
                    "{client.notes}"
                  </div>
                )}
              </div>

              {/* Card Expand Footer (Showing measurements counts) */}
              <div className="px-6 py-4 bg-natural-panel/40 border-t border-natural-border flex items-center justify-between z-10">
                <span className="font-mono text-[10px] text-natural-muted uppercase tracking-widest font-bold">
                  {measurementsList.length} Active parameters
                </span>

                <button className="text-natural-muted hover:text-natural-text flex items-center gap-1 font-sans text-xs font-bold leading-none cursor-pointer">
                  <span>{isExpanded ? 'Hide Specs' : 'Expand Files'}</span>
                  <Eye className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Expanded Detailed Measurements Specs */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden border-t border-natural-border bg-natural-panel/20"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-6 space-y-4">
                      <h5 className="text-xs font-mono font-bold text-natural-muted uppercase tracking-wider">
                        Tailored Measurement Parameters (inches)
                      </h5>

                      <div className="grid grid-cols-3 gap-2.5">
                        {measurementsList.length > 0 ? (
                          measurementsList.map(([key, value]) => (
                            <div key={key} className="bg-white px-3 py-2 border border-natural-border rounded-xl text-center shadow-xs">
                              <p className="font-mono text-[9px] font-bold text-natural-muted uppercase tracking-wider truncate mb-0.5">
                                {key}
                              </p>
                              <p className="font-serif font-extrabold text-natural-text text-sm">
                                {value}"
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-3 py-3 text-center text-xs text-natural-muted italic">
                            No measurements mapped fields yet
                          </div>
                        )}
                      </div>

                      {client.measurements.notes && (
                        <div className="p-3 bg-white border border-natural-border rounded-xl text-xs text-natural-text shadow-xs mt-3">
                          <span className="font-serif font-bold text-natural-accent block mb-1">Fitting notes:</span>
                          "{client.measurements.notes}"
                        </div>
                      )}

                      {/* Jump to measurements modifier direct */}
                      <button
                        onClick={() => {
                          setSelectedClientForMeasurements(client);
                          setActiveTab('measurements');
                        }}
                        className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-natural-accent/15 border border-natural-accent/20 text-natural-accent hover:bg-natural-accent hover:text-white rounded-xl font-sans text-xs font-bold transition-all uppercase tracking-wider cursor-pointer"
                      >
                        <span>Modify Measurements fit</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {filteredClients.length === 0 && (
          <div className="col-span-3 py-16 text-center text-natural-muted text-sm border-2 border-dashed border-natural-border rounded-3xl bg-white">
            No matching client profiles identified. Register a client folder to begin!
          </div>
        )}
      </div>
    </div>
  );
}
