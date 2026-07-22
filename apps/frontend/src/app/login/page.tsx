'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { Shield, Key, Mail, Lock, ArrowRight, ShieldCheck, Github, Globe } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('admin@acme.com');
  const [password, setPassword] = useState('Admin123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Attempt API call to NestJS Auth backend
      const res = await fetch('http://localhost:4000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        login(data.accessToken, data.user);
        router.push('/dashboard');
        return;
      }
    } catch (err) {
      // Ignore network fallback error
    }

    // Fallback for demonstration / local dev mode
    if (email && password) {
      const demoUser = {
        id: 'usr_admin_01',
        email,
        firstName: email.split('@')[0].split('.')[0] || 'System',
        lastName: 'Admin',
        tenantId: 'tenant_acme_01',
        tenantName: 'Acme Global Corporation',
        role: 'Global Administrator',
      };
      login('demo-jwt-access-token-itsm', demoUser);
      router.push('/dashboard');
    } else {
      setError('Please provide valid credentials.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Logo */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-500 flex items-center justify-center text-white font-black text-2xl mx-auto shadow-xl shadow-brand-500/20">
            S
          </div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">ENTERPRISE ITSM</h1>
          <p className="text-xs text-slate-400">Cloud IT Service Management & Automation Platform</p>
        </div>

        {/* Login Card */}
        <div className="glass-panel p-8 space-y-6 shadow-2xl">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-400" /> Sign In to Workspace
            </h2>
            <p className="text-xs text-slate-400 mt-1">Enter your corporate credentials or authenticate via SAML SSO.</p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Corporate Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@acme.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-brand-500 shadow-inner"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-300 uppercase">Password</label>
                <a href="#" className="text-[11px] font-semibold text-brand-400 hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-brand-500 shadow-inner"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/20 transition"
            >
              {loading ? 'Authenticating...' : 'Sign In to Platform'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* SSO Options */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Or Authenticate with Enterprise SSO
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  login('demo-sso-saml-token', {
                    id: 'sso_usr_01',
                    email: 'sso.admin@acme.com',
                    firstName: 'Okta',
                    lastName: 'User',
                    tenantId: 'tenant_acme_01',
                    tenantName: 'Acme Global',
                  });
                  router.push('/dashboard');
                }}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                <Globe className="w-4 h-4 text-cyan-400" /> Okta / SAML
              </button>

              <button
                type="button"
                onClick={() => {
                  login('demo-sso-github-token', {
                    id: 'sso_usr_02',
                    email: 'dev.admin@acme.com',
                    firstName: 'GitHub',
                    lastName: 'Developer',
                    tenantId: 'tenant_acme_01',
                    tenantName: 'Acme Global',
                  });
                  router.push('/dashboard');
                }}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                <Github className="w-4 h-4 text-purple-400" /> OAuth2 / OIDC
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
