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

const TermsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.bg, fontFamily: "'Inter', 'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <PublicNavbar />
      
      <main className="flex-grow pt-[140px] px-6 max-w-7xl mx-auto w-full">
        {/* Content Container */}
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-8" style={{ color: C.text }}>
            Terms of Service
          </h1>
          
          <div className="bg-white p-8 md:p-12 rounded-[16px] border border-gray-100 shadow-sm w-full mb-12">
            <div className="space-y-8 text-[16px] leading-relaxed" style={{ color: C.muted }}>
              <section>
                <p>
                  By accessing or using the Xoon Enterprise Hub platform, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you do not have permission to access the service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4" style={{ color: C.text }}>1. Services</h2>
                <p>
                  We provide a business referral networking platform. We reserve the right to withdraw or amend our service, and any service or material we provide via the platform, in our sole discretion without notice.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4" style={{ color: C.text }}>2. Acceptable Use</h2>
                <p>
                  You may use our platform only for lawful purposes and in accordance with these Terms. You agree not to use the platform in any way that violates any applicable national or international law or regulation.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4" style={{ color: C.text }}>3. User Contributions</h2>
                <p>
                  The platform may contain message boards, chat rooms, personal profiles, forums, and other interactive features that allow users to post content. You are entirely responsible for the content of, and any harm resulting from, that Content.
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

export default TermsPage;
