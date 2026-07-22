'use client';

import React, { useState } from 'react';
import { FormInput, Plus, Trash2, Eye, Shield, CheckSquare, AlignLeft, Paperclip, FileCode, Play } from 'lucide-react';

const availableFields = [
  { type: 'text', label: 'Single Line Text', icon: FormInput },
  { type: 'textarea', label: 'Multi-Line Text Area', icon: AlignLeft },
  { type: 'select', label: 'Dropdown Select', icon: CheckSquare },
  { type: 'reference', label: 'CMDB Reference Field', icon: FileCode },
  { type: 'attachment', label: 'File Attachment', icon: Paperclip },
];

export default function FormBuilderPage() {
  const [formFields, setFormFields] = useState<any[]>([
    { id: 'f1', type: 'text', label: 'Ticket Short Description', required: true, readOnly: false },
    { id: 'f2', type: 'select', label: 'Impact Category', required: true, readOnly: false, options: ['Enterprise', 'Department', 'Team'] },
  ]);

  const addField = (fieldType: string, label: string) => {
    const newF = {
      id: `f_${Date.now()}`,
      type: fieldType,
      label: `New ${label}`,
      required: false,
      readOnly: false,
    };
    setFormFields([...formFields, newF]);
  };

  const removeField = (id: string) => {
    setFormFields(formFields.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <FormInput className="w-6 h-6 text-brand-400" /> Dynamic Form Studio & UI Policy Designer
          </h1>
          <p className="text-xs text-slate-400">Design custom form layouts, field references, validation rules, and dynamic visibility UI policies.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg transition">
          <Play className="w-4 h-4" /> Save & Publish Form
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Component Palette Sidebar */}
        <div className="glass-panel p-5 space-y-4">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-3">Field Palette</h2>
          <div className="space-y-2">
            {availableFields.map((f) => {
              const Icon = f.icon;
              return (
                <button
                  key={f.type}
                  onClick={() => addField(f.type, f.label)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-brand-500 hover:bg-brand-600/10 text-slate-300 hover:text-white transition text-xs font-medium"
                >
                  <Icon className="w-4 h-4 text-brand-400" />
                  <span>{f.label}</span>
                  <Plus className="w-3.5 h-3.5 ml-auto text-slate-500" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Form Designer Canvas */}
        <div className="lg:col-span-3 glass-panel p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-base font-bold text-slate-100">Live Form Layout Canvas</h2>
            <p className="text-xs text-slate-400">Reorder fields, configure mandatory triggers, and test dynamic validation rules.</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            {formFields.map((field) => (
              <div key={field.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormFields(formFields.map((f) => (f.id === field.id ? { ...f, label: val } : f)));
                      }}
                      className="bg-transparent font-bold text-xs text-slate-100 border-b border-transparent hover:border-slate-700 focus:border-brand-500 focus:outline-none"
                    />
                    {field.required && <span className="text-rose-400 text-xs font-bold">* Mandatory</span>}
                  </div>
                  <div className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-500 font-mono">
                    [{field.type.toUpperCase()}] Placeholder preview
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormFields(formFields.map((f) => (f.id === field.id ? { ...f, required: checked } : f)));
                      }}
                      className="rounded border-slate-800 bg-slate-950 text-brand-600 focus:ring-0"
                    />
                    Mandatory
                  </label>

                  <button
                    onClick={() => removeField(field.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
