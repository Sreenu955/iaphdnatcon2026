import React from 'react';
import { motion } from 'framer-motion';
import { Building, Map, ArrowLeft, CheckCircle2, DollarSign, Layout, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useConference } from '../context/ConferenceContext';

const Trade = () => {
  const { tradeData } = useConference();

  return (
    <div className="min-h-screen bg-midnight text-primary pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-16">
          <Link to="/" className="inline-flex items-center text-primary text-xs font-black uppercase tracking-widest mb-6 hover:text-accent transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
          <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-4">
            Trade & <span className="text-[#00A8CC] italic">Sponsorship</span>
          </h1>
          <p className="text-primary/80 font-bold uppercase tracking-[4px] text-xs">Exhibition Layout & Branding Opportunities</p>
        </div>

        {/* Trade Layout Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-32">
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-8 flex items-center">
              <Layout className="w-8 h-8 text-[#00A8CC] mr-4" /> Exhibition Floor Plan
            </h2>
            <div className="aspect-video bg-secondary shadow-[0_4px_20px_rgba(20,33,61,0.05)] border border-softgray border border-softgray rounded-sm flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1582192730841-2a682d7375f9?auto=format&fit=crop&q=80&w=1200')] bg-cover opacity-20 group-hover:scale-110 transition-transform duration-1000"></div>
              <div className="relative text-center p-12">
                <Map className="w-20 h-20 text-[#00A8CC] mx-auto mb-6 opacity-50" />
                <p className="text-sm font-black uppercase tracking-widest text-primary/60 mb-6">Interactive Floor Plan Coming Soon</p>
                <a
                  href="https://iactacon2026.com/IACTACON%202026%20VIZAG_brochure.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-12 py-5 bg-[#C8A96B] text-white shadow-[0_4px_14px_rgba(200,169,107,0.25)] hover:bg-[#14213D] hover:text-[#00A8CC] hover:scale-105 transition-all duration-300 font-black uppercase tracking-widest text-[10px] inline-block"
                >
                  Download Layout PDF
                </a>
              </div>
            </div>
          </div>
          <div className="space-y-8">
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-8 flex items-center">
              <DollarSign className="w-8 h-8 text-[#00A8CC] mr-4" /> Sponsorship
            </h2>
            <div className="space-y-4">
              {tradeData.sponsorshipTiers.map((tier, i) => {
                const borderClass = tier.color || tier.borderColor || 'border-gray-400';
                return (
                  <div key={i} className={`p-6 bg-secondary shadow-[0_4px_20px_rgba(20,33,61,0.05)] border border-softgray border-l-4 ${borderClass} rounded-sm flex justify-between items-center group hover:bg-softgray/30 border border-softgray transition-colors cursor-pointer`}>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-primary">{tier.name}</h4>
                      <p className="text-[10px] font-bold text-primary/80 uppercase tracking-[2px] mt-1">Full Branding Pack</p>
                    </div>
                    <span className="text-[#00A8CC] font-black text-sm tracking-tighter group-hover:scale-110 transition-transform">{tier.price}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Trade Guidelines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start">
          <div className="space-y-8">
            <h3 className="text-3xl font-black uppercase tracking-tighter mb-8">Exhibitor Guidelines</h3>
            <ul className="space-y-6">
              {tradeData.exhibitorGuidelines.map((rule, i) => (
                <li key={i} className="flex items-start text-xs font-bold text-primary/80 uppercase tracking-widest leading-relaxed">
                  <CheckCircle2 className="w-5 h-5 text-[#00A8CC] mr-4 shrink-0" /> {rule}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-[#C8A96B]/5 border border-[#00A8CC]/20 p-12 rounded-sm space-y-8">
            <h3 className="text-3xl font-black uppercase tracking-tighter flex items-center">
              <FileText className="w-8 h-8 text-[#00A8CC] mr-4" /> Sponsorship Form
            </h3>
            <p className="text-primary/60 text-sm font-medium leading-relaxed">
              {tradeData.sponsorFormNote}
            </p>
            <div className="grid grid-cols-1 gap-4">
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="px-12 py-5 bg-[#C8A96B] text-white shadow-[0_4px_14px_rgba(200,169,107,0.25)] hover:bg-[#14213D] hover:text-[#00A8CC] hover:scale-105 transition-all duration-300 font-black uppercase tracking-widest text-[10px] inline-block"
              >
                Download Brochure
              </a>
              <Link
                to="/registration-form"
                className="w-full py-5 border border-softgray text-white bg-primary font-black uppercase tracking-widest text-[10px] hover:bg-[#C8A96B]/100 border border-softgray transition-all text-center"
              >
                Online Booking Portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trade;

