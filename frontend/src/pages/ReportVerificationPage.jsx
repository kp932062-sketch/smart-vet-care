import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../utils/api';

const ReportVerificationPage = () => {
  const { appointmentUid } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);

  useEffect(() => {
    const fetchVerification = async () => {
      setLoading(true);
      setError('');

      try {
        const normalizedUid = String(appointmentUid || '').trim().toUpperCase();
        const response = await api.get(`/reports/verify/${normalizedUid}`);
        setReport(response.data?.data || null);
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to verify report for this appointment ID.');
      } finally {
        setLoading(false);
      }
    };

    fetchVerification();
  }, [appointmentUid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow p-8 text-center max-w-xl w-full">
          <p className="text-slate-700 font-medium">Verifying report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow p-8 max-w-xl w-full">
          <h1 className="text-xl font-bold text-slate-900 mb-2">Report Verification</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700"
          >
            Go To Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-blue-700 p-6 text-white">
          <p className="text-xs uppercase tracking-wider opacity-90">SmartVet Verified Report</p>
          <h1 className="text-2xl font-bold mt-1">Read-Only Verification</h1>
          <p className="text-sm opacity-90 mt-2">Appointment ID: {report?.appointmentUid}</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
              <p className="text-slate-500">Patient</p>
              <p className="font-semibold text-slate-900">{report?.petName || 'N/A'}</p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
              <p className="text-slate-500">Owner</p>
              <p className="font-semibold text-slate-900">{report?.ownerName || 'N/A'}</p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
              <p className="text-slate-500">Doctor</p>
              <p className="font-semibold text-slate-900">Dr. {report?.doctorName || 'N/A'}</p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
              <p className="text-slate-500">Report Date</p>
              <p className="font-semibold text-slate-900">{report?.reportDate || 'N/A'}</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Diagnosis</p>
            <p className="text-slate-800 mt-1">{report?.diagnosis || 'N/A'}</p>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Treatment</p>
            <p className="text-slate-800 mt-1">{report?.treatment || 'N/A'}</p>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Prescription</p>
            <p className="text-slate-800 mt-1">{report?.prescription || 'N/A'}</p>
          </div>

          {report?.notes && (
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Notes</p>
              <p className="text-slate-800 mt-1">{report.notes}</p>
            </div>
          )}

          {report?.qrCodeDataUrl && (
            <div className="pt-2">
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Verification QR</p>
              <img src={report.qrCodeDataUrl} alt={`QR for ${report?.appointmentUid}`} className="h-28 w-28 rounded-lg border border-slate-200" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportVerificationPage;
