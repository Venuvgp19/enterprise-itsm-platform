'use client';

import React, { useState } from 'react';
import { ShoppingBag, Laptop, ShieldCheck, Key, Cloud, CheckCircle, Search } from 'lucide-react';

const catalogItems = [
  { id: 'CAT01', category: 'Hardware Request', title: 'MacBook Pro 16" M3 Max', description: 'Enterprise developer workstation with 36GB Unified Memory & 1TB SSD.', price: '$2,499.00', icon: Laptop },
  { id: 'CAT02', category: 'Software Access', title: 'GitHub Enterprise & Copilot', description: 'License provision for enterprise GitHub repository access and AI pairing.', price: '$38.00 / mo', icon: Key },
  { id: 'CAT03', category: 'Cloud Resources', title: 'AWS Sandboxed Dev Account', description: 'Isolated AWS account with $500 monthly budget guardrails for testing.', price: '$500.00 / mo', icon: Cloud },
  { id: 'CAT04', category: 'Security & Access', title: 'YubiKey 5C NFC Security Key', description: 'Hardware FIDO2 MFA security key for passwordless authentication.', price: '$55.00', icon: ShieldCheck },
];

export default function CatalogPage() {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const handleOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderSuccess(true);
    setTimeout(() => {
      setOrderSuccess(false);
      setSelectedItem(null);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-brand-400" /> IT Service Catalog Portal
        </h1>
        <p className="text-xs text-slate-400">Order enterprise hardware, request software licenses, and trigger automated fulfillment flows.</p>
      </div>

      {/* Catalog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {catalogItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="glass-panel p-5 space-y-4 flex flex-col justify-between glass-panel-hover">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.category}</span>
                  <h3 className="text-sm font-bold text-slate-100">{item.title}</h3>
                </div>
                <p className="text-xs text-slate-400 line-clamp-3">{item.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-200">{item.price}</span>
                <button
                  onClick={() => setSelectedItem(item)}
                  className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition"
                >
                  Request Now
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Request Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            {orderSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h3 className="text-lg font-bold text-slate-100">Service Request Submitted!</h3>
                <p className="text-xs text-slate-400">Request REQ0008420 created. Multi-level approval workflow initiated.</p>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-bold text-slate-100">Order: {selectedItem.title}</h2>
                <form onSubmit={handleOrder} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Business Justification</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Explain why this request is needed for your project..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedItem(null)}
                      className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg transition"
                    >
                      Confirm Order
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
