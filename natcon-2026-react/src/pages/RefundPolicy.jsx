import React from 'react';
import { Info, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useConference } from '../context/ConferenceContext';
import { motion } from 'framer-motion';

const RefundPolicy = () => {
  const { conferenceData } = useConference();
  const { refundPolicy } = conferenceData.registration;

  return (
    <div className="min-h-screen bg-midnight text-primary pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <Link to="/" className="inline-flex items-center text-primary text-xs font-black uppercase tracking-widest mb-6 hover:text-accent transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
            Refund <span className="text-[#C8A96B] italic">Policy</span>
          </h1>
          <p className="text-xs font-bold text-primary/80 uppercase tracking-[4px] mt-2">
            Cancellation, refund eligibility and timeline guidelines for IAPHD NATCON 2026
          </p>
        </div>

        {/* Content Sheet */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-secondary shadow-[0_4px_20px_rgba(20,33,61,0.05)] border border-softgray p-8 md:p-12 rounded-sm space-y-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C8A96B]/5 rounded-bl-full pointer-events-none"></div>
          
          <div className="flex items-center space-x-6 mb-4 relative z-10">
            <div className="p-4 bg-[#C8A96B]/10 rounded-sm">
              <RefreshCw className="w-8 h-8 text-[#00A8CC]" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-primary">Refund Timeline</h3>
              <p className="text-[10px] font-bold text-primary/80 uppercase tracking-widest">Eligibility breakdown based on cancellation dates</p>
            </div>
          </div>
          
          {/* Timeline table/grid */}
          <div className="border border-softgray rounded-xl overflow-hidden relative z-10 bg-white">
            <div className="grid grid-cols-2 bg-slate-50 border-b border-softgray px-6 py-4 text-[10px] font-black uppercase tracking-[3px] text-primary/80">
              <span>Cancellation Date</span>
              <span className="text-right">Refund Eligibility</span>
            </div>
            <div className="divide-y divide-softgray">
              {refundPolicy.timeline.map((row, i) => (
                <div key={i} className="grid grid-cols-2 px-6 py-4 text-xs font-bold text-primary uppercase tracking-widest">
                  <span>{row.date}</span>
                  <span className="text-right text-[#C8A96B] font-black">{row.eligibility}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Terms List */}
          <div className="space-y-4 pt-6 border-t border-softgray relative z-10">
            <h4 className="text-xs font-black uppercase tracking-[3px] text-[#00A8CC]">Important Terms & Conditions:</h4>
            <ul className="space-y-3 pl-4 list-disc text-[10px] font-bold text-primary/80 uppercase tracking-widest leading-relaxed">
              {refundPolicy?.terms?.filter(t => t && t.trim() !== '').map((term, i) => (
                <li key={i} className="hover:text-primary transition-colors">
                  {term}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Warning Note */}
        <div className="mt-12 p-8 border border-softgray bg-softgray/30 rounded-sm flex items-start space-x-6">
          <AlertCircle className="w-8 h-8 text-[#C8A96B] shrink-0 mt-1" />
          <div className="space-y-2">
            <h5 className="text-xs font-black uppercase tracking-widest text-[#C8A96B]">Please Note</h5>
            <p className="text-[10px] font-medium text-primary/80 leading-relaxed tracking-wider uppercase">
              All registration cancellations must be formally requested in writing. Phone requests or oral communications will not be valid for determining the timeline slab of refund eligibility.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
