import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Users, Clock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useConference } from '../context/ConferenceContext';

const Workshops = () => {
  const { workshopsList } = useConference();

  return (
    <div className="min-h-screen bg-midnight text-primary pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-16">
          <Link to="/" className="inline-flex items-center text-primary text-xs font-black uppercase tracking-widest mb-6 hover:text-accent transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
          <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-4">
            Preconference <span className="text-[#00A8CC] italic">Workshops</span>
          </h1>
          <p className="text-primary/80 font-bold uppercase tracking-[4px] text-xs">November 26, 2026 - Masterclasses for Excellence</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {workshopsList.map((ws, i) => (
            <motion.div 
              key={ws.id || i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-secondary shadow-[0_4px_20px_rgba(20,33,61,0.05)] border border-softgray border border-softgray p-8 rounded-sm hover:border-[#00A8CC]/50 transition-all flex flex-col group"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="p-4 bg-[#C8A96B]/10 rounded-sm">
                  <Brain className="w-8 h-8 text-[#00A8CC]" />
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-black uppercase text-primary/80 tracking-widest">Fees</span>
                  <span className="block text-2xl font-black text-[#00A8CC] tracking-tighter">{ws.price}</span>
                </div>
              </div>

              <h3 className="text-xl font-black uppercase tracking-tighter text-primary mb-4 group-hover:text-accent transition-colors">{ws.title}</h3>
              <p className="text-primary/80 text-xs font-medium leading-relaxed mb-8 flex-1">{ws.desc || ws.description}</p>
              
              <div className="space-y-4 mb-8 pt-8 border-t border-softgray">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-primary/80 flex items-center"><Users className="w-3 h-3 mr-2 text-[#00A8CC]" /> Mentor</span>
                  <span className="text-primary">{ws.mentor}</span>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-primary/80 flex items-center"><Clock className="w-3 h-3 mr-2 text-[#00A8CC]" /> Duration</span>
                  <span className="text-primary">{ws.time}</span>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-primary/80 flex items-center"><CheckCircle2 className="w-3 h-3 mr-2 text-[#00A8CC]" /> Capacity</span>
                  <span className="text-primary">{ws.seats} Seats</span>
                </div>
              </div>

              <Link to="/registration-form" className="w-full py-4 bg-[#C8A96B] text-white font-black uppercase text-[10px] tracking-widest hover:bg-[#14213D] hover:text-accent transition-all text-center rounded-sm">
                Book Workshop
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 bg-[#C8A96B]/5 border border-[#00A8CC]/20 p-8 rounded-sm flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-[10px] font-black uppercase tracking-[4px] text-primary/60">
            * Delegates can choose multiple workshops if timings do not overlap.
          </p>
          <Link to="/registration-form" className="px-10 py-4 bg-[#C8A96B] text-white shadow-[0_4px_14px_rgba(200,169,107,0.25)] hover:bg-[#14213D] hover:text-[#00A8CC] hover:scale-105 transition-all duration-300 font-black uppercase text-[10px] tracking-widest">
            Proceed to Registration
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Workshops;

