import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReportsPanel from '../components/doctor/ReportsPanel';

const DoctorReportsPage = () => {
  const navigate = useNavigate();
  const { link } = useParams();

  return (
    <section className="min-h-screen bg-transparent pt-24">
      <div className="mx-auto max-w-7xl p-4 md:p-8">
        <div className="dashboard-surface p-5 md:p-8">
        <div className="mb-8">
          <div className="mb-6 flex items-center gap-4">
            <button 
              onClick={() => navigate(`/doctor-dashboard/${link}`)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-800"
            >
              ←
            </button>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-600 text-2xl text-white shadow-lg shadow-orange-700/30">
              📊
            </div>
            <div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-slate-100">
                <span className="text-orange-600">Reports</span> <span className="text-emerald-600">&amp; Analytics</span>
              </h2>
              <p className="text-gray-600 dark:text-slate-300">Track your practice performance and patient reports</p>
            </div>
          </div>
        </div>

        <div className="section-card p-8">
          <ReportsPanel doctorLink={link} />
        </div>
        </div>
      </div>
    </section>
  );
};

export default DoctorReportsPage;