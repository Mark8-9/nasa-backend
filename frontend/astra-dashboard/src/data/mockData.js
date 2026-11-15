
const API_BASE_URL = "https://nasa-backend-production-7bfb6364.up.railway.app";
// console.log("API BASE URL:", API_BASE_URL); 
console.log("API BASE URL"); 

async function fetchEndpoint(endpoint, options = {}) {
  const cleanEndpoint = endpoint.replace(/^\/+/, '');
  const url = `${API_BASE_URL}/${cleanEndpoint}`;


  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...(options.body
        ? { body: JSON.stringify(options.body) }
        : {}),
    });

    const json = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        json.message || `HTTP Error ${response.status} on ${url}`
      );
    }

    console.log(`✅ [API Response] ${url}:`, json);

    return json.data !== undefined ? json.data : json;

  } catch (error) {
    console.error(`❌ [Fetch Error] ${url}:`, error.message);
    throw error;
  }
}

export const apiService = {
  getAstronauts: () =>
    fetchEndpoint('api/astronauts'),

  getAstronautDetails: (id = 'C001') =>
    fetchEndpoint(`api/astronauts/${id}`),

  getBaseline: (id = 'C001') =>
    fetchEndpoint(`api/astronauts/${id}/baseline`),

  getBaselineTest: (id = 'C001', test = 'hemoglobin') =>
    fetchEndpoint(`api/astronauts/${id}/baseline/${test}`),

  getMeasurements: (id = 'C001') =>
    fetchEndpoint(`api/astronauts/${id}/measurements`),

  getLatestMeasurements: (id = 'C001') =>
    fetchEndpoint(`api/astronauts/${id}/measurements/latest`),

  getCompareBaseline: (id = 'C001') =>
    fetchEndpoint(`api/astronauts/${id}/measurements/compare`),

  getTestMeasurements: (id = 'C001', test = 'hemoglobin') =>
    fetchEndpoint(`api/astronauts/${id}/measurements/${test}`),

  getOverview: () =>
    fetchEndpoint('api/dashboard/overview'),

  getTrends: () =>
    fetchEndpoint('api/dashboard/trends'),

  getOutOfRange: () =>
    fetchEndpoint('api/dashboard/out-of-range'),

  getAstronautAIAnalysis: (
    id = 'C001',
    feature = 'Hemoglobin',
    panel = ''
  ) => {
    const params = new URLSearchParams({ feature });

    if (panel) {
      params.append('panel', panel);
    }

    return fetchEndpoint(
      `api/ai/astronauts/${id}/analysis?${params.toString()}`
    );
  },
};

export default apiService;
