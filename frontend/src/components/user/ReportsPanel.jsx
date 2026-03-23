import React, { useEffect, useMemo, useState } from 'react';
import api from '../../utils/api';
import Card from '../common/Card';
import EmptyState from '../common/EmptyState';
import Loader from '../common/Loader';

const ReportsPanel = () => {
  const [reports, setReports] = useState([]);
  const [searchUid, setSearchUid] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState({});

  useEffect(() => {
    fetchReports();
  }, []);

  const reportCount = useMemo(() => reports.length, [reports]);

  const fetchReports = async (appointmentUid = '') => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      const normalizedUid = String(appointmentUid || '').trim().toUpperCase();
      if (normalizedUid) {
        params.appointment_uid = normalizedUid;
      }

      const res = await api.get('/user/reports', { params });
      const reportsData = Array.isArray(res.data?.data) ? res.data.data : [];
      setReports(reportsData);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to fetch medical reports.');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (appointmentUid, petName, date) => {
    setDownloading((prev) => ({ ...prev, [appointmentUid]: true }));
    setError('');
    try {
      const response = await api.get(`/reports/${appointmentUid}/pdf`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      const formattedDate = new Date(date || Date.now()).toISOString().slice(0, 10);
      const filename = `${petName || 'Pet'}_Medical_Report_${formattedDate}.pdf`;
      link.setAttribute('download', filename);

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading report:', err);
      setError('Failed to download report.');
    } finally {
      setDownloading((prev) => ({ ...prev, [appointmentUid]: false }));
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A';
    try {
      return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeStr;
    }
  };

  return (
    <Card className="p-5 sm:p-6 dark:bg-slate-900/80">
      <div className="mb-5 rounded-xl border border-emerald-100/80 bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20 dark:border-emerald-900/50 p-4">
        <p className="text-xs uppercase tracking-wide font-semibold text-emerald-700 dark:text-emerald-300">Health Records</p>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Your completed consultation summaries are stored here for quick access.</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">Medical Reports</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {reportCount} report{reportCount === 1 ? '' : 's'} available
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={searchUid}
            onChange={(event) => setSearchUid(event.target.value.toUpperCase())}
            placeholder="Search Appointment ID (APT-YYYYMMDD-1234)"
            className="w-full sm:w-80 rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            onClick={() => fetchReports(searchUid)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            Search
          </button>
          <button
            onClick={() => {
              setSearchUid('');
              fetchReports('');
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading && <Loader label="Loading medical reports..." />}

      {!loading && error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-900 p-3 text-sm text-red-700 dark:text-red-200">
          {error}
        </div>
      )}

      {!loading && !error && reports.length === 0 && (
        <EmptyState
          icon="🩺"
          title="No Medical Reports Yet"
          description="Once a consultation is completed, your medical report will appear here automatically."
        />
      )}

      {!loading && reports.length > 0 && (
        <div className="space-y-4">
          {reports.map((report) => {
            const reportId = report._id || report.id;
            const petName = report.pet_name || 'Pet';
            const reportDate = report.report_date || report.created_at;
            const appointmentUid = report.appointment_uid || `REPORT-${reportId}`;

            return (
              <Card key={reportId} className="p-4 sm:p-5 bg-gradient-to-r from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                        🏥
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{petName}</h4>
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">{appointmentUid}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                          Dr. {report.doctor_name || 'Unknown Doctor'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <p>📅 {formatDate(reportDate)}</p>
                      <p>🆔 {appointmentUid}</p>
                    </div>

                    {report.diagnosis && (
                      <div className="mt-3 text-sm">
                        <p className="font-medium text-slate-700 dark:text-slate-200">Diagnosis</p>
                        <p className="text-slate-600 dark:text-slate-300">{report.diagnosis}</p>
                      </div>
                    )}

                    {report.qr_code_data_url && (
                      <div className="mt-3">
                        <img src={report.qr_code_data_url} alt={`QR for ${appointmentUid}`} className="h-24 w-24 rounded-lg border border-slate-200" />
                      </div>
                    )}
                  </div>

                  <div className="flex lg:flex-col gap-2 lg:min-w-[140px]">
                    <button
                      onClick={() => downloadReport(appointmentUid, petName, reportDate)}
                      disabled={Boolean(downloading[appointmentUid])}
                      className="w-full px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {downloading[appointmentUid] ? 'Downloading...' : 'Download PDF'}
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default ReportsPanel;
