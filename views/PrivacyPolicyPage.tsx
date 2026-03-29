import React from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';

const C = {
  bg: '#F8FAFC',
  text: '#111827',
  muted: '#6B7280',
  primary: '#2563EB',
};

const PrivacyPolicyPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.bg, fontFamily: "'Inter', 'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <PublicNavbar />
      
      <main className="flex-grow pt-[140px] px-6 max-w-7xl mx-auto w-full">
        {/* Content Container */}
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-8" style={{ color: C.text }}>
            Privacy Policy
          </h1>
          
          <div className="bg-white p-8 md:p-12 rounded-[16px] border border-gray-100 shadow-sm w-full mb-12">
            <div className="space-y-8 text-[16px] leading-relaxed" style={{ color: C.muted }}>
              <section>
                <p className="mb-4">
                  This Privacy Policy describes how your personal information is collected, used, and shared when you visit or use the Xoon Enterprise Hub platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4" style={{ color: C.text }}>Information We Collect</h2>
                <p>
                  When you visit the site, we automatically collect certain information about your device, including information about your web browser, IP address, timezone, and some of the cookies that are installed on your device.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4" style={{ color: C.text }}>How Do We Use Your Personal Information?</h2>
                <p>
                  We use the personal information that we collect generally to fulfill any requests placed through the site, to communicate with you, and to screen our network for potential risk or fraud.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4" style={{ color: C.text }}>Data Retention</h2>
                <p>
                  When you submit a contact form or register for an account, we will maintain your Information for our records unless and until you ask us to delete this information.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default PrivacyPolicyPage;
