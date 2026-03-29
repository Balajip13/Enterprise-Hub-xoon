import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

// Design Tokens (Sync with LandingPage)
const C = {
  primary: '#2563EB',
  primaryHover: '#1D4ED8',
  bg: '#F8FAFC',
  border: '#E2E8F0',
  text: '#111827',
  muted: '#6B7280',
};

const PublicNavbar: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const handleNavClick = (id: string) => {
    if (window.location.pathname !== '/') {
      navigate('/#' + id);
    } else {
      const element = document.getElementById(id);
      if (element) {
        const y = element.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
    setOpen(false);
  };

  return (
    <header
      style={{
        background: scrolled ? 'rgba(255,255,255,0.98)' : 'transparent',
        borderBottom: scrolled ? `1px solid ${C.border}` : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(8px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(8px)' : 'none',
      }}
      className="fixed inset-x-0 top-0 z-50 transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 select-none cursor-pointer" onClick={() => navigate('/')}>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-black italic text-white text-lg shadow-sm"
            style={{ background: C.primary }}
          >
            X
          </div>
          <div className="leading-tight">
            <span className="block font-bold text-base tracking-tight" style={{ color: C.text }}>XOON</span>
            <span className="block text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: C.muted }}>
              Enterprise Hub
            </span>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {[['Features', 'features'], ['Network', 'how-it-works']].map(
            ([label, id]) => (
              <button
                key={label}
                onClick={() => handleNavClick(id)}
                className="text-sm font-medium transition-colors"
                style={{ color: C.muted }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = C.text; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = C.muted; }}
              >
                {label}
              </button>
            )
          )}
          <button
            onClick={() => navigate('/contact')}
            className="text-sm font-medium transition-colors"
            style={{ color: window.location.pathname === '/contact' ? C.text : C.muted }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = C.text; }}
            onMouseLeave={e => { if (window.location.pathname !== '/contact') (e.currentTarget as HTMLElement).style.color = C.muted; }}
          >
            Contact
          </button>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center">
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 text-sm font-semibold rounded-lg text-white transition-all shadow-sm"
            style={{ background: C.primary }}
            onMouseEnter={e => { 
              (e.currentTarget as HTMLElement).style.background = C.primaryHover;
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => { 
              (e.currentTarget as HTMLElement).style.background = C.primary;
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            }}
          >
            Login
          </button>
        </div>

        {/* Mobile burger */}
        <button
          className="md:hidden p-2 rounded-lg transition-colors"
          style={{ color: C.text }}
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t px-6 py-4 shadow-lg border-b" style={{ borderColor: C.border }}>
          <div className="flex flex-col gap-2 mb-6 mt-2">
            {[['Features', 'features'], ['Network', 'how-it-works']].map(
              ([label, id]) => (
                <button
                  key={label}
                  onClick={() => handleNavClick(id)}
                  className="w-full text-left py-2 text-base font-medium transition-colors"
                  style={{ color: C.text }}
                >
                  {label}
                </button>
              )
            )}
            <button
              onClick={() => { setOpen(false); navigate('/contact'); }}
              className="w-full text-left py-2 text-base font-medium transition-colors"
              style={{ color: C.text }}
            >
              Contact
            </button>
          </div>
          <button
            onClick={() => { setOpen(false); navigate('/login'); }}
            className="w-full py-3.5 text-base font-semibold rounded-lg text-white text-center shadow-sm transition-all"
            style={{ background: C.primary }}
          >
            Login
          </button>
        </div>
      )}
    </header>
  );
};

export default PublicNavbar;
