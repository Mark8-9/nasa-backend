// src/components/HealthChart.jsx
import React from 'react';
import { formatUnit } from '../pages/Overview';

export default function HealthChart({ title, data = [], baseline = null, unit = '' }) {
  const rawList = Array.isArray(data) ? data : (data?.measurements || data?.readings || data?.trends || []);

  // ترتيب النقاط زمنياً حسب timepoint.order إن وجد
  const sorted = [...rawList].sort((a, b) => {
    if (a?.timepoint?.order !== undefined && b?.timepoint?.order !== undefined) {
      return a.timepoint.order - b.timepoint.order;
    }
    return 0;
  });

  const points = sorted
    .map((item, idx) => ({
      label: item?.timepoint?.label || item?.label || item?.analyte || `T-${idx + 1}`,
      val: Number(item?.value ?? item?.mean ?? item?.reading ?? item?.count ?? 0),
      refMin: item?.refMin,
      refMax: item?.refMax,
      unit: item?.unit || unit,
    }))
    .filter((p) => !isNaN(p.val));

  if (points.length === 0) {
    return (
      <div className="card">
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>{title}</h3>
        <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          No telemetry trend data available for this selection
        </div>
      </div>
    );
  }

  const detectedUnit = formatUnit(points[0]?.unit || unit);
  const refMax = points[0]?.refMax;
  const refMin = points[0]?.refMin;

  const values = points.map((p) => p.val);
  if (baseline && !isNaN(Number(baseline))) values.push(Number(baseline));
  if (refMax !== null && refMax !== undefined) values.push(Number(refMax));
  if (refMin !== null && refMin !== undefined) values.push(Number(refMin));

  const minVal = Math.min(...values) * 0.9;
  const maxVal = Math.max(...values) * 1.1 || 100;

  const width = 700;
  const height = 230;
  const pad = 36;

  const getX = (i) => pad + (i / Math.max(points.length - 1, 1)) * (width - pad * 2);
  const getY = (v) => height - pad - ((v - minVal) / (maxVal - minVal || 1)) * (height - pad * 2);

  const polylinePoints = points.map((p, i) => `${getX(i)},${getY(p.val)}`).join(' ');

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{title}</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Mission Timeline Progression {detectedUnit && `(${detectedUnit})`}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {refMin !== undefined && refMax !== undefined && (
            <span className="badge badge-warning">
              Ref Range: {refMin ?? 0} – {refMax} {detectedUnit}
            </span>
          )}
          {baseline !== null && baseline !== undefined && !isNaN(Number(baseline)) && (
            <span className="badge badge-nominal">
              Baseline: {Number(baseline).toFixed(2)} {detectedUnit}
            </span>
          )}
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* خط الـ Baseline */}
        {baseline !== null && baseline !== undefined && !isNaN(Number(baseline)) && (
          <line
            x1={pad}
            y1={getY(Number(baseline))}
            x2={width - pad}
            y2={getY(Number(baseline))}
            stroke="#10b981"
            strokeDasharray="5 5"
            strokeWidth="1.5"
          />
        )}

        {/* خط الـ refMax
        {refMax !== null && refMax !== undefined && (
          <line
            x1={pad}
            y1={getY(Number(refMax))}
            x2={width - pad}
            y2={getY(Number(refMax))}
            stroke="#ef4444"
            strokeDasharray="3 3"
            strokeWidth="1"
            opacity="0.6"
          />
        )} */}

        <polygon
          points={`${getX(0)},${height - pad} ${polylinePoints} ${getX(points.length - 1)},${height - pad}`}
          fill="url(#lineGrad)"
        />

        <polyline fill="none" stroke="#6366f1" strokeWidth="2.5" points={polylinePoints} />

        {points.map((p, i) => {
          const isOut = (p.refMax != null && p.val > p.refMax) || (p.refMin != null && p.val < p.refMin);
          return (
            <g key={i}>
              <circle
                cx={getX(i)}
                cy={getY(p.val)}
                r="4.5"
                fill={isOut ? '#ef4444' : '#8b5cf6'}
                stroke="#090b10"
                strokeWidth="2"
              />
              <text x={getX(i)} y={getY(p.val) - 10} fill="#f8fafc" fontSize="10" textAnchor="middle" className="mono">
                {p.val}
              </text>
              <text x={getX(i)} y={height - 10} fill="#94a3b8" fontSize="10" textAnchor="middle" className="mono">
                {String(p.label).slice(0, 10)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}