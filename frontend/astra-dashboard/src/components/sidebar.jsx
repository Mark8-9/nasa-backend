// src/components/sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, Users, UserCheck, ShieldAlert, Cpu } from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { name: 'Mission Overview', path: '/', icon: <Activity size={18} /> },
    { name: 'Astronaut Crew', path: '/astronauts', icon: <Users size={18} /> },
  ];

  return (
    <aside className="sidebar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem', padding: '0 0.5rem' }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Cpu size={20} color="#fff" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.05em' }}>ASTRA HEALTH</h2>
          <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>BIO-TELEMETRY v2.4</span>
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              textDecoration: 'none',
              color: isActive ? '#fff' : 'var(--text-secondary)',
              background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              borderLeft: isActive ? '3px solid var(--accent-indigo)' : '3px solid transparent',
              fontWeight: isActive ? 600 : 400,
              transition: '0.2s'
            })}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="card" style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--status-nominal)' }} />
          <span className="mono" style={{ fontSize: '0.75rem', fontWeight: 600 }}>ISS LINK: ACTIVE</span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real-time Backend API Sync</p>
      </div>
    </aside>
  );
}