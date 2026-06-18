import { motion } from 'motion/react';
import { 
  Scissors, 
  Users, 
  Ruler, 
  ShoppingBag, 
  FileText, 
  LogOut, 
  User as UserIcon,
  Sparkles,
  Trophy,
  MessageSquare,
  Bot
} from 'lucide-react';
import { User, UserRole } from '../types';

interface SidebarProps {
  currentUser: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ currentUser, activeTab, setActiveTab, onLogout }: SidebarProps) {
  if (!currentUser) return null;

  const menuItems = [
    { id: 'dashboard', label: 'Bespoke Atelier', icon: Sparkles, roles: [UserRole.ADMIN, UserRole.TAILOR, UserRole.CUSTOMER] },
    { id: 'clients', label: 'Client Profiles', icon: Users, roles: [UserRole.ADMIN, UserRole.TAILOR] },
    { id: 'measurements', label: 'Measurements Fit', icon: Ruler, roles: [UserRole.ADMIN, UserRole.TAILOR] },
    { id: 'orders', label: 'Order Workflows', icon: ShoppingBag, roles: [UserRole.ADMIN, UserRole.TAILOR, UserRole.CUSTOMER] },
    { id: 'invoices', label: 'Automated Billing', icon: FileText, roles: [UserRole.ADMIN, UserRole.TAILOR, UserRole.CUSTOMER] },
    { id: 'communications', label: 'Client Communications', icon: MessageSquare, roles: [UserRole.ADMIN, UserRole.TAILOR] },
    { id: 'assistant', label: 'Acoustic AI Assistant', icon: Bot, roles: [UserRole.ADMIN, UserRole.TAILOR] },
  ];

  const allowedItems = menuItems.filter(item => item.roles.includes(currentUser.role));

  return (
    <aside className="w-72 bg-natural-panel text-natural-text flex flex-col justify-between border-r border-natural-border relative z-20">
      {/* Subtle stitched top accent */}
      <div className="absolute top-0 right-0 left-0 h-[3px] bg-natural-accent/30" />

      {/* Brand Header */}
      <div className="p-8 border-b border-natural-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-natural-accent rounded-full flex items-center justify-center shrink-0">
            <div className="w-6 h-6 border-2 border-dashed border-natural-bg rounded-full animate-spin-slow"></div>
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold tracking-tight text-natural-text uppercase leading-none">
              Bespoke Atelier
            </h1>
            <p className="font-mono text-[9px] text-natural-muted tracking-wider uppercase mt-1.5">
              Stitch & Seam v2.4
            </p>
          </div>
        </div>

        {/* Tailored Dotted Thread Seams Decoration */}
        <div className="mt-5 flex items-center gap-1 opacity-20">
          <span className="h-0.5 w-1 bg-natural-accent" />
          <span className="h-0.5 w-2 bg-natural-accent" />
          <span className="h-0.5 w-2 bg-natural-accent" />
          <span className="h-0.5 w-2 bg-natural-accent" />
          <span className="h-0.5 w-2 bg-natural-accent" />
          <span className="h-0.5 w-2 bg-natural-accent" />
          <span className="h-0.5 w-3 bg-natural-accent" />
          <span className="text-[10px] font-mono text-natural-accent mx-1">◆</span>
          <span className="h-0.5 w-3 bg-natural-accent" />
          <span className="h-0.5 w-2 bg-natural-accent" />
          <span className="h-0.5 w-2 bg-natural-accent" />
          <span className="h-0.5 w-2 bg-natural-accent" />
          <span className="h-0.5 w-2 bg-natural-accent" />
          <span className="h-0.5 w-2 bg-natural-accent" />
          <span className="h-0.5 w-1 bg-natural-accent" />
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-4 overflow-y-auto space-y-1.5 custom-scrollbar">
        <p className="px-4 text-[10px] font-mono font-bold text-natural-muted uppercase tracking-widest mb-3">
          Studio Navigation
        </p>

        {allowedItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl font-sans text-sm transition-all relative ${
                isActive
                  ? 'text-natural-text font-bold'
                  : 'text-natural-muted hover:text-natural-text hover:bg-white/40'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav-pill"
                  className="absolute inset-0 bg-white border border-natural-border rounded-xl shadow-xs -z-10"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              {isActive && (
                <span className="absolute left-0 w-1 h-5/12 bg-natural-accent rounded-r-md" />
              )}
              <IconComponent className={`h-5 w-5 ${isActive ? 'text-natural-accent' : 'text-natural-muted'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Role Section & Logout */}
      <div className="p-6 border-t border-natural-border bg-natural-panel">
        <div className="bg-natural-secondary p-4 rounded-xl text-white text-xs mb-4 shadow-xs">
          <p className="opacity-85 font-medium">Active Credentials</p>
          <p className="font-bold text-sm mt-0.5">{currentUser.fullName}</p>
          <p className="font-mono text-[9px] opacity-90 mt-1.5 uppercase tracking-wider">{currentUser.role} level key</p>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-3 bg-white hover:bg-natural-accent hover:text-white border border-natural-border text-natural-text rounded-xl font-sans text-xs transition-all tracking-wider font-semibold uppercase shadow-xs cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Exit Workspace</span>
        </button>
      </div>
    </aside>
  );
}
