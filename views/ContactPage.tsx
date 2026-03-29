import React, { useState, useEffect } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Menu,
  X,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';

import { apiService } from '../services/apiService';

interface ContactPageProps {}

// ─── Design Tokens (Matches LandingPage) ──────────────────────────────────
const C = {
  primary: '#2563EB',      // Blue
  primaryHover: '#1D4ED8',
  accent: '#06B6D4',       // Cyan
  dark: '#0F172A',         // Footer / Dark bg
  bg: '#F8FAFC',           // Main background
  cardBg: '#FFFFFF',       // Cards
  border: '#E2E8F0',       // Borders
  text: '#111827',         // Primary Text
  muted: '#6B7280',        // Secondary Text
};

// ─── Contact Page App ──────────────────────────────────────────────────────
const ContactPage: React.FC<ContactPageProps> = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await apiService.submitSupportMessage(formData);
      if (result.success) {
        setSubmitted(true);
      } else {
        alert(result.message || 'Failed to send message. Please try again.');
      }
    } catch (error: any) {
      console.error('Submission error:', error);
      alert(error.message || 'An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const contactItems = [
    {
      icon: Mail,
      title: 'Email',
      value: 'support@xoonhub.com',
      href: 'mailto:support@xoonhub.com',
      color: '#2563EB',
      bgColor: 'rgba(37, 99, 235, 0.08)'
    },
    {
      icon: Phone,
      title: 'Phone',
      value: '+91 98765 43210',
      href: 'tel:+919876543210',
      color: '#06B6D4',
      bgColor: 'rgba(6, 182, 212, 0.08)'
    },
    {
      icon: MapPin,
      title: 'Location',
      value: 'Chennai, India',
      href: '#',
      color: '#7C3AED',
      bgColor: 'rgba(124, 58, 237, 0.08)'
    }
  ];

  return (
    <div className="min-h-screen overflow-x-hidden flex flex-col" style={{ background: C.bg, fontFamily: "'Inter', 'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <PublicNavbar />
      
      <main className="flex-grow pt-[160px] pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="max-w-3xl mx-auto text-center mb-20">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6" style={{ color: C.text }}>
              Contact Us
            </h1>
            <p className="text-lg md:text-xl leading-relaxed" style={{ color: C.muted }}>
              Have questions about the Xoon Enterprise Hub network? Our team is ready to help you connect and grow.
            </p>
          </div>

          {/* Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            
            {/* Left Side: Contact Information Cards */}
            <div className="flex flex-col gap-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold mb-2" style={{ color: C.text }}>Get in Touch</h2>
                <p className="font-medium" style={{ color: C.muted }}>Reach out through any of these channels.</p>
              </div>

              {contactItems.map((item, i) => (
                <a 
                  key={i}
                  href={item.href}
                  className="group p-6 transition-all duration-300 rounded-2xl bg-white border border-gray-100 flex items-center gap-6 shadow-sm hover:shadow-xl hover:-translate-y-1"
                >
                  <div 
                    className="h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110" 
                    style={{ background: item.bgColor }}
                  >
                    <item.icon size={28} style={{ color: item.color }} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-[17px] font-bold tracking-tight mb-1" style={{ color: C.text }}>{item.title}</h3>
                    <p className="text-[15px] font-medium" style={{ color: C.muted }}>{item.value}</p>
                  </div>
                </a>
              ))}
              
              <div className="flex-grow" />
            </div>

            {/* Right Side: Contact Form Container */}
            <div className="bg-white p-8 md:p-10 rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/50 relative">
              {submitted ? (
                <div className="py-20 text-center animate-in fade-in zoom-in duration-500">
                  <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <Mail size={40} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4" style={{ color: C.text }}>Message Sent!</h3>
                  <p className="text-lg px-4" style={{ color: C.muted }}>Thanks for reaching out. Our team will get back to you within 24 hours.</p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="mt-10 text-base font-bold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold mb-2" style={{ color: C.text }}>Send a Message</h3>
                    <p className="font-medium text-sm" style={{ color: C.muted }}>Fill out the form below and we'll be in touch.</p>
                  </div>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[14px] font-bold ml-1" style={{ color: C.text }}>Full Name</label>
                        <input required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-gray-50/30 transition-all text-[15px] placeholder:text-gray-400" placeholder="John Doe" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[14px] font-bold ml-1" style={{ color: C.text }}>Email Address</label>
                        <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-gray-50/30 transition-all text-[15px] placeholder:text-gray-400" placeholder="john@example.com" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[14px] font-bold ml-1" style={{ color: C.text }}>Phone Number</label>
                        <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-gray-50/30 transition-all text-[15px] placeholder:text-gray-400" placeholder="+91 00000 00000" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[14px] font-bold ml-1" style={{ color: C.text }}>Subject</label>
                        <input required type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-gray-50/30 transition-all text-[15px] placeholder:text-gray-400" placeholder="General Inquiry" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[14px] font-bold ml-1" style={{ color: C.text }}>Message</label>
                      <textarea required rows={5} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-gray-50/30 transition-all text-[15px] resize-none placeholder:text-gray-400" placeholder="How can we help you grow?"></textarea>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{ background: C.primary, height: '44px' }}
                      className={`w-fit mx-auto px-10 py-3 mt-6 text-[16px] font-bold rounded-full text-white transition-all shadow-lg shadow-blue-200/50 flex justify-center items-center group relative overflow-hidden ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                      onMouseEnter={e => { 
                        if (loading) return;
                        (e.currentTarget as HTMLElement).style.background = C.primaryHover; 
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                        (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 20px -5px rgba(37, 99, 235, 0.3)';
                      }}
                      onMouseLeave={e => { 
                        if (loading) return;
                        (e.currentTarget as HTMLElement).style.background = C.primary; 
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                        (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 15px -3px rgba(37, 99, 235, 0.2)';
                      }}
                    >
                      <span className="relative z-10">{loading ? 'Sending...' : 'Send Message'}</span>
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default ContactPage;
