// src/components/StatCard.jsx
import React from 'react';

export default function StatCard({ title, value, subtitle, icon, status = 'nominal' }) {
  const statusColors = {
    nominal: 'var(--accent-indigo)',
    warning: 'var(--status-warning)',
    critical: 'var(--status-critical)',
    success: 'var(--status-nominal)'
  };

  return (
    <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{title}</span>
        <div style={{ color: statusColors[status], opacity: 0.85 }}>{icon}</div>
      </div>
      <div className="mono" style={{ fontSize: '1.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
        {value ?? '--'}
      </div>
      {subtitle && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}