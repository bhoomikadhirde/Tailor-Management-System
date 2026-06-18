import { useState, useEffect, FormEvent } from 'react';
import { motion } from 'motion/react';
import { 
  Ruler, 
  HelpCircle, 
  Save, 
  Sparkles, 
  User, 
  Layers,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { Client, Measurements } from '../types';

interface MeasurementsFormProps {
  clients: Client[];
  selectedClient: Client | null;
  onUpdateMeasurements: (clientId: string, measurements: Measurements) => Promise<void>;
  setSelectedClient: (client: Client | null) => void;
}

export default function MeasurementsForm({
  clients,
  selectedClient,
  onUpdateMeasurements,
  setSelectedClient
}: MeasurementsFormProps) {
  const [activeTab, setActiveTab] = useState<'upper' | 'lower'>('upper');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  // Local state for the selected client's measurements form
  const [formData, setFormData] = useState<Measurements>({
    neck: 0,
    chest: 0,
    bust: 0,
    waist: 0,
    hips: 0,
    shoulder: 0,
    sleeves: 0,
    length: 0,
    inseam: 0,
    cuff: 0,
    collar: 0,
    upperArm: 0,
    notes: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state if external client is passed or selected
  useEffect(() => {
    if (selectedClient) {
      const m = selectedClient.measurements;
      setFormData({
        neck: m.neck || 0,
        chest: m.chest || 0,
        bust: m.bust || 0,
        waist: m.waist || 0,
        hips: m.hips || 0,
        shoulder: m.shoulder || 0,
        sleeves: m.sleeves || 0,
        length: m.length || 0,
        inseam: m.inseam || 0,
        cuff: m.cuff || 0,
        collar: m.collar || 0,
        upperArm: m.upperArm || 0,
        notes: m.notes || ''
      });
    }
  }, [selectedClient]);

  const handleFieldChange = (key: keyof Measurements, val: string) => {
    if (key === 'notes') {
      setFormData(prev => ({ ...prev, [key]: val }));
    } else {
      const numVal = parseFloat(val);
      setFormData(prev => ({ ...prev, [key]: isNaN(numVal) ? 0 : numVal }));
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedClient) {
      alert('Registry Error: No active fitting profile client selected.');
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await onUpdateMeasurements(selectedClient.id, formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving measurements:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClientSelect = (clientId: string) => {
    const matched = clients.find(c => c.id === clientId);
    setSelectedClient(matched || null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-natural-text tracking-tight">Custom Measurements Fit</h2>
        <p className="text-natural-muted text-xs mt-0.5">Maintain precision millimeter parameters for individual bespoke drafts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side Column: Form fields and Select registry */}
        <div className="lg:col-span-12 xl:col-span-7 bg-white p-6 rounded-2xl border border-natural-border shadow-xs space-y-6">
          
          {/* Active Client Selection Dropdown */}
          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold text-natural-muted uppercase tracking-wide">
              Select Client Registry Profile
            </label>
            <div className="flex gap-3">
              <select
                value={selectedClient?.id || ''}
                onChange={(e) => handleClientSelect(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border border-natural-border focus:border-natural-accent focus:ring-1 focus:ring-natural-accent font-sans text-sm focus:outline-none bg-natural-panel text-natural-text"
              >
                <option value="">-- Choose active client record --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedClient ? (
            <form onSubmit={handleSave} className="space-y-6">
              
              {/* Category tabs */}
              <div className="flex bg-natural-panel p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('upper')}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-sans font-bold uppercase transition-all cursor-pointer ${
                    activeTab === 'upper' 
                      ? 'bg-natural-accent text-white shadow-xs' 
                      : 'text-natural-muted hover:text-natural-text'
                  }`}
                >
                  Upper Body Fit
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('lower')}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-sans font-bold uppercase transition-all cursor-pointer ${
                    activeTab === 'lower' 
                      ? 'bg-natural-accent text-white shadow-xs' 
                      : 'text-natural-muted hover:text-natural-text'
                  }`}
                >
                  Lower Body Specs
                </button>
              </div>

              {/* Form Input fields */}
              {activeTab === 'upper' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold text-natural-muted uppercase mb-1">
                      Neck Circumference
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.neck || ''}
                      onChange={(e) => handleFieldChange('neck', e.target.value)}
                      onFocus={() => setFocusedField('neck')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 text-sm font-semibold focus:outline-none ${
                        focusedField === 'neck'
                          ? 'border-natural-accent bg-amber-50/50 ring-2 ring-natural-accent/30 text-natural-text font-bold shadow-xs'
                          : 'border-natural-border bg-natural-bg text-natural-text'
                      }`}
                      placeholder="inches"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-natural-muted uppercase mb-1">
                      Chest Circumference
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.chest || ''}
                      onChange={(e) => handleFieldChange('chest', e.target.value)}
                      onFocus={() => setFocusedField('chest')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 text-sm font-semibold focus:outline-none ${
                        focusedField === 'chest'
                          ? 'border-natural-accent bg-amber-50/50 ring-2 ring-natural-accent/30 text-natural-text font-bold shadow-xs'
                          : 'border-natural-border bg-natural-bg text-natural-text'
                      }`}
                      placeholder="inches"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-natural-muted uppercase mb-1">
                      Bust (for Gowns/Blouses)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.bust || ''}
                      onChange={(e) => handleFieldChange('bust', e.target.value)}
                      onFocus={() => setFocusedField('chest')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 text-sm font-semibold focus:outline-none ${
                        focusedField === 'chest'
                          ? 'border-natural-accent bg-amber-50/50 ring-2 ring-natural-accent/30 text-natural-text font-bold shadow-xs'
                          : 'border-natural-border bg-natural-bg text-natural-text'
                      }`}
                      placeholder="inches"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-natural-muted uppercase mb-1">
                      Shoulder Width
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.shoulder || ''}
                      onChange={(e) => handleFieldChange('shoulder', e.target.value)}
                      onFocus={() => setFocusedField('shoulder')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 text-sm font-semibold focus:outline-none ${
                        focusedField === 'shoulder'
                          ? 'border-natural-accent bg-amber-50/50 ring-2 ring-natural-accent/30 text-natural-text font-bold shadow-xs'
                          : 'border-natural-border bg-natural-bg text-natural-text'
                      }`}
                      placeholder="inches"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-natural-muted uppercase mb-1">
                      Sleeve Length
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.sleeves || ''}
                      onChange={(e) => handleFieldChange('sleeves', e.target.value)}
                      onFocus={() => setFocusedField('sleeves')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 text-sm font-semibold focus:outline-none ${
                        focusedField === 'sleeves'
                          ? 'border-natural-accent bg-amber-50/50 ring-2 ring-natural-accent/30 text-natural-text font-bold shadow-xs'
                          : 'border-natural-border bg-natural-bg text-natural-text'
                      }`}
                      placeholder="inches"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-natural-muted uppercase mb-1">
                      Upper Arm Width
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.upperArm || ''}
                      onChange={(e) => handleFieldChange('upperArm', e.target.value)}
                      onFocus={() => setFocusedField('sleeves')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 text-sm font-semibold focus:outline-none ${
                        focusedField === 'sleeves'
                          ? 'border-natural-accent bg-amber-50/50 ring-2 ring-natural-accent/30 text-natural-text font-bold shadow-xs'
                          : 'border-natural-border bg-natural-bg text-natural-text'
                      }`}
                      placeholder="inches"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold text-natural-muted uppercase mb-1">
                      Waist Circumference
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.waist || ''}
                      onChange={(e) => handleFieldChange('waist', e.target.value)}
                      onFocus={() => setFocusedField('waist')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 text-sm font-semibold focus:outline-none ${
                        focusedField === 'waist'
                          ? 'border-natural-accent bg-amber-50/50 ring-2 ring-natural-accent/30 text-natural-text font-bold shadow-xs'
                          : 'border-natural-border bg-natural-bg text-natural-text'
                      }`}
                      placeholder="inches"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-natural-muted uppercase mb-1">
                      Hips Width
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.hips || ''}
                      onChange={(e) => handleFieldChange('hips', e.target.value)}
                      onFocus={() => setFocusedField('hips')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 text-sm font-semibold focus:outline-none ${
                        focusedField === 'hips'
                          ? 'border-natural-accent bg-amber-50/50 ring-2 ring-natural-accent/30 text-natural-text font-bold shadow-xs'
                          : 'border-natural-border bg-natural-bg text-natural-text'
                      }`}
                      placeholder="inches"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-natural-muted uppercase mb-1">
                      Total Garment Length
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.length || ''}
                      onChange={(e) => handleFieldChange('length', e.target.value)}
                      onFocus={() => setFocusedField('length')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 text-sm font-semibold focus:outline-none ${
                        focusedField === 'length'
                          ? 'border-natural-accent bg-amber-50/50 ring-2 ring-natural-accent/30 text-natural-text font-bold shadow-xs'
                          : 'border-natural-border bg-natural-bg text-natural-text'
                      }`}
                      placeholder="inches"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-natural-muted uppercase mb-1">
                      Inseam Length
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.inseam || ''}
                      onChange={(e) => handleFieldChange('inseam', e.target.value)}
                      onFocus={() => setFocusedField('length')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 text-sm font-semibold focus:outline-none ${
                        focusedField === 'length'
                          ? 'border-natural-accent bg-amber-50/50 ring-2 ring-natural-accent/30 text-natural-text font-bold shadow-xs'
                          : 'border-natural-border bg-natural-bg text-natural-text'
                      }`}
                      placeholder="inches"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-natural-muted uppercase mb-1">
                      Cuff Circumference
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.cuff || ''}
                      onChange={(e) => handleFieldChange('cuff', e.target.value)}
                      onFocus={() => setFocusedField('cuff')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 text-sm font-semibold focus:outline-none ${
                        focusedField === 'cuff'
                          ? 'border-natural-accent bg-amber-50/50 ring-2 ring-natural-accent/30 text-natural-text font-bold shadow-xs'
                          : 'border-natural-border bg-natural-bg text-natural-text'
                      }`}
                      placeholder="inches"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-natural-muted uppercase mb-1">
                      Collar Fit Band
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.collar || ''}
                      onChange={(e) => handleFieldChange('collar', e.target.value)}
                      onFocus={() => setFocusedField('neck')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 text-sm font-semibold focus:outline-none ${
                        focusedField === 'neck'
                          ? 'border-natural-accent bg-amber-50/50 ring-2 ring-natural-accent/30 text-natural-text font-bold shadow-xs'
                          : 'border-natural-border bg-natural-bg text-natural-text'
                      }`}
                      placeholder="inches"
                    />
                  </div>
                </div>
              )}

              {/* Special fitting notes */}
              <div>
                <label className="block text-xs font-mono font-bold text-natural-muted uppercase tracking-wide mb-1.5">
                  Fitting & Material Alterations Notes
                </label>
                <textarea
                  rows={3}
                  value={formData.notes || ''}
                  onChange={(e) => handleFieldChange('notes', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-natural-border focus:border-natural-accent focus:ring-1 focus:ring-natural-accent text-sm focus:outline-none bg-natural-bg text-natural-text"
                  placeholder="e.g. Needs rounded sleeve hems, extra chest overlap for standard buttons, high back seam pleats..."
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-natural-border">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3.5 bg-natural-accent text-white rounded-xl hover:bg-natural-muted font-sans font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Save className="h-4.5 w-4.5" />
                  <span>{isSaving ? 'Saving specifications...' : 'Save Parameters'}</span>
                </button>

                {saveSuccess && (
                  <motion.span
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-natural-secondary font-sans text-xs font-bold flex items-center gap-1"
                  >
                    <span>Parameters synchronized successfully.</span>
                  </motion.span>
                )}
              </div>

            </form>
          ) : (
            <div className="py-24 text-center border-2 border-dashed border-natural-border rounded-2xl bg-natural-panel/20">
              <ClipboardList className="h-10 w-10 text-natural-muted mx-auto mb-4 animate-bounce" />
              <h4 className="font-serif font-bold text-natural-text text-sm">Select Client Registry</h4>
              <p className="text-natural-muted text-xs mt-1 max-w-xs mx-auto">
                Pick a client folder from the dropdown menu above to read, edit, or plot custom sewing measurements.
              </p>
            </div>
          )}

        </div>

        {/* Right Side Column: Dynamic Mannequin Dummy Guide */}
        <div className="lg:col-span-12 xl:col-span-5 bg-natural-panel p-6 rounded-2xl border border-natural-border flex flex-col justify-between text-natural-text relative overflow-hidden min-h-[520px]">
          
          <div className="absolute inset-0 bg-grid opacity-25 pointer-events-none" />

          {/* Golden stitch lines visual border decoration */}
          <div className="absolute right-0 top-0 bottom-0 w-[1px] border-r border-dashed border-natural-accent/20" />

          <div className="relative z-10 space-y-1">
            <h4 className="font-serif font-bold text-natural-text text-sm flex items-center gap-2">
              <Layers className="h-4 w-4 text-natural-accent" />
              <span>Interactive Fitting Dummy</span>
            </h4>
            <p className="text-natural-muted text-[11px] leading-relaxed">
              <b>How to use:</b> Focus on fields on the left to see guides, or <b>click directly on any highlighted golden lines on the dummy below</b> (or the quick hotspots below) to jump directly to and focus that specific parameter form.
            </p>
          </div>

          {/* Dummy Center SVG Container */}
          <div className="relative flex-1 flex items-center justify-center py-6 h-[340px]">
            <svg 
              viewBox="0 0 200 400" 
              className="w-full h-full max-h-[320px] text-[#A8A29E]"
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5"
            >
              {/* Dummy Outlines (Stand and body parts) */}
              {/* Stand */}
              <line x1="100" y1="310" x2="100" y2="390" stroke="#736B5E" strokeWidth="3" />
              <path d="M70 390 L130 390 L100 365 Z" fill="#F2EFE9" stroke="#8B7E66" strokeWidth="2" />

              {/* Head Silhouette */}
              <ellipse 
                cx="100" cy="50" rx="16" ry="18" 
                fill="none" stroke="#736B5E" strokeDasharray="3 3" 
                className="cursor-pointer hover:stroke-natural-accent transition-all duration-200"
                onClick={() => { setFocusedField('neck'); setActiveTab('upper'); }}
                title="Click to edit Neck"
              />
              {/* Body outline (Shoulder to waist to hips) */}
              <path 
                d="M100 68 
                   C70 68, 62 80, 60 115 
                   C58 140, 72 170, 70 200 items-center
                   C68 230, 62 260, 65 300 
                   L135 300 
                   C138 260, 132 230, 130 200 
                   C128 170, 142 140, 140 115 
                   C138 80, 130 68, 100 68 Z" 
                fill="#FAF9F6" 
                stroke="#8B7E66" 
                strokeWidth="2" 
              />

              {/* --- MAPPING FOCUS GUIDES WITH CLICK AND HOVER EVENTS --- */}
              {/* Neck Guide */}
              <ellipse 
                cx="100" cy="74" rx="18" ry="4" 
                stroke={focusedField === 'neck' ? '#A37A5C' : '#E8E2D9'} 
                strokeWidth={focusedField === 'neck' ? '4.5' : '2'}
                className="transition-all duration-300 cursor-pointer hover:stroke-natural-accent hover:stroke-[3.5px]"
                style={{ filter: focusedField === 'neck' ? 'drop-shadow(0 0 6px #A37A5C)' : 'none' }}
                onClick={() => { setFocusedField('neck'); setActiveTab('upper'); }}
                title="Click Neck Circumference"
              />

              {/* Shoulder Guide */}
              <path 
                d="M 60 115 L 140 115" 
                stroke={focusedField === 'shoulder' ? '#A37A5C' : '#E8E2D9'} 
                strokeWidth={focusedField === 'shoulder' ? '5.5' : '2.5'}
                className="transition-all duration-300 cursor-pointer hover:stroke-natural-accent hover:stroke-[4px]"
                style={{ filter: focusedField === 'shoulder' ? 'drop-shadow(0 0 6px #A37A5C)' : 'none' }}
                onClick={() => { setFocusedField('shoulder'); setActiveTab('upper'); }}
                title="Click Shoulder Width"
              />

              {/* Chest Guide */}
              <ellipse 
                cx="100" cy="138" rx="38" ry="8" 
                stroke={focusedField === 'chest' ? '#A37A5C' : '#E8E2D9'} 
                strokeWidth={focusedField === 'chest' ? '4.5' : '2'}
                className="transition-all duration-300 cursor-pointer hover:stroke-natural-accent hover:stroke-[3.5px]"
                style={{ filter: focusedField === 'chest' ? 'drop-shadow(0 0 6px #A37A5C)' : 'none' }}
                onClick={() => { setFocusedField('chest'); setActiveTab('upper'); }}
                title="Click Chest Fit"
              />

              {/* Waist Guide */}
              <ellipse 
                cx="100" cy="195" rx="31" ry="6.5" 
                stroke={focusedField === 'waist' ? '#A37A5C' : '#E8E2D9'} 
                strokeWidth={focusedField === 'waist' ? '4.5' : '2'}
                className="transition-all duration-300 cursor-pointer hover:stroke-natural-accent hover:stroke-[3.5px]"
                style={{ filter: focusedField === 'waist' ? 'drop-shadow(0 0 6px #A37A5C)' : 'none' }}
                onClick={() => { setFocusedField('waist'); setActiveTab('lower'); }}
                title="Click Waist Circumference"
              />

              {/* Hips Guide */}
              <ellipse 
                cx="100" cy="250" rx="34" ry="7.5" 
                stroke={focusedField === 'hips' ? '#A37A5C' : '#E8E2D9'} 
                strokeWidth={focusedField === 'hips' ? '4.5' : '2'}
                className="transition-all duration-300 cursor-pointer hover:stroke-natural-accent hover:stroke-[3.5px]"
                style={{ filter: focusedField === 'hips' ? 'drop-shadow(0 0 6px #A37A5C)' : 'none' }}
                onClick={() => { setFocusedField('hips'); setActiveTab('lower'); }}
                title="Click Hips Width"
              />

              {/* Length Guide */}
              <line 
                x1="100" y1="115" x2="100" y2="300" 
                stroke={focusedField === 'length' ? '#A37A5C' : '#E8E2D9'} 
                strokeWidth={focusedField === 'length' ? '5.5' : '2.5'}
                className="transition-all duration-300 cursor-pointer hover:stroke-natural-accent hover:stroke-[4px]"
                style={{ filter: focusedField === 'length' ? 'drop-shadow(0 0 6px #A37A5C)' : 'none' }}
                onClick={() => { setFocusedField('length'); setActiveTab('lower'); }}
                title="Click Garment Length"
              />

              {/* Sleeves Side Line (Draped) */}
              <path 
                d="M 60 115 C 45 150, 42 190, 45 225" 
                stroke={focusedField === 'sleeves' ? '#A37A5C' : '#E8E2D9'} 
                strokeWidth={focusedField === 'sleeves' ? '5.5' : '2.5'}
                className="transition-all duration-300 cursor-pointer hover:stroke-natural-accent hover:stroke-[4px]"
                style={{ filter: focusedField === 'sleeves' ? 'drop-shadow(0 0 6px #A37A5C)' : 'none' }}
                onClick={() => { setFocusedField('sleeves'); setActiveTab('upper'); }}
                title="Click Sleeve Length"
              />
              <ellipse 
                cx="45" cy="225" rx="5" ry="2.5" 
                stroke={focusedField === 'cuff' ? '#A37A5C' : '#E8E2D9'} 
                strokeWidth={focusedField === 'cuff' ? '4' : '2'}
                className="transition-all duration-300 cursor-pointer hover:stroke-natural-accent hover:stroke-[3.5px]"
                style={{ filter: focusedField === 'cuff' ? 'drop-shadow(0 0 6px #A37A5C)' : 'none' }}
                onClick={() => { setFocusedField('cuff'); setActiveTab('lower'); }}
                title="Click Hand Cuff"
              />

            </svg>
          </div>

          {/* Hotspots Interactive Selection Grid */}
          <div className="bg-white/80 p-3.5 rounded-xl border border-natural-border/60 text-left space-y-1.5 mb-3 relative z-10">
            <span className="text-[9px] font-mono font-bold text-natural-accent uppercase tracking-widest block">◆ Hotspots Quick Selection</span>
            <div className="grid grid-cols-4 gap-1">
              {[
                { label: 'Neck', field: 'neck', tab: 'upper' },
                { label: 'Shoulder', field: 'shoulder', tab: 'upper' },
                { label: 'Chest', field: 'chest', tab: 'upper' },
                { label: 'Sleeve', field: 'sleeves', tab: 'upper' },
                { label: 'Waist', field: 'waist', tab: 'lower' },
                { label: 'Hips', field: 'hips', tab: 'lower' },
                { label: 'Length', field: 'length', tab: 'lower' },
                { label: 'Cuff', field: 'cuff', tab: 'lower' }
              ].map(spec => (
                <button
                  key={spec.label}
                  type="button"
                  onClick={() => {
                    setFocusedField(spec.field);
                    setActiveTab(spec.tab as any);
                  }}
                  className={`px-1 py-1 text-[10px] rounded-lg font-mono border text-center transition-all ${
                    focusedField === spec.field 
                      ? 'bg-natural-accent border-transparent text-white scale-[1.03] font-bold shadow-xs' 
                      : 'bg-natural-panel hover:bg-natural-bg border-natural-border text-natural-text'
                  }`}
                >
                  {spec.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active stats display info */}
          <div className="border-t border-natural-border pt-4 text-center">
            {focusedField ? (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-mono text-xs font-bold text-natural-accent capitalize animate-pulse"
              >
                Focusing parameter: <strong className="text-natural-text">{focusedField}</strong> (Standard inches)
              </motion.p>
            ) : (
              <p className="font-mono text-[10px] text-natural-muted">
                Select any fitting hotspot above to calibrate parameters.
              </p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
