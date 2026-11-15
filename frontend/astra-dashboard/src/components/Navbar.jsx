// src/components/Navbar.jsx
import React from 'react';
import { Bell, Radio, Search } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span className="badge badge-nominal">
          <Radio size={12} /> LIVE TELEMETRY
        </span>
        <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          MISSION DAY: SOL-142
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
          padding: '0.4rem 0.85rem', borderRadius: '8px'
        }}>
          <Search size={15} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search crew ID (e.g. C001)..."
            style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '0.85rem' }}
          />
        </div>
        <button className="btn-outline" style={{ padding: '0.45rem' }}>
          <Bell size={18} />
        </button>
      </div>
    </header>
  );
}