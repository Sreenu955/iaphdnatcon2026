import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConference } from '../context/ConferenceContext';
import * as LucideIcons from 'lucide-react';
import { Link } from 'react-router-dom';

const Play = LucideIcons.Play;
const X = LucideIcons.X;
const ChevronLeft = LucideIcons.ChevronLeft;
const ChevronRight = LucideIcons.ChevronRight;
const CheckCircle = LucideIcons.CheckCircle;
const HelpCircle = LucideIcons.HelpCircle;
const Clock = LucideIcons.Clock;
const ArrowRight = LucideIcons.ArrowRight;

const AboutUs = () => {
  const { aboutUs, conferenceData, aboutUsExtras, sponsors, isPromoVideoOpen, setIsPromoVideoOpen } = useConference();
  const [sliderIndex, setSliderIndex] = useState(0);

  // Sync isPromoVideoOpen state
  useEffect(() => {
    setIsPromoVideoOpen(true);
    return () => setIsPromoVideoOpen(false);
  }, [setIsPromoVideoOpen]);

  const slides = aboutUsExtras?.slides || [];

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setSliderIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="bg-midnight text-primary min-h-screen relative overflow-hidden font-sans">

      {/* 1. Page Title Header Section */}
      <section
        className="relative pt-16 pb-0 md:pt-20 md:pb-0 bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(5, 11, 24, 0.85) 0%, rgba(5, 11, 24, 0.95) 100%), url('https://iactacon2026.com/wp-content/uploads/2023/12/banner-bg.jpg')`,
        }}
      >
        {/* Glow Element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#C8A96B]/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-block px-6 py-2 bg-[#C8A96B]/10 border border-[#00A8CC]/20 backdrop-blur-md rounded-full"
          >
            <span className="text-[#00A8CC] text-[10px] font-black tracking-[6px] uppercase">
              30<sup className="lowercase text-[8px] tracking-normal">th</sup> IAPHD NATCON 2026
            </span>
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none mt-4 select-none">
            <span className="text-white bg-clip-text bg-gradient-to-r from-primary via-primary/90 to-primary/70 block">ABOUT THE</span>
            <span className="text-[#00A8CC] italic block mt-1">CONFERENCE</span>
          </h1>
          <div className="w-20 h-1.5 bg-[#C8A96B] mx-auto rounded-full"></div>
        </div>
      </section>

      {/* Rotating Graphic Spacer */}
      <div className="relative h-1 bg-midnight z-10">
        <div className="absolute left-16 top-[-40px] hidden md:block">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
            className="w-24 h-24 border border-softgray rounded-full flex items-center justify-center relative opacity-20"
          >
            <div className="w-16 h-16 border-2 border-dashed border-[#00A8CC] rounded-full"></div>
            <div className="absolute w-2 h-2 bg-[#C8A96B] rounded-full top-0"></div>
          </motion.div>
        </div>
      </div>

      {/* 2. Overlapping Main Content Column Grid */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

            {/* Image Overlay Box (Left Column) */}
            <div className="lg:col-span-6 relative">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative group rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-softgray"
              >
                <img
                  src={aboutUs.image || "./about.png"}
                  alt="Clinical innovation at NATCON"
                  className="w-full object-cover h-[450px] md:h-[550px] scale-100 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              </motion.div>

              {/* Dynamic Stats Badge Overlay */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="absolute -bottom-10 -left-6 md:-left-10 bg-[#C8A96B] border-2 border-softgray p-6 md:p-8 rounded-xl shadow-2xl w-48 md:w-56 text-center select-none group hover:scale-105 transition-transform duration-300"
              >
                <span className="text-5xl md:text-7xl font-black block tracking-tighter text-white font-mono drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)]">
                  {aboutUs.stats?.[0]?.value || "1000+"}
                </span>
                <span className="text-[10px] md:text-xs font-black uppercase text-white tracking-widest block mt-2 border-t border-softgray pt-2">
                  {aboutUs.stats?.[0]?.label || "Delegates Expected"}
                </span>
              </motion.div>
            </div>

            {/* Event Description (Right Column) */}
            <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-4"
              >
                <span className="inline-flex items-center space-x-2 text-[#00A8CC] font-black uppercase tracking-[4px] text-xs">
                  <span className="w-8 h-[2px] bg-[#C8A96B]"></span>
                  <span>{aboutUs.tagline}</span>
                </span>

                <h2 className="text-4xl md:text-5xl font-black leading-tight tracking-tight uppercase text-primary">
                  {aboutUs.heading}{' '}
                  <span className="text-[#00A8CC] italic block md:inline">{aboutUs.headingHighlight}</span>
                </h2>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-primary/60 text-lg leading-relaxed max-w-xl mx-auto lg:mx-0"
                dangerouslySetInnerHTML={{ __html: aboutUs.body }}
              />

              {/* Action Promo buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 pt-4"
              >
                {/* Watch Promo Trigger */}
                <button
                  onClick={() => setIsPromoVideoOpen(true)}
                  className="flex items-center space-x-4 group cursor-pointer"
                >
                  <span className="w-14 h-14 rounded-full border-2 border-softgray group-hover:border-[#00A8CC]/50 flex items-center justify-center transition-colors relative shrink-0">
                    <span className="absolute inset-1 bg-softgray/30 border border-softgray rounded-full group-hover:bg-[#C8A96B]/10 transition-colors"></span>
                    <Play className="w-5 h-5 text-primary group-hover:text-accent fill-current transition-colors ml-0.5" />
                  </span>
                  <span className="text-xs font-black uppercase tracking-widest text-primary group-hover:text-accent border-b border-softgray group-hover:border-[#00A8CC]/20 pb-1 transition-colors">
                    Watch Promo Video
                  </span>
                </button>

                <span className="hidden sm:inline text-white/10">|</span>

                <Link
                  to="/registration"
                  className="px-8 py-4 bg-[#C8A96B] text-white text-xs font-black uppercase tracking-widest rounded-full hover:bg-[#14213D] hover:text-accent transition-all shadow-xl hover:scale-105"
                >
                  Register Now
                </Link>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Why Attend? Features Grid */}
      <section className="py-24 bg-softgray/20 relative overflow-hidden border-t border-b border-softgray">
        <div className="absolute top-0 left-0 w-80 h-80 bg-[#C8A96B]/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">

          {/* Section Header */}
          <div className="text-center mb-16 space-y-2">
            <span className="text-[#00A8CC] font-black uppercase tracking-[4px] text-xs">BENEFITS</span>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-primary">
              WHY ATTEND <span className="text-[#00A8CC] italic">THE EVENT?</span>
            </h2>
            <div className="w-12 h-1 bg-[#C8A96B] mx-auto mt-4 rounded-full"></div>
          </div>

          {/* Grid Layout of 6 Premium Glassmorphic Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            {aboutUsExtras?.benefits?.map((card, i) => {
              const getIconComponent = (iconName) => {
                if (!iconName) return LucideIcons.Lightbulb;
                // Try exact match (e.g. Volume2, Ticket, MicVocal)
                if (LucideIcons[iconName]) return LucideIcons[iconName];

                // Convert kebab-case (e.g. mic-vocal) to PascalCase (e.g. MicVocal)
                const pascalName = iconName
                  .split('-')
                  .map(part => part.charAt(0).toUpperCase() + part.slice(1))
                  .join('');
                if (LucideIcons[pascalName]) return LucideIcons[pascalName];

                // Try case-insensitive lookup
                const foundKey = Object.keys(LucideIcons).find(
                  key => key.toLowerCase() === iconName.replace(/-/g, '').toLowerCase()
                );
                if (foundKey) return LucideIcons[foundKey];

                return LucideIcons.Lightbulb; // Fallback
              };
              const IconComp = getIconComponent(card.iconName);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 35 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="bg-white border border-softgray hover:border-[#00A8CC]/20 p-8 rounded-xl relative group transition-all duration-500 shadow-xl overflow-hidden"
                >
                  {/* Neon Top Edge glow on hover */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="w-14 h-14 bg-[#C8A96B]/5 border border-[#00A8CC]/10 rounded-xl flex items-center justify-center text-[#00A8CC] group-hover:bg-[#C8A96B] group-hover:text-accent transition-colors duration-500 mb-6 relative overflow-hidden">
                    <IconComp className="w-6 h-6 relative z-10" />
                  </div>

                  <h3 className="text-xl font-black uppercase text-primary tracking-tight group-hover:text-accent transition-colors duration-300 mb-3">
                    {card.title}
                  </h3>

                  <p className="text-primary/60 text-sm leading-relaxed font-semibold">
                    {card.desc}
                  </p>
                </motion.div>
              )
            })}

          </div>
        </div>
      </section>

      {/* 4. Text and Image Slideshow Carousel */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-softgray bg-secondary shadow-[0_4px_20px_rgba(20,33,61,0.05)] border border-softgray/20">

            {/* Slide Image */}
            <div className="relative h-[450px] md:h-[600px] w-full overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={sliderIndex}
                  src={slides[sliderIndex].img}
                  alt={slides[sliderIndex].title}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 0.35, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </AnimatePresence>

              <div className="absolute inset-0 bg-gradient-to-t from-[#050b18] via-transparent to-transparent"></div>

              {/* Slide text box card - Overlapping bottom right */}
              <div className="absolute bottom-0 right-0 left-0 md:left-auto md:max-w-xl p-8 md:p-12 z-20">
                <div className="bg-midnight/90 border border-softgray backdrop-blur-md p-8 md:p-10 rounded-xl shadow-2xl space-y-6 relative overflow-hidden">

                  <div className="absolute top-0 left-0 w-2 h-full bg-[#C8A96B]"></div>

                  <span className="text-[#00A8CC] font-black uppercase tracking-[3px] text-[10px] block">CONFERENCE HIGHLIGHTS</span>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={sliderIndex}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.4 }}
                      className="space-y-4"
                    >
                      <h3 className="text-2xl md:text-3xl font-black uppercase text-primary tracking-tight leading-tight">
                        {slides[sliderIndex].title}
                      </h3>
                      <p className="text-primary/60 text-xs md:text-sm leading-relaxed font-semibold">
                        {slides[sliderIndex].desc}
                      </p>
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation controls */}
                  <div className="flex items-center space-x-3 pt-2">
                    <button
                      onClick={() => setSliderIndex((sliderIndex - 1 + slides.length) % slides.length)}
                      className="w-10 h-10 border border-softgray hover:border-[#00A8CC] rounded-full flex items-center justify-center hover:bg-[#C8A96B] text-white shadow-[0_4px_14px_rgba(200,169,107,0.25)] hover:bg-[#14213D] hover:text-white transition-all transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setSliderIndex((sliderIndex + 1) % slides.length)}
                      className="w-10 h-10 border border-softgray hover:border-[#00A8CC] rounded-full flex items-center justify-center hover:bg-[#C8A96B] text-white shadow-[0_4px_14px_rgba(200,169,107,0.25)] hover:bg-[#14213D] hover:text-white transition-all transition-all cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 5. Infinite Running Logo Marquee Slider */}
      <section className="py-16 bg-midnight border-t border-softgray overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center mb-8">
          <span className="text-primary/80 font-black uppercase tracking-[4px] text-[10px]">PROUD SCIENTIFIC ASSOCIATES</span>
        </div>

        {/* Sliding Ribbon */}
        <div className="relative w-full flex overflow-x-hidden">
          <div className="animate-marquee whitespace-nowrap flex gap-12 text-center items-center py-4 select-none">
            {[1, 2].map((loop) => (
              <div key={loop} className="flex space-x-16 items-center shrink-0">
                {((sponsors && sponsors.length > 0) ? sponsors : [
                  { name: 'Colgate-Palmolive' },
                  { name: 'Sensodyne' },
                  { name: 'Oral-B' },
                  { name: 'Himalaya' },
                  { name: 'Dabur' },
                  { name: 'Pepsodent' }
                ]).map((sponsor, i) => (
                  sponsor.logoUrl ? (
                    <img
                      key={`${loop}-${i}`}
                      src={sponsor.logoUrl}
                      alt={sponsor.name}
                      className="h-12 w-auto object-contain transition-all duration-300 cursor-pointer px-4"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span
                      key={`${loop}-${i}`}
                      className="text-2xl font-black text-primary/30 hover:text-accent tracking-[4px] uppercase italic cursor-pointer transition-colors duration-300 font-sans px-4"
                    >
                      {sponsor.name}
                    </span>
                  )
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Embedded Promo Video Modal Overlay */}
      <AnimatePresence>
        {isPromoVideoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-5xl w-full bg-slate-900 border border-softgray rounded-2xl overflow-hidden shadow-2xl relative"
            >
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-softgray">
                <span className="text-xs font-black uppercase tracking-widest text-[#00A8CC]">Vizag Tour & Teaser Presentation</span>
                <button
                  onClick={() => setIsPromoVideoOpen(false)}
                  className="w-8 h-8 rounded-full bg-softgray/30 border border-softgray hover:bg-[#C8A96B] flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Video body */}
              <div className="relative bg-black flex items-center justify-center">
                <video
                  className="w-full aspect-video"
                  src="/promo.mp4"
                  autoPlay
                  controls
                  playsInline
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AboutUs;

