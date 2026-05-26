import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/client';
import { useAuth } from '../auth/AuthContext';

// Social Icons
const SocialIcons = {
  facebook: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  twitter: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  linkedin: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  instagram: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  ),
  youtube: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  whatsapp: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  ),
  telegram: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  ),
  link: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M10.59 13.41c.41.39.41 1.03 0 1.42-.39.39-1.03.39-1.42 0a5.003 5.003 0 0 1 0-7.07l3.54-3.54a5.003 5.003 0 0 1 7.07 0 5.003 5.003 0 0 1 0 7.07l-1.49 1.49c.01-.82-.12-1.64-.4-2.42l.47-.48a2.982 2.982 0 0 0 0-4.24 2.982 2.982 0 0 0-4.24 0l-3.53 3.53a2.982 2.982 0 0 0 0 4.24zm2.82-4.24c.39-.39 1.03-.39 1.42 0a5.003 5.003 0 0 1 0 7.07l-3.54 3.54a5.003 5.003 0 0 1-7.07 0 5.003 5.003 0 0 1 0-7.07l1.49-1.49c-.01.82.12 1.64.4 2.43l-.47.47a2.982 2.982 0 0 0 0 4.24 2.982 2.982 0 0 0 4.24 0l3.53-3.53a2.982 2.982 0 0 0 0-4.24.973.973 0 0 1 0-1.42z" />
    </svg>
  )
};

const getIconBgColor = (iconType) => {
  const colors = {
    facebook: 'bg-blue-600 hover:bg-blue-700',
    twitter: 'bg-black hover:bg-gray-800',
    linkedin: 'bg-blue-700 hover:bg-blue-800',
    instagram: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 hover:from-purple-700 hover:via-pink-600 hover:to-orange-500',
    youtube: 'bg-red-600 hover:bg-red-700',
    whatsapp: 'bg-green-500 hover:bg-green-600',
    telegram: 'bg-blue-500 hover:bg-blue-600',
    link: 'bg-gray-600 hover:bg-gray-700'
  };
  return colors[iconType] || 'bg-gray-600 hover:bg-gray-700';
};

export default function ContactPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'superadmin';

  const [socialLinks, setSocialLinks] = useState([]);
  const [contactInfo, setContactInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchContactInfo();
    fetchSocialLinks();
  }, []);

  const fetchContactInfo = async () => {
    try {
      const res = await axios.get('/api/contact');
      setContactInfo(res.data);
      setEditData(res.data);
    } catch (error) {
      console.error('Error fetching contact info:', error);
      // Use defaults
      setContactInfo({
        phone: '+91-7489635343',
        phoneHours: 'Mon-Sat 9am-6pm',
        email: 'info@trucksuvidha.com',
        emailResponseTime: 'We reply within 24hrs',
        whatsapp: '+917489635343',
        address: 'Indore, MP, India',
        businessHours: {
          weekdays: '9:00 AM - 6:00 PM',
          saturday: '9:00 AM - 2:00 PM',
          sunday: 'Closed'
        },
        faqs: []
      });
    }
  };

  const fetchSocialLinks = async () => {
    try {
      const res = await axios.get('/api/social-media');
      setSocialLinks(res.data);
    } catch (error) {
      console.error('Error fetching social media links:', error);
      setSocialLinks([]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put('/api/contact', editData);
      setContactInfo(editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving contact info:', error);
      alert(error.response?.data?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setSubmitted(true);
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // SuperAdmin Edit Mode
  if (isSuperAdmin && isEditing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Edit Contact Page</h1>
                <p className="text-purple-200">SuperAdmin: Modify all contact information</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setEditData(contactInfo);
                    setIsEditing(false);
                  }}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </button>
              </div>
            </div>

            {/* Contact Details Section */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Contact Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="text"
                    value={editData.phone || ''}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Hours</label>
                  <input
                    type="text"
                    value={editData.phoneHours || ''}
                    onChange={(e) => setEditData({ ...editData, phoneHours: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={editData.email || ''}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Response Time</label>
                  <input
                    type="text"
                    value={editData.emailResponseTime || ''}
                    onChange={(e) => setEditData({ ...editData, emailResponseTime: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp Number</label>
                  <input
                    type="text"
                    value={editData.whatsapp || ''}
                    onChange={(e) => setEditData({ ...editData, whatsapp: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Office Address</label>
                  <input
                    type="text"
                    value={editData.address || ''}
                    onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Business Hours Section */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Business Hours
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Weekdays (Mon-Fri)</label>
                  <input
                    type="text"
                    value={editData.businessHours?.weekdays || ''}
                    onChange={(e) => setEditData({
                      ...editData,
                      businessHours: { ...editData.businessHours, weekdays: e.target.value }
                    })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Saturday</label>
                  <input
                    type="text"
                    value={editData.businessHours?.saturday || ''}
                    onChange={(e) => setEditData({
                      ...editData,
                      businessHours: { ...editData.businessHours, saturday: e.target.value }
                    })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sunday</label>
                  <input
                    type="text"
                    value={editData.businessHours?.sunday || ''}
                    onChange={(e) => setEditData({
                      ...editData,
                      businessHours: { ...editData.businessHours, sunday: e.target.value }
                    })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Map URL Section */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Google Maps Embed URL
              </h2>
              <textarea
                value={editData.mapUrl || ''}
                onChange={(e) => setEditData({ ...editData, mapUrl: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="Paste Google Maps embed URL here..."
              />
            </div>

            {/* FAQs Section */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                FAQs
              </h2>
              <div className="space-y-4">
                {(editData.faqs || []).map((faq, index) => (
                  <div key={index} className="border-2 border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-500">FAQ #{index + 1}</span>
                      <button
                        onClick={() => {
                          const newFaqs = editData.faqs.filter((_, i) => i !== index);
                          setEditData({ ...editData, faqs: newFaqs });
                        }}
                        className="text-red-500 hover:text-red-700 text-sm font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => {
                        const newFaqs = [...editData.faqs];
                        newFaqs[index].question = e.target.value;
                        setEditData({ ...editData, faqs: newFaqs });
                      }}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg mb-2"
                      placeholder="Question"
                    />
                    <textarea
                      value={faq.answer}
                      onChange={(e) => {
                        const newFaqs = [...editData.faqs];
                        newFaqs[index].answer = e.target.value;
                        setEditData({ ...editData, faqs: newFaqs });
                      }}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                      placeholder="Answer"
                    />
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newFaqs = [...(editData.faqs || []), { question: '', answer: '' }];
                    setEditData({ ...editData, faqs: newFaqs });
                  }}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-500 hover:text-blue-500 transition font-semibold"
                >
                  + Add FAQ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normal View (with SuperAdmin edit button)
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* SuperAdmin Edit Banner */}
      {isSuperAdmin && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">⭐ SUPERADMIN</span>
              <span>You can edit this page</span>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="bg-white text-purple-600 px-6 py-2 rounded-lg font-bold hover:bg-purple-50 transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Page
            </button>
          </div>
        </div>
      )}

      {/* Hero Section - Interactive */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white overflow-hidden min-h-[400px]">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Morphing Blobs */}
          <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-yellow-400/30 to-orange-500/30 rounded-full blur-3xl animate-morph"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-cyan-500/30 rounded-full blur-3xl animate-morph" style={{ animationDelay: '-4s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-pink-400/20 to-purple-500/20 rounded-full blur-2xl animate-morph" style={{ animationDelay: '-2s' }}></div>

          {/* Floating Icons */}
          <div className="absolute top-20 left-[15%] text-4xl animate-float-orb opacity-60">📞</div>
          <div className="absolute top-32 right-[20%] text-3xl animate-float-orb opacity-60" style={{ animationDelay: '-2s' }}>✉️</div>
          <div className="absolute bottom-20 left-[25%] text-4xl animate-float-orb opacity-60" style={{ animationDelay: '-4s' }}>💬</div>
          <div className="absolute bottom-32 right-[15%] text-3xl animate-float-orb opacity-60" style={{ animationDelay: '-1s' }}>🚚</div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 animate-float-label">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-ping-slow"></span>
              <span className="text-sm font-medium">We're online and ready to help!</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              Let's <span className="text-yellow-300 animate-heartbeat inline-block cursor-pointer">Connect</span>
            </h1>

            <p className="text-xl sm:text-2xl text-white/90 max-w-2xl mx-auto mb-8">
              Have a question? Click any card below to reach us instantly. We love hearing from you!
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href={`tel:${contactInfo?.phone}`}
                className="group flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-full font-semibold transition-all duration-300 magnetic-hover animate-bounce-click"
              >
                <span className="text-2xl group-hover:animate-wiggle">📞</span>
                Call Now
              </a>
              <a
                href={`https://wa.me/${contactInfo?.whatsapp?.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 bg-green-500/80 hover:bg-green-500 backdrop-blur-sm px-6 py-3 rounded-full font-semibold transition-all duration-300 magnetic-hover animate-bounce-click"
              >
                <span className="text-2xl group-hover:animate-wiggle">💬</span>
                WhatsApp
              </a>
              <a
                href={`mailto:${contactInfo?.email}`}
                className="group flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-full font-semibold transition-all duration-300 magnetic-hover animate-bounce-click"
              >
                <span className="text-2xl group-hover:animate-wiggle">✉️</span>
                Email Us
              </a>
              <Link
                to="/demo"
                className="group flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 backdrop-blur-sm px-6 py-3 rounded-full font-semibold transition-all duration-300 magnetic-hover animate-bounce-click text-slate-900"
              >
                <span className="text-2xl group-hover:animate-wiggle">🎥</span>
                View Demo
              </Link>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" fillOpacity="0.1" />
            <path d="M0 120L60 112.5C120 105 240 90 360 82.5C480 75 600 75 720 80C840 85 960 95 1080 97.5C1200 100 1320 95 1380 92.5L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(249 250 251)" />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16">

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
                Reach Out <span className="text-indigo-600">Anytime</span> 👋
              </h2>
              <p className="text-lg text-gray-600">
                Click on any card to connect with us instantly!
              </p>
            </div>

            {/* Contact Cards - Interactive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Phone Card */}
              <a
                href={`tel:${contactInfo?.phone}`}
                className="group bg-gradient-to-br from-white to-green-50 rounded-2xl p-6 shadow-lg magnetic-hover glow-hover tilt-3d cursor-pointer border-2 border-transparent hover:border-green-200 animate-bounce-click"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <span className="text-3xl group-hover:animate-wiggle">📞</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-green-600 transition-colors">Call Us</h3>
                    <p className="text-gray-500 text-sm mb-2">{contactInfo?.phoneHours}</p>
                    <p className="text-green-600 font-bold text-lg">{contactInfo?.phone}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-green-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Tap to call</span>
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </a>

              {/* Email Card */}
              <a
                href={`mailto:${contactInfo?.email}`}
                className="group bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 shadow-lg magnetic-hover glow-hover tilt-3d cursor-pointer border-2 border-transparent hover:border-blue-200 animate-bounce-click"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <span className="text-3xl group-hover:animate-wiggle">✉️</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-blue-600 transition-colors">Email Us</h3>
                    <p className="text-gray-500 text-sm mb-2">{contactInfo?.emailResponseTime}</p>
                    <p className="text-blue-600 font-bold break-all">{contactInfo?.email}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Send email</span>
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </a>

              {/* Location Card */}
              <div className="group bg-gradient-to-br from-white to-red-50 rounded-2xl p-6 shadow-lg magnetic-hover tilt-3d cursor-pointer border-2 border-transparent hover:border-red-200">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <span className="text-3xl group-hover:animate-wiggle">📍</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-red-600 transition-colors">Visit Us</h3>
                    <p className="text-gray-500 text-sm mb-2">Our office location</p>
                    <p className="text-red-600 font-bold">{contactInfo?.address}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-red-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>View on map ↓</span>
                </div>
              </div>

              {/* WhatsApp Card */}
              <a
                href={`https://wa.me/${contactInfo?.whatsapp?.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-gradient-to-br from-white to-emerald-50 rounded-2xl p-6 shadow-lg magnetic-hover glow-hover tilt-3d cursor-pointer border-2 border-transparent hover:border-emerald-300 animate-bounce-click relative overflow-hidden"
              >
                {/* Animated pulse ring */}
                <div className="absolute top-4 right-4 w-3 h-3">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping-slow"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <span className="text-3xl group-hover:animate-wiggle">💬</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-emerald-600 transition-colors">WhatsApp</h3>
                    <p className="text-gray-500 text-sm mb-2">Instant replies!</p>
                    <p className="text-emerald-600 font-bold">Chat with us</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-emerald-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Open WhatsApp</span>
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </a>
            </div>

            {/* Social Media - Interactive */}
            {socialLinks.length > 0 && (
              <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-6 sm:p-8 shadow-lg border-2 border-purple-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🌐</span>
                  Connect With Us
                </h3>
                <div className="flex flex-wrap gap-4">
                  {socialLinks.map((link) => (
                    <a
                      key={link._id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group w-14 h-14 ${getIconBgColor(link.icon)} rounded-2xl flex items-center justify-center text-white transition-all duration-300 magnetic-hover animate-bounce-click shadow-lg hover:shadow-xl`}
                      title={link.platform}
                    >
                      <span className="group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300">
                        {SocialIcons[link.icon] || SocialIcons.link}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Business Hours - Interactive */}
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl magnetic-hover relative overflow-hidden">
              {/* Animated background dots */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 left-4 w-2 h-2 bg-white rounded-full animate-ping-slow"></div>
                <div className="absolute bottom-8 right-8 w-3 h-3 bg-white rounded-full animate-ping-slow" style={{ animationDelay: '-1s' }}></div>
                <div className="absolute top-1/2 right-4 w-2 h-2 bg-white rounded-full animate-ping-slow" style={{ animationDelay: '-0.5s' }}></div>
              </div>

              <h3 className="text-xl font-bold mb-6 flex items-center gap-3 relative">
                <span className="text-3xl animate-float-label">⏰</span>
                Business Hours
              </h3>
              <div className="space-y-4 relative">
                <div className="flex justify-between items-center p-3 bg-white/10 rounded-xl backdrop-blur-sm hover:bg-white/20 transition-colors cursor-default">
                  <span className="text-white/90 flex items-center gap-2">
                    <span>📅</span> Monday - Friday
                  </span>
                  <span className="font-bold bg-white/20 px-3 py-1 rounded-full">{contactInfo?.businessHours?.weekdays}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/10 rounded-xl backdrop-blur-sm hover:bg-white/20 transition-colors cursor-default">
                  <span className="text-white/90 flex items-center gap-2">
                    <span>📅</span> Saturday
                  </span>
                  <span className="font-bold bg-white/20 px-3 py-1 rounded-full">{contactInfo?.businessHours?.saturday}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/10 rounded-xl backdrop-blur-sm hover:bg-white/20 transition-colors cursor-default">
                  <span className="text-white/90 flex items-center gap-2">
                    <span>😴</span> Sunday
                  </span>
                  <span className="font-bold bg-yellow-400 text-gray-900 px-3 py-1 rounded-full">{contactInfo?.businessHours?.sunday}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form - Interactive */}
          <div className="bg-gradient-to-br from-white to-indigo-50 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl border-2 border-indigo-100 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-200/40 to-purple-200/40 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-pink-200/40 to-orange-200/40 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">💌</span>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Send us a Message</h2>
              </div>
              <p className="text-gray-600 mb-8 ml-12">We'd love to hear from you. Drop us a line!</p>

              {submitted && (
                <div className="mb-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl flex items-center gap-4 animate-fadeIn">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-green-800 text-lg">Message Sent Successfully!</h4>
                    <p className="text-sm text-green-600">We'll get back to you within 24 hours. 🚀</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Subject *</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    >
                      <option value="">Select a topic</option>
                      <option value="general">General Inquiry</option>
                      <option value="booking">Truck Booking</option>
                      <option value="load">Load Posting</option>
                      <option value="support">Technical Support</option>
                      <option value="partnership">Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition transform ${isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-[1.02] active:scale-[0.98]'
                    } text-white shadow-lg`}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="bg-white py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">Find Us</h2>
              <p className="text-gray-600">Visit our office or get directions</p>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-xl h-64 sm:h-80 lg:h-96 bg-gray-200">
              <iframe
                src={contactInfo?.mapUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d235526.94105022807!2d75.69903556640625!3d22.72423!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3962fcad1b410ddb%3A0x96ec4da356240f4!2sIndore%2C%20Madhya%20Pradesh!5e0!3m2!1sen!2sin!4v1701456000000!5m2!1sen!2sin"}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Office Location"
              ></iframe>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        {contactInfo?.faqs?.length > 0 && (
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-12 sm:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">Frequently Asked Questions</h2>
                <p className="text-gray-600">Quick answers to common questions</p>
              </div>
              <div className="max-w-3xl mx-auto space-y-4">
                {contactInfo.faqs.map((faq, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-5 sm:p-6 shadow-md hover:shadow-lg transition">
                    <h3 className="font-bold text-gray-800 mb-2 flex items-start gap-3">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5">?</span>
                      {faq.question}
                    </h3>
                    <p className="text-gray-600 ml-9">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
