import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/client';
import { useAuth } from '../auth/AuthContext';
import PaymentModal from '../components/PaymentModal';
import { isValidEmail, isValidPhone } from '../utils/validation';

export default function PostLoadPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [estimatedFee, setEstimatedFee] = useState(null);
  const [formData, setFormData] = useState({
    type: 'Full Load',
    sourceCity: '',
    destinationCity: '',
    material: '',
    capacityWeight: '',
    truckType: '',
    numTrucks: '1',
    scheduledDate: '',
    contactName: user?.name || '',
    contactPhone: '',
    contactEmail: user?.email || '',
    additionalInfo: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Calculate fee preview when load details change
  useEffect(() => {
    const calculateFeePreview = async () => {
      if (formData.material && formData.truckType) {
        try {
          const loadData = prepareLoadData();
          const response = await axios.post('/api/payments/calculate-fee', loadData);
          setEstimatedFee(response.data.feeBreakdown?.totalFee);
        } catch (err) {
          console.error('Error calculating fee preview:', err);
        }
      }
    };
    calculateFeePreview();
  }, [formData.material, formData.truckType, formData.capacityWeight, formData.numTrucks]);

  // Prepare load data for API
  const prepareLoadData = () => {
    return {
      type: formData.type === 'Full Load' ? 'full' : 'part',
      sourceCity: formData.sourceCity.trim(),
      destinationCity: formData.destinationCity.trim(),
      material: formData.material.trim(),
      weightMT: formData.capacityWeight ? parseFloat(formData.capacityWeight.replace(/[^\d.]/g, '')) : 0,
      truckType: formData.truckType.trim(),
      trucksRequired: parseInt(formData.numTrucks) || 1,
      scheduledDate: formData.scheduledDate,
      contactName: formData.contactName,
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone
    };
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();

    if (!user) {
      alert('Please login to post a load');
      navigate('/login');
      return;
    }

    // Validate required fields
    if (!formData.sourceCity || !formData.destinationCity || !formData.material || !formData.scheduledDate) {
      alert('Please fill in all required fields: Source City, Destination City, Material, and Scheduled Date');
      return;
    }

    // Validate email if provided
    if (formData.contactEmail && !isValidEmail(formData.contactEmail)) {
      alert('Please enter a valid email address');
      return;
    }

    // Validate phone if provided
    if (formData.contactPhone && !isValidPhone(formData.contactPhone)) {
      alert('Please enter a valid phone number (10 digits)');
      return;
    }

    // Show payment modal
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (result) => {
    setShowPaymentModal(false);
    alert('Payment successful! Your load has been posted. Transporters will contact you with quotes.');
    navigate('/load-board');
  };

  const handlePaymentFailure = (errorMessage) => {
    setShowPaymentModal(false);
    alert(`Payment failed: ${errorMessage}. Please try again.`);
  };

  const nextStep = () => {
    if (currentStep === 1 && (!formData.sourceCity || !formData.destinationCity)) {
      alert('Please fill in source and destination cities');
      return;
    }
    if (currentStep === 2 && (!formData.material || !formData.truckType)) {
      alert('Please select material type and truck type');
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const steps = [
    { num: 1, title: 'Route', icon: '🗺️' },
    { num: 2, title: 'Load Details', icon: '📦' },
    { num: 3, title: 'Schedule & Pay', icon: '💳' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-blue-200 text-sm mb-4">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              56,000+ Verified Transporters
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Post Your <span className="text-yellow-400">Load</span>
            </h1>
            <p className="text-blue-200 text-base sm:text-lg max-w-2xl mx-auto">
              Get instant quotes from verified transporters across India
            </p>
          </div>

          {/* Progress Steps */}
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between relative">
              {/* Progress Line */}
              <div className="absolute top-6 left-0 right-0 h-1 bg-white/20 rounded-full">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-500"
                  style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                ></div>
              </div>

              {steps.map((step) => (
                <div key={step.num} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${currentStep >= step.num
                      ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-gray-900 shadow-lg shadow-yellow-500/30'
                      : 'bg-white/20 text-white/60'
                      }`}
                  >
                    {currentStep > step.num ? '✓' : step.icon}
                  </div>
                  <span className={`mt-2 text-xs sm:text-sm font-medium ${currentStep >= step.num ? 'text-yellow-400' : 'text-white/60'
                    }`}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <form onSubmit={handleProceedToPayment}>
              {/* Step 1: Route */}
              <div className={`p-6 sm:p-8 lg:p-10 ${currentStep !== 1 ? 'hidden' : ''}`}>
                <div className="mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Where's your load going?</h2>
                  <p className="text-gray-600">Enter pickup and delivery locations</p>
                </div>

                {/* Load Type */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Select Load Type
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'Full Load' })}
                      className={`relative p-5 rounded-2xl border-2 transition-all duration-300 ${formData.type === 'Full Load'
                        ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/20'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {formData.type === 'Full Load' && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <div className="text-3xl mb-2">🚛</div>
                      <h3 className="font-bold text-gray-800 text-lg">Full Load</h3>
                      <p className="text-sm text-gray-500 mt-1">Above 3 Metric Tons</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'Part Load' })}
                      className={`relative p-5 rounded-2xl border-2 transition-all duration-300 ${formData.type === 'Part Load'
                        ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/20'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {formData.type === 'Part Load' && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <div className="text-3xl mb-2">📦</div>
                      <h3 className="font-bold text-gray-800 text-lg">Part Load</h3>
                      <p className="text-sm text-gray-500 mt-1">Below 3 Metric Tons</p>
                    </button>
                  </div>
                </div>

                {/* Route Inputs */}
                <div className="relative">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Source */}
                    <div className="relative">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Pickup Location <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        </div>
                        <input
                          type="text"
                          name="sourceCity"
                          value={formData.sourceCity}
                          onChange={handleChange}
                          placeholder="Enter city name"
                          className="w-full pl-16 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg transition"
                          required
                        />
                      </div>
                    </div>

                    {/* Arrow (Desktop) */}
                    <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-blue-600 rounded-full items-center justify-center z-10 shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>

                    {/* Destination */}
                    <div className="relative">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Delivery Location <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                        </div>
                        <input
                          type="text"
                          name="destinationCity"
                          value={formData.destinationCity}
                          onChange={handleChange}
                          placeholder="Enter city name"
                          className="w-full pl-16 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg transition"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Load Details */}
              <div className={`p-6 sm:p-8 lg:p-10 ${currentStep !== 2 ? 'hidden' : ''}`}>
                <div className="mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Load Details</h2>
                  <p className="text-gray-600">Tell us about what you're shipping</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Material Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Material Type <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="material"
                        value={formData.material}
                        onChange={handleChange}
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base appearance-none bg-white transition"
                        required
                      >
                        <option value="">Select Material</option>
                        <option value="Packed Food">🍱 Packed Food</option>
                        <option value="Electronics">📱 Electronics</option>
                        <option value="Furniture">🪑 Furniture</option>
                        <option value="Machinery">⚙️ Machinery</option>
                        <option value="Construction Material">🧱 Construction Material</option>
                        <option value="Agricultural Products">🌾 Agricultural Products</option>
                        <option value="Chemicals">🧪 Chemicals</option>
                        <option value="Textiles">👕 Textiles</option>
                        <option value="Auto Parts">🔧 Auto Parts</option>
                        <option value="FMCG">🛒 FMCG</option>
                        <option value="Others">📦 Others</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Weight */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Approximate Weight <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="capacityWeight"
                        value={formData.capacityWeight}
                        onChange={handleChange}
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base appearance-none bg-white transition"
                        required
                      >
                        <option value="">Select Weight</option>
                        <option value="Do Not Know">🤷 Don't Know</option>
                        <option value="Upto 5 MT">⚖️ Up to 5 MT</option>
                        <option value="Upto 10 MT">⚖️ Up to 10 MT</option>
                        <option value="Upto 12 MT">⚖️ Up to 12 MT</option>
                        <option value="Upto 15 MT">⚖️ Up to 15 MT</option>
                        <option value="Upto 20 MT">⚖️ Up to 20 MT</option>
                        <option value="Upto 25 MT">⚖️ Up to 25 MT</option>
                        <option value="Above 30 MT">⚖️ Above 30 MT</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Truck Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Truck Type <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="truckType"
                        value={formData.truckType}
                        onChange={handleChange}
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base appearance-none bg-white transition"
                        required
                      >
                        <option value="">Select Truck Type</option>
                        <option value="Container Close Body 32FT MXL">🚛 Container 32FT MXL</option>
                        <option value="Container Close Body 24FT SXL">🚛 Container 24FT SXL</option>
                        <option value="Container Close Body 20FT">🚛 Container 20FT</option>
                        <option value="Flat Bed Trailers">🚚 Flat Bed Trailers</option>
                        <option value="Canters 19feet / 17feet">🚚 Canters 19/17 Feet</option>
                        <option value="Truck 25MT / 14 Wheel">🚛 Truck 25MT (14 Wheel)</option>
                        <option value="Truck 20MT / 12 Wheel">🚛 Truck 20MT (12 Wheel)</option>
                        <option value="Truck 16MT / 10 Wheel">🚛 Truck 16MT (10 Wheel)</option>
                        <option value="Truck 9MT / 6 Wheel">🚛 Truck 9MT (6 Wheel)</option>
                        <option value="Pick Up / Chota Hathi">🛻 Pick Up / Chota Hathi</option>
                        <option value="Any">🚚 Any Available</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Number of Trucks */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Number of Trucks
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, numTrucks: Math.max(1, parseInt(formData.numTrucks) - 1).toString() })}
                        className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center text-xl font-bold text-gray-700 transition"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        name="numTrucks"
                        value={formData.numTrucks}
                        onChange={handleChange}
                        min="1"
                        max="100"
                        className="flex-1 px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-xl font-bold transition"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, numTrucks: Math.min(100, parseInt(formData.numTrucks) + 1).toString() })}
                        className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center text-xl font-bold text-gray-700 transition"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Estimated Fee Preview */}
                {estimatedFee && (
                  <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-green-700 font-medium">Estimated Booking Fee</p>
                        <p className="text-xs text-green-600">Payable before posting load</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-700">₹{estimatedFee}</p>
                      <p className="text-xs text-green-600">incl. GST</p>
                    </div>
                  </div>
                )}

                {/* Additional Info */}
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Any special requirements like loading/unloading assistance, fragile items, etc."
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Step 3: Schedule & Contact */}
              <div className={`p-6 sm:p-8 lg:p-10 ${currentStep !== 3 ? 'hidden' : ''}`}>
                <div className="mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Schedule & Payment</h2>
                  <p className="text-gray-600">When do you need the truck? Complete payment to post your load.</p>
                </div>

                {/* Date Selection */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Pickup Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative max-w-md">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="date"
                      name="scheduledDate"
                      value={formData.scheduledDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-16 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg transition"
                      required
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Name</label>
                      <input
                        type="text"
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleChange}
                        placeholder="Your name"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Phone</label>
                      <input
                        type="tel"
                        name="contactPhone"
                        value={formData.contactPhone}
                        onChange={handleChange}
                        placeholder="9876543210"
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white ${formData.contactPhone && !isValidPhone(formData.contactPhone)
                            ? 'border-red-300 bg-red-50'
                            : formData.contactPhone && isValidPhone(formData.contactPhone)
                              ? 'border-green-300 bg-green-50'
                              : 'border-gray-200'
                          }`}
                      />
                      {formData.contactPhone && !isValidPhone(formData.contactPhone) && (
                        <p className="text-xs text-red-500 mt-1">Enter valid 10-digit phone</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
                      <input
                        type="email"
                        name="contactEmail"
                        value={formData.contactEmail}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white ${formData.contactEmail && !isValidEmail(formData.contactEmail)
                            ? 'border-red-300 bg-red-50'
                            : formData.contactEmail && isValidEmail(formData.contactEmail)
                              ? 'border-green-300 bg-green-50'
                              : 'border-gray-200'
                          }`}
                      />
                      {formData.contactEmail && !isValidEmail(formData.contactEmail) && (
                        <p className="text-xs text-red-500 mt-1">Enter valid email</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Summary with Payment Info */}
                <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">📋 Load Summary</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Route</span>
                      <p className="font-semibold text-gray-800">{formData.sourceCity || '—'} → {formData.destinationCity || '—'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Load Type</span>
                      <p className="font-semibold text-gray-800">{formData.type}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Material</span>
                      <p className="font-semibold text-gray-800">{formData.material || '—'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Weight</span>
                      <p className="font-semibold text-gray-800">{formData.capacityWeight || '—'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Trucks</span>
                      <p className="font-semibold text-gray-800">{formData.numTrucks} × {formData.truckType || 'Any'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Date</span>
                      <p className="font-semibold text-gray-800">{formData.scheduledDate ? new Date(formData.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</p>
                    </div>
                  </div>

                  {/* Booking Fee Display */}
                  {estimatedFee && (
                    <div className="mt-4 pt-4 border-t border-blue-200 flex items-center justify-between">
                      <div>
                        <span className="text-gray-600 text-sm">Booking Fee</span>
                        <p className="text-xs text-gray-500">One-time fee for load confirmation</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">₹{estimatedFee}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Info */}
                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-amber-800 text-sm">Why Booking Fee?</h4>
                      <p className="text-amber-700 text-xs mt-1">
                        A small booking fee ensures genuine load postings and prioritizes your load to verified transporters.
                        This fee is non-refundable once the load is posted.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="px-6 sm:px-8 lg:px-10 pb-6 sm:pb-8 lg:pb-10 flex flex-col sm:flex-row gap-4">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 sm:flex-none px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>
                )}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 py-4 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl transition transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
                  >
                    Continue
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-4 px-8 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl transition transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Pay ₹{estimatedFee || '—'} & Post Load
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Features */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">⚡</div>
              <h4 className="font-semibold text-white text-sm">Instant Quotes</h4>
              <p className="text-blue-200 text-xs mt-1">Get quotes within minutes</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">✅</div>
              <h4 className="font-semibold text-white text-sm">Verified Transporters</h4>
              <p className="text-blue-200 text-xs mt-1">All partners are verified</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">🔒</div>
              <h4 className="font-semibold text-white text-sm">Secure Payments</h4>
              <p className="text-blue-200 text-xs mt-1">Powered by Razorpay</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        loadDetails={prepareLoadData()}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentFailure={handlePaymentFailure}
      />
    </div>
  );
}
