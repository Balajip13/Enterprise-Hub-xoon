import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Linkedin, Twitter, Instagram, Facebook } from 'lucide-react';

const C = {
  primary: '#2563EB',
};

const PublicFooter: React.FC = () => {
  const navigate = useNavigate();
  return (
    <footer id="footer" style={{ background: '#020617', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '70px', paddingBottom: '50px' }} className="px-6 w-full">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start gap-12 md:gap-x-32 lg:gap-x-48">
        
        {/* Left side: Brand Logo + Text + Social */}
        <div className="flex flex-col gap-5">
          <div>
            <div className="flex items-center gap-3 select-none mb-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black italic text-[#F8FAFC] text-sm" style={{ background: C.primary }}>
                X
              </div>
              <span className="font-bold text-[20px] tracking-tight text-[#F8FAFC]">Xoon Enterprise Hub</span>
            </div>
            <p className="text-[15px] leading-relaxed text-[#94A3B8] font-medium">
              Business referral networking platform
            </p>
          </div>

          {/* Social media minimal outline icons under brand text */}
          <div className="flex items-center gap-6 mt-1">
            {[
              { Icon: Linkedin, href: '#' },
              { Icon: Twitter, href: '#' },
              { Icon: Instagram, href: '#' },
              { Icon: Facebook, href: '#' }
            ].map(({Icon, href}, i) => (
               <a
                 key={i}
                 href={href}
                 className="text-[#94A3B8] hover:text-[#2563EB] transition-colors"
                 aria-label="Social Link"
               >
                 <Icon size={22} strokeWidth={1.5} />
               </a>
            ))}
          </div>
        </div>

        {/* Right side: Reorganized Links Columns */}
        <div className="grid grid-cols-2 gap-12 md:gap-24 w-full md:w-auto">
          {/* Column 1: Platform */}
          <div className="flex flex-col gap-5">
            <h4 className="text-[#F8FAFC] font-bold text-[16px] tracking-wide">Platform</h4>
            <nav className="flex flex-col gap-3.5">
              {[
                { label: 'About', path: '/about' },
                { label: 'Features', path: '/#features' },
                { label: 'How It Works', path: '/#how-it-works' },
                { label: 'FAQ', path: '/faq' }
              ].map(link => (
                <button
                  key={link.label}
                  onClick={() => navigate(link.path)}
                  className="text-[15px] font-medium transition-colors text-[#94A3B8] hover:text-[#2563EB] text-left"
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Column 2: Support */}
          <div className="flex flex-col gap-5">
            <h4 className="text-[#F8FAFC] font-bold text-[16px] tracking-wide">Support</h4>
            <nav className="flex flex-col gap-3.5">
              {[
                { label: 'Contact', path: '/contact' },
                { label: 'Terms', path: '/terms' },
                { label: 'Privacy Policy', path: '/privacy' }
              ].map(link => (
                <button
                  key={link.label}
                  onClick={() => navigate(link.path)}
                  className="text-[15px] font-medium transition-colors text-[#94A3B8] hover:text-[#2563EB] text-left"
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

      </div>

      {/* Bottom Footer: Copyright Wrapper */}
      <div className="max-w-7xl mx-auto border-t border-white/5 mt-12 pt-8 text-center pb-2">
        <p className="text-[14px] text-[#64748B] font-medium">
          © 2026 Xoon Enterprise Hub. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default PublicFooter;
