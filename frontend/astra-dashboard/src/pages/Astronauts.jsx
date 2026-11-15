// src/pages/Astronauts.jsx
import React, { useEffect, useState } from 'react';
import { apiService } from '../data/mockData';
import AstronautTable from '../components/AstronautTable';

export default function Astronauts() {
  const [astronauts, setAstronauts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCrew() {
      try {
        const data = await apiService.getAstronauts();
        const list = Array.isArray(data) ? data : (data.astronauts || data.results || []);
        setAstronauts(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCrew();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.25rem' }}>Astronaut Crew Manifest</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Select a crew member to inspect baseline values, latest measurements, and biomarker comparisons
          </p>
        </div>
        <span className="badge badge-nominal mono">ENDPOINT: api/astronauts/</span>
      </div>

      {loading ? (
        <div className="mono">Fetching Crew Manifest...</div>
      ) : (
        <AstronautTable astronauts={astronauts} />
      )}
    </div>
  );
}