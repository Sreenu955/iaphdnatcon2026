import React from 'react';
import { motion } from 'framer-motion';
import { useConference } from '../context/ConferenceContext';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const RegistrationGuidelines = () => {
  const { registrationGuidelines } = useConference();

  return (
    <div className="min-h-screen bg-midnight text-primary pt-32 pb-20 font-sans relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-16">
          <Link to="/" className="inline-flex items-center text-primary text-xs font-black uppercase tracking-widest mb-6 hover:text-accent transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
          <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-4">
            Registration <span className="text-[#00A8CC] italic">Guidelines</span>
          </h1>
          <p className="text-primary/80 font-bold uppercase tracking-[4px] text-xs">
            {registrationGuidelines.intro || 'Please read these instructions before completing your registration to ensure a smooth process.'}
          </p>
        </div>

        {/* Steps */}
        <div className="bg-white rounded-xl border border-softgray p-8 shadow-md">
          <h2 className="text-2xl font-black uppercase text-[#00A8CC] mb-6">Steps</h2>
          {typeof registrationGuidelines.steps === 'string' ? (
            <div 
              className="text-xs md:text-sm text-primary/80 font-bold uppercase tracking-wider leading-relaxed prose prose-sm max-w-none font-sans"
              dangerouslySetInnerHTML={{ __html: registrationGuidelines.steps }}
            />
          ) : (
            <ul className="space-y-4 text-primary/80">
              {registrationGuidelines.steps?.map((step, idx) => (
                <li key={idx} className="relative pl-6 before:absolute before:left-0 before:top-1 before:w-3 before:h-3 before:bg-[#C8A96B] before:rounded-full text-xs md:text-sm font-bold text-primary/80 uppercase tracking-widest leading-relaxed">
                  {step}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Custom Guidelines / Payment Addons */}
        {registrationGuidelines.bankDetails && registrationGuidelines.bankDetails.length > 0 && (
          <div className="space-y-8 mt-12">
            {registrationGuidelines.bankDetails.map((row, i) => (
              <div key={i} className="bg-white rounded-xl border border-softgray p-8 shadow-md space-y-4">
                <div>
                  <h2 className="text-xl font-black uppercase text-[#00A8CC]">{row.title || row.label}</h2>
                  {(row.intro || row.note) && (
                    <p className="text-primary/80 font-bold uppercase tracking-[4px] text-[10px] mt-2">
                      {row.intro || row.note}
                    </p>
                  )}
                </div>
                <div 
                  className="text-xs md:text-sm text-primary/80 font-bold uppercase tracking-wider leading-relaxed prose prose-sm max-w-none font-sans"
                  dangerouslySetInnerHTML={{ __html: row.text || row.value }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Footer Note */}
        {registrationGuidelines.note && (
          <div className="bg-white rounded-xl border border-softgray p-8 text-center shadow-md mt-12">
            <p className="text-primary/60 text-sm">{registrationGuidelines.note}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationGuidelines;

