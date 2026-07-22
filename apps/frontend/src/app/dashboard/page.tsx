'use client';

import React from 'react';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Server,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Plus,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

const stats = [
  { name: 'Active Incidents', value: '42', change: '+3 today', changeType: 'increase', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  { name: 'SLA Breach Risk', value: '3', change: '-2 resolved', changeType: 'decrease', icon: Clock, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
  { name: 'Pending Approvals', value: '8', change: '4 Change CAB', changeType: 'neutral', icon: CheckCircle2, color: 'text-brand-400', bg: 'bg-brand-500/10 border-brand-500/20' },
  { name: 'CI Infrastructure Health', value: '99.94%', change: '1,420 CIs Tracked', changeType: 'increase', icon: Server, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
];

const recentIncidents = [
  { id: 'INC0001042', title: 'Core Router NYC-01 High Latency', priority: 'P1 - CRITICAL', state: 'IN_PROGRESS', caller: 'Monitoring Bot', group: 'Network Ops', time: '12m ago' },
  { id: 'INC0001041', title: 'SAP ERP Financials SSO Auth Failure', priority: 'P2 - HIGH', state: 'NEW', caller: 'Sarah Connor', group: 'App Support', time: '28m ago' },
  { id: 'INC0001040', title: 'Printer Spooler Offline - London HQ', priority: 'P4 - LOW', state: 'IN_PROGRESS', caller: 'David Miller', group: 'Desktop Support', time: '1h ago' },
  { id: 'INC0001039', title: 'AWS East Region DB Connection Timeout', priority: 'P2 - HIGH', state: 'ON_HOLD', caller: 'AWS CloudWatch', group: 'DevOps Ops', time: '2h ago' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-brand-900/40 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-400 uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4" /> Enterprise Incident & Ops Command Center
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100">ITIL Service Management Overview</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time status of Incidents, SLAs, Changes, and Infrastructure Configuration Items.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/incidents"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition shadow-lg shadow-brand-500/20"
          >
            <Plus className="w-4 h-4" /> Create Incident
          </Link>
          <Link
            href="/studio/workflow-builder"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition"
          >
            Workflow Studio
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className={`p-5 rounded-xl border backdrop-blur-md ${stat.bg} space-y-3`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.name}</span>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-100 tracking-tight">{stat.value}</span>
                <span className="text-xs font-medium text-slate-400">{stat.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Split: Incident Feed & SLA Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incident Command Center Data Table Preview */}
        <div className="lg:col-span-2 glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-400" /> Active Incident Stream
              </h2>
              <p className="text-xs text-slate-400">High impact IT service interruptions requiring immediate response.</p>
            </div>
            <Link href="/incidents" className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Number</th>
                  <th className="py-3 px-3">Short Description</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">State</th>
                  <th className="py-3 px-3">Group</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {recentIncidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-mono font-bold text-brand-400">{inc.id}</td>
                    <td className="py-3 px-3 font-medium text-slate-200">{inc.title}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inc.priority.startsWith('P1')
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : inc.priority.startsWith('P2')
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {inc.priority}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-300">{inc.state}</td>
                    <td className="py-3 px-3 text-slate-400">{inc.group}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SLA & System Status */}
        <div className="glass-panel p-6 space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> SLA Target Compliance
            </h2>
            <p className="text-xs text-slate-400">Response & Resolution SLAs across business calendars.</p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">P1 Critical Response (15 mins)</span>
                <span className="text-emerald-400">98.4%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '98.4%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">P2 High Resolution (4 hours)</span>
                <span className="text-brand-400">94.1%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full" style={{ width: '94.1%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Service Request Fulfillment</span>
                <span className="text-amber-400">89.0%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '89%' }}></div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Upcoming CAB Change Review</span>
            <p className="text-xs text-slate-200 font-semibold">CHG0000842 - Migration to Kubernetes Cluster East-2</p>
            <p className="text-[11px] text-slate-400">Scheduled: Tomorrow at 20:00 UTC</p>
          </div>
        </div>
      </div>
    </div>
  );
}
