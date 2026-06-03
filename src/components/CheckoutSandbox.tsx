import React, { useState } from 'react';
import { CreditCard, ShieldCheck, ShoppingCart, HelpCircle, ArrowRight, Smartphone, Building, RefreshCcw } from 'lucide-react';

export const CheckoutSandbox: React.FC = () => {
  // Read transaction context from query parameters
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('order_id') || '';
  const tranId = params.get('tran_id') || `TXN_${Date.now()}`;
  const totalAmount = params.get('total') || '0';

  const [activeSubTab, setActiveSubTab] = useState<'card' | 'mfs' | 'bank'>('card');
  const [selectedMobile, setSelectedMobile] = useState<'bkash' | 'nagad' | 'rocket'>('bkash');
  const [cardNumber, setCardNumber] = useState('4321 8765 9012 3456');
  const [cvv, setCvv] = useState('123');
  const [loading, setLoading] = useState(false);
  const [pin, setPin] = useState('');

  const triggerCallback = (outcome: 'success' | 'fail' | 'cancel') => {
    setLoading(true);
    // Simulate redirection delay
    setTimeout(() => {
      if (outcome === 'success') {
        window.location.href = `/api/payment/success?order_id=${orderId}&tran_id=${tranId}`;
      } else if (outcome === 'fail') {
        window.location.href = `/api/payment/fail?order_id=${orderId}&tran_id=${tranId}`;
      } else {
        window.location.href = `/api/payment/cancel?order_id=${orderId}&tran_id=${tranId}`;
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      {/* Brand Header */}
      <div className="w-full max-w-3xl mb-4 text-center">
        <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#006A4E] bg-emerald-100 rounded-full dark:bg-emerald-900/50 dark:text-emerald-400">
          SSLCommerz Simulation Gateway
        </span>
        <h2 className="text-sm font-semibold text-slate-500 mt-2">
          Bangladesh Secure Electronic Transaction Settlement System
        </h2>
      </div>

      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row transition-all duration-300">
        
        {/* Invoice Summary Strip */}
        <div className="w-full md:w-1/3 p-6 bg-slate-50 dark:bg-slate-950/40 border-b md:border-b-0 md:border-r border-slate-150 dark:border-slate-800 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Order Invoice</h3>
            
            <div className="flex items-start gap-2">
              <ShoppingCart className="text-orange-500 mt-1 shrink-0" size={16} />
              <div>
                <p className="text-[10px] text-slate-400">Order ID Unique</p>
                <p className="text-xs font-black text-slate-800 dark:text-white font-mono truncate max-w-[150px]" title={orderId}>
                  #{orderId.substring(0,10)}...
                </p>
              </div>
            </div>

            <div>
              <p className="text-[10px] text-slate-400">Transaction ID</p>
              <p className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 truncate" title={tranId}>
                {tranId}
              </p>
            </div>

            <div>
              <p className="text-[10px] text-slate-400">Merchant Name</p>
              <p className="text-xs font-bold text-slate-800 dark:text-white">DarazLite Bangladesh</p>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest leading-none font-bold">Payable Total</span>
            <div className="text-2xl font-black text-orange-600 dark:text-orange-500 mt-1 leading-none">
              ৳ {totalAmount} BDT
            </div>
            <span className="text-[9px] text-slate-405 block mt-1">Inclusive of VAT, SD, and processing tariffs</span>
          </div>
        </div>

        {/* Dynamic Sandbox Simulator UI Dashboard */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            {/* Simulation Tab Selection header */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 pb-3 gap-1.5 overflow-x-auto">
              <button
                onClick={() => setActiveSubTab('card')}
                className={`px-3 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 shrink-0 transition-colors ${activeSubTab === 'card' ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/20' : 'text-slate-500 hover:bg-slate-55'}`}
              >
                <CreditCard size={14} /> Cards (Visa/Master)
              </button>
              
              <button
                onClick={() => setActiveSubTab('mfs')}
                className={`px-3 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 shrink-0 transition-colors ${activeSubTab === 'mfs' ? 'bg-[#D12053]/5 text-[#D12053] dark:bg-[#D12053]/15' : 'text-slate-500 hover:bg-slate-55'}`}
              >
                <Smartphone size={14} /> Mobile Banking (bKash/Nagad)
              </button>

              <button
                onClick={() => setActiveSubTab('bank')}
                className={`px-3 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 shrink-0 transition-colors ${activeSubTab === 'bank' ? 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/20' : 'text-slate-500 hover:bg-slate-55'}`}
              >
                <Building size={14} /> Retail Banks
              </button>
            </div>

            <div className="mt-6">
              {loading ? (
                <div className="py-16 text-center space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto" />
                  <p className="text-xs text-slate-550 font-bold">Settling simulation callback parameters with secure backend server...</p>
                </div>
              ) : (
                <>
                  {/* TAB 1: CARD PAYMENTS */}
                  {activeSubTab === 'card' && (
                    <div className="space-y-4">
                      <p className="text-xs text-slate-500">Provide any credit/debit card numbers for instant system settlement:</p>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Card Number</label>
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={e => setCardNumber(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500/30 dark:text-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Expiry Date</label>
                            <input
                              type="text"
                              defaultValue="12/29"
                              className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500/30 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">CVV Code</label>
                            <input
                              type="password"
                              value={cvv}
                              onChange={e => setCvv(e.target.value)}
                              className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500/30 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: MOBILE PAYMENTS */}
                  {activeSubTab === 'mfs' && (
                    <div className="space-y-4">
                      {/* Sub-icons selector */}
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedMobile('bkash')}
                          className={`flex-1 p-2 border rounded-xl flex flex-col items-center gap-1 cursor-pointer transition-all ${selectedMobile === 'bkash' ? 'border-[#E2136E] bg-[#E2136E]/5 scale-95 shadow-sm' : 'border-slate-100 dark:border-slate-850'}`}
                        >
                          <span className="text-xs font-bold text-[#E2136E]">bKash</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedMobile('nagad')}
                          className={`flex-1 p-2 border rounded-xl flex flex-col items-center gap-1 cursor-pointer transition-all ${selectedMobile === 'nagad' ? 'border-[#F15A22] bg-[#F15A22]/5 scale-95 shadow-sm' : 'border-slate-100 dark:border-slate-850'}`}
                        >
                          <span className="text-xs font-bold text-[#F15A22]">Nagad</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedMobile('rocket')}
                          className={`flex-1 p-2 border rounded-xl flex flex-col items-center gap-1 cursor-pointer transition-all ${selectedMobile === 'rocket' ? 'border-[#8C3494] bg-[#8C3494]/5 scale-95 shadow-sm' : 'border-slate-100 dark:border-slate-850'}`}
                        >
                          <span className="text-xs font-bold text-[#8C3494]">Rocket</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">MFS Wallet Account Number</label>
                          <input
                            type="text"
                            placeholder="01712345678"
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500/30 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Mobile PIN</label>
                          <input
                            type="password"
                            placeholder="••••"
                            value={pin}
                            onChange={e => setPin(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500/30 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: NET BANKING */}
                  {activeSubTab === 'bank' && (
                    <div className="space-y-4">
                      <p className="text-xs text-slate-500">Select any authorized retail bank to enter your client portal simulator:</p>
                      <select className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-semibold dark:text-white">
                        <option>City Touch - City Bank</option>
                        <option>EBL Skybanking</option>
                        <option>Brac Bank Astha</option>
                        <option>Dutch-Bangla NexusPay</option>
                        <option>Sonali Bank e-Sheba</option>
                      </select>
                      <p className="text-[10px] text-slate-400 leading-normal">You will be re-routed to a simulated online banking auth login, which returns secure session clearance variables.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Checkout Controls Panel */}
          {!loading && (
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-850 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => triggerCallback('cancel')}
                className="flex-1 py-3 text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-350 dark:hover:bg-slate-750 font-bold rounded-xl transition-all"
              >
                Abort & Cancel
              </button>
              
              <button
                type="button"
                onClick={() => triggerCallback('fail')}
                className="flex-1 py-3 text-xs bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-450 dark:hover:bg-rose-950/30 font-bold rounded-xl transition-all"
              >
                Simulate Payment Failure
              </button>

              <button
                type="button"
                onClick={() => triggerCallback('success')}
                className="flex-1 py-3.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-600/10 active:scale-98 transition-all flex items-center justify-center gap-1.5"
              >
                <ShieldCheck size={16} /> Establish Success Pay
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SSL Footer certification signals */}
      <div className="mt-8 flex items-center gap-4 text-[10px] text-slate-400 font-medium">
        <span className="flex items-center gap-1">🔒 128-bit SSL Encryption Check</span>
        <span>🛡️ PCI-DSS Compliant Gateway</span>
        <span>🇧🇩 Bangladesh Authorized FinTech Partner</span>
      </div>
    </div>
  );
};
