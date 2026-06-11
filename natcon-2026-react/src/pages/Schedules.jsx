import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, ArrowLeft, Download, Coffee, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useConference } from '../context/ConferenceContext';

const Schedules = () => {
  const [activeDay, setActiveDay] = useState(1);
  const { schedules } = useConference();

  // Filter and map the MySQL relational schedules to match component expectations
  const activeSchedules = (schedules || [])
    .filter(item => Number(item.dayNumber) === activeDay)
    .map(item => {
      const isBreak = /break|tea|lunch|welcome kit/i.test(item.title || '');
      return {
        time: item.timeSlot,
        event: item.title,
        speaker: item.speaker || '',
        location: item.venue || 'ANIDS Campus',
        type: isBreak ? 'break' : 'session'
      };
    });

  return (
    <div className="min-h-screen bg-midnight text-primary pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-16">
          <Link to="/" className="inline-flex items-center text-primary text-xs font-black uppercase tracking-widest mb-6 hover:text-accent transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
          <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-4">
            Event <span className="text-[#00A8CC] italic">Schedules</span>
          </h1>
          <p className="text-primary/80 font-bold uppercase tracking-[4px] text-xs">November 27-29, 2026 - Tentative Program</p>
        </div>

        {/* Day Toggle */}
        <div className="flex space-x-4 mb-16">
          {[1, 2, 3].map(day => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`flex-1 py-6 border-b-4 transition-all text-sm font-black uppercase tracking-widest ${activeDay === day ? 'bg-[#C8A96B]/10 border-[#00A8CC] text-primary shadow-xl' : 'bg-secondary shadow-[0_4px_20px_rgba(20,33,61,0.05)] border border-softgray border-softgray text-primary/80 hover:text-accent'
                }`}
            >
              Day 0{day} <span className="block text-[10px] font-bold text-primary/60 mt-1 italic uppercase tracking-[2px]">Nov {26 + day}</span>
            </button>
          ))}
        </div>

        {/* Schedule List */}
        <div className="space-y-4">
          {activeSchedules.map((item, i) => (
            <motion.div
              key={`${activeDay}-${i}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-8 rounded-sm flex flex-col md:flex-row items-center gap-8 ${item.type === 'break' ? 'bg-[#C8A96B]/5 border border-[#00A8CC]/20 italic' : 'bg-secondary shadow-[0_4px_20px_rgba(20,33,61,0.05)] border border-softgray border border-softgray hover:border-[#00A8CC]/50'
                } transition-colors`}
            >
              <div className="w-full md:w-32 flex flex-col items-center justify-center shrink-0">
                <Clock className="w-6 h-6 text-[#00A8CC] mb-2" />
                <span className="text-sm font-black text-primary">{item.time}</span>
              </div>
              <div className="flex-1 text-center md:text-left">
                {item.type === 'break' ? (
                  <div className="flex items-center justify-center md:justify-start">
                    <Coffee className="w-5 h-5 mr-4 text-[#00A8CC]" />
                    <span className="text-lg font-black uppercase tracking-tighter text-[#00A8CC]">{item.event}</span>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-black uppercase tracking-tighter text-primary mb-2">{item.event}</h3>
                    <div className="flex flex-wrap justify-center md:justify-start gap-6">
                      {item.speaker && (
                        <div className="flex items-center text-[10px] font-bold uppercase tracking-widest text-primary/80">
                          <User className="w-3 h-3 mr-2 text-[#00A8CC]" /> {item.speaker}
                        </div>
                      )}
                      <div className="flex items-center text-[10px] font-bold uppercase tracking-widest text-primary/80">
                        <MapPin className="w-3 h-3 mr-2 text-[#00A8CC]" /> {item.location}
                      </div>
                    </div>
                  </>
                )}
              </div>
              {item.type !== 'break' && (
                <button className="px-6 py-3 bg-softgray/30 border border-softgray text-[9px] font-black uppercase tracking-widest hover:bg-[#C8A96B] transition-all rounded-full">Notify Me</button>
              )}
            </motion.div>
          ))}
        </div>


      </div>
    </div>
  );
};

export default Schedules;

