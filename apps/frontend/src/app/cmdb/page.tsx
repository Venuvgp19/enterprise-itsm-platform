'use client';

import React, { useState } from 'react';
import {
  Server,
  Database,
  Shield,
  Cpu,
  Network,
  ArrowRight,
  Activity,
  Plus,
  CheckCircle,
  Radio,
  Zap,
  Globe,
  Layers,
  List,
  Maximize2,
  AlertTriangle,
} from 'lucide-react';

interface ConfigurationItem {
  id: string;
  name: string;
  ciClass: string;
  status: 'OPERATIONAL' | 'DEGRADED' | 'OUTAGE' | 'MAINTENANCE';
  ip: string;
  env: string;
  category: string;
  x: number; // Node graph position X (%)
  y: number; // Node graph position Y (%)
  dependsOn: string[]; // Upstream CI IDs
  serves: string[]; // Downstream CI IDs
  activeIncidents: number;
}

const initialCis: ConfigurationItem[] = [
  {
    id: 'CI001',
    name: 'router-border-nyc-01',
    ciClass: 'BGP Network Router',
    status: 'DEGRADED',
    ip: '192.168.1.1',
    env: 'Production',
    category: 'Networking',
    x: 12,
    y: 45,
    dependsOn: [],
    serves: ['CI002', 'CI003'],
    activeIncidents: 2,
  },
  {
    id: 'CI002',
    name: 'api-gateway-envoy-v2',
    ciClass: 'API Ingress Gateway',
    status: 'OPERATIONAL',
    ip: '10.240.2.14',
    env: 'Production',
    category: 'Middleware',
    x: 34,
    y: 25,
    dependsOn: ['CI001'],
    serves: ['CI004', 'CI005'],
    activeIncidents: 0,
  },
  {
    id: 'CI003',
    name: 'okta-mfa-webhook-gw',
    ciClass: 'Identity Proxy',
    status: 'OPERATIONAL',
    ip: '10.240.3.90',
    env: 'Production',
    category: 'Security',
    x: 34,
    y: 70,
    dependsOn: ['CI001'],
    serves: ['CI006'],
    activeIncidents: 0,
  },
  {
    id: 'CI004',
    name: 'k8s-prod-cluster-east-1',
    ciClass: 'Kubernetes Cluster',
    status: 'OPERATIONAL',
    ip: '10.240.0.12',
    env: 'Production',
    category: 'Cloud Compute',
    x: 60,
    y: 25,
    dependsOn: ['CI002'],
    serves: ['CI005', 'CI007'],
    activeIncidents: 1,
  },
  {
    id: 'CI005',
    name: 'db-postgres-primary',
    ciClass: 'PostgreSQL Database',
    status: 'OPERATIONAL',
    ip: '10.240.4.88',
    env: 'Production',
    category: 'Database',
    x: 85,
    y: 25,
    dependsOn: ['CI002', 'CI004'],
    serves: [],
    activeIncidents: 0,
  },
  {
    id: 'CI006',
    name: 'redis-session-auth-01',
    ciClass: 'Redis Cache Server',
    status: 'OPERATIONAL',
    ip: '10.240.5.12',
    env: 'Production',
    category: 'Caching',
    x: 60,
    y: 70,
    dependsOn: ['CI003'],
    serves: [],
    activeIncidents: 0,
  },
  {
    id: 'CI007',
    name: 'mainframe-host-01',
    ciClass: 'Unix Mainframe',
    status: 'OPERATIONAL',
    ip: '10.240.9.4',
    env: 'Production',
    category: 'Legacy Mainframe',
    x: 85,
    y: 70,
    dependsOn: ['CI004'],
    serves: [],
    activeIncidents: 0,
  },
];

export default function CmdbPage() {
  const [cis, setCis] = useState<ConfigurationItem[]>(initialCis);
  const [selectedCi, setSelectedCi] = useState<ConfigurationItem>(initialCis[0]);
  const [viewMode, setViewMode] = useState<'GRAPH' | 'DIRECTORY'>('GRAPH');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states for adding CI
  const [name, setName] = useState('');
  const [ciClass, setCiClass] = useState('Kubernetes Cluster');
  const [status, setStatus] = useState<'OPERATIONAL' | 'DEGRADED' | 'OUTAGE' | 'MAINTENANCE'>('OPERATIONAL');
  const [ip, setIp] = useState('');
  const [env, setEnv] = useState('Production');

  const handleAddCi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newCi: ConfigurationItem = {
      id: `CI${String(cis.length + 1).padStart(3, '0')}`,
      name,
      ciClass,
      status,
      ip: ip || '10.240.0.100',
      env,
      category: 'Cloud Infrastructure',
      x: 50 + (cis.length * 5) % 40,
      y: 50 + (cis.length * 8) % 40,
      dependsOn: ['CI002'],
      serves: [],
      activeIncidents: 0,
    };

    const updated = [newCi, ...cis];
    setCis(updated);
    setSelectedCi(newCi);
    setName('');
    setIp('');
    setIsModalOpen(false);
  };

  // Determine if a CI is part of selected blast radius
  const isBlastRadius = (ciId: string) => {
    if (ciId === selectedCi.id) return true;
    return selectedCi.dependsOn.includes(ciId) || selectedCi.serves.includes(ciId);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <Server className="w-6 h-6 text-brand-400" /> Configuration Management Database (CMDB)
          </h1>
          <p className="text-xs text-slate-400">
            Interactive enterprise infrastructure topology map, dependency graphs & outage blast-radius visualizer.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 text-xs font-bold">
            <button
              onClick={() => setViewMode('GRAPH')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                viewMode === 'GRAPH'
                  ? 'bg-brand-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Topology Graph View
            </button>
            <button
              onClick={() => setViewMode('DIRECTORY')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                viewMode === 'DIRECTORY'
                  ? 'bg-brand-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" /> Directory Table View
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg shadow-brand-500/20 transition"
          >
            <Plus className="w-4 h-4" /> Register CI
          </button>
        </div>
      </div>

      {/* GRAPH TOPOLOGY VIEW */}
      {viewMode === 'GRAPH' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left / Center 3 Cols: Interactive Canvas */}
          <div className="lg:col-span-3 glass-panel p-5 space-y-4 relative min-h-[550px] flex flex-col justify-between overflow-hidden">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" /> Interactive Dependency Canvas
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  {cis.length} Active CIs Connected
                </span>
              </div>
              <div className="flex items-center gap-4 text-[11px] font-bold">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Operational
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span> Degraded
                </span>
                <span className="flex items-center gap-1 text-brand-400">
                  <span className="w-3 h-0.5 bg-brand-400"></span> Selected Blast Radius
                </span>
              </div>
            </div>

            {/* 2D Vector Node Network Canvas */}
            <div className="relative w-full h-[450px] bg-slate-950/80 rounded-2xl border border-slate-800/80 overflow-hidden shadow-inner">
              {/* SVG Dependency Connection Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  <linearGradient id="gradActive" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
                {cis.map((source) =>
                  source.serves.map((targetId) => {
                    const target = cis.find((c) => c.id === targetId);
                    if (!target) return null;

                    const isHighlight =
                      (source.id === selectedCi.id && selectedCi.serves.includes(target.id)) ||
                      (target.id === selectedCi.id && selectedCi.dependsOn.includes(source.id));

                    return (
                      <line
                        key={`${source.id}-${target.id}`}
                        x1={`${source.x}%`}
                        y1={`${source.y}%`}
                        x2={`${target.x}%`}
                        y2={`${target.y}%`}
                        stroke={isHighlight ? 'url(#gradActive)' : '#334155'}
                        strokeWidth={isHighlight ? '3' : '1.5'}
                        strokeDasharray={isHighlight ? '6,3' : 'none'}
                        className={isHighlight ? 'animate-pulse' : 'opacity-40'}
                      />
                    );
                  })
                )}
              </svg>

              {/* CI Nodes */}
              {cis.map((ci) => {
                const isSelected = selectedCi.id === ci.id;
                const inBlast = isBlastRadius(ci.id);

                return (
                  <div
                    key={ci.id}
                    onClick={() => setSelectedCi(ci)}
                    style={{ left: `${ci.x}%`, top: `${ci.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 transform hover:scale-110 p-3 rounded-2xl border ${
                      isSelected
                        ? 'bg-brand-600/30 border-brand-400 text-white shadow-xl shadow-brand-500/30 ring-4 ring-brand-500/20 scale-105 z-20'
                        : inBlast
                        ? 'bg-slate-900 border-emerald-500/50 text-slate-100 shadow-md shadow-emerald-500/10 z-10'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 opacity-60 hover:opacity-100 z-0'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-1.5 rounded-lg ${
                          ci.ciClass.includes('Database')
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : ci.ciClass.includes('Router')
                            ? 'bg-amber-500/20 text-amber-400'
                            : ci.ciClass.includes('Security')
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-brand-500/20 text-brand-400'
                        }`}
                      >
                        {ci.ciClass.includes('Database') ? (
                          <Database className="w-4 h-4" />
                        ) : ci.ciClass.includes('Router') ? (
                          <Network className="w-4 h-4" />
                        ) : ci.ciClass.includes('Security') ? (
                          <Shield className="w-4 h-4" />
                        ) : (
                          <Server className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold flex items-center gap-1.5">
                          <span>{ci.name}</span>
                          <span
                            className={`w-2 h-2 rounded-full ${
                              ci.status === 'OPERATIONAL'
                                ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                                : 'bg-amber-400 animate-ping'
                            }`}
                          ></span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">{ci.ip}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 1 Col: Selected Node Inspector Panel */}
          <div className="glass-panel p-5 space-y-5">
            <div className="border-b border-slate-800 pb-3 flex justify-between items-start">
              <div>
                <span className="text-xs font-mono font-bold text-brand-400">{selectedCi.id}</span>
                <h3 className="text-base font-bold text-slate-100">{selectedCi.name}</h3>
                <span className="text-xs text-slate-400">{selectedCi.ciClass}</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                  selectedCi.status === 'OPERATIONAL'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                }`}
              >
                {selectedCi.status}
              </span>
            </div>

            {/* Spec Cards */}
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">IP Address</span>
                <span className="font-mono font-bold text-slate-200">{selectedCi.ip}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Environment</span>
                <span className="font-bold text-brand-400">{selectedCi.env}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Category</span>
                <span className="font-bold text-slate-300">{selectedCi.category}</span>
              </div>
            </div>

            {/* Blast Radius Section */}
            <div className="space-y-3 border-t border-slate-800 pt-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Outage Blast Radius
              </h4>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Upstream Dependencies</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedCi.dependsOn.length > 0 ? (
                      selectedCi.dependsOn.map((id) => (
                        <span key={id} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-brand-300 font-mono text-[10px]">
                          {id}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 italic">None (Root CI Node)</span>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Downstream Impacted Services</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedCi.serves.length > 0 ? (
                      selectedCi.serves.map((id) => (
                        <span key={id} className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-[10px]">
                          {id}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 italic">None (Edge Leaf Node)</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DIRECTORY TABLE VIEW */}
      {viewMode === 'DIRECTORY' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-panel p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-200">CI Directory</h2>
              <span className="text-xs font-mono font-bold text-brand-400">{cis.length} CIs Tracked</span>
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {cis.map((ci) => (
                <div
                  key={ci.id}
                  onClick={() => setSelectedCi(ci)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition space-y-2 ${
                    selectedCi.id === ci.id
                      ? 'bg-brand-600/20 border-brand-500/50 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-xs text-brand-400">{ci.id}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        ci.status === 'OPERATIONAL'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {ci.status}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-100">{ci.name}</div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{ci.ciClass}</span>
                    <span>{ci.ip}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 glass-panel p-6 space-y-6">
            <div className="border-b border-slate-800 pb-4 flex justify-between items-start">
              <div>
                <div className="text-xs font-mono font-bold text-brand-400">{selectedCi.id}</div>
                <h2 className="text-xl font-bold text-slate-100">{selectedCi.name}</h2>
                <p className="text-xs text-slate-400">{selectedCi.ciClass} • Environment: {selectedCi.env}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                  selectedCi.status === 'OPERATIONAL'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                }`}
              >
                {selectedCi.status}
              </span>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Upstream & Downstream Relationship Map</h3>
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center min-w-[140px]">
                    <Network className="w-5 h-5 text-brand-400 mx-auto mb-1" />
                    <div className="text-xs font-bold text-slate-200">api-gateway-envoy</div>
                    <div className="text-[10px] text-slate-500">Upstream Traffic</div>
                  </div>

                  <ArrowRight className="w-5 h-5 text-slate-600 animate-pulse hidden sm:block" />

                  <div className="p-4 rounded-xl bg-brand-900/40 border-2 border-brand-500 text-center min-w-[160px] shadow-lg shadow-brand-500/20">
                    <Server className="w-6 h-6 text-brand-400 mx-auto mb-1" />
                    <div className="text-xs font-extrabold text-white">{selectedCi.name}</div>
                    <div className="text-[10px] text-brand-300 font-mono">{selectedCi.ip}</div>
                  </div>

                  <ArrowRight className="w-5 h-5 text-slate-600 animate-pulse hidden sm:block" />

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center min-w-[140px]">
                    <Database className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                    <div className="text-xs font-bold text-slate-200">db-postgres-primary</div>
                    <div className="text-[10px] text-slate-500">Depends On DB</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Configuration Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-100">Register Configuration Item (CI)</h2>
            <form onSubmit={handleAddCi} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">CI Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. k8s-prod-cluster-west-1"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">CI Class</label>
                  <select
                    value={ciClass}
                    onChange={(e) => setCiClass(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                  >
                    <option value="Kubernetes Cluster">Kubernetes Cluster</option>
                    <option value="PostgreSQL Database">PostgreSQL Database</option>
                    <option value="Network Router">Network Router</option>
                    <option value="API Gateway">API Gateway</option>
                    <option value="Redis Cache Server">Redis Cache Server</option>
                    <option value="Virtual Machine">Virtual Machine</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                  >
                    <option value="OPERATIONAL">OPERATIONAL</option>
                    <option value="DEGRADED">DEGRADED</option>
                    <option value="OUTAGE">OUTAGE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">IP Address</label>
                  <input
                    type="text"
                    value={ip}
                    onChange={(e) => setIp(e.target.value)}
                    placeholder="e.g. 10.240.12.8"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Environment</label>
                  <select
                    value={env}
                    onChange={(e) => setEnv(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                  >
                    <option value="Production">Production</option>
                    <option value="Staging">Staging</option>
                    <option value="Development">Development</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg transition"
                >
                  Register Configuration Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
