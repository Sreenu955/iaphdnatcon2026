import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useConference } from '../context/ConferenceContext';
import {
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  ShieldCheck,
  Building,
  Globe,
  ArrowLeft
} from 'lucide-react';

const Contact = () => {
  const { conferenceData, contactSettings, headerLogos } = useConference();

  return (
    <div className="bg-midnight text-primary min-h-screen relative overflow-hidden font-sans pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-16">
          <Link to="/" className="inline-flex items-center text-primary text-xs font-black uppercase tracking-widest mb-6 hover:text-accent transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
          <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-4">
            Contact <span className="text-[#00A8CC] italic">Secretariat</span>
          </h1>
          <p className="text-primary/80 font-bold uppercase tracking-[4px] text-xs">
            30th IAPHD National Conference 2026 Helpdesk & Office
          </p>
        </div>

        {/* Main Content Section */}
        <div className="space-y-16 relative z-10">

          {/* Dynamic Corporate Header Logos Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/[0.02] border border-softgray p-8 rounded-2xl shadow-xl relative overflow-hidden text-center space-y-6"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
            <div>
              <span className="text-[#00A8CC] font-black uppercase tracking-[4px] text-[10px]">HOSTS & ORGANIZATIONAL PARTNERS</span>
              <h3 className="text-xl font-black uppercase text-primary mt-1">Official Conference Collaborators</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-center max-w-4xl mx-auto pt-4">
              <div className="flex flex-col items-center justify-center bg-[#C8A96B]/5 border border-softgray rounded-xl p-4 h-28 group hover:border-[#00A8CC]/20 transition-all duration-300">
                <img
                  src={headerLogos?.logo1 || "./logo-1.png"}
                  alt="Host Logo 1"
                  className="max-h-20 max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex flex-col items-center justify-center bg-[#C8A96B]/5 border border-softgray rounded-xl p-4 h-28 group hover:border-[#00A8CC]/20 transition-all duration-300">
                <img
                  src={headerLogos?.logo2 || "./logo-1.png"}
                  alt="Host Logo 2"
                  className="max-h-20 max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex flex-col items-center justify-center bg-[#C8A96B]/5 border border-softgray rounded-xl p-4 h-28 group hover:border-[#00A8CC]/20 transition-all duration-300">
                <img
                  src={headerLogos?.logo3 || "./logo-2.png"}
                  alt="Host Logo 3"
                  className="max-h-20 max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex flex-col items-center justify-center bg-[#C8A96B]/5 border border-softgray rounded-xl p-4 h-28 group hover:border-[#00A8CC]/20 transition-all duration-300">
                <img
                  src={headerLogos?.logo4 || "./logo-2.png"}
                  alt="Host Logo 4"
                  className="max-h-20 max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">

            {/* Left Column: Address, Support Details, and Timings */}
            <div className="lg:col-span-5 space-y-8 flex flex-col justify-between">

              {/* Address card */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white/[0.02] border border-softgray p-8 rounded-2xl shadow-xl space-y-6 relative overflow-hidden group flex-1"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#C8A96B] group-hover:bg-[#C8A96B] transition-colors duration-300"></div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#C8A96B]/20 border border-[#00A8CC]/10 rounded-xl flex items-center justify-center text-[#00A8CC] group-hover:bg-[#C8A96B] group-hover:text-accent transition-colors duration-300 shrink-0">
                    <Building className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[#00A8CC] font-black uppercase tracking-[3px] text-[10px] block">CONFERENCE VENUE</span>
                    <h3 className="text-lg font-black uppercase text-primary tracking-tight">ANIDS Visakhapatnam</h3>
                  </div>
                </div>

                <div className="space-y-4 text-primary/80 text-sm font-semibold leading-relaxed">
                  <p>
                    Department of Public Health Dentistry, <br />
                    Anil Neerukonda Institute of Dental Sciences (ANIDS), <br />
                    Sangivalasa, Bheemunipatnam Mandal, <br />
                    Visakhapatnam - 531162, Andhra Pradesh, India.
                  </p>
                  <div className="flex items-center space-x-2 text-xs font-black uppercase text-[#00A8CC] pt-2">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span>Sangivalasa, Visakhapatnam</span>
                  </div>
                </div>
              </motion.div>

              {/* Secretariat Contacts Card */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-white/[0.02] border border-softgray p-8 rounded-2xl shadow-xl space-y-6 relative overflow-hidden group flex-1"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#C8A96B] group-hover:bg-[#C8A96B] transition-colors duration-300"></div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#C8A96B]/20 border border-[#00A8CC]/10 rounded-xl flex items-center justify-center text-[#00A8CC] group-hover:bg-[#C8A96B] group-hover:text-accent transition-colors duration-300 shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[#00A8CC] font-black uppercase tracking-[3px] text-[10px] block">SECRETARIAT</span>
                    <h3 className="text-lg font-black uppercase text-primary tracking-tight">Get in Touch</h3>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <a
                    href={`tel:${contactSettings.phone}`}
                    className="flex items-center space-x-4 bg-white/[0.02] hover:bg-[#C8A96B]/20 border border-softgray rounded-xl p-4 group/item transition-colors"
                  >
                    <Phone className="w-5 h-5 text-[#00A8CC] group-hover/item:scale-110 transition-transform" />
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-primary/60 block leading-none mb-1">Phone Line</span>
                      <span className="text-sm font-bold text-primary group-hover/item:text-[#00A8CC] transition-colors leading-none">+91 {contactSettings.phone}</span>
                    </div>
                  </a>

                  <a
                    href={`https://wa.me/${contactSettings.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-4 bg-white/[0.02] hover:bg-[#25d366]/10 border border-softgray rounded-xl p-4 group/item transition-colors"
                  >
                    <MessageCircle className="w-5 h-5 text-[#25d366] group-hover/item:scale-110 transition-transform" />
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-primary/60 block leading-none mb-1">WhatsApp Chat</span>
                      <span className="text-sm font-bold text-primary group-hover/item:text-[#25d366] transition-colors leading-none">Instant Helpdesk</span>
                    </div>
                  </a>

                  <a
                    href={`mailto:${contactSettings.supportEmail}`}
                    className="flex items-center space-x-4 bg-white/[0.02] hover:bg-[#C8A96B]/20 border border-softgray rounded-xl p-4 group/item transition-colors"
                  >
                    <Mail className="w-5 h-5 text-[#00A8CC] group-hover/item:scale-110 transition-transform" />
                    <div className="truncate">
                      <span className="text-[9px] font-black uppercase tracking-widest text-primary/60 block leading-none mb-1">General & Scientific Support</span>
                      <span className="text-xs font-bold text-primary group-hover/item:text-[#00A8CC] transition-colors leading-none block truncate">{contactSettings.supportEmail}</span>
                    </div>
                  </a>

                  <a
                    href={`mailto:${contactSettings.registrationEmail}`}
                    className="flex items-center space-x-4 bg-white/[0.02] hover:bg-[#C8A96B]/20 border border-softgray rounded-xl p-4 group/item transition-colors"
                  >
                    <Mail className="w-5 h-5 text-[#00A8CC] group-hover/item:scale-110 transition-transform" />
                    <div className="truncate">
                      <span className="text-[9px] font-black uppercase tracking-widest text-primary/60 block leading-none mb-1">Registrations & Payments</span>
                      <span className="text-xs font-bold text-white group-hover/item:text-[#00A8CC] transition-colors leading-none block truncate">{contactSettings.registrationEmail}</span>
                    </div>
                  </a>
                </div>
              </motion.div>

            </div>

            {/* Right Column: Google Maps Interactive Location Iframe */}
            <div className="lg:col-span-7 h-[500px] lg:h-auto flex">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white/[0.02] border border-softgray p-3 rounded-3xl shadow-xl w-full flex overflow-hidden relative group"
              >
                {/* Visual Glow around the Map container */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-[#00A8CC]/5 pointer-events-none rounded-3xl z-10 border border-softgray group-hover:border-[#00A8CC]/20 transition-all duration-500"></div>

                <iframe
                  className="w-full h-full rounded-2xl border-0 shadow-inner   transition-all duration-700 relative z-20"
                  src="https://maps.google.com/maps?q=Anil%20Neerukonda%20Institute%20of%20Dental%20Sciences,%20Sangivalasa,%20Visakhapatnam&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  title="Interactive Google Map of ANIDS Visakhapatnam"
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </motion.div>
            </div>

          </div>



        </div>
      </div>

    </div>
  );
};

export default Contact;

