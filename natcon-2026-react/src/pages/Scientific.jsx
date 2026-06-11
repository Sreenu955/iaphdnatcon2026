import React, { useState } from 'react';
import { useConference } from '../context/ConferenceContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Award, Download, CheckCircle2, ShieldAlert, ArrowLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Scientific = () => {
  const { conferenceData, scientificDownloads, showToast } = useConference();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="min-h-screen bg-midnight text-primary pt-32 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-16">
          <Link to="/" className="inline-flex items-center text-primary text-xs font-black uppercase tracking-widest mb-6 hover:text-accent transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
          <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-4">
            Scientific <span className="text-[#00A8CC] italic">Zone</span>
          </h1>
          <p className="text-primary/80 font-bold uppercase tracking-[4px] text-xs">Guidelines & Abstract Submissions</p>
        </div>

        {/* Categories Tab */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-20">
          <div className="flex flex-col space-y-2">
            {conferenceData.scientific.categories.map((cat, i) => (
              <button 
                key={i}
                onClick={() => setActiveTab(i)}
                className={`text-left px-8 py-6 text-xs font-black uppercase tracking-[3px] transition-all border-l-4 ${
                  activeTab === i ? 'bg-[#C8A96B] text-white shadow-[0_4px_14px_rgba(200,169,107,0.25)] hover:bg-[#14213D] hover:text-[#00A8CC] transition-all border-[#00A8CC] shadow-xl translate-x-2' : 'bg-secondary shadow-[0_4px_20px_rgba(20,33,61,0.05)] border border-softgray text-primary/80 border-softgray hover:border-[#00A8CC]/50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="lg:col-span-3 bg-secondary shadow-[0_4px_20px_rgba(20,33,61,0.05)] border border-softgray p-12 border border-softgray relative overflow-hidden group rounded-sm">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#C8A96B]/5 rounded-bl-full"></div>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="relative z-10"
              >
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h3 className="text-3xl font-black text-primary uppercase tracking-tighter">{conferenceData.scientific.categories[activeTab].type}</h3>
                    <p className="text-[#00A8CC] font-bold text-[10px] uppercase tracking-[4px] mt-1 italic">Submission Rules for {conferenceData.scientific.categories[activeTab].label}</p>
                  </div>
                  <div className="bg-[#C8A96B]/20 p-4 rounded-sm border border-accent/30">
                    <span className="block text-[10px] font-black text-accent uppercase tracking-widest text-center">Submission Portal</span>
                    <Link to="/submissions" className="block text-xl font-black text-[#00A8CC] text-center tracking-tighter hover:text-accent transition-colors">GO TO PORTAL</Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <h4 className="text-primary font-bold uppercase tracking-widest text-xs flex items-center">
                      <ShieldAlert className="w-4 h-4 text-[#00A8CC] mr-3" /> Mandatory Rules
                    </h4>
                    <ul className="space-y-4">
                      {conferenceData.scientific.categories[activeTab].rules.map((rule, i) => (
                        <li key={i} className="text-xs font-medium text-primary/60 leading-relaxed flex items-start">
                          <CheckCircle2 className="w-4 h-4 text-[#00A8CC] mr-3 shrink-0" /> {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-6">
                    <h4 className="text-primary font-bold uppercase tracking-widest text-xs flex items-center">
                      <FileText className="w-4 h-4 text-[#00A8CC] mr-3" /> Abstract Structure
                    </h4>
                    <div className="bg-softgray/30 border border-softgray p-8 rounded-sm border border-softgray space-y-4">
                      {conferenceData.scientific.abstract.structure.map((item, i) => (
                        <div key={i} className="flex items-center space-x-4 border-b border-softgray pb-2 last:border-0">
                          <span className="text-[10px] font-black text-[#00A8CC]">{i+1}</span>
                          <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">{item}</span>
                        </div>
                      ))}
                    </div>
                    <button className="w-full py-4 bg-[#C8A96B] text-white shadow-[0_4px_14px_rgba(200,169,107,0.25)] hover:bg-[#14213D] hover:text-[#00A8CC] hover:scale-102 transition-all duration-300 font-black uppercase text-[10px] tracking-widest">Submit Online</button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Download Section */}
        {scientificDownloads && scientificDownloads.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {scientificDownloads.map((doc, i) => (
              <div key={i} className="bg-secondary shadow-[0_4px_20px_rgba(20,33,61,0.05)] border border-softgray p-8 border border-softgray rounded-sm hover:border-[#00A8CC]/50 transition-all flex flex-col justify-between">
                <div>
                  <h4 className="text-primary font-black uppercase tracking-widest text-xs mb-2">{doc.title}</h4>
                  <p className="text-primary/80 text-[10px] font-bold uppercase tracking-widest mb-6 leading-relaxed">{doc.desc}</p>
                </div>
                {doc.fileUrl ? (
                  <a 
                    href={doc.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center text-[#00A8CC] font-black uppercase text-[10px] tracking-widest hover:text-accent transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" /> Download File
                  </a>
                ) : (
                  <button 
                    onClick={() => {
                      if (showToast) {
                        showToast("This template file has not been uploaded yet.", "info");
                      } else {
                        alert("This template file has not been uploaded yet.");
                      }
                    }}
                    className="inline-flex items-center text-primary/80 font-black uppercase text-[10px] tracking-widest cursor-not-allowed"
                  >
                    <Download className="w-4 h-4 mr-2" /> Not Available
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Scientific;

