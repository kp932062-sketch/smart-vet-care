import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { getActiveToken } from '../../utils/auth';

const ReportCardPanel = () => {
  const [animals, setAnimals] = useState([]);
  const [selectedAnimal, setSelectedAnimal] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportUrl, setReportUrl] = useState('');

  useEffect(() => {
    const fetchAnimals = async () => {
      setLoading(true);
      setError('');
      try {
        // Get user ID from JWT
        const token = getActiveToken();
        let userId = '';
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            userId = payload.id;
          } catch {}
        }
        // Fetch animals for user
        const res = await api.get(`/pets?owner=${userId}`);
        setAnimals(res.data);
      } catch (err) {
        setError('Failed to fetch animals');
      }
      setLoading(false);
    };
    fetchAnimals();
  }, []);

  const handleViewReport = async () => {
    if (!selectedAnimal) return;
    setLoading(true);
    setError('');
    try {
      // Just set the PDF URL for download/view
      setReportUrl(`${api.defaults.baseURL}/report/animal/${selectedAnimal}`);
    } catch (err) {
      setError('Failed to fetch report');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-xl font-bold mb-2">Report Card</h3>
      {loading && <div className="text-blue-600">Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Select Animal</label>
        <select className="w-full rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100" value={selectedAnimal} onChange={e => setSelectedAnimal(e.target.value)}>
          <option value="">Choose animal</option>
          {animals.map(animal => (
            <option key={animal._id} value={animal._id}>{animal.name} ({animal.type})</option>
          ))}
        </select>
      </div>
      <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleViewReport} disabled={!selectedAnimal || loading}>View/Download Report</button>
      {reportUrl && (
        <div className="mt-4">
          <a href={reportUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">Download PDF</a>
        </div>
      )}
    </div>
  );
};

export default ReportCardPanel;
