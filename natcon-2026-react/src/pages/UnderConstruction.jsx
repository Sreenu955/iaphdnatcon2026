import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Hammer, Clock, ArrowLeft, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

const UnderConstruction = ({ pageName = "This Page" }) => {
  return (
    <div className="min-h-screen bg-midnight text-primary pt-32 pb-20 font-sans flex items-center justify-center relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C8A96B]/5 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00A8CC]/5 rounded-full blur-[120px] pointer-events-none animate-pulse duration-5000"></div>

      <div className="max-w-xl mx-auto px-4 text-center relative z-10 space-y-8">
        {/* Floating Animation Graphic */}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="mx-auto w-24 h-24 bg-secondary border border-softgray rounded-3xl flex items-center justify-center shadow-xl relative"
        >
          <Hammer className="w-10 h-10 text-[#C8A96B]" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -top-2 -right-2 p-1.5 bg-slate-900 border border-[#00A8CC]/30 rounded-xl"
          >
            <Clock className="w-4 h-4 text-[#00A8CC]" />
          </motion.div>
        </motion.div>

        {/* Text Details */}
        <div className="space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#C8A96B]/10 text-[#C8A96B] rounded-full text-[9px] font-black uppercase tracking-widest border border-[#C8A96B]/20">
            <ShieldAlert className="w-3.5 h-3.5" /> Coming Soon
          </span>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-primary leading-tight">
            Under <span className="text-[#00A8CC] italic">Construction</span>
          </h1>
          <p className="text-[11px] font-black uppercase tracking-[3px] text-[#C8A96B]">
            Section: {pageName}
          </p>
          <p className="text-xs text-primary/60 font-bold uppercase tracking-wider max-w-sm mx-auto leading-relaxed">
            The organizing committee is finalizing schedules & resources for this segment. Please check back shortly as live updates are deployed dynamically!
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-8 py-4 bg-[#C8A96B] hover:bg-[#14213D] text-white hover:text-accent font-black uppercase text-[10px] tracking-widest transition-all rounded-sm shadow-[0_4px_15px_rgba(200,169,107,0.25)] hover:scale-105"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-2" /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnderConstruction;
