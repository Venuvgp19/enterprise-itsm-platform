import React from 'react';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

export const metadata = {
  title: 'Enterprise ITSM Platform',
  description: 'Next-Generation Enterprise IT Service Management Platform inspired by ServiceNow',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 flex h-screen overflow-hidden antialiased">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-6 bg-slate-950/40">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
