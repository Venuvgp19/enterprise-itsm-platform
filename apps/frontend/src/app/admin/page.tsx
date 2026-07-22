'use client';

import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Key,
  Lock,
  Users,
  Plus,
  Trash2,
  UserPlus,
  Mail,
  Building,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

const initialUsers = [
  { id: 'u1', name: 'System Admin', email: 'admin@acme.com', role: 'Global Administrator', department: 'IT Ops', status: 'ACTIVE', mfa: true },
  { id: 'u2', name: 'Sarah Connor', email: 's.connor@acme.com', role: 'ITIL Incident Manager', department: 'App Support', status: 'ACTIVE', mfa: true },
  { id: 'u3', name: 'Alex Mercer', email: 'a.mercer@acme.com', role: 'Security Specialist', department: 'SecOps', status: 'ACTIVE', mfa: false },
  { id: 'u4', name: 'David Miller', email: 'd.miller@acme.com', role: 'Service Desk Agent', department: 'Desktop Support', status: 'ACTIVE', mfa: false },
  { id: 'u5', name: 'Richard Stallman', email: 'r.stallman@acme.com', role: 'Global Administrator', department: 'Unix', status: 'ACTIVE', mfa: true },
];

const rbacRoles = [
  { name: 'Global Administrator', users: 3, permissions: 'All Permissions (*:*)', isSystem: true },
  { name: 'ITIL Incident Manager', users: 14, permissions: 'incident:*, sla:read, task:*', isSystem: false },
  { name: 'Change Advisory Board (CAB)', users: 8, permissions: 'change:*, approval:*', isSystem: false },
  { name: 'Service Desk Agent', users: 42, permissions: 'incident:read, incident:create, catalog:read', isSystem: false },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'rbac' | 'security'>('users');
  const [users, setUsers] = useState(initialUsers);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  // Form states for adding a user
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Service Desk Agent');
  const [department, setDepartment] = useState('Unix');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !firstName) return;

    const newUser = {
      id: `u_${Date.now()}`,
      name: `${firstName} ${lastName}`,
      email,
      role,
      department,
      status: 'ACTIVE',
      mfa: false,
    };

    setUsers([newUser, ...users]);
    setFirstName('');
    setLastName('');
    setEmail('');
    setIsAddUserModalOpen(false);
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  const toggleUserStatus = (id: string) => {
    setUsers(
      users.map((u) =>
        u.id === id ? { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : u
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <Settings className="w-6 h-6 text-brand-400" /> Admin & Security Management Studio
          </h1>
          <p className="text-xs text-slate-400">Manage user accounts, RBAC permissions, tenant security policies, and audit controls.</p>
        </div>

        {activeTab === 'users' && (
          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg shadow-brand-500/20 transition"
          >
            <UserPlus className="w-4 h-4" /> Add New User
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'users' ? 'border-brand-500 text-brand-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" /> User Accounts ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('rbac')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'rbac' ? 'border-brand-500 text-brand-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> RBAC & Roles
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'security' ? 'border-brand-500 text-brand-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Lock className="w-4 h-4" /> Tenant Security & Audit
        </button>
      </div>

      {/* Tab 1: User Management Table */}
      {activeTab === 'users' && (
        <div className="glass-panel p-6 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">User Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">MFA</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-sans">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-bold text-slate-200">{user.name}</td>
                    <td className="py-3 px-4 text-slate-300 font-mono">{user.email}</td>
                    <td className="py-3 px-4 text-brand-400 font-semibold">{user.role}</td>
                    <td className="py-3 px-4 text-slate-400">{user.department}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleUserStatus(user.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition ${
                          user.status === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {user.status}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      {user.mfa ? (
                        <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> Enabled</span>
                      ) : (
                        <span className="text-slate-500 flex items-center gap-1 text-[11px]"><XCircle className="w-3.5 h-3.5" /> Off</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 transition"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: RBAC Matrix */}
      {activeTab === 'rbac' && (
        <div className="glass-panel p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Role-Based Access Control (RBAC)
            </h2>
            <button className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition">
              Create Custom Role
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Role Name</th>
                  <th className="py-3 px-3">Assigned Users</th>
                  <th className="py-3 px-3">Granted Permissions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-sans">
                {rbacRoles.map((role) => (
                  <tr key={role.name} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-bold text-slate-200">{role.name}</td>
                    <td className="py-3 px-3 text-slate-300">{role.users} Members</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-brand-400">{role.permissions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Security Controls */}
      {activeTab === 'security' && (
        <div className="glass-panel p-6 space-y-4 max-w-2xl">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Lock className="w-4 h-4 text-brand-400" /> Tenant Security Hardening
          </h2>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-200">Enforce Multi-Factor Auth (MFA)</div>
                <div className="text-[10px] text-slate-500">Require TOTP / FIDO2 for all admins</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-200">Tenant Data Isolation</div>
                <div className="text-[10px] text-slate-500">Row-Level Security (RLS) enabled</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-200">Immutable Audit Logging</div>
                <div className="text-[10px] text-slate-500">All data mutations logged with IP trace</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-100">Add New User Account</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.doe@acme.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                  >
                    <option value="Global Administrator">Global Administrator</option>
                    <option value="ITIL Incident Manager">ITIL Incident Manager</option>
                    <option value="Change Advisory Board (CAB)">Change Advisory Board (CAB)</option>
                    <option value="Service Desk Agent">Service Desk Agent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                  >
                    <option value="Unix">Unix</option>
                    <option value="IT Ops">IT Ops</option>
                    <option value="App Support">App Support</option>
                    <option value="SecOps">SecOps</option>
                    <option value="Desktop Support">Desktop Support</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg transition"
                >
                  Create User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
