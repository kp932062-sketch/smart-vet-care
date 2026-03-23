import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const CareerPortal = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const nextStep = () => {
    console.log(`Moving from step ${currentStep} to ${currentStep + 1}`);
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      console.log(`New step: ${currentStep + 1}`);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    mobile: '', 
    specialization: '', 
    education: '', 
    experience: '',
    bio: '',
    licenseNumber: '',
    clinicAddress: '',
    languages: '',
    consultationFee: '',
    qualification: ''
  });
  const [documents, setDocuments] = useState({
    license: null,
    degree: null,
    experience: null,
    photo: null,
    idProof: null
  });
  
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleFileChange = (e, documentType) => {
    const file = e.target.files[0];
    if (file) {
      setDocuments(prev => ({
        ...prev,
        [documentType]: file
      }));
    }
  };

  // DEVELOPER TESTING: Function to simulate dummy file upload
  const addDummyFile = (documentType) => {
    const dummyFile = new File(['dummy content'], `dummy_${documentType}.pdf`, {
      type: 'application/pdf',
      lastModified: Date.now()
    });
    setDocuments(prev => ({
      ...prev,
      [documentType]: dummyFile
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add form fields
      Object.keys(form).forEach(key => {
        formData.append(key, form[key]);
      });
      
      // Add documents
      Object.keys(documents).forEach(key => {
        if (documents[key]) {
          formData.append(key, documents[key]);
        }
      });
      
      const response = await api.post('/doctors', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response?.data) {
  const responseData = response.data;
  console.log('Success response:', responseData);
  setSuccess('Application submitted successfully! You will be notified by email about the verification process. If you do not see the email in your inbox, please check your spam folder.');
        setForm({ 
          name: '', 
          email: '', 
          mobile: '', 
          specialization: '', 
          education: '', 
          experience: '',
          bio: '',
          licenseNumber: '',
          clinicAddress: '',
          languages: '',
          consultationFee: '',
          qualification: ''
        });
        setDocuments({
          license: null,
          degree: null,
          experience: null,
          photo: null,
          idProof: null
        });
        setCurrentStep(1);
      }
    } catch (err) {
      console.error('Application submission error:', err);
      const apiMessage = err?.response?.data?.message || err?.response?.data?.error;
      setError(`Failed to submit application: ${apiMessage || err.message}. Please try again.`);
    }
    setLoading(false);
  };

  const validateStep = (step) => {
    console.log(`Validating step ${step}:`, { form, documents });
    switch (step) {
      case 1:
        const step1Valid = form.name && form.email && form.mobile;
        console.log('Step 1 validation:', step1Valid);
        return step1Valid;
      case 2:
        const step2Valid = form.specialization && form.education && form.experience;
        console.log('Step 2 validation:', step2Valid);
        return step2Valid;
      case 3:
        // Step 3 is optional additional information, so always allow proceeding
        console.log('Step 3 validation: true (always valid)');
        return true;
      case 4:
        const step4Valid = documents.license && documents.degree && documents.photo && documents.idProof;
        console.log('Step 4 validation:', step4Valid);
        return step4Valid;
      default:
        console.log('Default validation: false');
        return false;
    }
  };

  const specializations = [
    'Small Animal Medicine',
    'Large Animal Medicine',
    'Emergency & Critical Care',
    'Surgery',
    'Internal Medicine',
    'Dermatology',
    'Cardiology',
    'Oncology',
    'Ophthalmology',
    'Dental',
    'Exotic Animal Medicine',
    'Wildlife Medicine',
    'Other'
  ];

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 sm:py-12 lg:py-20">
      <div className="container mx-auto px-3 sm:px-4 lg:px-8 max-w-6xl">
        
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors bg-white/50 backdrop-blur-sm rounded-lg px-3 sm:px-4 py-2 hover:bg-white/70 border border-white/30 text-sm sm:text-base mb-4 sm:mb-0"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </button>
            <div className="hidden sm:block w-32"></div>
          </div>
          
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full sm:rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl sm:text-3xl text-white">🩺</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Join Our Team
              </h1>
            </div>
            <p className="text-sm sm:text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
              Join SmartVet's network of passionate veterinary professionals. Help us provide exceptional care to pets and their families.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30 shadow-lg">
              <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">💰</div>
              <h3 className="font-semibold text-gray-800 text-xs sm:text-sm">Competitive Pay</h3>
              <p className="text-xs text-gray-600 hidden sm:block">Excellent compensation</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30 shadow-lg">
              <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">🏥</div>
              <h3 className="font-semibold text-gray-800 text-xs sm:text-sm">Modern Facilities</h3>
              <p className="text-xs text-gray-600 hidden sm:block">State-of-the-art equipment</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30 shadow-lg">
              <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">📚</div>
              <h3 className="font-semibold text-gray-800 text-xs sm:text-sm">Growth</h3>
              <p className="text-xs text-gray-600 hidden sm:block">Continuous learning</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30 shadow-lg">
              <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">⚖️</div>
              <h3 className="font-semibold text-gray-800 text-xs sm:text-sm">Work-Life Balance</h3>
              <p className="text-xs text-gray-600 hidden sm:block">Flexible schedules</p>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/30 backdrop-blur-lg rounded-2xl sm:rounded-3xl border border-white/30 shadow-2xl p-4 sm:p-6 lg:p-8">
            
            {/* Progress Steps */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ${
                      currentStep >= step 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step}
                    </div>
                    {step < 4 && (
                      <div className={`h-1 w-12 sm:w-16 lg:w-24 mx-2 sm:mx-3 ${
                        currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="text-center">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                  {currentStep === 1 && "Personal Information"}
                  {currentStep === 2 && "Professional Details"}
                  {currentStep === 3 && "Additional Information"}
                  {currentStep === 4 && "Document Upload"}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Step {currentStep} of 4
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <span className="text-blue-600">👤</span>
                        Full Name
                      </label>
                      <input 
                        className="w-full rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-800 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500" 
                        type="text" 
                        name="name" 
                        required 
                        value={form.name} 
                        onChange={handleChange}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <span className="text-emerald-600">📧</span>
                        Email Address
                      </label>
                      <input 
                        className="w-full rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-800 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500" 
                        type="email" 
                        name="email" 
                        required 
                        value={form.email} 
                        onChange={handleChange}
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>
                  <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                    <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <span className="text-purple-600">📱</span>
                      Mobile Number
                    </label>
                    <input 
                      className="w-full rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-800 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500" 
                      type="tel" 
                      name="mobile" 
                      required 
                      value={form.mobile} 
                      onChange={handleChange}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Professional Details */}
              {currentStep === 2 && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                    <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <span className="text-blue-600">🩺</span>
                      Specialization
                    </label>
                    <select 
                      className="w-full rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-800 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500" 
                      name="specialization" 
                      required 
                      value={form.specialization} 
                      onChange={handleChange}
                    >
                      <option value="">Select your specialization</option>
                      {specializations.map((spec) => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <span className="text-emerald-600">🎓</span>
                        Education/Degree
                      </label>
                      <input 
                        className="w-full rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-800 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500" 
                        type="text" 
                        name="education" 
                        required
                        value={form.education} 
                        onChange={handleChange}
                        placeholder="DVM, University Name"
                      />
                    </div>
                    <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                      <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
                        <span className="text-purple-600">⏰</span>
                        Experience (years)
                      </label>
                      <input 
                        className="w-full rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-800 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500" 
                        type="number" 
                        name="experience" 
                        min="0"
                        required
                        value={form.experience} 
                        onChange={handleChange}
                        placeholder="Years of experience"
                      />
                    </div>
                  </div>
                  
                  <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                    <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
                      <span className="text-indigo-600">🏆</span>
                      Professional Qualifications
                    </label>
                    <input 
                      className="w-full rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-800 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500" 
                      type="text" 
                      name="qualification" 
                      value={form.qualification} 
                      onChange={handleChange}
                      placeholder="Additional certifications, specializations, awards"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Additional Information */}
              {currentStep === 3 && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                    <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
                      <span className="text-orange-600">📄</span>
                      License Number
                    </label>
                    <input 
                      className="w-full rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-800 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500" 
                      type="text" 
                      name="licenseNumber" 
                      value={form.licenseNumber} 
                      onChange={handleChange}
                      placeholder="Professional license number"
                    />
                  </div>
                  
                  <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                    <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
                      <span className="text-green-600">💰</span>
                      Consultation Fee (₹)
                    </label>
                    <input 
                      className="w-full rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-800 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500" 
                      type="number" 
                      name="consultationFee" 
                      min="200"
                      max="1000"
                      value={form.consultationFee} 
                      onChange={handleChange}
                      placeholder="300-500 recommended"
                    />
                    <p className="text-xs text-gray-500 mt-1">Platform takes 15% commission (You keep 85%)</p>
                  </div>

                  <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                    <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
                      <span className="text-blue-600">💬</span>
                      Professional Bio
                    </label>
                    <textarea 
                      className="w-full rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-800 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500 resize-none" 
                      name="bio" 
                      rows={4}
                      value={form.bio} 
                      onChange={handleChange}
                      placeholder="Tell us about your professional background, interests, and what drives your passion for veterinary medicine..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                      <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
                        <span className="text-emerald-600">🏥</span>
                        Current/Previous Clinic
                      </label>
                      <input 
                        className="w-full rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-800 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500" 
                        type="text" 
                        name="clinicAddress" 
                        value={form.clinicAddress} 
                        onChange={handleChange}
                        placeholder="Clinic or hospital name and address"
                      />
                    </div>
                    <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                      <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
                        <span className="text-purple-600">🗣️</span>
                        Languages
                      </label>
                      <input 
                        className="w-full rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-800 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500" 
                        type="text" 
                        name="languages" 
                        value={form.languages} 
                        onChange={handleChange}
                        placeholder="English, Hindi, etc."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Document Upload */}
              {currentStep === 4 && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-blue-50/80 backdrop-blur-sm rounded-xl p-4 border border-blue-200/50 mb-6">
                    <div className="flex items-center gap-2 text-blue-700 mb-2">
                      <span className="text-xl">📋</span>
                      <h4 className="font-semibold">Document Verification Required</h4>
                    </div>
                    <p className="text-sm text-blue-600">
                      Please upload the following documents for verification. All documents should be clear, readable, and in PDF or image format (max 5MB each).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {/* License Document */}
                    <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                      <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
                        <span className="text-blue-600">📄</span>
                        Veterinary License <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange(e, 'license')}
                        className="w-full rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                      />
                      {/* DEVELOPER TESTING: Dummy file button */}
                      <button
                        type="button"
                        onClick={() => addDummyFile('license')}
                        className="mt-2 px-3 py-1 bg-yellow-500 text-white text-xs rounded-md hover:bg-yellow-600 transition-colors"
                      >
                        🧪 Use Dummy File (DEV)
                      </button>
                      {documents.license && (
                        <p className="text-xs text-green-600 mt-1">✅ {documents.license.name}</p>
                      )}
                    </div>

                    {/* Degree Certificate */}
                    <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                      <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
                        <span className="text-emerald-600">🎓</span>
                        Degree Certificate <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange(e, 'degree')}
                        className="w-full rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                      />
                      {/* DEVELOPER TESTING: Dummy file button */}
                      <button
                        type="button"
                        onClick={() => addDummyFile('degree')}
                        className="mt-2 px-3 py-1 bg-yellow-500 text-white text-xs rounded-md hover:bg-yellow-600 transition-colors"
                      >
                        🧪 Use Dummy File (DEV)
                      </button>
                      {documents.degree && (
                        <p className="text-xs text-green-600 mt-1">✅ {documents.degree.name}</p>
                      )}
                    </div>

                    {/* Experience Certificate */}
                    <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                      <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
                        <span className="text-purple-600">📜</span>
                        Experience Certificate
                      </label>
                      <input 
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange(e, 'experience')}
                        className="w-full rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                      />
                      {/* DEVELOPER TESTING: Dummy file button */}
                      <button
                        type="button"
                        onClick={() => addDummyFile('experience')}
                        className="mt-2 px-3 py-1 bg-yellow-500 text-white text-xs rounded-md hover:bg-yellow-600 transition-colors"
                      >
                        🧪 Use Dummy File (DEV)
                      </button>
                      {documents.experience && (
                        <p className="text-xs text-green-600 mt-1">✅ {documents.experience.name}</p>
                      )}
                    </div>

                    {/* Professional Photo */}
                    <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                      <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
                        <span className="text-orange-600">📸</span>
                        Professional Photo <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'photo')}
                        className="w-full rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                      />
                      {/* DEVELOPER TESTING: Dummy file button */}
                      <button
                        type="button"
                        onClick={() => addDummyFile('photo')}
                        className="mt-2 px-3 py-1 bg-yellow-500 text-white text-xs rounded-md hover:bg-yellow-600 transition-colors"
                      >
                        🧪 Use Dummy File (DEV)
                      </button>
                      {documents.photo && (
                        <p className="text-xs text-green-600 mt-1">✅ {documents.photo.name}</p>
                      )}
                    </div>
                  </div>

                  {/* ID Proof */}
                  <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                    <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
                      <span className="text-red-600">🆔</span>
                      Government ID Proof <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange(e, 'idProof')}
                      className="w-full rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                    {/* DEVELOPER TESTING: Dummy file button */}
                    <button
                      type="button"
                      onClick={() => addDummyFile('idProof')}
                      className="mt-2 px-3 py-1 bg-yellow-500 text-white text-xs rounded-md hover:bg-yellow-600 transition-colors"
                    >
                      🧪 Use Dummy File (DEV)
                    </button>
                    {documents.idProof && (
                      <p className="text-xs text-green-600 mt-1">✅ {documents.idProof.name}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Aadhaar, PAN Card, Passport, or Driver's License</p>
                  </div>

                  {/* DEVELOPER TESTING: Quick fill all documents */}
                  <div className="bg-yellow-100/80 backdrop-blur-sm rounded-xl p-4 border border-yellow-300/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-yellow-800">
                        <span className="text-lg">🧪</span>
                        <span className="font-semibold">Developer Testing Mode</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          addDummyFile('license');
                          addDummyFile('degree');
                          addDummyFile('experience');
                          addDummyFile('photo');
                          addDummyFile('idProof');
                        }}
                        className="px-4 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors"
                      >
                        🚀 Fill All Dummy Files
                      </button>
                    </div>
                    <p className="text-xs text-yellow-700 mt-2">Click to automatically fill all required documents with dummy files for testing</p>
                  </div>

                  <div className="bg-yellow-50/80 backdrop-blur-sm rounded-xl p-4 border border-yellow-200/50">
                    <div className="flex items-start gap-2 text-yellow-700">
                      <span className="text-lg">⚠️</span>
                      <div>
                        <h4 className="font-semibold mb-1">Verification Process</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Your documents will be reviewed by our admin team</li>
                          <li>• You may receive a phone call for verification</li>
                          <li>• Approval process takes 2-3 business days</li>
                          <li>• You'll receive email updates about your application status</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-white/20">
                <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 sm:flex-none bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-300 text-sm sm:text-base"
                    >
                      Previous
                    </button>
                  )}
                  
                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={!validateStep(currentStep)}
                      className={`flex-1 sm:flex-none font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-300 text-sm sm:text-base ${
                        validateStep(currentStep)
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Next Step
                    </button>
                  ) : (
                    <button 
                      type="submit" 
                      disabled={loading || !documents.license || !documents.degree || !documents.photo || !documents.idProof}
                      className={`flex-1 sm:flex-none font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-300 text-sm sm:text-base ${
                        (loading || !documents.license || !documents.degree || !documents.photo || !documents.idProof)
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                      }`}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Submitting...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <span>🚀</span>
                          <span>Submit Application</span>
                        </div>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Messages */}
              {error && (
                <div className="p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-xl">
                  <div className="flex items-center space-x-2 text-red-700">
                    <span>❌</span>
                    <span className="font-medium text-sm sm:text-base">{error}</span>
                  </div>
                </div>
              )}
              
              {success && (
                <div className="p-4 bg-green-50/80 backdrop-blur-sm border border-green-200/50 rounded-xl">
                  <div className="flex items-center space-x-2 text-green-700">
                    <span>✅</span>
                    <span className="font-medium text-sm sm:text-base">{success}</span>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 sm:mt-12 text-center">
          <div className="bg-white/40 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/30 shadow-lg">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-4">What Happens Next?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600">
              <div className="flex flex-col items-center">
                <div className="text-xl sm:text-2xl mb-1 sm:mb-2">📋</div>
                <p className="font-medium">Application Review</p>
                <p className="text-xs">We'll review your application within 2-3 business days</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-xl sm:text-2xl mb-1 sm:mb-2">📞</div>
                <p className="font-medium">Interview Process</p>
                <p className="text-xs">Phone/video interview with our team</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-xl sm:text-2xl mb-1 sm:mb-2">🎉</div>
                <p className="font-medium">Welcome Aboard</p>
                <p className="text-xs">Onboarding and integration with our platform</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CareerPortal;

