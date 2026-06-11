import React from 'react';
import { Info, ArrowLeft, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useConference } from '../context/ConferenceContext';
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
  const { privacyPolicy } = useConference();

  return (
    <div className="min-h-screen bg-midnight text-primary pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <Link to="/" className="inline-flex items-center text-primary text-xs font-black uppercase tracking-widest mb-6 hover:text-accent transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
            Privacy <span className="text-[#00A8CC] italic">Policy</span>
          </h1>
          <p className="text-xs font-bold text-primary/80 uppercase tracking-[4px] mt-2">
            Data protection and privacy guidelines for IAPHD NATCON 2026
          </p>
        </div>

        {/* Content Sheet */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-secondary shadow-[0_4px_20px_rgba(20,33,61,0.05)] border border-softgray border border-softgray p-8 md:p-12 rounded-sm space-y-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C8A96B]/5 rounded-bl-full pointer-events-none"></div>
          
          <div className="flex items-center space-x-6 mb-4 relative z-10">
            <div className="p-4 bg-[#C8A96B]/10 rounded-sm">
              <Info className="w-8 h-8 text-[#00A8CC]" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-primary">Data Security</h3>
              <p className="text-[10px] font-bold text-primary/80 uppercase tracking-widest">Active policies managed live from the admin portal</p>
            </div>
          </div>
          
          <div 
            className="text-xs md:text-sm text-primary/80 font-black leading-relaxed uppercase tracking-widest border-l-2 border-[#00A8CC]/50 pl-6 py-2 relative z-10 space-y-4"
            dangerouslySetInnerHTML={{ __html: privacyPolicy }}
          />
        </motion.div>

        {/* Encryption Protection Card */}
        <div className="mt-12 p-8 border border-softgray bg-softgray/30 border border-softgray rounded-sm flex items-start space-x-6">
          <Shield className="w-8 h-8 text-primary/60 shrink-0 mt-1" />
          <div className="space-y-2">
            <h5 className="text-xs font-black uppercase tracking-widest text-primary/60">Strict Data Protection</h5>
            <p className="text-[10px] font-medium text-primary/80 leading-relaxed tracking-wider uppercase">
              All transactions and profile uploads are secured with high-grade industry encryption standards. No financial data or personal files are shared outside of official verification requirements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

