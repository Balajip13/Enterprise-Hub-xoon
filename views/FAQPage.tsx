import React from 'react';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';

const C = {
  bg: '#F8FAFC',
  text: '#111827',
  muted: '#6B7280',
  primary: '#2563EB',
};

const FAQPage: React.FC = () => {
  const faqs = [
    {
      q: "What is Xoon Enterprise Hub?",
      a: "Xoon Enterprise Hub is a networking platform for business professionals to share referrals and grow their businesses together."
    },
    {
      q: "How can I join the network?",
      a: "You can click on the 'Join Network' button on the homepage to start the registration process."
    },
    {
      q: "Is there a membership fee?",
      a: "Please contact our support team for detailed information regarding membership levels and associated fees."
    },
    {
      q: "How are referrals tracked?",
      a: "Our platform provides a dedicated dashboard for sending, receiving, and tracking the status of every referral shared within the network."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.bg, fontFamily: "'Inter', 'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <PublicNavbar />
      
      <main className="flex-grow pt-[140px] px-6 max-w-7xl mx-auto w-full">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-8" style={{ color: C.text }}>
            Frequently Asked Questions
          </h1>
          
          <div className="bg-white p-8 md:p-12 rounded-[16px] border border-gray-100 shadow-sm w-full mb-12">
            <div className="space-y-8">
              {faqs.map((faq, i) => (
                <div key={i} className="border-b border-gray-100 pb-8 last:border-0 last:pb-0">
                  <h3 className="text-xl font-bold mb-3" style={{ color: C.text }}>{faq.q}</h3>
                  <p className="text-[16px] leading-relaxed" style={{ color: C.muted }}>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default FAQPage;
