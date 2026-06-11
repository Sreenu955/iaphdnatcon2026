import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, ChevronUp, ArrowLeft, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useConference } from '../context/ConferenceContext';

const Faqs = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const { faqs } = useConference();

  return (
    <div className="min-h-screen bg-midnight text-primary pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <Link to="/" className="inline-flex items-center text-primary text-xs font-black uppercase tracking-widest mb-6 hover:text-accent transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
          <h1 className="text-4xl md:text-4xl font-black uppercase tracking-tighter mb-4">
            Frequently Asked <span className="text-[#00A8CC] italic">Questions</span>
          </h1>
          <p className="text-xs font-bold text-primary/80 uppercase tracking-[4px] mt-2">
            Dynamic updates managed live from the admin dashboard
          </p>
        </div>

        {/* FAQ Grid */}
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-softgray bg-secondary shadow-[0_4px_20px_rgba(20,33,61,0.05)] border border-softgray rounded-sm overflow-hidden shadow-lg transition-all duration-300"
            >
              <button
                onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                className="w-full p-8 text-left flex justify-between items-center hover:bg-white/[0.02] transition-colors"
              >
                <span className="text-sm md:text-base font-black uppercase tracking-wider text-primary pr-6">
                  <span className="text-[#00A8CC] mr-3 font-black">Q{index + 1}.</span> {faq.question}
                </span>
                {openFaq === faq.id ? (
                  <ChevronUp className="w-5 h-5 text-[#00A8CC] shrink-0 transition-transform duration-300" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-primary/80 shrink-0 transition-transform duration-300" />
                )}
              </button>
              <AnimatePresence initial={false}>
                {openFaq === faq.id && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden border-t border-softgray"
                  >
                    <div
                      className="p-8 text-xs md:text-sm text-primary/60 font-medium leading-relaxed uppercase tracking-wider bg-[#C8A96B]/[0.15]"
                      dangerouslySetInnerHTML={{ __html: faq.answer }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Help Panel */}
        <div className="mt-16 p-8 border border-softgray bg-secondary shadow-[0_4px_20px_rgba(20,33,61,0.05)] border border-softgray rounded-sm flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-start space-x-6">
            <MessageSquare className="w-10 h-10 text-[#00A8CC] shrink-0 mt-1" />
            <div className="space-y-2">
              <h5 className="text-xs font-black uppercase tracking-[2px] text-primary">Still have questions?</h5>
              <p className="text-[10px] font-medium text-primary/80 leading-relaxed tracking-wider uppercase">
                If your question is not answered in the FAQ list above, please reach out directly to our scientific and registration coordinators.
              </p>
            </div>
          </div>
          <a
            href="contact"
            className="px-6 py-4 bg-[#C8A96B] text-white shadow-[0_4px_14px_rgba(200,169,107,0.25)] hover:bg-[#14213D] hover:text-[#00A8CC] hover:scale-105 transition-all duration-300 font-black text-xs uppercase tracking-widest rounded-full whitespace-nowrap shadow-lg"
          >
            Contact Desk
          </a>
        </div>
      </div>
    </div>
  );
};

export default Faqs;

