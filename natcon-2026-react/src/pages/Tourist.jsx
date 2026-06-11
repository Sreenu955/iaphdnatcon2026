import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Compass, ArrowLeft, ExternalLink, Anchor } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useConference } from '../context/ConferenceContext';

const Tourist = () => {
  const { cityIntro, touristAttractions } = useConference();

  return (
    <div className="min-h-screen bg-midnight text-primary pt-32 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-16">
          <Link to="/" className="inline-flex items-center text-primary text-xs font-black uppercase tracking-widest mb-6 hover:text-accent transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
          <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-4">
            City of <span className="text-[#00A8CC] italic">Destiny</span>
          </h1>
          <p className="text-primary/80 font-bold uppercase tracking-[4px] text-xs">Visakhapatnam - Exploration Guide</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center">
              <Compass className="w-8 h-8 text-[#00A8CC] mr-4" /> {cityIntro.heading || "Discover Vizag"}
            </h2>
            <div
              className="text-primary/60 text-lg leading-relaxed space-y-4"
              dangerouslySetInnerHTML={{ __html: cityIntro.body || "" }}
            />
            <div className="bg-secondary shadow-[0_4px_20px_rgba(20,33,61,0.05)] border border-softgray p-8 border border-softgray rounded-sm">
              <div className="flex items-center space-x-4 mb-4">
                <Anchor className="w-6 h-6 text-[#00A8CC]" />
                <h4 className="text-sm font-black uppercase tracking-widest text-primary">Travel Tip</h4>
              </div>
              <p className="text-[11px] font-bold text-primary/80 uppercase tracking-widest leading-relaxed">
                {cityIntro.travelTip}
              </p>
            </div>
          </motion.div>
          <div className="aspect-video bg-secondary shadow-[0_4px_20px_rgba(20,33,61,0.05)] border border-softgray rounded-sm overflow-hidden border border-softgray group">
            <img src={cityIntro.heroImage} className="w-full h-full object-cover transition-all duration-1000" alt="Vizag Coast" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {touristAttractions.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-secondary shadow-[0_4px_20px_rgba(20,33,61,0.05)] border border-softgray border border-softgray rounded-sm overflow-hidden group hover:border-[#00A8CC]/50 transition-all"
            >
              <div className="aspect-square relative overflow-hidden">
                <img src={item.mediaUrl || item.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-midnight via-transparent to-transparent opacity-60"></div>
                <div className="absolute bottom-6 left-6">
                  <Camera className="w-6 h-6 text-white mb-2" />
                </div>
              </div>
              <div className="p-8 space-y-4">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-primary mb-2">{item.title}</h3>
                  {item.distance && (
                    <div className="inline-flex items-center gap-1 bg-[#C8A96B]/10 text-[#C8A96B] px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider mb-2">
                      <span>📍 {item.distance}</span>
                    </div>
                  )}
                </div>
                <div
                  className="text-[10px] font-bold text-primary/80  leading-relaxed tracking-widest space-y-2"
                  dangerouslySetInnerHTML={{ __html: item.desc || item.description }}
                />
                {item.mapUrl && (
                  <a
                    href={item.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-[#00A8CC] hover:text-[#C8A96B] hover:underline pt-2 border-t border-softgray w-full"
                  >
                    View on Map <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <a
            href="https://www.google.com/maps/search/?api=1&query=Visakhapatnam+Tourist+Places"
            target="_blank"
            rel="noopener noreferrer"
            className="px-14 py-6 bg-[#C8A96B] text-white font-black uppercase text-xs tracking-widest hover:bg-[#14213D] hover:text-accent transition-all rounded-sm inline-flex items-center mx-auto"
          >
            View Interactive Travel Map <ExternalLink className="ml-3 w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Tourist;

