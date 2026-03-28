'use client';

import { Command } from 'lucide-react';

export default function PlaceholderPage({ title = "Feature Coming Soon" }: { title?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
      <div className="w-16 h-16 bg-[#111111] rounded-2xl flex items-center justify-center border border-[#272727] animate-pulse">
        <Command size={32} className="text-[#a1a1aa]" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold uppercase tracking-tighter">{title}</h1>
        <p className="text-sm text-[#71717a] font-medium max-w-xs mx-auto uppercase tracking-widest">
          This feature is part of our upcoming release. Stay tuned for updates!
        </p>
      </div>
      <button 
        onClick={() => window.history.back()}
        className="btn-secondary px-8"
      >
        GO BACK
      </button>
    </div>
  );
}
