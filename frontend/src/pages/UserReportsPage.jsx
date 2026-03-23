import React from 'react';
import { useNavigate } from 'react-router-dom';
import ReportsPanel from '../components/user/ReportsPanel';

const UserReportsPage = () => {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen bg-transparent pt-24">
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <div className="dashboard-surface p-5 sm:p-6 lg:p-8">
          <div className="mb-6">
            <div className="mb-6 flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-800"
            >
              ←
            </button>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-2xl text-white shadow-lg shadow-teal-700/30">
              📄
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 lg:text-4xl dark:text-slate-100">
                <span className="text-teal-600">Medical</span> <span className="text-blue-600">Reports</span>
              </h2>
              <p className="text-gray-600 dark:text-slate-300">View and download your pet's medical reports</p>
            </div>
          </div>
        </div>

        <div className="section-card p-6">
          <ReportsPanel />
        </div>
        </div>
      </div>
    </section>
  );
};

export default UserReportsPage;