'use client';

import React, { useState } from 'react';
import { Workflow, Play, Plus, CheckCircle, Clock, Send, Code, ShieldCheck, ArrowDown } from 'lucide-react';

const initialNodes = [
  { id: 'n1', type: 'start', label: 'Trigger: Incident P1 Created', icon: Play, color: 'border-emerald-500 bg-emerald-500/10 text-emerald-400' },
  { id: 'n2', type: 'approval', label: 'CAB Multi-Level Approval', icon: ShieldCheck, color: 'border-amber-500 bg-amber-500/10 text-amber-400' },
  { id: 'n3', type: 'rest', label: 'Post Alert to Slack & Teams', icon: Send, color: 'border-brand-500 bg-brand-500/10 text-brand-400' },
  { id: 'n4', type: 'end', label: 'Workflow Execution Completed', icon: CheckCircle, color: 'border-slate-600 bg-slate-800 text-slate-300' },
];

export default function WorkflowBuilderPage() {
  const [nodes, setNodes] = useState(initialNodes);

  const addNode = (nodeType: string) => {
    const newNode = {
      id: `n_${Date.now()}`,
      type: nodeType,
      label: `Automated Action: ${nodeType.toUpperCase()}`,
      icon: Clock,
      color: 'border-cyan-500 bg-cyan-500/10 text-cyan-400',
    };
    setNodes([...nodes.slice(0, nodes.length - 1), newNode, nodes[nodes.length - 1]]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <Workflow className="w-6 h-6 text-brand-400" /> Visual Workflow Designer Canvas
          </h1>
          <p className="text-xs text-slate-400">Design DAG execution workflows, multi-stage approvals, script execution, and webhooks.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg transition">
          <Play className="w-4 h-4" /> Save & Test Workflow Graph
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Node Palette */}
        <div className="glass-panel p-5 space-y-4">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-3">Workflow Nodes</h2>
          <div className="space-y-2">
            <button onClick={() => addNode('approval')} className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-500 text-slate-300 text-xs font-medium">
              <ShieldCheck className="w-4 h-4 text-amber-400" /> Human Approval Chain
            </button>
            <button onClick={() => addNode('rest')} className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-brand-500 text-slate-300 text-xs font-medium">
              <Send className="w-4 h-4 text-brand-400" /> REST API Call / Webhook
            </button>
            <button onClick={() => addNode('timer')} className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500 text-slate-300 text-xs font-medium">
              <Clock className="w-4 h-4 text-cyan-400" /> Timer Delay & SLA Pause
            </button>
          </div>
        </div>

        {/* Visual Graph Execution Canvas */}
        <div className="lg:col-span-3 glass-panel p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-base font-bold text-slate-100">Workflow DAG Canvas Graph</h2>
            <p className="text-xs text-slate-400">Sequential & parallel execution graph with condition branches and automatic rollbacks.</p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center gap-4">
            {nodes.map((node, index) => {
              const Icon = node.icon;
              return (
                <React.Fragment key={node.id}>
                  <div className={`p-4 rounded-xl border-2 shadow-lg min-w-[280px] text-center space-y-1 ${node.color}`}>
                    <Icon className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-xs font-extrabold tracking-wide">{node.label}</div>
                    <div className="text-[10px] opacity-75 font-mono">Node ID: {node.id}</div>
                  </div>

                  {index < nodes.length - 1 && (
                    <div className="flex flex-col items-center">
                      <div className="w-0.5 h-6 bg-slate-700"></div>
                      <ArrowDown className="w-4 h-4 text-slate-500" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
