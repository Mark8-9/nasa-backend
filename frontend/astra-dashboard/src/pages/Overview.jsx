// src/pages/Overview.jsx
import React, { useEffect, useState } from 'react';
import { apiService } from '../data/mockData';
import StatCard from '../components/StatCard';
import { Users, Activity, AlertTriangle, CheckCircle2, ArrowUp, ArrowDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const formatUnit = (u) => {
  if (!u) return '';
  const map = {
    milligram_per_deciliter: 'mg/dL',
    millimol_per_liter: 'mmol/L',
    cells_per_microliter: 'cells/µL',
    million_per_microliter: 'M/µL',
    thousand_per_microliter: 'K/µL',
    gram_per_deciliter: 'g/dL',
    grams_per_deciliter: 'g/dL',
    units_per_liter: 'U/L',
    femtoliter: 'fL',
    percent: '%',
  };
  return map[u] || u.replace(/_/g, ' ');
};

export const formatAnalyte = (name) => {
  if (!name) return '--';
  return String(name).replace(/_/g, ' ');
};

export default function Overview() {
  const [overview, setOverview] = useState(null);
  const [outOfRange, setOutOfRange] = useState([]);
  const [selectedCrewFilter, setSelectedCrewFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      const [ovRes, oorRes] = await Promise.allSettled([
        apiService.getOverview(),
        apiService.getOutOfRange(),
      ]);

      if (ovRes.status === 'fulfilled') setOverview(ovRes.value);

      if (oorRes.status === 'fulfilled') {
        const oData = oorRes.value;
        setOutOfRange(Array.isArray(oData) ? oData : (oData?.data || oData?.outOfRange || []));
      }
      setLoading(false);
    }
    loadDashboard();
  }, []);

  if (loading) {
    return <div className="mono" style={{ padding: '2rem' }}>Loading Mission Telemetry...</div>;
  }

  const filteredOutOfRange = selectedCrewFilter === 'ALL'
    ? outOfRange
    : outOfRange.filter(item => item.astronautId === selectedCrewFilter);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.25rem' }}>Mission Control Overview</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Real-time crew health aggregation & out-of-range biomarker anomalies (CBC / CMP Panels)
        </p>
      </div>

      {/* الكروت العلوية */}
      <div className="stats-grid">
        <StatCard
          title="Total Active Crew"
          value={overview?.totalAstronauts ?? overview?.astronautsCount ?? 4}
          subtitle="Assigned to Mission C001 - C004"
          icon={<Users size={20} />}
          status="nominal"
        />
        <StatCard
          title="Total Measurements"
          value={overview?.totalMeasurements ?? overview?.measurementsCount ?? '--'}
          subtitle="Pre-flight & Post-flight logs"
          icon={<Activity size={20} />}
          status="nominal"
        />
        <StatCard
          title="Out-of-Range Alerts"
          value={overview?.outOfRangeCount ?? outOfRange.length}
          subtitle="Biomarkers outside refMin / refMax"
          icon={<AlertTriangle size={20} />}
          status="critical"
        />
        <StatCard
          title="Active Panels"
          value="CBC & CMP"
          subtitle="Hematology & Metabolic Telemetry"
          icon={<CheckCircle2 size={20} />}
          status="success"
        />
      </div>

      {/* جدول القراءات خارج المدى المرجعي */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>
              Out-of-Range Biomarker Alerts ({filteredOutOfRange.length})
            </h3>
            <span className="badge badge-critical">CRITICAL TELEMETRY</span>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {['ALL', 'C001', 'C002', 'C003', 'C004'].map(crew => (
              <button
                key={crew}
                onClick={() => setSelectedCrewFilter(crew)}
                className={`btn-outline mono ${selectedCrewFilter === crew ? 'active' : ''}`}
                style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }}
              >
                {crew}
              </button>
            ))}
          </div>
        </div>

        <div className="table-container">
          <table className="astra-table">
            <thead>
              <tr>
                <th>Astronaut</th>
                <th>Analyte / Biomarker</th>
                <th>Panel</th>
                <th>Measured Value</th>
                <th>Reference Range</th>
                <th>Deviation</th>
                <th>Timepoint</th>
                <th>Inspect</th>
              </tr>
            </thead>
            <tbody>
              {filteredOutOfRange.map((item, i) => {
                const isHigh = item.refMax !== null && item.refMax !== undefined && item.value > item.refMax;
                const isLow = item.refMin !== null && item.refMin !== undefined && item.value < item.refMin;

                const refText = item.refMin !== null && item.refMin !== undefined
                  ? `${item.refMin} – ${item.refMax} ${formatUnit(item.unit)}`
                  : `≤ ${item.refMax} ${formatUnit(item.unit)}`;

                return (
                  <tr key={item._id || i}>
                    <td className="mono" style={{ fontWeight: 700, color: 'var(--accent-indigo)' }}>
                      {item.astronautId}
                    </td>
                    <td style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                      {formatAnalyte(item.analyte)}
                    </td>
                    <td>
                      <span className="badge badge-nominal">{item.panel || 'LAB'}</span>
                    </td>
                    <td className="mono" style={{ color: isHigh ? 'var(--status-critical)' : 'var(--status-warning)', fontWeight: 700 }}>
                      {item.value} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>{formatUnit(item.unit)}</span>
                    </td>
                    <td className="mono" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {refText}
                    </td>
                    <td>
                      {isHigh && (
                        <span className="badge badge-critical">
                          <ArrowUp size={12} /> HIGH
                        </span>
                      )}
                      {isLow && (
                        <span className="badge badge-warning">
                          <ArrowDown size={12} /> LOW
                        </span>
                      )}
                    </td>
                    <td className="mono">
                      <span style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                        background: item.timepoint?.phase === 'pre' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(139, 92, 246, 0.12)',
                        color: item.timepoint?.phase === 'pre' ? '#818cf8' : '#c084fc',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}>
                        {item.timepoint?.label || '--'} ({item.timepoint?.phase || 'flight'})
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-outline"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                        onClick={() => navigate(`/astronauts/${item.astronautId}`)}
                      >
                        View Crew
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}