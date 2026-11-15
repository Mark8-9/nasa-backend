// src/pages/AstronautDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../data/mockData';
import HealthChart from '../components/HealthChart';
import { formatUnit, formatAnalyte } from './Overview';
import { User, Activity, GitCompare, Database, FlaskConical, Sparkles, RefreshCw } from 'lucide-react';

const ANALYTES = [
  'hemoglobin',
  'hematocrit',
  'glucose',
  'urea_nitrogen_bun',
  'creatinine',
  'potassium',
  'chloride',
  'carbon_dioxide',
  'platelet_count',
  'red_blood_cell_count',
  'absolute_monocytes',
  'alkaline_phosphatase',
];

export default function AstronautDetails() {
  const { id = 'C001' } = useParams();
  const [selectedTest, setSelectedTest] = useState('hemoglobin');
  const [activeTab, setActiveTab] = useState('all');

  const [details, setDetails] = useState(null);
  const [baseline, setBaseline] = useState([]);
  const [testBaseline, setTestBaseline] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [latest, setLatest] = useState([]);
  const [comparison, setComparison] = useState([]);
  const [testMeasurements, setTestMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);

  // States خاصة بـ Gemini AI Summary
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  useEffect(() => {
    async function fetchAllCrewData() {
      setLoading(true);
      setAiAnalysis(null);
      const [detRes, baseRes, allMeasRes, latRes, compRes] = await Promise.allSettled([
        apiService.getAstronautDetails(id),
        apiService.getBaseline(id),
        apiService.getMeasurements(id),
        apiService.getLatestMeasurements(id),
        apiService.getCompareBaseline(id),
      ]);

      if (detRes.status === 'fulfilled') setDetails(detRes.value);
      if (baseRes.status === 'fulfilled') {
        const b = baseRes.value;
        setBaseline(Array.isArray(b) ? b : (b?.baselines || b?.data || Object.entries(b || {})));
      }
      if (allMeasRes.status === 'fulfilled') {
        const m = allMeasRes.value;
        setMeasurements(Array.isArray(m) ? m : (m?.measurements || m?.data || []));
      }
      if (latRes.status === 'fulfilled') {
        const l = latRes.value;
        setLatest(Array.isArray(l) ? l : (l?.measurements || l?.latest || Object.entries(l || {})));
      }
      if (compRes.status === 'fulfilled') {
        const c = compRes.value;
        setComparison(Array.isArray(c) ? c : (c?.comparisons || c?.comparison || Object.entries(c || {})));
      }
      setLoading(false);
    }
    fetchAllCrewData();
  }, [id]);

  useEffect(() => {
    async function fetchSpecificBiomarker() {
      const [tBase, tMeas] = await Promise.allSettled([
        apiService.getBaselineTest(id, selectedTest),
        apiService.getTestMeasurements(id, selectedTest),
      ]);

      if (tBase.status === 'fulfilled') setTestBaseline(tBase.value);
      if (tMeas.status === 'fulfilled') {
        const tm = tMeas.value;
        setTestMeasurements(Array.isArray(tm) ? tm : (tm?.measurements || tm?.readings || []));
      }
    }
    fetchSpecificBiomarker();
  }, [id, selectedTest]);

  // دالة استدعاء الـ AI مع تمرير الـ selectedTest كـ feature
  const handleFetchAI = async (featureToAnalyze = selectedTest) => {
    setActiveTab('ai');
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await apiService.getAstronautAIAnalysis(id, featureToAnalyze);
      setAiAnalysis(res);
    } catch (err) {
      setAiError(err.message || 'Failed to generate AI analysis');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return <div className="mono" style={{ padding: '2rem' }}>Syncing Telemetry for Crew {id}...</div>;
  }

  // عرض الـ summary والـ readings الراجعة من الكونترولر
  const renderAISection = () => {
    if (!aiAnalysis) return null;

    const summaryText =
      typeof aiAnalysis.summary === 'string'
        ? aiAnalysis.summary
        : typeof aiAnalysis === 'string'
        ? aiAnalysis
        : JSON.stringify(aiAnalysis.summary || aiAnalysis, null, 2);

    const aiReadings = aiAnalysis.readings || [];
    const aiBaselines = aiAnalysis.baselines || [];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* كارت الملخص الطبي من Gemini */}
        <div
          style={{
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            borderRadius: '10px',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span className="badge badge-nominal mono">
              FEATURE: {formatAnalyte(aiAnalysis.feature || selectedTest).toUpperCase()}
            </span>
            {aiBaselines.length > 0 && (
              <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Baseline: {aiBaselines[0].value} {formatUnit(aiBaselines[0].unit)}
              </span>
            )}
          </div>

          <div
            style={{
              whiteSpace: 'pre-wrap',
              lineHeight: 1.8,
              color: 'var(--text-primary)',
              fontSize: '0.95rem',
            }}
          >
            {summaryText}
          </div>
        </div>

        {/* جدول القراءات التي تم إرسالها للـ AI (readings) */}
        {aiReadings.length > 0 && (
          <div>
            <h4 className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
              Analyzed Telemetry Readings ({aiReadings.length} Timepoints)
            </h4>
            <div className="table-container">
              <table className="astra-table">
                <thead>
                  <tr>
                    <th>Timepoint</th>
                    <th>Phase</th>
                    <th>Value</th>
                    <th>Reference Range</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {aiReadings.map((r, i) => {
                    const isOut = (r.refMax != null && r.value > r.refMax) || (r.refMin != null && r.value < r.refMin);
                    return (
                      <tr key={i}>
                        <td className="mono" style={{ fontWeight: 600 }}>{r.timepoint}</td>
                        <td className="mono" style={{ textTransform: 'uppercase', color: 'var(--text-secondary)' }}>{r.phase}</td>
                        <td className="mono" style={{ fontWeight: 700, color: isOut ? 'var(--status-critical)' : 'var(--accent-indigo)' }}>
                          {r.value} {formatUnit(r.unit)}
                        </td>
                        <td className="mono" style={{ color: 'var(--text-secondary)' }}>
                          {r.refMin ?? 0} – {r.refMax ?? '--'} {formatUnit(r.unit)}
                        </td>
                        <td>
                          <span className={`badge ${isOut ? 'badge-critical' : 'badge-nominal'}`}>
                            {isOut ? 'OUT OF RANGE' : 'NOMINAL'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMeasurementsTable = (list) => {
    const arr = Array.isArray(list) ? list : [];
    if (arr.length === 0) {
      return (
        <tr>
          <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No records found</td>
        </tr>
      );
    }

    return arr.map((item, idx) => {
      if (Array.isArray(item)) {
        const [k, v] = item;
        return (
          <tr key={k}>
            <td style={{ fontWeight: 600, textTransform: 'capitalize' }}>{formatAnalyte(k)}</td>
            <td colSpan="5" className="mono">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</td>
          </tr>
        );
      }

      const val = item.value ?? item.mean ?? item.baselineValue ?? item.latestValue ?? '--';
      const isOut =
        (item.refMax != null && val > item.refMax) ||
        (item.refMin != null && val < item.refMin);

      return (
        <tr key={item._id || idx}>
          <td style={{ fontWeight: 600, textTransform: 'capitalize' }}>
            {formatAnalyte(item.analyte || item.testName || item.name)}
          </td>
          <td>
            <span className="badge badge-nominal">{item.panel || 'BIO'}</span>
          </td>
          <td className="mono" style={{ fontWeight: 700, color: isOut ? 'var(--status-critical)' : 'var(--accent-indigo)' }}>
            {val} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>{formatUnit(item.unit)}</span>
          </td>
          <td className="mono" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {item.refMin !== undefined || item.refMax !== undefined
              ? `${item.refMin ?? 0} – ${item.refMax ?? '--'} ${formatUnit(item.unit)}`
              : (item.baseline ?? item.mean ?? '--')}
          </td>
          <td className="mono">
            {item.timepoint?.label ? `${item.timepoint.label} (${item.timepoint.phase})` : (item.phase || '--')}
          </td>
          <td>
            <span className={`badge ${isOut ? 'badge-critical' : 'badge-nominal'}`}>
              {isOut ? 'OUT OF RANGE' : 'NOMINAL'}
            </span>
          </td>
        </tr>
      );
    });
  };

  return (
    <div>
      {/* الهيدر واختيار الـ Analyte + زر الـ AI */}
      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '12px',
            background: 'rgba(99, 102, 241, 0.15)', border: '1px solid var(--accent-indigo)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <User size={28} color="var(--accent-indigo)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>
                Astronaut {details?.astronautId || id}
              </h1>
              <span className="badge badge-nominal mono">{id}</span>
            </div>
            <p className="mono" style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              Total Measurements Synced: {measurements.length}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FlaskConical size={16} color="var(--accent-purple)" />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Select Feature:</span>
            <select
              value={selectedTest}
              onChange={(e) => {
                const newFeature = e.target.value;
                setSelectedTest(newFeature);
                if (activeTab === 'ai') {
                  handleFetchAI(newFeature);
                }
              }}
              className="btn-outline mono"
              style={{ background: 'var(--bg-primary)', padding: '0.45rem 0.75rem' }}
            >
              {ANALYTES.map((a) => (
                <option key={a} value={a}>
                  {formatAnalyte(a).toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <button className="btn-primary" onClick={() => handleFetchAI(selectedTest)} disabled={aiLoading}>
            <Sparkles size={16} />
            {aiLoading ? 'Generating Summary...' : `AI Summary (${formatAnalyte(selectedTest)})`}
          </button>
        </div>
      </div>

      {/* الشارت للـ Analyte المختار */}
      <div style={{ marginBottom: '1.5rem' }}>
        <HealthChart
          title={`${formatAnalyte(selectedTest).toUpperCase()} — (api/astronauts/${id}/measurements/${selectedTest}/)`}
          data={testMeasurements}
          baseline={testBaseline?.mean ?? testBaseline?.value ?? testBaseline?.baseline}
          unit={testBaseline?.unit || ''}
        />
      </div>

      {/* التبويبات */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button className={`btn-outline ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
          All Measurements ({measurements.length})
        </button>
        <button className={`btn-outline ${activeTab === 'latest' ? 'active' : ''}`} onClick={() => setActiveTab('latest')}>
          <Activity size={14} style={{ marginRight: 6 }} /> Latest Readings (`/latest/`)
        </button>
        <button className={`btn-outline ${activeTab === 'baseline' ? 'active' : ''}`} onClick={() => setActiveTab('baseline')}>
          <Database size={14} style={{ marginRight: 6 }} /> Full Baseline (`/baseline/`)
        </button>
        <button className={`btn-outline ${activeTab === 'compare' ? 'active' : ''}`} onClick={() => setActiveTab('compare')}>
          <GitCompare size={14} style={{ marginRight: 6 }} /> Compare with Baseline (`/compare/`)
        </button>
        <button
          className={`btn-outline ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => handleFetchAI(selectedTest)}
          style={{ borderColor: activeTab === 'ai' ? 'var(--accent-purple)' : undefined }}
        >
          <Sparkles size={14} style={{ marginRight: 6, color: '#c084fc' }} />
          Gemini AI Summary
        </button>
      </div>

      {/* عرض المحتوى */}
      {activeTab === 'ai' ? (
        <div className="card" style={{ border: '1px solid rgba(139, 92, 246, 0.4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Sparkles size={20} color="#c084fc" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                Gemini AI — Health Summary for {id} ({formatAnalyte(selectedTest).toUpperCase()})
              </h3>
            </div>
            <button className="btn-outline" onClick={() => handleFetchAI(selectedTest)} disabled={aiLoading}>
              <RefreshCw size={14} style={{ marginRight: 6 }} /> Regenerate
            </button>
          </div>

          {aiLoading && (
            <div className="mono" style={{ padding: '2rem', textAlign: 'center', color: '#c084fc' }}>
              ✨ Gemini AI is analyzing {formatAnalyte(selectedTest)} readings for {id}...
            </div>
          )}

          {aiError && (
            <div className="mono" style={{ padding: '1rem', color: 'var(--status-critical)', background: 'rgba(239,68,68,0.1)', borderRadius: 8 }}>
              ⚠️ {aiError}
            </div>
          )}

          {!aiLoading && !aiError && renderAISection()}
        </div>
      ) : (
        <div className="card table-container">
          <table className="astra-table">
            <thead>
              <tr>
                <th>Analyte</th>
                <th>Panel</th>
                <th>Value / Mean</th>
                <th>Reference / Baseline</th>
                <th>Timepoint</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {activeTab === 'all' && renderMeasurementsTable(measurements)}
              {activeTab === 'latest' && renderMeasurementsTable(latest)}
              {activeTab === 'baseline' && renderMeasurementsTable(baseline)}
              {activeTab === 'compare' && renderMeasurementsTable(comparison)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}