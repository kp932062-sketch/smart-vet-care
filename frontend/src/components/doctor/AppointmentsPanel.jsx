
import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { getActiveToken } from '../../utils/auth';
import FormInput from '../common/FormInput';

const AppointmentsPanel = ({ doctorLink }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [viewMode, setViewMode] = useState('today'); // 'today', 'week', 'all'
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [consultationData, setConsultationData] = useState({
    symptoms: '',
    examination: '',
    diagnosis: '',
    recommendations: '',
    followUpRequired: false,
    followUpDate: ''
  });
  const [prescriptionData, setPrescriptionData] = useState({
    medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    diagnosis: '',
    notes: ''
  });
  const [paymentData, setPaymentData] = useState({
    consultationFee: 500,
    medicineCharges: 0,
    totalAmount: 500
  });

  // Helper function to add doctor link to API headers
  const getDoctorApiConfig = () => {
    const config = {};
    if (doctorLink) {
      config.headers = {
        'Doctor-Link': doctorLink
      };
    }
    return config;
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      setError('');
      try {
        //  Wait for doctor data to be available
        let doctorId = '';
        let attempts = 0;
        const maxAttempts = 10; // Wait up to 5 seconds

        // Try to get doctor data with retries
        while (!doctorId && attempts < maxAttempts) {
          const doctorData = sessionStorage.getItem('doctor');
          if (doctorData) {
            try {
              const doctor = JSON.parse(doctorData);
              doctorId = doctor._id || doctor.id;
              break;
            } catch (parseErr) {
              console.error('Error parsing doctor data:', parseErr);
            }
          }

          // If no doctor data yet, wait a bit and try again
          if (!doctorId) {
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
          }
        }

        // If still no doctor ID, try to fetch it using the link
        if (!doctorId && doctorLink) {
          try {
            const res = await api.get(`/doctors?uniqueAccessLink=${doctorLink}`);
            if (res.data && res.data.length > 0) {
              const doctor = res.data[0];
              doctorId = doctor._id || doctor.id;
              sessionStorage.setItem('doctor', JSON.stringify(doctor));
            }
          } catch (fetchErr) {
            console.error('Error fetching doctor by link:', fetchErr);
          }
        }

        if (!doctorId) {
          setError('Unable to identify doctor. Please refresh the page.');
          setLoading(false);
          return;
        }


        //  Use doctor authentication config
        const apiConfig = getDoctorApiConfig();

        // Add doctor link as query parameter as fallback
        const queryParams = new URLSearchParams();
        if (viewMode === 'today') {
          queryParams.append('date', selectedDate);
        }
        if (doctorLink) {
          queryParams.append('doctorLink', doctorLink);
        }

        const queryString = queryParams.toString();
        const url = `/appointments/doctor/${doctorId}${queryString ? `?${queryString}` : ''}`;


        // Use the new doctor-specific endpoint
        const res = await api.get(url, apiConfig);

        // Sort appointments by time for better display
        const sortedAppointments = res.data.sort((a, b) => {
          if (a.date === b.date) {
            return a.time.localeCompare(b.time);
          }
          return new Date(a.date) - new Date(b.date);
        });

        setAppointments(sortedAppointments);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Failed to fetch appointments');
      }
      setLoading(false);
    };

    fetchAppointments();
  }, [selectedDate, viewMode, doctorLink]);

  const handleConfirm = async (appointmentId) => {
    try {
      const apiConfig = getDoctorApiConfig();
      const res = await api.put(`/appointments/${appointmentId}/confirm`, {}, apiConfig);
      setAppointments(appts => appts.map(appt =>
        appt._id === appointmentId ? { ...appt, status: 'confirmed', confirmedAt: new Date() } : appt
      ));
    } catch (err) {
      console.error('Error confirming appointment:', err);
      setError('Failed to confirm appointment');
    }
  };

  const handleCancel = async (appointmentId, reason = 'Doctor unavailable') => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      const apiConfig = getDoctorApiConfig();
      await api.put(`/appointments/${appointmentId}/cancel`, { reason }, apiConfig);
      setAppointments(appts => appts.map(appt =>
        appt._id === appointmentId ? { ...appt, status: 'cancelled', cancelledAt: new Date() } : appt
      ));
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      setError('Failed to cancel appointment');
    }
  };

  const openConsultationModal = (appointment) => {
    setSelectedAppointment(appointment);

    // Pre-fill with existing data if available
    if (appointment.consultation) {
      setConsultationData(appointment.consultation);
    }
    if (appointment.prescription) {
      setPrescriptionData(appointment.prescription);
    }
    if (appointment.payment) {
      setPaymentData(appointment.payment);
    }

    setShowConsultationModal(true);
  };

  const addMedicine = () => {
    setPrescriptionData(prev => ({
      ...prev,
      medicines: [...prev.medicines, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    }));
  };

  const removeMedicine = (index) => {
    setPrescriptionData(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index)
    }));
  };

  const updateMedicine = (index, field, value) => {
    setPrescriptionData(prev => ({
      ...prev,
      medicines: prev.medicines.map((med, i) =>
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const calculateTotal = () => {
    const total = (paymentData.consultationFee || 0) + (paymentData.medicineCharges || 0);
    setPaymentData(prev => ({ ...prev, totalAmount: total }));
  };

  useEffect(() => {
    calculateTotal();
  }, [paymentData.consultationFee, paymentData.medicineCharges]);

  const saveConsultation = async () => {
    try {
      const apiConfig = getDoctorApiConfig();
      await api.put(`/appointments/${selectedAppointment._id}/consultation`, {
        consultation: consultationData,
        prescription: prescriptionData,
        payment: paymentData
      }, apiConfig);

      // Update local state
      setAppointments(appts => appts.map(appt =>
        appt._id === selectedAppointment._id ? {
          ...appt,
          consultation: consultationData,
          prescription: prescriptionData,
          payment: paymentData
        } : appt
      ));

      setShowConsultationModal(false);
    } catch (err) {
      console.error('Error saving consultation:', err);
      setError('Failed to save consultation');
    }
  };

  const [showReportModal, setShowReportModal] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);

  const completeAppointment = async () => {
    try {
      const apiConfig = getDoctorApiConfig();
      //  Send consultation, prescription, and payment data to backend
      const res = await api.put(`/appointments/${selectedAppointment._id}/complete`, {
        consultation: consultationData,
        prescription: prescriptionData,
        consultationFee: paymentData.consultationFee || 500
      }, apiConfig);

      // Update local state
      setAppointments(appts => appts.map(appt =>
        appt._id === selectedAppointment._id ? {
          ...appt,
          status: 'completed',
          completedAt: new Date(),
          reportGenerated: true
        } : appt
      ));

      // Set generated report data and show report modal
      setGeneratedReport({
        appointment: selectedAppointment,
        report: res.data.report,
        consultation: consultationData,
        prescription: prescriptionData,
        payment: paymentData
      });

      setShowConsultationModal(false);
      setShowReportModal(true);

    } catch (err) {
      console.error('Error completing appointment:', err);
      setError('Failed to complete appointment');
    }
  };

  const downloadReport = async (reportId) => {
    try {
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
    } catch (err) {
      console.error('Error downloading report:', err);
      setError('Failed to download report');
    }
  };

  const printReport = () => {
    window.print();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-emerald-600">ðŸ“…</span>
              My Appointments
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {viewMode === 'today' ? `Appointments for ${formatDate(selectedDate)}` : 'All your appointments'}
            </p>
          </div>

          {/* View Mode Toggles */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('today')}
                className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                  viewMode === 'today'
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setViewMode('all')}
                className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                  viewMode === 'all'
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                All
              </button>
            </div>

            {viewMode === 'today' && (
              <FormInput
                type="date"
                label=""
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                inputClassName="text-sm"
              />
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <span className="ml-3 text-emerald-600 font-medium">Loading appointments...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <span className="text-red-600 mr-2">âŒ</span>
              <span className="text-red-700 font-medium">{error}</span>
            </div>
            <button
              onClick={() => setError('')}
              className="text-red-600 text-sm mt-2 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {appointments.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">ðŸ“…</div>
                <h4 className="text-lg font-semibold text-gray-700 mb-2">
                  {viewMode === 'today' ? 'No appointments today' : 'No appointments found'}
                </h4>
                <p className="text-gray-500">
                  {viewMode === 'today'
                    ? 'You have a free day! Enjoy your time off.'
                    : 'Your appointment schedule is currently empty.'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map(appt => (
                  <div key={appt._id} className="bg-gradient-to-r from-white to-gray-50 rounded-xl p-4 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Appointment Details */}
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                              <span className="text-emerald-600 text-lg">ðŸ¾</span>
                            </div>
                            <div>
                              <h5 className="font-semibold text-gray-800 text-lg">
                                {appt.user?.name || 'Patient'}
                              </h5>
                              <p className="text-sm text-gray-600">
                                Pet: <span className="font-medium">{appt.petName}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex-1 sm:ml-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-blue-600">ðŸ“…</span>
                                <span className="text-gray-700">{formatDate(appt.date)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-purple-600">â°</span>
                                <span className="text-gray-700">{appt.time}</span>
                              </div>
                            </div>
                            <div className="mt-2">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Reason:</span> {appt.reason}
                              </p>
                              {appt.user?.email && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Contact: {appt.user.email}
                                </p>
                              )}
                              {appt.payment?.totalAmount > 0 && (
                                <p className="text-sm text-green-600 mt-1 font-medium">
                                  Fee: â‚¹{appt.payment.totalAmount}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status and Actions */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appt.status || 'pending')}`}>
                          {(appt.status || 'pending').toUpperCase()}
                        </span>

                        <div className="flex flex-wrap gap-2">
                          {appt.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleConfirm(appt._id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                              >
                                âœ… Confirm
                              </button>
                              <button
                                onClick={() => handleCancel(appt._id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                              >
                                âŒ Cancel
                              </button>
                            </>
                          )}

                          {appt.status === 'confirmed' && (
                            <>
                              <button
                                onClick={() => openConsultationModal(appt)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                              >
                                ðŸ©º Start Consultation
                              </button>
                              <button
                                onClick={() => handleCancel(appt._id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                              >
                                âŒ Cancel
                              </button>
                            </>
                          )}

                          {appt.status === 'completed' && (
                            <div className="flex items-center gap-2 text-sm text-green-600">
                              <span>âœ… Completed</span>
                              {appt.reportGenerated && (
                                <span className="text-xs bg-green-100 px-2 py-1 rounded">ðŸ“‹ Report Generated</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Consultation Modal */}
      {showConsultationModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-[9999] p-2 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl my-2 min-h-[calc(100vh-1rem)] max-h-[calc(100vh-1rem)] flex flex-col overflow-hidden">
            <div className="sticky top-0 bg-white p-4 border-b border-gray-200 rounded-t-2xl z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-800">
                  ðŸ©º Consultation - {selectedAppointment.petName}
                </h3>
                <button
                  onClick={() => setShowConsultationModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                >
                  âœ•
                </button>
              </div>
              <p className="text-gray-600 mt-2">
                Patient: {selectedAppointment.user?.name} | Date: {formatDate(selectedAppointment.date)} | Time: {selectedAppointment.time}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="p-4 space-y-4 pb-6 h-full">{/* Added bottom padding for better spacing */}
                {/* Consultation Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 relative z-20">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Symptoms</label>
                    <textarea
                      value={consultationData.symptoms}
                      onChange={(e) => setConsultationData(prev => ({ ...prev, symptoms: e.target.value }))}
                      placeholder="Describe observed symptoms..."
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 relative z-30"
                      rows="3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Physical Examination</label>
                    <textarea
                      value={consultationData.examination}
                      onChange={(e) => setConsultationData(prev => ({ ...prev, examination: e.target.value }))}
                      placeholder="Physical examination findings..."
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 relative z-30"
                      rows="3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
                    <textarea
                      value={consultationData.diagnosis}
                      onChange={(e) => setConsultationData(prev => ({ ...prev, diagnosis: e.target.value }))}
                      placeholder="Primary diagnosis..."
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 relative z-30"
                      rows="3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recommendations</label>
                    <textarea
                      value={consultationData.recommendations}
                      onChange={(e) => setConsultationData(prev => ({ ...prev, recommendations: e.target.value }))}
                      placeholder="Treatment recommendations and care instructions..."
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 relative z-30"
                      rows="3"
                    />
                  </div>
                </div>

                {/* Prescription */}
                <div className="relative z-20">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-gray-800">ðŸ’Š Prescription</h4>
                    <button
                      onClick={addMedicine}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors relative z-30"
                    >
                      + Add Medicine
                    </button>
                  </div>

                  <div className="space-y-3">
                    {prescriptionData.medicines.map((medicine, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg relative z-30">
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
                          <FormInput
                            type="text"
                            label=""
                            placeholder="Medicine Name"
                            value={medicine.name}
                            onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                            inputClassName="text-sm relative z-40"
                          />
                          <FormInput
                            type="text"
                            label=""
                            placeholder="Dosage"
                            value={medicine.dosage}
                            onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                            inputClassName="text-sm relative z-40"
                          />
                          <FormInput
                            type="text"
                            label=""
                            placeholder="Frequency"
                            value={medicine.frequency}
                            onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                            inputClassName="text-sm relative z-40"
                          />
                          <FormInput
                            type="text"
                            label=""
                            placeholder="Duration"
                            value={medicine.duration}
                            onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                            inputClassName="text-sm relative z-40"
                          />
                          <FormInput
                            type="text"
                            label=""
                            placeholder="Instructions"
                            value={medicine.instructions}
                            onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
                            inputClassName="text-sm relative z-40"
                          />
                          <button
                            onClick={() => removeMedicine(index)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm transition-colors relative z-40"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">ðŸ’³ Payment Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Fee (â‚¹)</label>
                      <FormInput
                        type="number"
                        label=""
                        value={paymentData.consultationFee}
                        onChange={(e) => setPaymentData(prev => ({ ...prev, consultationFee: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Medicine Charges (â‚¹)</label>
                      <FormInput
                        type="number"
                        label=""
                        value={paymentData.medicineCharges}
                        onChange={(e) => setPaymentData(prev => ({ ...prev, medicineCharges: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount (â‚¹)</label>
                      <FormInput
                        type="number"
                        label=""
                        value={paymentData.totalAmount}
                        readOnly
                        inputClassName="font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions - Sticky Footer */}
                <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200 rounded-b-2xl z-10">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={saveConsultation}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                      ðŸ’¾ Save Consultation
                    </button>
                    <button
                      onClick={completeAppointment}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                      âœ… Complete & Generate Report
                    </button>
                    <button
                      onClick={() => setShowConsultationModal(false)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Generation Success Modal */}
      {showReportModal && generatedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-600 text-2xl">âœ…</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Consultation Completed Successfully!</h3>
                    <p className="text-emerald-600 font-medium">Medical report has been generated and sent to the patient</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  âœ•
                </button>
              </div>
            </div>

            <div className="p-6" id="report-content">
              {/* Report Receipt */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">ðŸ¥ VetCare Medical Report</h2>
                  <p className="text-gray-600">Professional Veterinary Consultation Report</p>
                  <div className="w-24 h-1 bg-emerald-500 mx-auto mt-2 rounded"></div>
                </div>

                {/* Patient & Doctor Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-3">ðŸ‘¤ Patient Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Owner:</span> {generatedReport.appointment.user?.name}</p>
                      <p><span className="font-medium">Pet Name:</span> {generatedReport.appointment.petName}</p>
                      <p><span className="font-medium">Email:</span> {generatedReport.appointment.user?.email}</p>
                      <p><span className="font-medium">Consultation Date:</span> {formatDate(generatedReport.appointment.date)}</p>
                      <p><span className="font-medium">Time:</span> {generatedReport.appointment.time}</p>
                    </div>
                  </div>

                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-emerald-800 mb-3">ðŸ‘¨â€âš•ï¸ Doctor Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Doctor:</span> Dr. {generatedReport.appointment.doctor?.name}</p>
                      <p><span className="font-medium">Specialization:</span> {generatedReport.appointment.doctor?.specialization}</p>
                      <p><span className="font-medium">Report ID:</span> {generatedReport.report._id}</p>
                      <p><span className="font-medium">Generated:</span> {new Date().toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Medical Details */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">ðŸ” Symptoms Observed</h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-700">{generatedReport.consultation.symptoms || 'No specific symptoms noted'}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">ðŸ©º Physical Examination</h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-700">{generatedReport.consultation.examination || 'Normal examination findings'}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">ðŸŽ¯ Diagnosis</h4>
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                      <p className="text-gray-800 font-medium">{generatedReport.consultation.diagnosis || 'Routine health check completed'}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">ðŸ“ Treatment Recommendations</h4>
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <p className="text-gray-700">{generatedReport.consultation.recommendations || 'Continue regular care and monitoring'}</p>
                    </div>
                  </div>

                  {/* Prescription */}
                  {generatedReport.prescription.medicines?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">ðŸ’Š Prescribed Medications</h4>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-purple-100">
                              <tr>
                                <th className="text-left p-3 text-sm font-semibold text-purple-800">Medicine</th>
                                <th className="text-left p-3 text-sm font-semibold text-purple-800">Dosage</th>
                                <th className="text-left p-3 text-sm font-semibold text-purple-800">Frequency</th>
                                <th className="text-left p-3 text-sm font-semibold text-purple-800">Duration</th>
                                <th className="text-left p-3 text-sm font-semibold text-purple-800">Instructions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {generatedReport.prescription.medicines.map((medicine, index) => (
                                <tr key={index} className="border-t border-purple-200">
                                  <td className="p-3 text-sm text-gray-700 font-medium">{medicine.name}</td>
                                  <td className="p-3 text-sm text-gray-600">{medicine.dosage}</td>
                                  <td className="p-3 text-sm text-gray-600">{medicine.frequency}</td>
                                  <td className="p-3 text-sm text-gray-600">{medicine.duration}</td>
                                  <td className="p-3 text-sm text-gray-600">{medicine.instructions}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Summary */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">ðŸ’³ Payment Summary</h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="text-center">
                          <p className="text-gray-600">Consultation Fee</p>
                          <p className="text-lg font-bold text-blue-600">â‚¹{generatedReport.payment.consultationFee}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600">Medicine Charges</p>
                          <p className="text-lg font-bold text-green-600">â‚¹{generatedReport.payment.medicineCharges}</p>
                        </div>
                        <div className="text-center border-l border-blue-300 md:pl-4">
                          <p className="text-gray-600">Total Amount</p>
                          <p className="text-xl font-bold text-emerald-600">â‚¹{generatedReport.payment.totalAmount}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="text-center pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">
                      This report has been automatically sent to the patient's email address
                    </p>
                    <p className="text-xs text-gray-500">
                      Generated by VetCare Professional Platform â€¢ {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={printReport}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  ðŸ–¨ï¸ Print Report
                </button>
                <button
                  onClick={() => downloadReport(generatedReport.report._id)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  ðŸ“¥ Download PDF
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 

export default AppointmentsPanel;

