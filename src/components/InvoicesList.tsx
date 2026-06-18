import { useState, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Printer, 
  DollarSign, 
  CreditCard,
  Plus, 
  User, 
  Calendar, 
  Scissors,
  CheckCircle,
  FileCheck
} from 'lucide-react';
import { Invoice, PaymentStatus } from '../types';

interface InvoicesListProps {
  invoices: Invoice[];
  onTriggerPayment: (invoiceId: string, amountPaid: number) => Promise<void>;
}

export default function InvoicesList({ invoices, onTriggerPayment }: InvoicesListProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [paymentInput, setPaymentInput] = useState<number>(0);

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'PAID':
        return 'bg-[#9A9B7C]/15 text-[#4E503B] border-[#9A9B7C]/25';
      case 'PARTIAL':
        return 'bg-natural-accent/15 text-natural-accent border-natural-accent/25';
      case 'UNPAID':
        return 'bg-red-50 text-red-700 border-red-100';
    }
  };

  const startRecordPayment = (inv: Invoice, e: MouseEvent) => {
    e.stopPropagation();
    setRecordingId(inv.id);
    setPaymentInput(inv.amountPaid);
  };

  const handleSavePayment = async (invId: string) => {
    try {
      await onTriggerPayment(invId, paymentInput);
      setRecordingId(null);
    } catch (err) {
      console.error('Error saving payment record:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-serif text-2xl font-bold text-natural-text tracking-tight">Automated Billing Ledger</h2>
          <p className="text-natural-muted text-xs mt-0.5">Automated invoice records generated natively from active orders.</p>
        </div>
      </div>

      {/* Grid of invoice list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {invoices.map((inv) => {
          const balance = Math.max(0, inv.total - inv.amountPaid);
          const isRecording = recordingId === inv.id;

          return (
            <div
              key={inv.id}
              onClick={() => setSelectedInvoice(inv)}
              className="bg-white border border-natural-border rounded-2xl hover:border-natural-accent p-6 flex flex-col justify-between hover:shadow-xs cursor-pointer transition-all space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-natural-muted uppercase tracking-widest">
                  Atelier Receipt
                </span>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono border font-bold ${getPaymentStatusBadge(inv.paymentStatus)}`}>
                  {inv.paymentStatus}
                </span>
              </div>

              <div>
                <h4 className="font-serif text-sm font-bold text-natural-text">
                  Invoice {inv.invoiceNumber}
                </h4>
                <p className="font-sans text-xs text-natural-muted mt-1">
                  Client: <strong className="text-natural-text font-serif font-bold">{inv.clientName}</strong>
                </p>
                <p className="font-mono text-[10px] text-natural-muted mt-0.5">
                  Order link: {inv.orderNumber}
                </p>
              </div>

              {/* Amount detail ledger */}
              <div className="p-3 bg-natural-panel border border-natural-border rounded-xl font-mono text-[11px] space-y-1.5">
                <div className="flex justify-between text-natural-muted">
                  <span>Grand Total:</span>
                  <span className="text-natural-text font-bold">₹{inv.total}</span>
                </div>
                <div className="flex justify-between text-natural-muted">
                  <span>Amount Paid:</span>
                  <span className="text-[#4E503B] font-bold">₹{inv.amountPaid}</span>
                </div>
                <div className="flex justify-between text-natural-text pt-1.5 border-t border-natural-border font-bold">
                  <span>Balance Due:</span>
                  <span className={balance > 0 ? "text-[#A0522D]" : "text-[#4E503B]"}>₹{balance}</span>
                </div>
              </div>

              {/* Double actions */}
              <div className="flex items-center gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setSelectedInvoice(inv)}
                  className="flex-1 py-2.5 bg-natural-accent text-white rounded-xl hover:bg-natural-muted font-sans font-bold text-xs uppercase tracking-wider text-center cursor-pointer shadow-xs transition-colors"
                >
                  Inspect Invoice
                </button>
                <button
                  onClick={(e) => startRecordPayment(inv, e)}
                  className="p-2.5 bg-natural-panel hover:bg-natural-accent hover:text-white border border-natural-border text-natural-text rounded-xl flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                  title="Update custom payment amount"
                >
                  <DollarSign className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Record payment dropdown panel */}
              {isRecording && (
                <div className="p-4 bg-natural-panel border border-natural-border rounded-xl space-y-3 mt-2" onClick={(e) => e.stopPropagation()}>
                  <p className="font-sans font-bold text-natural-text text-xs">Record Client Payment</p>
                  
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max={inv.total}
                      value={paymentInput}
                      onChange={(e) => setPaymentInput(Number(e.target.value))}
                      className="flex-1 px-3 py-2 border border-natural-border focus:outline-none focus:border-natural-accent bg-white rounded-lg text-xs font-semibold text-natural-text"
                    />
                    <button
                      onClick={() => handleSavePayment(inv.id)}
                      className="px-3 py-2 bg-natural-accent text-white rounded-lg font-sans text-xs font-bold uppercase hover:bg-natural-muted cursor-pointer transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {invoices.length === 0 && (
          <div className="col-span-3 py-16 text-center text-natural-muted text-sm border-2 border-dashed border-natural-border rounded-3xl bg-white">
            No invoicing records found. Generate orders to compile invoice files.
          </div>
        )}
      </div>

      {/* Elegant printable receipt mockup overlay */}
      <AnimatePresence>
        {selectedInvoice && (
          <div 
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 print:p-0 overflow-y-auto"
            onClick={() => setSelectedInvoice(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-natural-border w-full max-w-xl rounded-2xl shadow-2xl p-8 relative print:border-none print:shadow-none"
            >
              
              {/* Scissors visual cut border indicator */}
              <div className="absolute top-4 left-4 right-4 flex items-center gap-1.5 opacity-30 select-none print:hidden">
                <Scissors className="h-3 w-3 text-natural-text transform -rotate-45" />
                <div className="flex-1 h-[1px] border-b border-dashed border-natural-border" />
              </div>

              {/* Scissor Header Logo */}
              <div className="text-center pt-8 pb-5 space-y-1.5 border-b border-natural-border">
                <div className="inline-flex h-12 w-12 rounded-full border border-natural-text items-center justify-center mx-auto mb-2 bg-natural-panel animate-spin-slow">
                  <Scissors className="h-5 w-5 text-natural-text transform -rotate-45" />
                </div>
                <h3 className="font-bold text-natural-text text-lg font-serif uppercase tracking-[0.12em]">
                  Bespoke Atelier Boutique
                </h3>
                <p className="text-[11px] text-natural-muted font-sans">
                  Premium Custom Fitting & Fine Embroidery Services
                </p>
                <p className="font-mono text-[9px] text-natural-muted">
                  742 LUXURY ROW SEWING, SAN FRANCISCO • +1-555-SEWS
                </p>
              </div>

              {/* Invoice Numbers */}
              <div className="grid grid-cols-2 mt-6 gap-4 font-sans text-xs text-natural-text">
                <div className="space-y-1">
                  <p className="text-natural-muted uppercase tracking-widest text-[9px] font-mono font-bold">CLIENT CONTRACTOR</p>
                  <p className="font-serif font-bold text-natural-text text-sm">{selectedInvoice.clientName}</p>
                  <p className="text-natural-muted">Contact ID: {selectedInvoice.clientId}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-natural-muted uppercase tracking-widest text-[9px] font-mono font-bold">INVOICE SPECIFICATIONS</p>
                  <p className="font-mono font-extrabold text-natural-text text-sm">{selectedInvoice.invoiceNumber}</p>
                  <p className="text-natural-muted font-mono">Date: {new Date(selectedInvoice.issueDate).toLocaleDateString()}</p>
                  <p className="text-natural-muted font-mono">Limit Due: {new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Itemized list of bills */}
              <div className="mt-8 border-b border-natural-border">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b-2 border-natural-text font-mono text-[9px] font-bold text-natural-muted uppercase tracking-wider pb-2">
                      <th className="py-2.5">Stitching Specification Description</th>
                      <th className="text-center py-2.5">Qty</th>
                      <th className="text-right py-2.5">Price</th>
                      <th className="text-right py-2.5">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items.map((itm) => (
                      <tr key={itm.id} className="border-b border-natural-panel font-sans text-natural-text text-xs">
                        <td className="py-3 font-semibold text-natural-text">{itm.description}</td>
                        <td className="text-center py-3 font-mono">{itm.qty}</td>
                        <td className="text-right py-3 font-mono">₹{itm.unitPrice}</td>
                        <td className="text-right py-3 font-mono font-bold text-natural-text">₹{itm.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Box */}
              <div className="mt-6 flex justify-end">
                <div className="w-5/12 font-sans text-xs space-y-2.5 text-natural-text">
                  <div className="flex justify-between text-natural-muted">
                    <span>Atelier Subtotal</span>
                    <span className="font-mono font-bold">₹{selectedInvoice.subtotal}</span>
                  </div>
                  {selectedInvoice.discount > 0 && (
                    <div className="flex justify-between text-red-700">
                      <span>Bespoke Discount</span>
                      <span className="font-mono font-bold">-₹{selectedInvoice.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-natural-muted">
                    <span>Atelier Tax Surcharge</span>
                    <span className="font-mono font-bold">+₹{selectedInvoice.tax}</span>
                  </div>
                  <div className="flex justify-between border-t border-natural-border pt-2.5 text-natural-text font-bold text-sm">
                    <span>Grand Bill Total</span>
                    <span className="font-mono font-extrabold">₹{selectedInvoice.total}</span>
                  </div>
                  <div className="flex justify-between text-natural-accent font-bold">
                    <span>Deposits Received</span>
                    <span className="font-mono">-₹{selectedInvoice.amountPaid}</span>
                  </div>
                  <div className="flex justify-between border-t border-dashed border-natural-border pt-2 text-[#A0522D] font-extrabold text-xs">
                    <span>Outstanding Due</span>
                    <span className="font-mono">₹{Math.max(0, selectedInvoice.total - selectedInvoice.amountPaid)}</span>
                  </div>
                </div>
              </div>

              {/* Signature Lines and Disclaimers */}
              <div className="mt-12 pt-6 border-t border-natural-border grid grid-cols-2 gap-4 text-[10px] text-natural-muted font-sans">
                <div className="space-y-1">
                  <p className="font-bold text-natural-text">Legal Disclaimers</p>
                  <p className="leading-normal italic max-w-xs text-[9px] text-natural-muted">
                    "Items left past 60 days following the trial fitting approval are subject to storage catalog fees. Fabric warranty is limited standard stitch-break bindings of 5 weeks."
                  </p>
                </div>
                <div className="text-right mt-6 flex flex-col justify-end items-end space-y-1">
                  <div className="w-28 border-b border-natural-text h-10" />
                  <p className="pr-2 text-[9px] uppercase tracking-wider font-mono text-natural-muted">Bespoke Workshop Sign</p>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="mt-8 flex items-center justify-end gap-3 print:hidden">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-natural-panel hover:bg-natural-border text-natural-text rounded-lg font-sans text-xs font-bold flex items-center gap-1.5 border border-natural-border cursor-pointer transition-colors"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print invoice</span>
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2 bg-natural-accent hover:bg-natural-muted text-white rounded-lg font-sans text-xs font-bold cursor-pointer transition-colors"
                >
                  Confirm Close
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
