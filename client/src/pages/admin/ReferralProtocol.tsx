
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  RefreshCcw, 
  ShieldAlert, 
  ArrowUpRight, 
  CheckCircle2,
  FileText
} from 'lucide-react';

const ReferralProtocol: React.FC = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: "How referrals are submitted",
      icon: ArrowUpRight,
      desc: "Process",
      content: "All referrals must be submitted through the centralized platform registry to ensure tracking and commission attribution. Handshake deals outside the system are not recognized by the network governance.",
      color: "text-indigo-600",
      bg: "bg-indigo-50"
    },
    {
      title: "Deal ownership rules",
      icon: CheckCircle2,
      desc: "Ownership",
      content: "The original referrer maintains visibility throughout the deal lifecycle. If a deal is passed to multiple parties, the first registered node path remains the primary beneficiary for commission realization.",
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      title: "Chapter involvement",
      icon: BookOpen,
      desc: "Structure",
      content: "Chapter Leads must verify the integrity of high-value deals within their region. They may act as mediators if disputes arise regarding deal fulfillment or service quality.",
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Meeting scheduling process",
      icon: Clock,
      desc: "Timeline",
      content: "Once a referral is accepted, a meeting must be scheduled within 72 hours. Verification of the meeting must be logged on the platform to move the deal to the 'Meeting Scheduled' status.",
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      title: "Conversion rules",
      icon: RefreshCcw,
      desc: "Velocity",
      content: "A referral is considered 'Converted' when a formal service agreement or invoice is issued. The recipient node is responsible for updating this state and attaching the digital proof if required.",
      color: "text-violet-600",
      bg: "bg-violet-50"
    },
    {
      title: "Reporting violations",
      icon: ShieldAlert,
      desc: "Security",
      content: "Any attempts to bypass the protocol or engage in collaborative trust gaming will lead to immediate node suspension. Report inconsistencies directly to the network admin through the support portal.",
      color: "text-rose-600",
      bg: "bg-rose-50"
    }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-[1300px] mx-auto p-6 md:p-12 space-y-16">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Referral Protocol</h1>
          <p className="text-slate-500 font-medium mt-3 text-lg leading-relaxed">
            Guidelines explaining how referrals and deal flows should work inside the network. These protocols ensure transparency, fairness, and systematic value exchange.
          </p>
        </div>
        <div className="w-16 h-16 bg-slate-950 text-white rounded-full flex items-center justify-center shadow-2xl flex-shrink-0">
          <FileText className="w-8 h-8" />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sections.map((section, i) => (
          <div key={i} className="bg-white p-6 rounded-[16px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group flex flex-col h-full">
             <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 ${section.bg} ${section.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <section.icon className="w-6 h-6" />
                </div>
                <div>
                   <p className="text-[10px] font-black tracking-widest uppercase opacity-40">{section.desc}</p>
                   <h4 className="font-black text-slate-950 text-sm tracking-tight">{section.title}</h4>
                </div>
             </div>
             <p className="text-sm text-slate-500 font-medium leading-relaxed italic">{section.content}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-[2.5rem] p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/20 rounded-full -mr-40 -mt-40 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
          <div className="max-w-xl">
            <h3 className="text-3xl font-black mb-4 tracking-tight">Systematic Compliance</h3>
            <p className="text-slate-400 font-medium leading-relaxed">These rules are enforced systematically by our deal graph analyzer. Deviation from the protocol triggers an automatic integrity review by the chapter leadership.</p>
          </div>
          <button 
            onClick={() => navigate('/admin/referrals')}
            className="px-10 py-4 bg-white text-slate-950 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all active:scale-95 shadow-xl flex-shrink-0 uppercase tracking-widest"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReferralProtocol;
