import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users,
  Share2,
  Calendar,
  BarChart3,
  Menu,
  X,
  Network,
  TrendingUp,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Star,
  ChevronLeft,
  ChevronRight,
  Quote,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';

interface LandingPageProps {}

// ─── Design Tokens (Modern SaaS V3) ──────────────────────────────────────────
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

// ─── Utility ──────────────────────────────────────────────────────────────
const scrollToSection = (id: string, e?: React.MouseEvent) => {
  e?.preventDefault();
  const element = document.getElementById(id);
  if (element) {
    const y = element.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
};

// ─── Navbar ────────────────────────────────────────────────────────────────
const Navbar: React.FC<{ user?: any }> = ({ user }) => {
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
      scrollToSection(id);
    }
    setOpen(false);
  };

  const Logo = () => (
    <div className="flex items-center gap-3 select-none cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center font-black italic text-white text-lg shadow-sm"
        style={{ background: C.primary }}
      >
        X
      </div>
      <div className="leading-tight">
        <span className="block font-bold text-base tracking-tight" style={{ color: scrolled ? '#FFFFFF' : C.text }}>XOON</span>
        <span className="block text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: scrolled ? '#CBD5E1' : C.muted }}>
          Enterprise Hub
        </span>
      </div>
    </div>
  );

  const MenuLink: React.FC<{ href: string; children: React.ReactNode; onClick?: () => void; isScrolled?: boolean }> = ({ href, children, onClick, isScrolled }) => (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        const id = href.substring(1); // Remove '#'
        handleNavClick(id);
        onClick?.();
      }}
      className="text-sm font-medium transition-colors"
      style={{ color: isScrolled ? '#FFFFFF' : C.text }}
    >
      {children}
    </a>
  );

  const CTAButton: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string }> = ({ onClick, children, className }) => (
    <button
      onClick={onClick}
      className={`px-6 py-2.5 text-sm font-semibold rounded-lg text-white transition-all shadow-sm bg-indigo-600 hover:bg-indigo-700 ${className}`}
    >
      {children}
    </button>
  );

  return (
    <header
      style={{
        background: scrolled ? 'rgba(15, 23, 42, 0.98)' : 'transparent',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
      }}
      className="fixed inset-x-0 top-0 z-50 transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between">
        <Logo />

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-8">
          <MenuLink href="#features" isScrolled={scrolled}>Features</MenuLink>
          <MenuLink href="#network" isScrolled={scrolled}>Network</MenuLink>
          <button 
            onClick={() => navigate('/contact')}
            className="text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: scrolled ? '#FFFFFF' : C.text }}
          >
            Contact
          </button>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center">
          <CTAButton onClick={() => navigate('/login')}>Login</CTAButton>
        </div>

        {/* Mobile Burger */}
        <button
          className="md:hidden p-2 rounded-lg transition-colors"
          style={{ color: scrolled || open ? '#FFFFFF' : C.text }}
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-slate-950 p-6 flex flex-col space-y-4 border-t border-white/10 animate-in slide-in-from-top duration-300 z-50">
          <MenuLink href="#features" onClick={() => setOpen(false)} isScrolled={true}>Features</MenuLink>
          <MenuLink href="#network" onClick={() => setOpen(false)} isScrolled={true}>Network</MenuLink>
          <button 
            onClick={() => { setOpen(false); navigate('/contact'); }}
            className="text-sm font-medium transition-colors text-white text-left px-0"
          >
            Contact
          </button>
          <div className="pt-4 border-t border-white/10">
            <CTAButton onClick={() => { setOpen(false); navigate('/login'); }} className="w-full">
              Login
            </CTAButton>
          </div>
        </div>
      )}
    </header>
  );
};

// ─── Hero ──────────────────────────────────────────────────────────────────
const Hero: React.FC<{ user?: any }> = ({ user }) => {
  const navigate = useNavigate();
  return (
  <section 
    className="min-h-[85vh] flex items-center relative overflow-hidden" 
    style={{ paddingTop: '72px', background: C.bg }}
  >
    {/* Subtle radial gradient background */}
    <div 
      className="absolute inset-0 pointer-events-none" 
      style={{
        background: `radial-gradient(circle at 50% 0%, rgba(37, 99, 235, 0.06) 0%, rgba(248, 250, 252, 1) 70%)`
      }}
    />

    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 lg:py-32 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center relative z-10">
      {/* Left */}
      <div className="max-w-xl">
        <h1
          className="text-4xl md:text-5xl lg:text-[56px] font-bold tracking-tight leading-[1.12] mb-6"
          style={{ color: C.text }}
        >
          Business Referral<br />
          <span style={{ color: C.primary }}>Network</span>
        </h1>

        <p className="text-lg md:text-xl font-normal mb-8 leading-relaxed" style={{ color: C.muted }}>
          Connect with professionals and grow through trusted referrals.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-4 rounded-xl text-base font-semibold text-white transition-all shadow-sm flex items-center justify-center"
            style={{ background: C.primary }}
            onMouseEnter={e => { 
              (e.currentTarget as HTMLElement).style.background = C.primaryHover; 
              (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 15px -3px rgba(37, 99, 235, 0.2)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => { 
              (e.currentTarget as HTMLElement).style.background = C.primary; 
              (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            }}
          >
            Join Network
          </button>
        </div>

        {/* Small trusted avatar stack */}
        <div className="flex items-center gap-4">
          <div className="flex -space-x-4">
            {[ 
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces&q=80",
              "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces&q=80",
              "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces&q=80",
              "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces&q=80"
            ].map((src, i) => (
              <img 
                key={i} 
                src={src} 
                className="w-12 h-12 rounded-full border-[3px] object-cover" 
                style={{ borderColor: C.bg }}
                alt="Member" 
                loading="lazy" 
              />
            ))}
          </div>
          <p className="text-sm font-medium" style={{ color: C.muted }}>
            Trusted by <strong style={{color: C.text}}>500+</strong> business owners
          </p>
        </div>
      </div>

      {/* Right — Real Photography */}
      <div 
        className="relative rounded-2xl overflow-hidden border border-gray-200 transition-transform duration-500 hover:scale-[1.01]" 
        style={{ background: C.cardBg, boxShadow: '0 20px 40px -12px rgba(0,0,0,0.08)' }}
      >
        {/* Switching this Unsplash to another high-quality meeting setting just for variety of the visual hierarchy, it perfectly represents Business professionals collaborating */}
        <img 
          src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" 
          alt="Business professionals networking at a meeting" 
          className="w-full h-auto object-cover aspect-[4/3]"
          loading="eager"
        />
      </div>
    </div>
  </section>
  );
};

// ─── Features ──────────────────────────────────────────────────────────────
const Features: React.FC = () => {
  const cards = [
    {
      icon: Users,
      title: 'Member Directory',
      desc: 'Connect with verified business members.',
      iconColor: '#2563EB',
      bgColor: 'rgba(37, 99, 235, 0.1)',
    },
    {
      icon: Share2,
      title: 'Referral System',
      desc: 'Send, receive, and track business referrals.',
      iconColor: '#14B8A6',
      bgColor: 'rgba(20, 184, 166, 0.1)',
    },
    {
      icon: Calendar,
      title: 'Meetings',
      desc: 'Schedule and manage networking meetings.',
      iconColor: '#7C3AED',
      bgColor: 'rgba(124, 58, 237, 0.1)',
    },
    {
      icon: BarChart3,
      title: 'Dashboard',
      desc: 'Monitor referrals, activity, and growth.',
      iconColor: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.1)',
    },
  ];

  return (
    <section id="features" style={{ background: '#FFFFFF' }} className="py-16 md:py-24 px-6 border-y border-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-5" style={{ color: C.text }}>
            Powerful Networking Features
          </h2>
          <p className="text-lg md:text-xl leading-relaxed" style={{ color: C.muted }}>
            Tools designed to help professionals connect, share referrals, and grow their businesses.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {cards.map(({ icon: Icon, title, desc, iconColor, bgColor }) => (
            <div
              key={title}
              className="group p-10 transition-all duration-500 bg-white border border-gray-100 hover:border-transparent"
              style={{ 
                borderRadius: '24px', 
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)' 
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-12px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 25px 50px -12px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)';
              }}
            >
              {/* Icon Circle */}
              <div 
                className="mb-8 h-16 w-16 rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-110" 
                style={{ background: bgColor }}
              >
                 <Icon size={32} color={iconColor} strokeWidth={1.5} />
              </div>

              {/* Text Content */}
              <h3 className="text-[22px] font-bold mb-4 tracking-tight" style={{ color: C.text }}>
                {title}
              </h3>
              <p className="text-[16px] leading-relaxed font-medium" style={{ color: C.muted }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Community / Network Section ───────────────────────────────────────────
const CommunitySection: React.FC = () => (
  <section id="network" style={{ background: C.bg }} className="py-16 md:py-24 px-6 border-b border-gray-100">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left: Photos collage */}
        <div className="relative grid grid-cols-2 gap-4">
          <img 
            src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
            alt="Professionals in meeting" 
            className="w-full h-[280px] object-cover rounded-2xl mt-8 border border-gray-200 shadow-sm transition-transform duration-500 hover:scale-[1.02]"
            loading="lazy"
          />
          <img 
            src="https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
            alt="Team collaborating" 
            className="w-full h-[280px] object-cover rounded-2xl border border-gray-200 shadow-sm transition-transform duration-500 hover:scale-[1.02]"
            loading="lazy"
          />
        </div>

        {/* Right: Copy */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-4" style={{ color: C.text }}>
            A trusted business network
          </h2>
          <p className="text-lg mb-8" style={{ color: C.muted }}>
            Members collaborate, exchange referrals, and grow their businesses together.
          </p>
          <ul className="space-y-4">
            {[
              "Verified business members",
              "Structured referral exchange",
              "Track networking results"
            ].map((text, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: C.accent }}></div>
                <span className="text-base font-medium" style={{ color: C.text }}>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </section>
);

// ─── How It Works ──────────────────────────────────────────────────────────
const HowItWorks: React.FC = () => {
  const steps = [
    { 
      icon: Network,   
      num: '01', 
      title: 'Join the Network', 
      desc: 'Create your professional profile and become part of the business network.',
      accent: '#2563EB',
      gradient: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)'
    },
    { 
      icon: Users,     
      num: '02', 
      title: 'Connect with Members', 
      desc: 'Discover and connect with verified professionals in the community.',
      accent: '#14B8A6',
      gradient: 'linear-gradient(135deg, #14B8A6 0%, #2DD4BF 100%)'
    },
    { 
      icon: Share2,    
      num: '03', 
      title: 'Share Referrals', 
      desc: 'Exchange trusted business referrals with your network.',
      accent: '#7C3AED',
      gradient: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)'
    },
    { 
      icon: TrendingUp, 
      num: '04', 
      title: 'Grow Your Business', 
      desc: 'Track results and build long-term business relationships.',
      accent: '#F59E0B',
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #FB923C 100%)'
    },
  ];

  return (
    <section id="how-it-works" style={{ background: '#F8FAFC' }} className="py-20 md:py-40 px-6 border-b border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto relative">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-28">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-5" style={{ color: C.text }}>
            How the Xoon Network Works
          </h2>
          <p className="text-lg md:text-xl leading-relaxed" style={{ color: C.muted }}>
            A simple process to connect, refer, and grow your business through trusted networking.
          </p>
        </div>

        {/* Process Flow Container */}
        <div className="relative">
          
          {/* Connecting Line (Desktop Only) */}
          <div className="hidden lg:block absolute top-[66px] left-[15%] right-[15%] h-[1px] bg-slate-200 z-0">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-8 relative z-10">
            {steps.map(({ icon: Icon, num, title, desc, accent, gradient }) => (
              <div 
                key={title} 
                className="group flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-1.5"
              >
                {/* Step Marker / Icon */}
                <div className="relative mb-10">
                  <div 
                    className="h-[132px] w-[132px] rounded-[32px] flex items-center justify-center transition-all duration-500 bg-white border border-slate-100 shadow-sm group-hover:shadow-2xl relative z-10"
                    style={{
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      background: 'rgba(255, 255, 255, 0.9)'
                    }}
                  >
                    <div 
                      className="absolute inset-0 rounded-[32px] opacity-0 group-hover:opacity-5 transition-opacity duration-500"
                      style={{ background: gradient }}
                    />
                    <Icon size={44} style={{ color: accent }} strokeWidth={1.5} className="transition-all duration-500 group-hover:scale-110 group-hover:brightness-110" />
                  </div>
                  
                  {/* Step Number Badge */}
                  <div 
                    className="absolute -top-3 left-1/2 -translate-x-1/2 h-8 w-14 rounded-full flex items-center justify-center text-white text-[12px] font-black shadow-md z-20 border-2 border-white transition-all duration-500 group-hover:scale-110 group-hover:-top-4"
                    style={{ background: accent }}
                  >
                    {num}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold mb-4 tracking-tight px-4" style={{ color: C.text }}>
                  {title}
                </h3>
                <p className="text-[15px] leading-relaxed font-medium px-4 max-w-[260px] mx-auto" style={{ color: C.muted }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

// ─── Testimonials ──────────────────────────────────────────────────────────
const Testimonials: React.FC = () => {
  const reviews = [
    {
      name: 'Alex Morgan',
      role: 'Digital Marketing Consultant',
      image: 'https://i.pravatar.cc/150?u=alex',
      text: '"This referral network helped me connect with professionals and generate valuable business opportunities."',
      stars: 5,
    },
    {
      name: 'Daniel Foster',
      role: 'Startup Advisor',
      image: 'https://i.pravatar.cc/150?u=daniel',
      text: '"The referral system is simple and effective. Our professional network has grown significantly."',
      stars: 4,
    },
    {
      name: 'Kavya Nair',
      role: 'Business Strategist',
      image: 'https://i.pravatar.cc/150?u=kavya',
      text: '"A powerful platform for professionals who want to build meaningful business relationships."',
      stars: 5,
    },
    {
      name: 'Ryan Matthews',
      role: 'Financial Consultant',
      image: 'https://i.pravatar.cc/150?u=ryan',
      text: '"The structured referral exchange has helped our company reach new clients."',
      stars: 4,
    },
    {
      name: 'Aditi Mehta',
      role: 'Real Estate Consultant',
      image: 'https://i.pravatar.cc/150?u=aditi',
      text: '"This platform makes networking easier and more productive."',
      stars: 5,
    },
    {
      name: 'Michael Carter',
      role: 'IT Solutions Architect',
      image: 'https://i.pravatar.cc/150?u=michael',
      text: '"A great way to build partnerships and expand professional connections."',
      stars: 4,
    },
  ];

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setItemsPerPage(1);
      else if (window.innerWidth < 1024) setItemsPerPage(2);
      else setItemsPerPage(3);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      if (scrollWidth > clientWidth) {
        const progress = (scrollLeft / (scrollWidth - clientWidth)) * 100;
        setScrollProgress(progress);
      }
    }
  };

  const slide = (direction: 'next' | 'prev') => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.offsetWidth / itemsPerPage;
      const scrollAmount = direction === 'next' ? cardWidth : -cardWidth;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section id="testimonials" style={{ background: '#FFFFFF' }} className="py-20 md:py-32 px-6 border-b border-gray-100">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="mb-20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-5" style={{ color: C.text }}>
              What Our Members Say
            </h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <p className="text-[16px] md:text-xl leading-relaxed" style={{ color: C.muted }}>
                Hear directly from professionals growing their business through trusted referrals.
              </p>
              
              {/* Desktop Navigation Arrows - Integrated with Header */}
              <div className="hidden md:flex gap-3 ml-4">
                <button 
                  onClick={() => slide('prev')}
                  className="h-10 w-10 rounded-full border border-gray-100 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-400 hover:text-blue-600 shadow-sm transition-all"
                  aria-label="Previous slide"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => slide('next')}
                  className="h-10 w-10 rounded-full border border-gray-100 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-400 hover:text-blue-600 shadow-sm transition-all"
                  aria-label="Next slide"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative group">
          {/* Cards Scroll Area */}
          <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory no-scrollbar"
            style={{ 
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {reviews.map((review, idx) => (
              <div 
                key={idx} 
                className="flex-shrink-0 snap-center"
                style={{ width: `calc(${100 / itemsPerPage}% - ${((itemsPerPage - 1) * 24) / itemsPerPage}px)` }}
              >
                <div className="h-full p-6 bg-white border border-gray-100 rounded-[28px] shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-1.5 group/card">
                  <div className="mb-5 flex justify-between items-start">
                    <div className="p-2.5 bg-blue-50/50 rounded-xl">
                      <Quote size={20} className="text-blue-600 opacity-60" fill="currentColor" />
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={12} 
                          fill={i < review.stars ? "#F59E0B" : "none"} 
                          color={i < review.stars ? "#F59E0B" : "#E2E8F0"} 
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-[15px] leading-relaxed mb-6 italic font-medium" style={{ color: C.text }}>
                    {review.text}
                  </p>

                  <div className="h-[1px] w-full bg-gray-50 mb-6" />

                  <div className="flex items-center gap-3">
                    <img 
                      src={review.image} 
                      alt={review.name} 
                      className="w-11 h-11 rounded-full object-cover border-2 border-white ring-1 ring-gray-100 shadow-sm"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${review.name}&background=random`; }}
                    />
                    <div className="text-left leading-tight">
                      <h4 className="font-bold text-[15px]" style={{ color: C.text }}>{review.name}</h4>
                      <p className="text-[12.5px] font-medium" style={{ color: C.muted }}>{review.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Multi-Step Progress Bar */}
        <div className="mt-12 flex flex-col items-center">
          {/* Progress Indicator Track */}
          <div className="w-[12%] min-w-[100px] h-[4px] bg-gray-100 rounded-full overflow-hidden relative">
            <div 
              className="absolute top-0 bottom-0 bg-blue-600 rounded-full transition-all duration-150 ease-out"
              style={{ 
                left: `${scrollProgress * 0.65}%`, // Offset thumb position to keep it within track
                width: '35%',
                background: C.primary
              }}
            />
          </div>
          
          {/* Mobile Arrows (Positioned below header on small screens) */}
          <div className="flex md:hidden gap-6 mt-10">
            <button 
              onClick={() => slide('prev')} 
              className="h-11 w-11 rounded-full border border-gray-100 bg-white shadow-sm flex items-center justify-center text-gray-400 active:text-blue-600 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => slide('next')} 
              className="h-11 w-11 rounded-full border border-gray-100 bg-white shadow-sm flex items-center justify-center text-gray-400 active:text-blue-600 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

// ─── Stats ─────────────────────────────────────────────────────────────────
const Stats: React.FC = () => {
  const stats = [
    { icon: Users,      value: '500+',   label: 'Members' },
    { icon: Share2,     value: '3,000+', label: 'Referrals Shared' },
    { icon: Calendar,   value: '50+',    label: 'Meetings Conducted' },
    { icon: TrendingUp, value: '1,200+', label: 'Businesses Connected' },
  ];

  return (
    <section style={{ background: C.bg }} className="py-24 px-6 border-b border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div 
          className="rounded-2xl py-12 px-6 sm:px-12 transition-all duration-300"
          style={{ background: '#1E293B', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-12 sm:gap-y-0 divide-y sm:divide-y-0 sm:divide-x divide-slate-600/50">
            {stats.map(({ icon: Icon, value, label }) => (
              <div 
                key={label} 
                className="flex flex-col items-center justify-center text-center group transition-all duration-300 py-6 sm:py-0"
              >
                <div className="mb-5 text-slate-300 group-hover:text-white transition-colors duration-300">
                  <Icon size={30} strokeWidth={1.5} />
                </div>
                <p className="text-[48px] leading-none mb-3 font-bold tracking-tight text-white transition-opacity duration-300 group-hover:opacity-100 opacity-95">{value}</p>
                <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-slate-400 group-hover:text-slate-300 transition-colors duration-300">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};


// ─── Footer ────────────────────────────────────────────────────────────────
const Footer: React.FC = () => {
  const navigate = useNavigate();
  return (
    <footer id="footer" style={{ background: '#020617', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '70px', paddingBottom: '50px', marginTop: '60px' }} className="px-6">
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
                  onClick={() => link.path.startsWith('/#') ? scrollToSection(link.path.substring(2)) : navigate(link.path)}
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

// ─── Main Landing Page App Flow Wrapper ────────────────────────────────────────
const LandingPage: React.FC<{ user?: any }> = ({ user }) => {
  useEffect(() => {
    // Handle hash scroll on load
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      setTimeout(() => scrollToSection(id), 100);
    }
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: C.bg, fontFamily: "'Inter', 'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <Navbar user={user} />
      <Hero user={user} />
      <Features />
      <CommunitySection />
      <HowItWorks />
      <Testimonials />
      <Stats />
      <Footer />
    </div>
  );
};

export default LandingPage;
