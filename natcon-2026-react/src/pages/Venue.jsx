import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Hotel, Car, ArrowLeft, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useConference } from '../context/ConferenceContext';

const Venue = () => {
  const { venueInfo, hotelsList } = useConference();

  return (
    <div className="min-h-screen bg-midnight text-primary pt-32 pb-20 font-sans">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-16">
          <Link to="/" className="inline-flex items-center text-primary text-xs font-black uppercase tracking-widest mb-6 hover:text-accent transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
          <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-4">
            The <span className="text-[#00A8CC] italic">Venue</span> & Stay
          </h1>
          <p className="text-primary/80 font-bold uppercase tracking-[4px] text-xs">{venueInfo.subtitle || "Visakhapatnam - The City of Destiny"}</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center">
              <MapPin className="w-8 h-8 text-[#00A8CC] mr-4" /> Conference Location
            </h2>
            <div className="bg-secondary shadow-[0_4px_20px_rgba(20,33,61,0.05)] border border-softgray p-8 border border-softgray rounded-sm space-y-6">
              <p className="text-xl font-bold text-primary uppercase tracking-tight">{venueInfo.name}</p>
              <p className="text-primary/60 leading-relaxed">
                {venueInfo.description}
              </p>
              <a
                href={venueInfo.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-[#00A8CC] font-black uppercase text-xs tracking-widest hover:text-accent transition-colors"
              >
                View on Google Maps <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </div>
          </motion.div>
          <div className="aspect-video bg-secondary shadow-[0_4px_20px_rgba(20,33,61,0.05)] border border-softgray border border-softgray rounded-sm overflow-hidden group">
            <img src={venueInfo.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Venue" />
          </div>
        </div>

        {/* Accommodation Section */}
        <div className="space-y-16" id="accommodation">
          <div className="text-center">
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 flex items-center justify-center">
              <Hotel className="w-10 h-10 text-[#00A8CC] mr-4" /> Recommended <span className="text-[#00A8CC] ml-3 italic">Stays</span>
            </h2>
            <p className="text-primary/80 uppercase tracking-widest text-[10px] font-black">Specially curated hotels for delegates</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {hotelsList.map((hotel, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-secondary shadow-[0_4px_20px_rgba(20,33,61,0.05)] border border-softgray border border-softgray p-6 rounded-sm hover:border-[#00A8CC]/50 transition-colors group flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-video rounded-sm overflow-hidden mb-6 relative">
                    <img src={hotel.img || hotel.imageUrl} className="w-full h-full object-cover transition-all duration-500" alt={hotel.name} />
                    <div className="absolute top-4 left-4 bg-[#C8A96B] text-white shadow-[0_4px_14px_rgba(200,169,107,0.25)] hover:bg-[#14213D] hover:text-white transition-all text-[8px] font-black uppercase px-3 py-1 rounded-full tracking-widest">{hotel.rating}</div>
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-primary mb-2">{hotel.name}</h3>
                  <p className="text-primary/80 text-[10px] font-bold uppercase tracking-widest flex items-center mb-6">
                    <Car className="w-3.5 h-3.5 text-[#00A8CC] mr-2" /> {hotel.dist || hotel.distance || "N/A"} from venue
                  </p>
                </div>

                <div className="pt-4 border-t border-softgray">
                  <a
                    href={hotel.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 bg-primary border border-softgray hover:bg-[#C8A96B] hover:border-accent/30 text-white text-center font-black uppercase text-[9px] tracking-widest transition-all rounded-sm flex items-center justify-center gap-2 group/btn transition-colors duration-300"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#00A8CC] group-hover/btn:text-white transition-colors" />
                    <span>View Map</span>
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Venue;

