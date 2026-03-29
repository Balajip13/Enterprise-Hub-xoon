import React from 'react';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';

const C = {
  bg: '#F8FAFC',
  text: '#111827',
  muted: '#6B7280',
  primary: '#2563EB',
};

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.bg, fontFamily: "'Inter', 'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <PublicNavbar />
      
      <main className="flex-grow pt-[140px] px-6 max-w-7xl mx-auto w-full">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-8" style={{ color: C.text }}>
            About Xoon Enterprise Hub
          </h1>
          
          <div className="bg-white p-8 md:p-12 rounded-[16px] border border-gray-100 shadow-sm w-full mb-12">
            <div className="space-y-8 text-[16px] leading-relaxed" style={{ color: C.muted }}>
              <section>
                <p>
                  Xoon Enterprise Hub is a premium business referral networking platform designed to connect professionals and foster growth through trusted relationships.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4" style={{ color: C.text }}>Our Mission</h2>
                <p>
                  Our mission is to empower business owners and professionals by providing a structured, high-integrity environment for exchange of referrals and collaboration.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4" style={{ color: C.text }}>How We Work</h2>
                <p>
                  We bring together verified members across various industries, providing them with the tools and platform to track their networking activities, manage referrals, and participate in strategic meetings.
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

export default AboutPage;
