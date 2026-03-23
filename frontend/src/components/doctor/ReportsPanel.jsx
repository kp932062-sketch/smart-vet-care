import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { getActiveToken } from '../../utils/auth';
import FormInput from '../common/FormInput';

const ReportsPanel = ({ doctorLink }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('reports');
  const [showClinicalNoteModal, setShowClinicalNoteModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [clinicalNote, setClinicalNote] = useState({
    outcome: '',
    animalBehavior: '',
    outcomeDetails: '',
    lessonsLearned: '',
    preventionStrategy: '',
    complications: ''
  });
  const [analytics, setAnalytics] = useState({
    totalConsultations: 0,
    totalPatients: 0,
    commonDiseases: [],
    monthlyStats: [],
    treatmentSuccess: 0,
    avgConsultationTime: 0
  });
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [monthlyAnalytics, setMonthlyAnalytics] = useState(null);

  const getCurrentDoctorId = () => {
    const doctorData = JSON.parse(sessionStorage.getItem('doctor') || '{}');
    const userInfo = JSON.parse(sessionStorage.getItem('user') || '{}');

    return (
      doctorData.id || doctorData._id ||
      userInfo.id || userInfo._id ||
      null
    );
  };

  const getDoctorApiConfig = () => {
    const config = {
      headers: {}
    };
    
    // Add JWT token for authentication (if available)
    const token = getActiveToken();
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Add Doctor-Link for doctor-specific access (required for doctors)
    if (doctorLink) {
      config.headers['Doctor-Link'] = doctorLink;
    }
    
    return config;
  };

  useEffect(() => {
    fetchReports();
    fetchDynamicAnalytics(); // Add dynamic analytics
    fetchMonthlyAnalytics(selectedMonth); // Fetch current month analytics
  }, []);

  useEffect(() => {
    if (reports.length > 0) {
      calculateAnalytics();
    }
  }, [reports]);

  const fetchDynamicAnalytics = async () => {
    try {
      const doctorId = getCurrentDoctorId();
      
      if (!doctorId) {
        return;
      }

      const response = await api.get(`/reports/doctor/${doctorId}/analytics`);
      const data = response.data;
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('âŒ Error fetching dynamic analytics:', error);
    }
  };

  const fetchMonthlyAnalytics = async (selectedDate) => {
    try {
      const doctorId = getCurrentDoctorId();
      
      if (!doctorId) {
        return;
      }

      const [year, month] = selectedDate.split('-');
      const response = await api.get(`/reports/doctor/${doctorId}/analytics`, {
        params: { month, year }
      });
      
      const data = response.data;
      if (data.success) {
        setMonthlyAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('âŒ Error fetching monthly analytics:', error);
    }
  };

  const handleMonthChange = (event) => {
    const newMonth = event.target.value;
    setSelectedMonth(newMonth);
    fetchMonthlyAnalytics(newMonth);
  };

  const handleMonthBarClick = (monthData, monthIndex) => {
    // Calculate the year-month string for the clicked month
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Calculate which month was clicked (going back from current month)
    const targetMonth = currentMonth - (5 - monthIndex);
    const targetYear = targetMonth < 0 ? currentYear - 1 : currentYear;
    const adjustedMonth = targetMonth < 0 ? 12 + targetMonth : targetMonth;
    
    const selectedMonthString = `${targetYear}-${String(adjustedMonth + 1).padStart(2, '0')}`;
    
    
    // Update the selected month and fetch analytics
    setSelectedMonth(selectedMonthString);
    fetchMonthlyAnalytics(selectedMonthString);
    
    // Add visual feedback
    const clickedElement = monthData?.target?.currentTarget || monthData?.currentTarget;
    if (!clickedElement) {
      return;
    }
    clickedElement.style.transform = 'scale(0.95)';
    setTimeout(() => {
      clickedElement.style.transform = 'scale(1)';
    }, 150);
  };

  const fetchReports = async () => {
    try {
      const doctorId = getCurrentDoctorId();
      
      if (!doctorId) {
        console.error('No doctor ID found in session.');
        setError('Doctor ID not found. Please login again.');
        setLoading(false);
        return;
      }
      
      const apiConfig = getDoctorApiConfig();
      const response = await api.get(`/reports/doctor/${doctorId}`, apiConfig);
      setReports(response.data);
      setLoading(false);
      
    } catch (err) {
      console.error('Error fetching reports:', err);
      
      if (err.response?.status === 400) {
        setError('Invalid doctor ID. Please login again.');
      } else if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else {
        setError('Failed to load reports. Please try again.');
      }
      setLoading(false);
    }
  };

  const calculateAnalytics = () => {
    const totalConsultations = reports.length;
    const uniquePatients = new Set(reports.map(r => r.farmer?._id)).size;
    
    // Count diseases
    const diseases = {};
    reports.forEach(report => {
      if (report.diagnosis) {
        const disease = report.diagnosis.toLowerCase().trim();
        diseases[disease] = (diseases[disease] || 0) + 1;
      }
    });
    
    const commonDiseases = Object.entries(diseases)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([disease, count]) => ({ disease, count }));

    // Monthly stats (last 6 months)
    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      const monthReports = reports.filter(report => {
        const reportDate = new Date(report.createdAt);
        return reportDate.getMonth() === date.getMonth() && 
               reportDate.getFullYear() === date.getFullYear();
      });
      
      monthlyStats.push({
        month: monthKey,
        consultations: monthReports.length,
        patients: new Set(monthReports.map(r => r.farmer?._id)).size
      });
    }

    // Treatment success rate (assuming completed reports are successful)
    const completedReports = reports.filter(r => r.status === 'completed');
    const treatmentSuccess = totalConsultations > 0 ? 
      Math.round((completedReports.length / totalConsultations) * 100) : 0;

    setAnalytics({
      totalConsultations,
      totalPatients: uniquePatients,
      commonDiseases,
      monthlyStats,
      treatmentSuccess,
      avgConsultationTime: 45 // This would be calculated from actual consultation data
    });
  };

  const downloadReport = async (reportId) => {
    try {
      // Use the same approach as AppointmentsPanel for successful downloads
      const apiConfig = {
        responseType: 'blob',
        ...getDoctorApiConfig()
      };
      
      const response = await api.get(`/reports/${reportId}/download`, apiConfig);
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading report:', err);
      setError('Failed to download report');
    }
  };

  const openClinicalNoteModal = (report) => {
    setSelectedReport(report);
    setShowClinicalNoteModal(true);
    // Clear any previous messages
    setError('');
    setMessage({ type: '', text: '' });
    // Pre-fill with existing clinical note if available
    if (report.clinicalNote) {
      setClinicalNote(report.clinicalNote);
    } else {
      setClinicalNote({
        outcome: '',
        animalBehavior: '',
        outcomeDetails: '',
        lessonsLearned: '',
        preventionStrategy: '',
        complications: ''
      });
    }
  };

  const saveClinicalNote = async () => {
    try {
      if (!selectedReport) {
        console.error('No selected report');
        return;
      }
      
      
      const apiConfig = getDoctorApiConfig();
      
      const response = await api.put(`/reports/${selectedReport._id}/clinical-note`, {
        clinicalNote: {
          ...clinicalNote,
          addedAt: new Date()
          // addedBy will be set by backend using req.user.id
        }
      }, apiConfig);
      
      
      // Update the reports state with the full updated report
      const updatedReports = reports.map(report => 
        report._id === selectedReport._id 
          ? response.data // Use the full updated report from backend
          : report
      );
      setReports(updatedReports);
      
      setShowClinicalNoteModal(false);
      setSelectedReport(null);
      
      // Clear any previous errors and show success message
      setError('');
      setMessage({ type: 'success', text: 'Clinical note saved successfully!' });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
      
    } catch (err) {
      console.error('Error saving clinical note:', err);
      console.error('Error response:', err.response?.data);
      setError('Failed to save clinical note: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const TabButton = ({ id, label, icon, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
        isActive
          ? 'bg-blue-600 text-white shadow-lg'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </button>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header with Tabs */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">ðŸ“Š Reports & Analytics</h3>
          <p className="text-gray-600">Track your practice performance and patient reports</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6">
        <TabButton
          id="reports"
          label="Medical Reports"
          icon="ðŸ“‹"
          isActive={activeTab === 'reports'}
          onClick={setActiveTab}
        />
        <TabButton
          id="analytics"
          label="Practice Analytics"
          icon="ðŸ“ˆ"
          isActive={activeTab === 'analytics'}
          onClick={setActiveTab}
        />
        <TabButton
          id="diseases"
          label="Disease Patterns"
          icon="ðŸ”¬"
          isActive={activeTab === 'diseases'}
          onClick={setActiveTab}
        />
        <TabButton
          id="clinical"
          label="Clinical Notes"
          icon="ðŸ“"
          isActive={activeTab === 'clinical'}
          onClick={setActiveTab}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {message.text && (
        <div className={`p-4 rounded-lg mb-6 ${
          message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <p className={message.type === 'success' ? 'text-green-600' : 'text-red-600'}>
            {message.text}
          </p>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'reports' && (
        <div>
          <div className="bg-blue-50 px-4 py-2 rounded-lg mb-6 flex justify-between items-center">
            <span className="text-sm font-medium text-blue-700">
              Total Reports: {reports.length}
            </span>
            <span className="text-sm text-blue-600">
              Success Rate: {analytics.treatmentSuccess}%
            </span>
          </div>

          {reports.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Reports Found</h3>
              <p className="text-gray-500">
                Completed consultation reports will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="text-lg font-semibold text-gray-800">
                          {report.title || `Consultation Report`}
                        </h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          report.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {report.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Patient:</span> {report.farmer?.name || 'Unknown'}
                          </p>
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Pet:</span> {report.animal?.name || report.appointment?.petName || 'Unknown'}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Report Type:</span> {report.reportType || 'Consultation'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Date:</span> {new Date(report.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Diagnosis:</span> {report.diagnosis || 'Not specified'}
                          </p>
                          <div className="text-sm text-gray-600">
                            <div><span className="font-medium">Consultation Fee:</span> â‚¹{report.cost?.consultationFee || 0}</div>
                            <div><span className="font-medium">Platform Fee:</span> â‚¹{report.cost?.platformFee || 0}</div>
                            <div><span className="font-medium">Tax (5%):</span> â‚¹{report.cost?.tax || 0}</div>
                            <div><span className="font-medium">Total Cost:</span> <span className="font-bold">â‚¹{report.cost?.total || 0}</span></div>
                          </div>
                        </div>
                      </div>

                      {report.diagnosis && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Diagnosis:</p>
                          <p className="text-sm text-gray-600">{report.diagnosis}</p>
                        </div>
                      )}

                      {report.recommendations && (
                        <div className="bg-blue-50 rounded-lg p-3 mb-3">
                          <p className="text-sm font-medium text-blue-700 mb-1">Recommendations:</p>
                          <p className="text-sm text-blue-600">{report.recommendations}</p>
                        </div>
                      )}

                      {report.prescriptions && report.prescriptions.length > 0 && (
                        <div className="bg-green-50 rounded-lg p-3">
                          <p className="text-sm font-medium text-green-700 mb-2">Prescriptions:</p>
                          <div className="space-y-1">
                            {report.prescriptions.map((prescription, index) => (
                              <p key={index} className="text-sm text-green-600">
                                â€¢ {prescription.medicineName} - {prescription.dosage} ({prescription.frequency})
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      {/* Doctor Download Button - No Payment Required */}
                      <button
                        onClick={() => downloadReport(report._id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        ï¿½ Download PDF
                      </button>
                      
                      {report.appointment && (
                        <div className="text-xs text-gray-500 text-center">
                          Appointment: {new Date(report.appointment.date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Month Selector */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                ðŸ“… Select Month to Analyze
              </h4>
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-600">Month:</label>
                <FormInput
                  type="month"
                  label=""
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  max={new Date().toISOString().slice(0, 7)}
                />
              </div>
            </div>
            
            {monthlyAnalytics && (
              <div className="bg-blue-50 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm text-blue-600">
                    Showing data for: <span className="font-semibold">
                      {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  {monthlyAnalytics.previousMonthData && (
                    <div className="text-xs text-blue-500 mt-1">
                      vs Previous Month: 
                      <span className={`ml-1 font-semibold ${monthlyAnalytics.growthPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {monthlyAnalytics.growthPercentage >= 0 ? '+' : ''}{monthlyAnalytics.growthPercentage}% consultations
                      </span>
                      {', '}
                      <span className={`font-semibold ${monthlyAnalytics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {monthlyAnalytics.revenueGrowth >= 0 ? '+' : ''}{monthlyAnalytics.revenueGrowth}% revenue
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Quick Stats</div>
                    <div className="text-lg font-bold text-blue-700">
                      {monthlyAnalytics.totalConsultations} consultations â€¢ â‚¹{monthlyAnalytics.totalRevenue.toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setMonthlyAnalytics(null);
                      setSelectedMonth(() => {
                        const now = new Date();
                        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
                      });
                    }}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    ðŸ”™ Back to Overview
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Key Metrics - Show monthly data if available */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
              <div className="text-2xl mb-2">ðŸ“Š</div>
              <div className="text-sm opacity-90">
                {monthlyAnalytics ? 'Monthly' : 'Total'} Consultations
              </div>
              <div className="text-3xl font-bold">
                {(monthlyAnalytics || analytics)?.totalConsultations || 0}
              </div>
              {monthlyAnalytics?.previousMonthData && (
                <div className={`text-xs mt-1 ${monthlyAnalytics.growthPercentage >= 0 ? 'text-blue-200' : 'text-red-200'}`}>
                  {monthlyAnalytics.growthPercentage >= 0 ? 'â†—ï¸' : 'â†˜ï¸'} {Math.abs(monthlyAnalytics.growthPercentage)}% vs last month
                </div>
              )}
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
              <div className="text-2xl mb-2">ðŸ‘¥</div>
              <div className="text-sm opacity-90">
                {monthlyAnalytics ? 'Monthly' : 'Total'} Patients
              </div>
              <div className="text-3xl font-bold">
                {(monthlyAnalytics || analytics)?.totalPatients || 0}
              </div>
              {monthlyAnalytics?.previousMonthData && (
                <div className="text-xs mt-1 text-green-200">
                  Prev: {monthlyAnalytics.previousMonthData.patients} patients
                </div>
              )}
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl">
              <div className="text-2xl mb-2">âœ…</div>
              <div className="text-sm opacity-90">Success Rate</div>
              <div className="text-3xl font-bold">
                {(monthlyAnalytics || analytics)?.treatmentSuccess || 0}%
              </div>
            </div>
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-6 rounded-xl">
              <div className="text-2xl mb-2">ðŸ’°</div>
              <div className="text-sm opacity-90">
                {monthlyAnalytics ? 'Monthly' : 'Total'} Revenue
              </div>
              <div className="text-3xl font-bold">
                â‚¹{((monthlyAnalytics || analytics)?.totalRevenue || 0).toLocaleString()}
              </div>
              {monthlyAnalytics?.previousMonthData && (
                <div className={`text-xs mt-1 ${monthlyAnalytics.revenueGrowth >= 0 ? 'text-emerald-200' : 'text-red-200'}`}>
                  {monthlyAnalytics.revenueGrowth >= 0 ? 'â†—ï¸' : 'â†˜ï¸'} {Math.abs(monthlyAnalytics.revenueGrowth)}% vs last month
                </div>
              )}
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl">
              <div className="text-2xl mb-2">ðŸ“…</div>
              <div className="text-sm opacity-90">
                {monthlyAnalytics ? 'Avg per Day' : 'This Month'}
              </div>
              <div className="text-3xl font-bold">
                {monthlyAnalytics ? 
                  Math.round((monthlyAnalytics.totalConsultations || 0) / 30) :
                  'â‚¹' + ((analytics.monthlyRevenue || 0).toLocaleString())
                }
                {monthlyAnalytics && <span className="text-lg"> /day</span>}
              </div>
            </div>
          </div>

          {/* Monthly Performance Chart - Only show if not viewing specific month */}
          {!monthlyAnalytics && (
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                ðŸ“ˆ Monthly Performance (Last 6 Months)
                <span className="text-sm text-gray-500 font-normal">Click any month to view details</span>
              </h4>
              <div className="grid grid-cols-6 gap-4">
                {(analytics.monthlyStats || []).map((stat, index) => (
                  <div 
                    key={index} 
                    className="text-center cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg rounded-lg p-2 hover:bg-white"
                    onClick={(e) => handleMonthBarClick(e, index)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    title={`Click to view detailed analytics for ${stat.month}`}
                  >
                    <div className="bg-gradient-to-t from-blue-600 to-blue-500 rounded-lg p-3 mb-2 relative h-20 overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-200">
                      {/* Animated background bar */}
                      <div 
                        className="bg-gradient-to-t from-blue-400 to-blue-300 rounded-lg absolute bottom-0 left-0 right-0 transition-all duration-500 ease-out"
                        style={{ 
                          height: `${Math.max(20, (stat.consultations / Math.max(...(analytics.monthlyStats || []).map(s => s.consultations || 1))) * 100)}%` 
                        }}
                      ></div>
                      
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-blue-300 opacity-0 hover:opacity-20 transition-opacity duration-200 rounded-lg"></div>
                      
                      {/* Content */}
                      <div className="text-white text-sm font-bold relative z-10 pt-2 drop-shadow-sm">{stat.consultations}</div>
                      
                      {/* Click indicator */}
                      <div className="absolute top-1 right-1 text-white text-xs opacity-0 hover:opacity-100 transition-opacity duration-200">
                        ðŸ‘†
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-600 font-semibold mb-1 hover:text-blue-600 transition-colors duration-200">
                      {stat.month}
                    </div>
                    <div className="text-xs text-gray-500 hover:text-gray-700 transition-colors duration-200">
                      {stat.patients} patients
                    </div>
                    <div className="text-xs text-green-600 font-medium hover:text-green-700 transition-colors duration-200">
                      â‚¹{(stat.revenue || 0).toLocaleString()}
                    </div>
                    
                    {/* Interaction hint */}
                    <div className="text-xs text-blue-500 opacity-0 hover:opacity-100 transition-opacity duration-200 mt-1">
                      ðŸ“Š View Details
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Instructions */}
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm">
                  <span className="animate-pulse">ðŸ‘†</span>
                  Click on any month above to view detailed analytics for that period
                  <span className="animate-pulse">ðŸ“Š</span>
                </div>
              </div>
            </div>
          )}

          {/* Monthly Comparison - Show only when viewing specific month */}
          {monthlyAnalytics?.previousMonthData && (
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">ðŸ“Š Month-to-Month Comparison</h4>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h5 className="font-semibold text-gray-700 mb-4">Selected Month</h5>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Consultations:</span>
                      <span className="font-bold text-blue-600">{monthlyAnalytics.totalConsultations}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Patients:</span>
                      <span className="font-bold text-green-600">{monthlyAnalytics.totalPatients}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Revenue:</span>
                      <span className="font-bold text-emerald-600">â‚¹{monthlyAnalytics.totalRevenue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h5 className="font-semibold text-gray-700 mb-4">Previous Month</h5>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Consultations:</span>
                      <span className="font-bold text-blue-600">{monthlyAnalytics.previousMonthData.consultations}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Patients:</span>
                      <span className="font-bold text-green-600">{monthlyAnalytics.previousMonthData.patients}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Revenue:</span>
                      <span className="font-bold text-emerald-600">â‚¹{monthlyAnalytics.previousMonthData.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Revenue Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                ðŸ’° Revenue Analysis
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average per Consultation:</span>
                  <span className="font-semibold text-green-700">
                    â‚¹{(monthlyAnalytics || analytics).totalConsultations > 0 ? 
                       Math.round(((monthlyAnalytics || analytics).totalRevenue || 0) / (monthlyAnalytics || analytics).totalConsultations) : 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">
                    {monthlyAnalytics ? 'Selected Month' : 'This Month'} Revenue:
                  </span>
                  <span className="font-semibold text-green-700">
                    â‚¹{((monthlyAnalytics?.totalRevenue || analytics.monthlyRevenue || 0)).toLocaleString()}
                  </span>
                </div>
                {monthlyAnalytics?.revenueGrowth !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Revenue Growth:</span>
                    <span className={`font-semibold ${monthlyAnalytics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {monthlyAnalytics.revenueGrowth >= 0 ? 'ðŸ“ˆ' : 'ðŸ“‰'} {Math.abs(monthlyAnalytics.revenueGrowth)}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                ðŸ“Š Performance Metrics
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">
                    {monthlyAnalytics ? 'Daily Average' : 'Monthly Average'}:
                  </span>
                  <span className="font-semibold text-blue-700">
                    {monthlyAnalytics ? 
                      Math.round((monthlyAnalytics.totalConsultations || 0) / 30) :
                      Math.round((analytics.totalConsultations || 0) / 6)
                    } consultations
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Patient Retention:</span>
                  <span className="font-semibold text-blue-700">
                    {(monthlyAnalytics || analytics).totalPatients > 0 ? 
                      Math.round(((monthlyAnalytics || analytics).totalConsultations / (monthlyAnalytics || analytics).totalPatients) * 100) / 100 : 0
                    }x avg visits
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Activity Level:</span>
                  <span className={`font-semibold ${
                    ((monthlyAnalytics || analytics).totalConsultations || 0) > 20 ? 'text-green-600' : 
                    ((monthlyAnalytics || analytics).totalConsultations || 0) > 10 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {((monthlyAnalytics || analytics).totalConsultations || 0) > 20 ? 'ðŸ”¥ High' : 
                     ((monthlyAnalytics || analytics).totalConsultations || 0) > 10 ? 'âš¡ Medium' : 'ðŸŒ Low'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'diseases' && (
        <div className="space-y-6">
          {/* Common Diseases */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">ðŸ”¬ Most Common Diseases</h4>
            {analytics.commonDiseases.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No disease data available yet</p>
            ) : (
              <div className="space-y-3">
                {analytics.commonDiseases.map((disease, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 capitalize">{disease.disease}</div>
                        <div className="text-sm text-gray-500">{disease.count} cases</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full transition-all"
                          style={{ width: `${(disease.count / Math.max(...analytics.commonDiseases.map(d => d.count))) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {Math.round((disease.count / analytics.totalConsultations) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Disease Timeline */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">ðŸ“… Recent Disease Cases</h4>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {reports
                .filter(r => r.diagnosis)
                .slice(0, 10)
                .map((report, index) => (
                  <div key={index} className="flex items-center gap-4 bg-white p-3 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800 capitalize">{report.diagnosis}</div>
                      <div className="text-sm text-gray-500">
                        {report.animal?.name} â€¢ {new Date(report.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs ${
                      report.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {report.status}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Clinical Notes Tab */}
      {activeTab === 'clinical' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              ðŸ“ Clinical Notes & Treatment Outcomes
            </h3>
            <p className="text-gray-600 mb-4">
              Record detailed observations, treatment outcomes, and lessons learned to build your clinical knowledge base.
            </p>
          </div>

          {/* Reports with Clinical Notes */}
          <div className="space-y-4">
            {reports.map((report, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">
                      {report.animal?.name} - {report.diagnosis || 'General Consultation'}
                    </h4>
                    <p className="text-sm text-gray-500">
                      ðŸ“… {new Date(report.createdAt).toLocaleDateString()} â€¢ 
                      ðŸ‘¨â€ðŸŒ¾ {report.farmer?.name} â€¢ 
                      ðŸ„ {report.animal?.species}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openClinicalNoteModal(report)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        report.clinicalNote 
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {report.clinicalNote ? 'ðŸ“ Edit Notes' : 'âž• Add Clinical Note'}
                    </button>
                  </div>
                </div>

                {/* Treatment Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h5 className="font-semibold text-gray-700 mb-2">ðŸ’Š Treatment Given:</h5>
                  <p className="text-gray-600">{report.treatment || 'Treatment details not available'}</p>
                </div>

                {/* Clinical Note Display */}
                {report.clinicalNote && (
                  <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-4 border border-blue-200">
                    <h5 className="font-semibold text-blue-800 mb-3 flex items-center">
                      ðŸ“‹ Clinical Observations & Outcomes
                    </h5>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong className="text-gray-700">Treatment Outcome:</strong>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                          report.clinicalNote.outcome === 'successful' ? 'bg-green-100 text-green-700' :
                          report.clinicalNote.outcome === 'complications' ? 'bg-yellow-100 text-yellow-700' :
                          report.clinicalNote.outcome === 'fatality' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {report.clinicalNote.outcome === 'successful' ? 'âœ… Successful' :
                           report.clinicalNote.outcome === 'complications' ? 'âš ï¸ Complications' :
                           report.clinicalNote.outcome === 'fatality' ? 'ðŸ’€ Fatality' : 'ðŸ“‹ Ongoing'}
                        </span>
                      </div>
                      
                      <div>
                        <strong className="text-gray-700">Added:</strong>
                        <p className="text-gray-600">{new Date(report.clinicalNote.addedAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div>
                        <strong className="text-gray-700">Animal Behavior & Response:</strong>
                        <p className="text-gray-600 mt-1">{report.clinicalNote.animalBehavior}</p>
                      </div>
                      
                      <div>
                        <strong className="text-gray-700">Clinical Outcome Details:</strong>
                        <p className="text-gray-600 mt-1">{report.clinicalNote.outcomeDetails}</p>
                      </div>
                      
                      <div>
                        <strong className="text-gray-700">Lessons Learned:</strong>
                        <p className="text-gray-600 mt-1 italic">{report.clinicalNote.lessonsLearned}</p>
                      </div>
                      
                      <div>
                        <strong className="text-gray-700">Prevention Strategy:</strong>
                        <p className="text-blue-700 mt-1 font-medium">{report.clinicalNote.preventionStrategy}</p>
                      </div>
                      
                      {report.clinicalNote.complications && (
                        <div>
                          <strong className="text-red-700">Complications:</strong>
                          <p className="text-red-600 mt-1">{report.clinicalNote.complications}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {reports.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl text-gray-300 mb-4">ðŸ“</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Reports Available</h3>
              <p className="text-gray-500">Complete consultations to start building your clinical knowledge base.</p>
            </div>
          )}
        </div>
      )}

      {/* Clinical Note Modal */}
      {showClinicalNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-800">
                  ðŸ“ Clinical Note - {selectedReport?.animal?.name}
                </h3>
                <button
                  onClick={() => setShowClinicalNoteModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  âœ•
                </button>
              </div>
              <p className="text-gray-600 mt-2">
                Record detailed observations and outcomes for future reference
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Treatment Outcome */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ðŸŽ¯ Treatment Outcome *
                </label>
                <select
                  value={clinicalNote.outcome}
                  onChange={(e) => setClinicalNote({...clinicalNote, outcome: e.target.value})}
                  className="w-full rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                  required
                >
                  <option value="">Select outcome...</option>
                  <option value="successful">âœ… Successful Recovery</option>
                  <option value="complications">âš ï¸ Complications Occurred</option>
                  <option value="fatality">ðŸ’€ Animal Fatality</option>
                  <option value="ongoing">ðŸ“‹ Treatment Ongoing</option>
                </select>
              </div>

              {/* Animal Behavior */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ðŸ„ Animal Behavior & Response *
                </label>
                <textarea
                  value={clinicalNote.animalBehavior}
                  onChange={(e) => setClinicalNote({...clinicalNote, animalBehavior: e.target.value})}
                  placeholder="Describe the animal's behavior during treatment, response to medication, appetite changes, mobility, etc."
                  className="w-full rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-800 placeholder-gray-400 h-24 resize-none transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
                  required
                />
              </div>

              {/* Outcome Details */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ðŸ“‹ Clinical Outcome Details *
                </label>
                <textarea
                  value={clinicalNote.outcomeDetails}
                  onChange={(e) => setClinicalNote({...clinicalNote, outcomeDetails: e.target.value})}
                  placeholder="Detailed description of the treatment outcome, recovery timeline, final condition, etc."
                  className="w-full rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-800 placeholder-gray-400 h-24 resize-none transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
                  required
                />
              </div>

              {/* Lessons Learned */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ðŸŽ“ Lessons Learned *
                </label>
                <textarea
                  value={clinicalNote.lessonsLearned}
                  onChange={(e) => setClinicalNote({...clinicalNote, lessonsLearned: e.target.value})}
                  placeholder="What did you learn from this case? What would you do differently? Key insights gained?"
                  className="w-full rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-800 placeholder-gray-400 h-24 resize-none transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
                  required
                />
              </div>

              {/* Prevention Strategy */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ðŸ›¡ï¸ Future Prevention Strategy *
                </label>
                <textarea
                  value={clinicalNote.preventionStrategy}
                  onChange={(e) => setClinicalNote({...clinicalNote, preventionStrategy: e.target.value})}
                  placeholder="How can similar cases be prevented in the future? Recommendations for farmers, early warning signs to watch for, etc."
                  className="w-full rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-800 placeholder-gray-400 h-24 resize-none transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
                  required
                />
              </div>

              {/* Complications (Optional) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  âš ï¸ Complications (if any)
                </label>
                <textarea
                  value={clinicalNote.complications}
                  onChange={(e) => setClinicalNote({...clinicalNote, complications: e.target.value})}
                  placeholder="Describe any complications that occurred, unexpected reactions, secondary conditions, etc."
                  className="w-full rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-800 placeholder-gray-400 h-20 resize-none transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowClinicalNoteModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={saveClinicalNote}
                  disabled={!clinicalNote.outcome || !clinicalNote.animalBehavior || !clinicalNote.outcomeDetails || !clinicalNote.lessonsLearned || !clinicalNote.preventionStrategy}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  ðŸ’¾ Save Clinical Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPanel;
