import React, { useState } from 'react';
import { useConference } from '../context/ConferenceContext';
import { motion } from 'framer-motion';
import { Mail, Globe, ArrowLeft, Users, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Committees = () => {
  const { conferenceData, chiefPatron } = useConference();
  const [activeTab, setActiveTab] = useState('organizing');

  const groupedConferenceCommittee = conferenceData.committees?.conferenceCommittee?.reduce((acc, member) => {
    const role = member.role || 'Other';
    if (!acc[role]) acc[role] = [];
    acc[role].push(member);
    return acc;
  }, {}) || {};

  return (
    <div className="min-h-screen bg-midnight text-primary pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-16">
          <Link to="/" className="inline-flex items-center text-primary text-xs font-black uppercase tracking-widest mb-6 hover:text-accent transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
          <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-4">
            The <span className="text-[#00A8CC] italic">Leadership</span>
          </h1>
          <p className="text-primary/80 font-bold uppercase tracking-[4px] text-xs">IAPHD NATCON 2026 Committees</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-4 mb-16 border-b border-softgray pb-8">
          <button
            onClick={() => setActiveTab('organizing')}
            className={`px-8 py-4 text-xs font-black uppercase tracking-[3px] transition-all border-b-2 ${activeTab === 'organizing' ? 'border-[#00A8CC] text-white bg-[#C8A96B]/100' : 'border-transparent text-primary/80 hover:text-accent'
              }`}
          >
            Organizing Committee
          </button>
          <button
            onClick={() => setActiveTab('headoffice')}
            className={`px-8 py-4 text-xs font-black uppercase tracking-[3px] transition-all border-b-2 ${activeTab === 'headoffice' ? 'border-[#00A8CC] text-white bg-[#C8A96B]/100' : 'border-transparent text-primary/80 hover:text-accent'
              }`}
          >
            Head Office Members
          </button>
        </div>

        {activeTab === 'organizing' && (
          <div className="space-y-16">
            {/* Chief Patron Section */}
            {chiefPatron && (
              <div className="max-w-4xl mx-auto">
                <h2 className="text-center text-3xl md:text-4xl font-black uppercase tracking-widest text-[#00A8CC] mb-8">
                  Chief Patron
                </h2>

                <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 via-sky-100 to-blue-200 text-gray-900 rounded-3xl p-8 md:p-12 shadow-xl border border-blue-200 flex flex-col md:flex-row items-center justify-between gap-8">
                  {/* Decorative background blob */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-softgray/70 rounded-bl-full pointer-events-none"></div>

                  {/* Left Content */}
                  <div className="flex-1 space-y-4 text-center md:text-left z-10">
                    <h3 className="text-2xl md:text-4.5xl font-black tracking-tight text-[#14213D] leading-tight">
                      {chiefPatron.name}
                    </h3>
                    <div className="space-y-1.5">
                      <p className="text-sm font-black uppercase tracking-[3px] text-[#00A8CC]">
                        {chiefPatron.role}
                      </p>
                      <p className="text-sm md:text-base font-bold text-gray-700">
                        {chiefPatron.institution}
                      </p>
                    </div>
                  </div>

                  {/* Right Content - Photo */}
                  <div className="w-48 h-48 md:w-60 md:h-60 rounded-2xl overflow-hidden shrink-0 shadow-lg border-4 border-white bg-midnight z-10">
                    <img
                      src={chiefPatron.image || "./portrait.png"}
                      alt={chiefPatron.name}
                      className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(chiefPatron.name)}&background=002147&color=fff&size=512`;
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Organizing Committee Grid */}
            <div className="border-t border-softgray pt-12">
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter mb-8 text-center md:text-left text-primary/60">
                Organizing Committee Members
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {conferenceData.committees.organizing.map((member, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group bg-[#faf6ee] shadow-[0_4px_20px_rgba(20,33,61,0.05)] border border-softgray border border-softgray p-6 rounded-sm hover:border-[#00A8CC]/50 transition-all"
                  >
                    <div className="aspect-square rounded-sm overflow-hidden mb-6 relative transition-all duration-700">
                      <img
                        src={member.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=17161a&color=fff&size=512`}
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=17161a&color=fff&size=512`;
                        }}
                      />
                      <div className="absolute inset-0 bg-[#C8A96B]/10 mix-blend-color"></div>
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tighter mb-1">{member.name}</h3>
                    <p className="text-[#00A8CC] font-bold text-[10px] uppercase tracking-[3px] mb-2">{member.role}</p>
                  </motion.div>
                ))}
              </div>
            </div>
            {/* Conference Committee Members List */}
            {Object.keys(groupedConferenceCommittee).length > 0 && (
              <div className="bg-secondary shadow-[0_4px_20px_rgba(20,33,61,0.05)] border border-softgray p-12 rounded-sm">
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 flex items-center">
                  <Users className="w-8 h-8 text-[#00A8CC] mr-4" /> Conference Committee Members
                </h3>
                <div className="space-y-12">
                  {Object.entries(groupedConferenceCommittee).map(([category, members], idx) => (
                    <div key={idx}>
                      <h4 className="text-xl font-black text-center uppercase tracking-widest text-[#00A8CC] mb-6 pb-2 border-b border-softgray/30">
                        {category}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {members.map((member, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-center p-6 bg-midnight/50 border border-softgray rounded-sm hover:bg-softgray/25 transition-all"
                          >
                            <div>
                              <h5 className="text-md font-black uppercase tracking-widest text-primary">{member.name}</h5>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'headoffice' && (
          <div className="space-y-16">
            {/* Core Leaders */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {conferenceData.committees.headOffice.leaders.map((member, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center p-6 bg-secondary shadow-[0_4px_20px_rgba(20,33,61,0.05)] border border-softgray border border-softgray rounded-sm hover:bg-softgray/30 border border-softgray transition-colors"
                >

                  <div>
                    <h3 className="text-md font-black uppercase tracking-widest text-primary">{member.name}</h3>
                    <p className="text-[12px] font-bold text-[#00A8CC] uppercase tracking-[2px] mt-1">{member.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* EC Members List */}
            <div className="bg-secondary shadow-[0_4px_20px_rgba(20,33,61,0.05)] border border-softgray p-12 rounded-sm">
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 flex items-center">
                <Users className="w-8 h-8 text-[#00A8CC] mr-4" /> Executive Committee Members
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {conferenceData.committees.headOffice.ecMembers.map((name, i) => (
                  <div key={i} className="flex items-center space-x-3 text-primary/90 hover:text-accent transition-colors cursor-default">
                    <ShieldCheck className="w-4 h-4 text-[#00A8CC]/90" />
                    <span className="text-[12px] font-bold uppercase tracking-widest">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Committees;

