import React from 'react';
import { useConference } from '../context/ConferenceContext';
import { motion } from 'framer-motion';
import { Send, ArrowLeft, Info, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const AbstractGuidelines = () => {
  const { abstractGuidelines } = useConference();

  return (
    <div className="min-h-screen bg-midnight text-primary pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center md:text-left">
          <Link to="/" className="inline-flex items-center text-primary text-xs font-black uppercase tracking-widest mb-6 hover:text-accent transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
          <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-4">
            Abstract <span className="text-[#00A8CC] italic">Guidelines</span>
          </h1>
          <p className="text-primary/80 font-bold uppercase tracking-[4px] text-xs">Formatting Rules & Submission Instructions</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-10"
        >
          {/* Heading card */}
          <div className="bg-secondary shadow-[0_4px_20px_rgba(20,33,61,0.05)] border border-softgray p-10 md:p-16 rounded-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#C8A96B]/5 rounded-bl-full pointer-events-none" />
            <div className="relative z-10 max-w-3xl">
              <span className="text-[#00A8CC] font-black uppercase tracking-[6px] text-xs mb-4 block">Guidelines</span>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-primary mb-6">
                {abstractGuidelines.heading}
              </h2>
              <p className="text-primary/60 text-sm leading-relaxed font-medium">
                {abstractGuidelines.intro}
              </p>
            </div>
          </div>

          {/* Rules grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {abstractGuidelines.rules.map((rule, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start space-x-4 bg-secondary shadow-[0_4px_20px_rgba(20,33,61,0.05)] border border-softgray hover:border-accent/30 p-6 rounded-sm transition-all group"
              >
                <div className="w-8 h-8 shrink-0 bg-[#C8A96B]/10 rounded-sm flex items-center justify-center border border-[#00A8CC]/20 group-hover:bg-[#C8A96B]/20 transition-colors">
                  <span className="text-[#00A8CC] font-black text-xs">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <p className="text-sm font-medium text-primary/80 leading-relaxed">{rule}</p>
              </motion.div>
            ))}
          </div>

          {/* Deadline & contact badges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#C8A96B]/10 border border-[#00A8CC]/20 p-6 rounded-sm flex items-start space-x-4">
              <Clock className="w-8 h-8 text-[#00A8CC] shrink-0 mt-0.5" />
              <div>
                <h5 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Submission Deadline</h5>
                <p className="text-sm font-bold text-[#00A8CC]">{abstractGuidelines.deadline}</p>
              </div>
            </div>
            <div className="bg-softgray/30 border border-softgray p-6 rounded-sm flex items-start space-x-4">
              <Info className="w-8 h-8 text-primary/60 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Need Help?</h5>
                <p className="text-xs font-medium text-primary/60 leading-relaxed">{abstractGuidelines.contactNote}</p>
              </div>
            </div>
          </div>

          {/* CTA to portal */}
          <div className="text-center">
            <Link
              to="/submissions"
              className="inline-flex items-center space-x-3 bg-[#C8A96B] text-white shadow-[0_4px_14px_rgba(200,169,107,0.25)] hover:bg-[#14213D] hover:text-[#00A8CC] hover:scale-105 transition-all px-10 py-5 rounded-full font-black uppercase tracking-widest text-xs shadow-xl"
            >
              <span>Proceed to Submission Portal</span>
              <Send className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AbstractGuidelines;
