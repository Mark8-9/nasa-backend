// src/components/AstronautTable.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export default function AstronautTable({ astronauts = [] }) {
  const navigate = useNavigate();

  const formatDate = (isoString) => {
    if (!isoString) return '--';
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="card table-container">
      <table className="astra-table">
        <thead>
          <tr>
            <th>Astronaut ID</th>
            <th>MongoDB Record ID (_id)</th>
            <th>Created At</th>
            <th>Last Sync (Updated At)</th>
            <th>Telemetry Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {astronauts.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                No astronauts found from API.
              </td>
            </tr>
          ) : (
            astronauts.map((astro, idx) => {
              // قراءة astronautId الأساسي بتاعك (C001, C002...)
              const id = astro.astronautId || astro.astronaut_id || astro.id || `C00${idx + 1}`;
              return (
                <tr key={astro._id || id}>
                  <td className="mono" style={{ fontWeight: 700, color: 'var(--accent-indigo)', fontSize: '1rem' }}>
                    {id}
                  </td>
                  <td className="mono" style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    {astro._id || '--'}
                  </td>
                  <td className="mono" style={{ fontSize: '0.85rem' }}>
                    {formatDate(astro.createdAt)}
                  </td>
                  <td className="mono" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {formatDate(astro.updatedAt)}
                  </td>
                  <td>
                    <span className="badge badge-nominal">ACTIVE CREW</span>
                  </td>
                  <td>
                    <button
                      className="btn-primary"
                      onClick={() => navigate(`/astronauts/${id}`)}
                    >
                      Telemetry <ArrowUpRight size={15} />
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}