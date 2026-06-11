import React from 'react';
import { useConference } from '../context/ConferenceContext';
import { Check, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const RegistrationTable = ({ onProceed, plain = false }) => {
  const { conferenceData, pricingPhase } = useConference();
  const { tiers, phases } = conferenceData.registration;
  const navigate = useNavigate();

  const handleProceed = () => {
    if (onProceed) {
      onProceed();
    } else {
      navigate('/registration-form');
    }
  };

  const renderContent = () => (
    <div className={`${plain ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}`}>
      {!plain && (
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-primary uppercase tracking-tighter mb-4">
            Registration <span className="text-[#00A8CC] text-outline-primary">Matrix</span>
          </h2>
          <div className="flex justify-center items-center space-x-2 text-primary/60">
            <Info className="w-4 h-4 text-[#00A8CC] animate-pulse" />
            <p className="text-xs md:text-sm font-black uppercase tracking-[3px]">
              Current Phase: {phases[pricingPhase].label} ({phases[pricingPhase].dates})
            </p>
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto items-stretch">
        {tiers.map((tier) => {
          const isPremium = tier.id === 'premium';
          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: isPremium ? 0.2 : 0 }}
              className={`relative border rounded-3xl p-6 md:p-10 flex flex-col justify-between transition-all duration-500 hover:scale-[1.01] bg-[#faf6ee] ${isPremium
                ? 'border-2 border-[#00A8CC] shadow-[0_20px_40px_rgba(0,168,204,0.12)]'
                : 'border-softgray shadow-[0_10px_30px_rgba(20,33,61,0.04)]'
                }`}
            >
              {/* Premium Badge */}
              {isPremium && (
                <div className="absolute top-0 right-0 bg-[#C8A96B] text-white shadow-[0_4px_14px_rgba(200,169,107,0.25)] hover:bg-[#14213D] hover:text-white transition-all text-[9px] font-black uppercase tracking-[3px] py-1.5 px-6 rounded-bl-2xl">
                  Recommended
                </div>
              )}

              <div>
                {/* Header */}
                <div className="mb-8">
                  <div className="flex items-center space-x-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${isPremium ? 'bg-[#C8A96B]' : 'bg-[#C8A96B]/50'} animate-pulse`} />
                    <h3 className="text-3xl font-black text-primary uppercase tracking-tighter">
                      {tier.name}
                    </h3>
                  </div>
                  <p className="text-[#00A8CC] font-bold text-xs uppercase tracking-[3px] mt-1.5 pl-5.5">
                    {tier.includes}
                  </p>
                </div>

                {/* Included Benefits List */}
                <div className="mb-6 pl-5.5">
                  <p className="text-[10px] font-black uppercase text-primary/80 tracking-[3px] mb-3">Included Benefits:</p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                    {tier.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start text-[10px] font-bold text-primary/80 uppercase tracking-widest leading-relaxed">
                        <Check className="w-3.5 h-3.5 mr-2 text-[#00A8CC] shrink-0 mt-0.5" />
                        {benefit}
                      </li>
                    ))}
                  </ul>

                </div>

                {/* Pricing Area inside Card */}
                <div className="border-t border-softgray pt-5">
                  <div className="flex items-center justify-between mb-3 px-2 text-[10px] font-black uppercase tracking-[3px] text-primary/80">
                    <span>Category</span>
                    <span className="text-right">Early Bird / Standard</span>
                  </div>
                  <div className="space-y-2">
                    {tier.pricing.map((row, i) => {
                      const earlyBirdVal = row.displayEarlyBird || (typeof row.earlyBird === 'number' ? `₹${row.earlyBird.toLocaleString()}` : row.earlyBird);
                      const standardVal = row.displayStandard || (typeof row.standard === 'number' ? `₹${row.standard.toLocaleString()}` : row.standard);
                      return (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-softgray last:border-0 hover:bg-white/[0.015] px-2.5 rounded-xl transition-colors">
                          <div className="text-[10px] font-bold text-primary uppercase tracking-widest max-w-[50%] leading-relaxed">
                            {row.category}
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-primary text-base font-black tracking-tight">
                              {earlyBirdVal}
                            </span>
                            <span className="text-primary/80 text-[9px] font-bold line-through mt-0.5">
                              {standardVal}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer Details */}
      <div className="mt-16 p-8 border border-[#00A8CC]/20 bg-[#C8A96B]/5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 max-w-5xl mx-auto shadow-lg">
        <div className="text-primary/60 text-xs font-semibold uppercase tracking-wider space-y-1">
          <p className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-[#C8A96B] mr-2" /> * Registration charges are inclusive of 18% GST.</p>
          <p className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-[#C8A96B] mr-2" /> ** Children aged 6-14 years will be charged ₹3,500.</p>
        </div>
        <button
          onClick={handleProceed}
          className="w-full md:w-auto px-12 py-5 bg-[#C8A96B] text-white font-black uppercase tracking-widest hover:bg-[#14213D] hover:text-accent transition-all duration-300 shadow-[0_4px_14px_rgba(200,169,107,0.3)] rounded-full hover:scale-105 cursor-pointer"
        >
          Register Now
        </button>
      </div>
    </div>
  );

  if (plain) {
    return renderContent();
  }

  return (
    <section className="py-20 bg-[#F6F8FF] shadow-[0_4px_20px_rgba(20,33,61,0.05)] border border-softgray" id="registration">
      {renderContent()}
    </section>
  );
};

export default RegistrationTable;

