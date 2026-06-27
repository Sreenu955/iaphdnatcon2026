import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  ArrowUpRight,
  Calendar,
  MapPin,
  Users,
  Award,
  ChevronRight,
  ChevronLeft,
  Bell,
  Mail,
  ArrowRight,
  Globe,
  Clock,
  ChevronDown,
  FileText,
  Search,
  Download,
  Building,
  Menu,
  X,
  Play,
  ShieldAlert,
  Info,
  CheckCircle2,
  FileUp,
  Brain,
  Camera,
  Phone,
  ChevronUp
} from 'lucide-react';
import { ConferenceProvider, useConference } from './context/ConferenceContext';
import RegistrationTable from './components/RegistrationTable';
import ToastContainer from './components/ToastContainer';
import AdminDashboard from './pages/AdminDashboard';
import RegistrationForm from './pages/RegistrationForm';
import OfflineRegistration from './pages/OfflineRegistration';
import Venue from './pages/Venue';
import Committees from './pages/Committees';
import Scientific from './pages/Scientific';
import Schedules from './pages/Schedules';
import Trade from './pages/Trade';
import Submissions from './pages/Submissions';
import AbstractGuidelines from './pages/AbstractGuidelines';
import Workshops from './pages/Workshops';
import Utility from './pages/Utility';
import Tourist from './pages/Tourist';
import Faqs from './pages/Faqs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RefundPolicy from './pages/RefundPolicy';
import RegistrationGuidelines from './pages/RegistrationGuidelines';
import AboutUs from './pages/AboutUs';
import TermsConditions from './pages/TermsConditions';
import Contact from './pages/Contact';
import UnderConstruction from './pages/UnderConstruction';


const parseAnnouncementContent = (contentString) => {
  if (!contentString) return { desc: '', linkUrl: '', pdfUrl: '' };

  // Try to parse the string directly first
  try {
    const parsed = JSON.parse(contentString);
    return {
      desc: parsed.desc || '',
      linkUrl: parsed.linkUrl || '',
      pdfUrl: parsed.pdfUrl || ''
    };
  } catch (e) { }

  // If that fails, try to unescape &quot; and other common HTML entities
  try {
    const unescaped = contentString
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
    const parsed = JSON.parse(unescaped);
    return {
      desc: parsed.desc || '',
      linkUrl: parsed.linkUrl || '',
      pdfUrl: parsed.pdfUrl || ''
    };
  } catch (e) { }

  // If it's still not valid JSON, check if it starts with {" or has {" inside
  if (contentString.includes('{"desc"') || contentString.includes('{&quot;desc&quot;')) {
    const descMatch = contentString.match(/(?:"desc"|&quot;desc&quot;)\s*:\s*(?:"([^"]*)"|&quot;((?:(?!&quot;).)*)&quot;)/);
    const linkMatch = contentString.match(/(?:"linkUrl"|&quot;linkUrl&quot;)\s*:\s*(?:"([^"]*)"|&quot;((?:(?!&quot;).)*)&quot;)/);
    const pdfMatch = contentString.match(/(?:"pdfUrl"|&quot;pdfUrl&quot;)\s*:\s*(?:"([^"]*)"|&quot;((?:(?!&quot;).)*)&quot;)/);

    return {
      desc: descMatch ? (descMatch[1] || descMatch[2] || '') : '',
      linkUrl: linkMatch ? (linkMatch[1] || linkMatch[2] || '') : '',
      pdfUrl: pdfMatch ? (pdfMatch[1] || pdfMatch[2] || '') : ''
    };
  }

  // Otherwise, it is plain text legacy content
  return {
    desc: contentString,
    linkUrl: '',
    pdfUrl: ''
  };
};

// Public Components
// Public Components
const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { conferenceData, notification, headerLogos, announcements } = useConference();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 150);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (location.pathname === '/admin') return null;

  const getSubTo = (item, subItem) => {
    const subLabel = typeof subItem === 'string' ? subItem : subItem.label;
    let subTo = typeof subItem === 'string' ? (item.to || '#') : subItem.to;

    if (typeof subItem === 'string') {
      if (subLabel.includes('Workshops')) subTo = '/workshops';
      if (subLabel.includes('Submissions')) subTo = '/submissions';
      if (subLabel.includes('E-Receipt') || subLabel.includes('Reg Number')) subTo = '/utility';
      if (subLabel.includes('Attractions')) subTo = '/tourist';
    }
    return subTo;
  };

  const isParentActive = (item) => {
    if (location.pathname === item.to) return true;
    if (item.sub) {
      return item.sub.some(subItem => {
        const subTo = getSubTo(item, subItem);
        return location.pathname === subTo;
      });
    }
    return false;
  };

  return (
    <header className="no-print">
      {/* Ticker Section - Scrolls naturally with the page */}
      <div
        className="bg-[#14213D] text-white overflow-hidden border-b border-softgray flex items-stretch h-10 relative z-30 group"
      >
        {/* Flash News Static Badge */}
        <div className="bg-[#C8A96B] text-white font-black text-[10px] tracking-[2px] uppercase px-4 flex items-center shrink-0 z-20 shadow-[5px_0_15px_rgba(0,0,0,0.15)] select-none border-r border-softgray relative">
          <span className="relative flex h-2 w-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          Flash News
        </div>

        {/* Scrolling News Body */}
        <div className="flex-1 overflow-hidden relative flex items-center">
          <div className="py-2 flex items-center animate-marquee whitespace-nowrap gap-16">
            {(() => {
              const activeAnns = announcements?.filter(ann => ann.isActive !== false) || [];

              // Fallback to static notification if there are no active database alerts
              if (activeAnns.length === 0) {
                return [1, 2, 3, 4].map(i => (
                  <span key={`notif-fallback-${i}`} className="flex items-center font-extrabold text-[10px] md:text-xs tracking-[1px] text-white/90 select-none shrink-0">
                    <Bell className="w-3.5 h-3.5 mr-3 text-[#00A8CC] animate-bounce shrink-0" />
                    <span>{notification}</span>
                    <Link
                      to="/registration"
                      className="ml-3 bg-[#C8A96B] hover:bg-white text-white hover:text-[#00A8CC] transition-all px-3 py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-[1.5px] border border-softgray cursor-pointer shadow-sm hover:-translate-y-0.5 active:translate-y-0"
                    >
                      Click Here
                    </Link>
                    <div className="w-2 h-2 bg-softgray/70 rounded-full ml-16"></div>
                  </span>
                ));
              }

              // Duplicate announcements to make the marquee flow seamlessly and remain visually full
              let scrollList = [...activeAnns];
              while (scrollList.length < 5) {
                scrollList = [...scrollList, ...activeAnns];
              }

              return scrollList.map((item, idx) => {
                const parsed = parseAnnouncementContent(item.content);
                const descText = parsed.desc;
                const linkUrl = parsed.linkUrl;
                const pdfUrl = parsed.pdfUrl;

                const redirect = pdfUrl || linkUrl;
                const isPdf = !!pdfUrl;

                return (
                  <span key={`notif-${item.id || idx}-${idx}`} className="flex items-center font-extrabold text-[10px] md:text-xs tracking-[1px] text-white/90 shrink-0">
                    <Bell className="w-3.5 h-3.5 mr-3 text-[#00A8CC] animate-bounce shrink-0" />
                    <span className="font-black text-[#C8A96B] uppercase">{item.title}:</span>
                    <span className="ml-2 font-medium text-white/85">{descText}</span>

                    {redirect ? (
                      redirect.startsWith('http') || redirect.endsWith('.pdf') ? (
                        <a
                          href={redirect}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-3 bg-[#C8A96B] hover:bg-white text-white hover:text-[#00A8CC] hover:-translate-y-0.5 active:translate-y-0 transition-all px-3 py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-[1.5px] border border-softgray cursor-pointer inline-flex items-center gap-1 shadow-sm font-sans"
                        >
                          {isPdf ? '📄 Click Here' : '🔗 Click Here'}
                        </a>
                      ) : (
                        <Link
                          to={redirect}
                          className="ml-3 bg-[#C8A96B] hover:bg-white text-white hover:text-[#00A8CC] hover:-translate-y-0.5 active:translate-y-0 transition-all px-3 py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-[1.5px] border border-softgray cursor-pointer inline-flex items-center gap-1 shadow-sm font-sans"
                        >
                          🔗 Click Here
                        </Link>
                      )
                    ) : null}
                    <div className="w-2 h-2 bg-softgray/70 rounded-full ml-16"></div>
                  </span>
                );
              });
            })()}
          </div>
        </div>
      </div>

      {/* Top Branding Section - Scrolls naturally with the page */}
      <div
        className="bg-white border-b border-softgray px-4 md:px-8 py-6 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="hidden md:flex items-center gap-4 shrink-0">
            <img src={headerLogos?.logo1 || "./logo-1.png"} alt="IAPHD Logo" className="h-20 w-auto object-contain" />
            <img src={headerLogos?.logo2 || "./logo-1.png"} alt="IAPHD Logo" className="h-20 w-auto object-contain" />
          </div>
          <div className="flex-1 text-center flex flex-col items-center">
            <div className="mb-2">
              <span className="text-5xl md:text-5xl font-black tracking-tighter text-[#14213D] uppercase italic leading-none block">IAPHD NATCON <span className="text-[#00A8CC]">2026</span> VIZAG</span>
            </div>
            <p className="text-[11px] md:text-xsm font-bold text-black uppercase tracking-[2px] mb-4 max-w-2xl">
              30<sup className="uppercase">th</sup> NATIONAL CONFERENCE OF INDIAN ASSOCIATION OF PUBLIC HEALTH DENTISTRY
            </p>
            {/* <div className="inline-block bg-[#C8A96B]/10 border border-[#00A8CC]/20 text-[#00A8CC] text-[10px] font-black uppercase tracking-[3px] px-8 py-2 rounded-full mb-4">
              Augmenting AI & Innovation
            </div> */}
            <div className="flex flex-col md:flex-row items-center md:space-x-8 text-[11px] font-black text-[#14213D] uppercase tracking-[3px]">
              <span className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-[#00A8CC]" /> ANIDS, Visakhapatnam</span>
              <span className="hidden md:inline text-gray-200">|</span>
              <span className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-[#00A8CC]" /> {conferenceData.dates}</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4 shrink-0">
            <img src={headerLogos?.logo3 || "./logo-2.png"} alt="ACA Logo" className="h-20 w-auto object-contain" />
            <img src={headerLogos?.logo4 || "./logo-2.png"} alt="ACA Logo" className="h-20 w-auto object-contain" />
          </div>
        </div>
      </div>

      {/* Navigation Bar - Sticky top-0 and transitions on Scroll */}
      <nav className={`sticky top-0 z-[100] transition-all duration-500 border-b border-softgray ${isScrolled ? 'bg-white py-2 shadow-xl' : 'bg-[#14213D] py-1'}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-center relative min-h-[50px]">
          {/* Logo on Left - Only visible when scrolled and hidden on mobile */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: isScrolled ? 1 : 0, x: isScrolled ? 0 : -20 }}
            className={`hidden lg:flex items-center absolute left-4 md:left-0 top-1/2 -translate-y-1/2 ${!isScrolled ? 'pointer-events-none' : ''}`}
          >
            <Link to="/">
              <img src={headerLogos?.logo1 || "./logo-1.png"} alt="Logo" className="h-10 w-10 object-contain hover:scale-105 transition-transform" />
            </Link>
          </motion.div>

          {/* Navigation Links - Centered */}
          <div className="hidden lg:flex items-center justify-center space-x-2">
            {conferenceData.navigation.map((item, i) => (
              <div key={i} className="relative group px-5 py-3 cursor-pointer">
                <div className={`flex items-center text-[10px] font-black tracking-[2px] transition-colors uppercase ${isParentActive(item)
                  ? 'text-[#00A8CC]'
                  : isScrolled
                    ? 'text-[#14213D] group-hover:text-[#00A8CC]'
                    : 'text-white group-hover:text-[#00A8CC]'
                  }`}>
                  {item.to ? (
                    <Link to={item.to}>{item.label}</Link>
                  ) : (
                    <a href={item.href || '#'}>{item.label}</a>
                  )}
                  {item.sub && <ChevronDown className="w-3 h-3 ml-1 group-hover:rotate-180 transition-transform" />}
                </div>
                {item.sub && (
                  <div className={`absolute top-full left-0 w-72 shadow-2xl opacity-0 translate-y-2 pointer-events-none text-white group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all p-2 rounded-b-sm z-[110] ${isScrolled ? 'bg-white' : 'bg-[#14213D]'
                    }`}>
                    {item.sub.map((subItem, j) => {
                      const subLabel = typeof subItem === 'string' ? subItem : subItem.label;
                      const subTo = getSubTo(item, subItem);
                      const isActiveSub = location.pathname === subTo;

                      return (
                        <Link key={j} to={subTo} className={`block px-6 py-4 text-[10px] font-bold uppercase tracking-[2px] border-b last:border-0 transition-colors ${isActiveSub
                          ? isScrolled
                            ? 'text-[#00A8CC] bg-gray-50'
                            : 'text-[#00A8CC] bg-softgray/30'
                          : isScrolled
                            ? 'text-[#14213D] hover:text-[#00A8CC] hover:bg-gray-50'
                            : 'text-white hover:text-[#00A8CC] hover:bg-softgray/30'
                          }`}>
                          {subLabel}
                        </Link>
                      );
                    })}
                  </div>
                )}
                <div className={`absolute bottom-0 left-5 right-5 h-1 bg-[#C8A96B] transition-transform origin-left ${isParentActive(item) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></div>
              </div>
            ))}
          </div>

          {/* Mobile menu toggle */}
          <div className="lg:hidden flex items-center justify-between w-full py-2">
            <span className={`font-black uppercase text-xs tracking-widest ${isScrolled ? 'text-[#14213D]' : 'text-white'}`}>Navigation</span>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={`${isScrolled ? 'text-[#14213D]' : 'text-white'} p-2`}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`lg:hidden border-t shadow-2xl absolute top-full left-0 w-full z-[100] ${isScrolled ? 'bg-white border-softgray' : 'bg-[#14213D] border-softgray'
                }`}
            >
              <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
                {conferenceData.navigation.map((item, i) => (
                  <div key={i} className="space-y-2">
                    {item.to ? (
                      <Link to={item.to} className={`block text-sm font-black uppercase tracking-widest py-3 border-b ${isParentActive(item)
                        ? 'text-[#00A8CC] border-softgray'
                        : isScrolled
                          ? 'text-[#14213D] border-softgray'
                          : 'text-white border-softgray'
                        }`}>{item.label}</Link>
                    ) : (
                      <a href={item.href || '#'} className={`block text-sm font-black uppercase tracking-widest py-3 border-b ${isParentActive(item)
                        ? 'text-[#00A8CC] border-softgray'
                        : isScrolled
                          ? 'text-[#14213D] border-softgray'
                          : 'text-white border-softgray'
                        }`}>{item.label}</a>
                    )}
                    {item.sub && (
                      <div className="grid grid-cols-2 gap-2 pl-4">
                        {item.sub.map((subItem, j) => {
                          const subLabel = typeof subItem === 'string' ? subItem : subItem.label;
                          const subTo = getSubTo(item, subItem);
                          const isActiveSub = location.pathname === subTo;

                          return (
                            <Link key={j} to={subTo} onClick={() => setMobileMenuOpen(false)} className={`block text-[9px] font-bold uppercase tracking-widest py-2 ${isActiveSub
                              ? 'text-[#00A8CC]'
                              : isScrolled
                                ? 'text-primary/80 hover:text-[#00A8CC]'
                                : 'text-white/60 hover:text-[#00A8CC]'
                              }`}>{subLabel}</Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

const CountdownTimer = () => {
  const { homepageData } = useConference();
  const calculateTimeLeft = () => {
    // Conference target date: November 27, 2026
    const difference = +new Date(homepageData?.countdownTarget || "2026-11-27T00:00:00") - +new Date();
    let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num) => String(num).padStart(2, '0');

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.8 }}
      className="mt-6 md:mt-10"
    >
      <div className="inline-flex items-center justify-center space-x-3 md:space-x-6 bg-white/[0.02] border border-softgray backdrop-blur-xl px-6 py-4 md:px-10 md:py-6 rounded-2xl md:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] hover:border-accent/30 hover:shadow-[0_20px_50px_rgba(217,10,44,0.15)] transition-all duration-500">

        {/* Days */}
        <div className="flex items-center space-x-1 md:space-x-2">
          <span className="text-3xl md:text-5xl lg:text-6xl font-black text-white font-heading tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            {formatNumber(timeLeft.days)}
          </span>
          <span className="text-sm md:text-lg font-black text-[#00A8CC] uppercase select-none tracking-wider">
            D
          </span>
        </div>

        {/* Separator */}
        <span className="text-xl md:text-3xl font-extrabold text-white/15 select-none animate-pulse">:</span>

        {/* Hours */}
        <div className="flex items-center space-x-1 md:space-x-2">
          <span className="text-3xl md:text-5xl lg:text-6xl font-black text-white font-heading tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            {formatNumber(timeLeft.hours)}
          </span>
          <span className="text-sm md:text-lg font-black text-[#00A8CC] uppercase select-none tracking-wider">
            H
          </span>
        </div>

        {/* Separator */}
        <span className="text-xl md:text-3xl font-extrabold text-white/15 select-none animate-pulse">:</span>

        {/* Minutes */}
        <div className="flex items-center space-x-1 md:space-x-2">
          <span className="text-3xl md:text-5xl lg:text-6xl font-black text-white font-heading tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            {formatNumber(timeLeft.minutes)}
          </span>
          <span className="text-sm md:text-lg font-black text-[#00A8CC] uppercase select-none tracking-wider">
            M
          </span>
        </div>

        {/* Separator */}
        <span className="text-xl md:text-3xl font-extrabold text-white/15 select-none animate-pulse">:</span>

        {/* Seconds */}
        <div className="flex items-center space-x-1 md:space-x-2">
          <span className="text-3xl md:text-5xl lg:text-6xl font-black text-white font-heading tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            {formatNumber(timeLeft.seconds)}
          </span>
          <span className="text-sm md:text-lg font-black text-[#00A8CC] uppercase select-none tracking-wider">
            S
          </span>
        </div>

      </div>
    </motion.div>
  );
};

const Hero = () => {
  const { conferenceData, homepageData } = useConference();
  const videoRef = React.useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      // Let the browser's native engine handle the static load automatically on mount.
      // Calling load() programmatically here cancels the initial parse request,
      // which can crash/flicker the GPU video decoder context on Windows Chrome.
      videoRef.current.play().catch(err => {
        console.warn("Video autoplay failed:", err);
      });
    }
  }, []);

  const renderHighlighted = (text) => {
    if (!text) return null;
    const words = text.split(' ');
    if (words.length <= 1) return text;
    const lastWord = words.pop();
    return <>{words.join(' ')} <span className="text-[#00A8CC] italic">{lastWord}</span></>;
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0A0E1A] pt-20">
      {/* Background Video - Direct src attribute for robust loading in React */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        src="/slider.mp4"
        className="absolute inset-0 w-full h-full object-cover scale-105 pointer-events-none z-0"
      />
      {/* Dark Overlay Gradients for Perfect Text Contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80 z-0"></div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 inline-block px-8 py-2 bg-[#C8A96B]/10 border border-[#00A8CC]/20 backdrop-blur-md rounded-full"
        >
          <span className="text-[#00A8CC] text-[10px] font-black tracking-[6px] uppercase">{conferenceData.name}</span>
        </motion.div>

        <div className="relative mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white text-lg md:text-xl font-bold uppercase tracking-[8px] mb-4"
          >
            {homepageData?.heroTitle1 || "Gen Z Public Health Dentistry"}
          </motion.h2>
          <motion.h1
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "circOut" }}
            className="text-6xl md:text-[140px] font-black leading-none tracking-tighter text-outline uppercase relative"
          >
            {renderHighlighted(homepageData?.heroTitle2 || "AUGMENTING AI")}
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-5xl md:text-[100px] font-black leading-none tracking-tighter text-white uppercase mt-[-10px] md:mt-[-30px]"
          >
            {renderHighlighted(homepageData?.heroTitle3 || "& INNOVATION")}
          </motion.h1>
        </div>

        {/* Countdown Timer */}
        <CountdownTimer />

      </div>
    </section>
  );
};

const WelcomeSection = () => {
  const { aboutUs } = useConference();

  return (
    <section className="py-10 bg-[#F5F7FA] relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          <div className="lg:w-1/2 relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#C8A96B]/10 rounded-full blur-3xl"></div>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="relative z-10"
            >
              <img
                src={aboutUs.image || "./about.png"}
                alt="Conference Welcome"
                className="rounded-2xl shadow-2xl w-full object-cover h-[500px]"
              />
              {aboutUs.stats && aboutUs.stats[0] && (
                <div className="absolute -bottom-10 -right-10 bg-[#C8A96B] p-10 rounded-2xl shadow-2xl hidden md:block">
                  <div className="text-5xl font-black mb-2">{aboutUs.stats[0].value}</div>
                  <div className="text-white text-xs font-black uppercase tracking-widest">{aboutUs.stats[0].label}</div>
                </div>
              )}
            </motion.div>
          </div>
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <span className="text-[#00A8CC] font-black uppercase tracking-[6px] text-xs mb-6 block">{aboutUs.tagline}</span>
              <h2 className="text-[#00A8CC] text-4xl md:text-5xl font-black mb-8 leading-tight">
                {aboutUs.heading} <br /> <span className="text-[#00A8CC] italic">{aboutUs.headingHighlight}</span>
              </h2>
              <div
                className="text-black text-lg leading-relaxed mb-10"
                dangerouslySetInnerHTML={{ __html: aboutUs.body }}
              />
              {aboutUs.stats && aboutUs.stats.length > 1 && (
                <div className="grid grid-cols-2 gap-6 mb-10">
                  {aboutUs.stats.slice(1).map((stat, i) => (
                    <div key={i} className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-[#C8A96B]/90 rounded-xl flex items-center justify-center shrink-0">
                        <span className="font-black text-sm">{stat.value}</span>
                      </div>
                      <div>
                        <h4 className="text-[black] font-black uppercase text-xs mb-1">{stat.label}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Link to="/registration" className="inline-flex items-center space-x-3 bg-[#C8A96B] text-white shadow-[0_4px_14px_rgba(200,169,107,0.25)] hover:bg-[#14213D] hover:text-white transition-all px-10 py-5 rounded-full font-black uppercase tracking-widest text-xs shadow-xl hover:scale-105 transition-all">
                <span>Register Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

const CommitteeSection = () => {
  const { conferenceData, chiefPatron } = useConference();
  const members = conferenceData.committees.organizing;

  const scrollRef = React.useRef(null);
  const timeoutRef = React.useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const scroll = (direction) => {
    const { current } = scrollRef;
    if (current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });

      // Briefly pause autoscrolling on manual button clicks
      setIsHovered(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setIsHovered(false);
      }, 6000); // Resume autoscroll after 6 seconds of inactivity
    }
  };

  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      const { current } = scrollRef;
      if (current) {
        const maxScroll = current.scrollWidth - current.clientWidth;
        // If we are close to the end, wrap back to the start smoothly
        if (current.scrollLeft >= maxScroll - 20) {
          current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          const firstChild = current.children[0];
          const cardWidth = firstChild ? firstChild.getBoundingClientRect().width + 32 : 352;
          current.scrollBy({ left: cardWidth, behavior: 'smooth' });
        }
      }
    }, 3000); // Autoscroll every 3 seconds

    return () => clearInterval(interval);
  }, [isHovered]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <section className="py-10  bg-[#F5F7FA] relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#C8A96B]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#C8A96B]/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <span className="text-[#00A8CC] font-black uppercase tracking-[6px] text-xs mb-4 block">Meet the Team</span>
            <h2 className="text-4xl md:text-5xl font-black text-primary uppercase tracking-tighter mb-4">
              Organizing <span className="text-[#00A8CC] text-outline-primary">Committee</span>
            </h2>
          </div>

        </div>

        {/* Chief Patron Section */}
        {chiefPatron && (
          <div className="max-w-4xl mx-auto mb-16">
            <div className="relative overflow-hidden bg-[#faf6ee] text-[#1a202c] rounded-3xl p-8 md:p-12 shadow-xl border border-[#cfbfa3]/30 flex flex-col md:flex-row items-center justify-between gap-8">
              {/* Decorative faint background watermark */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#C8A96B]/3 rounded-full blur-[80px] pointer-events-none"></div>

              {/* Left Content */}
              <div className="flex-1 space-y-4 text-center md:text-left z-10">
                <span className="text-[#00A8CC] font-black uppercase tracking-[6px] text-[10px] block">IAPHD NATCON 2026 Leadership</span>
                <h3 className="text-2xl md:text-4xl font-black tracking-tight text-[#14213D] leading-tight">
                  {chiefPatron.name}
                </h3>
                <div className="space-y-1.5">
                  <p className="text-sm font-black uppercase tracking-[3px] text-[#00A8CC]">
                    {chiefPatron.role}
                  </p>
                  <p className="text-sm md:text-base font-bold text-primary/80">
                    {chiefPatron.institution}
                  </p>
                </div>
              </div>

              {/* Right Content - Photo */}
              <div className="w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden shrink-0 shadow-lg border-4 border-white bg-[#C8A96B]/10 z-10">
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
        {/* Navigation Buttons */}
        <div className="flex space-x-3 shrink-0">
          <button
            onClick={() => scroll('left')}
            className="w-12 h-12 rounded-full border border-softgray bg-white flex items-center justify-center text-[#00A8CC] hover:bg-[#C8A96B] hover:text-accent hover:border-[#00A8CC] transition-all duration-300 shadow-md cursor-pointer group"
            aria-label="Scroll Left"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-12 h-12 rounded-full border border-softgray bg-white flex items-center justify-center text-[#00A8CC] hover:bg-[#C8A96B] hover:text-accent hover:border-[#00A8CC] transition-all duration-300 shadow-md cursor-pointer group"
            aria-label="Scroll Right"
          >
            <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
        {/* Scrollable Container Wrapper with Fade Masks */}
        <div className="relative">
          {/* Left Fade Mask */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none z-10"></div>
          {/* Right Fade Mask */}
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none z-10"></div>

          <div
            ref={scrollRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={() => setIsHovered(true)}
            onTouchEnd={() => setIsHovered(false)}
            className="flex overflow-x-auto scrollbar-none snap-x snap-mandatory gap-8 pb-10 scroll-smooth px-4 -mx-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {members.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.05, duration: 0.35 }}
                className="w-60 md:w-64 shrink-0 snap-start bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl group border border-softgray hover:border-[#00A8CC]/20 transition-all duration-500"
              >
                <div className="relative overflow-hidden h-60 md:h-64 bg-gray-100">
                  <img
                    src={m.img}
                    alt={m.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=002147&color=fff&size=512`;
                    }}
                  />
                  {/* Glowing Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#00A8CC]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                    <p className="text-white/80 text-[10px] font-semibold tracking-wider uppercase">IAPHD NATCON 2026 Organizing Team</p>
                  </div>
                </div>
                <div className="p-5 text-center bg-[#faf6ee]">
                  <h4 className="text-primary font-black uppercase tracking-widest text-xs md:text-sm mb-2 group-hover:text-[#00A8CC] transition-colors duration-300">
                    {m.name}
                  </h4>
                  <p className="text-[#00A8CC] font-bold uppercase text-[9px] md:text-[10px] tracking-widest bg-[#C8A96B]/5 py-1 px-3 rounded-full inline-block">
                    {m.role}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/committees"
            className="text-[#00A8CC] font-black uppercase text-xs tracking-widest border-b-2 border-[#00A8CC] pb-2 hover:text-[#00A8CC] transition-all inline-block hover:scale-105"
          >
            View All Committee Members
          </Link>
        </div>
      </div>
    </section>
  );
};

const parseDateString = (dateStr) => {
  if (!dateStr) return { day: '', month: 'NOV', year: '2026' };
  const cleaned = dateStr.trim();
  const parts = cleaned.split(/\s+/);
  let day = '';
  let month = 'NOV';

  if (parts.length === 1) {
    if (isNaN(parts[0])) {
      month = parts[0].substring(0, 3).toUpperCase();
    } else {
      day = parts[0];
    }
  } else if (parts.length >= 2) {
    if (isNaN(parts[0])) {
      month = parts[0].substring(0, 3).toUpperCase();
      day = parts[1];
    } else {
      day = parts[0];
      month = parts[1].substring(0, 3).toUpperCase();
    }
  }
  return { day, month, year: '2026' };
};

const JoinConference = () => {
  const { programScheduleData } = useConference();
  const hasDynamicDays = programScheduleData?.days && programScheduleData.days.length > 0;
  const [activeDay, setActiveDay] = useState(hasDynamicDays ? programScheduleData.days[0].id : '27');

  useEffect(() => {
    if (hasDynamicDays) {
      const exists = programScheduleData.days.some(d => String(d.id) === String(activeDay));
      if (!exists) {
        setActiveDay(programScheduleData.days[0].id);
      }
    }
  }, [programScheduleData, hasDynamicDays]);

  const tabs = hasDynamicDays
    ? programScheduleData.days.map(d => {
      const { day, month, year } = parseDateString(d.date);
      return {
        id: d.id,
        day,
        month,
        year,
        label: d.label
      };
    })
    : [
      { id: '26', day: '26', month: 'NOV', year: '2026', label: 'Day 0 - Pre-Conf' },
      { id: '27', day: '27', month: 'NOV', year: '2026', label: 'Day 1 - Scientific' },
      { id: '28', day: '28', month: 'NOV', year: '2026', label: 'Day 2 - Presentations' },
      { id: '29', day: '29', month: 'NOV', year: '2026', label: 'Day 3 - Valedictory' }
    ];

  const activeDayData = hasDynamicDays
    ? programScheduleData.days.find(d => String(d.id) === String(activeDay))
    : programScheduleData?.[activeDay];

  const activeTitle = activeDayData?.title || '';
  const activeSubtitle = hasDynamicDays
    ? `${activeDayData?.label || ''}`
    : activeDayData?.subtitle || '';

  const eventsList = hasDynamicDays
    ? (activeDayData?.events || [])
    : (activeDayData?.schedule || []);

  return (
    <section className="py-28 bg-midnight relative overflow-hidden border-t border-softgray" id="program">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C8A96B]/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#C8A96B]/5 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">

        {/* Module Header */}
        <div className="text-center mb-16">
          <span className="text-[#00A8CC] font-black uppercase tracking-[6px] text-xs mb-4 block">Event Timeline</span>
          <h2 className="text-primary text-4xl md:text-5xl font-black uppercase tracking-tighter">
            Join Us <span className="text-[#00A8CC] italic">At Conference</span>
          </h2>
          <div className="w-16 h-1 bg-[#C8A96B] mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Date Tabs Container (Capsule shape like reference site) */}
        <div className="max-w-4xl mx-auto mb-16 p-2 md:p-3 bg-[white/[0.02]] border border-softgray rounded-3xl md:rounded-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xl">
          {tabs.map((tab) => {
            const isActive = String(activeDay) === String(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => setActiveDay(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-3 px-6 py-4 rounded-2xl md:rounded-full transition-all duration-500 cursor-pointer ${isActive
                  ? 'bg-transparent border-2 border-[#00A8CC] text-white shadow-2xl scale-[1.03] md:scale-105'
                  : 'bg-transparent border border-transparent text-primary/60 hover:text-accent hover:bg-white/[0.02]'
                  }`}
              >
                <span className={`text-4xl md:text-5xl font-black tracking-tighter ${isActive ? 'text-primary' : 'text-primary/60'}`}>
                  {tab.day}
                </span>
                <div className="flex flex-col text-left leading-none uppercase">
                  <span className={`text-xs md:text-sm font-black tracking-widest ${isActive ? 'text-[#00A8CC]' : 'text-primary/60'}`}>
                    {tab.month}
                  </span>
                  <span className="text-[10px] font-bold text-primary/80 mt-1">
                    {tab.year}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Program View */}
        <div className="max-w-4xl mx-auto bg-[#faf6ee] shadow-[0_4px_20px_rgba(20,33,61,0.05)] border border-softgray border border-softgray p-6 md:p-10 rounded-2xl md:rounded-3xl shadow-2xl relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C8A96B]/5 rounded-bl-full blur-2xl"></div>

          <div className="mb-10 text-center sm:text-left border-b border-softgray pb-6">
            <h3 className="text-2xl md:text-3xl font-black text-primary uppercase tracking-tighter mb-2">
              {activeTitle}
            </h3>
            <p className="text-primary/60 text-sm font-bold uppercase tracking-widest">
              {activeSubtitle}
            </p>
          </div>

          {/* Timeline list */}
          <div className="space-y-6">
            {eventsList.map((item, idx) => {
              const host = item.host || item.speaker || '';
              const venue = item.venue || item.location || '';
              return (
                <motion.div
                  key={`${activeDay}-${idx}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8 p-5 bg-white/[0.01] hover:bg-white/[0.02] border border-softgray hover:border-[#00A8CC]/20 rounded-xl transition-all duration-300 group"
                >
                  {/* Time Indicator */}
                  <div className="flex items-center text-[#00A8CC] shrink-0 font-black text-xs md:text-sm tracking-widest uppercase md:w-48 bg-[#C8A96B]/5 px-3 py-1.5 rounded-lg border border-[#00A8CC]/10">
                    <Clock className="w-4 h-4 mr-2 shrink-0 animate-pulse" />
                    {item.time}
                  </div>

                  {/* Event Details */}
                  <div className="flex-1">
                    <h4 className="text-primary text-base md:text-lg font-black uppercase tracking-tight group-hover:text-[#00A8CC] transition-colors duration-300">
                      {item.event}
                    </h4>
                    <div className="flex flex-wrap gap-4 md:gap-6 mt-3">
                      {host && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80 flex items-center">
                          <Users className="w-3.5 h-3.5 mr-1.5 text-[#00A8CC]" />
                          Host: {host}
                        </span>
                      )}
                      {venue && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80 flex items-center">
                          <MapPin className="w-3.5 h-3.5 mr-1.5 text-[#00A8CC]" />
                          Venue: {venue}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* CTA & Brochure Actions inside Active Program */}
          <div className="mt-12 pt-8 border-t border-softgray flex flex-col sm:flex-row items-center justify-between gap-6">
            <Link
              to="/registration"
              className="w-full sm:w-auto px-10 py-5 bg-[#C8A96B] text-white font-black uppercase tracking-widest text-xs rounded-full hover:bg-[#14213D] hover:text-white transition-all duration-300 shadow-[0_4px_14px_rgba(200,169,107,0.25)] hover:scale-105 text-center"
            >
              Register & Reserve Seats
            </Link>

            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-5 border border-softgray text-white font-black uppercase tracking-widest text-[10px] rounded-full hover:bg-softgray/30 border border-softgray transition-all duration-300 flex items-center justify-center hover:border-softgray"
            >
              <Download className="w-4 h-4 mr-2" /> Download Full Schedule PDF
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};

const HomepagePopup = () => {
  const { homepagePopup } = useConference();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (homepagePopup?.enabled && homepagePopup?.imageUrl) {
      const hasShown = sessionStorage.getItem('iaphd_popup_shown');
      if (!hasShown) {
        // Show after a brief delay for a smoother entrance
        const timer = setTimeout(() => {
          setIsOpen(true);
          sessionStorage.setItem('iaphd_popup_shown', 'true');
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [homepagePopup]);

  if (!homepagePopup?.imageUrl) return null;

  const handleImageClick = () => {
    if (homepagePopup.linkUrl) {
      setIsOpen(false);
      const url = homepagePopup.linkUrl.trim();
      if (url.startsWith('http://') || url.startsWith('https://')) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        // Internal route, use router navigate
        navigate(url);
      }
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative w-full max-w-lg md:max-w-xl bg-gradient-to-b from-[#14213D] to-[#0B132B] border border-[#C8A96B]/30 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center bg-black/50 hover:bg-black/80 text-white rounded-full border border-white/10 hover:border-white/30 transition-all cursor-pointer"
              aria-label="Close popup"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Banner Area */}
            <div
              className={`relative cursor-pointer overflow-hidden ${homepagePopup.linkUrl ? 'hover:opacity-95 transition-opacity' : ''}`}
              onClick={handleImageClick}
            >
              <img
                src={homepagePopup.imageUrl}
                alt="Conference Promotion"
                className="w-full h-auto max-h-[70vh] object-contain block mx-auto transition-transform duration-500 hover:scale-[1.02]"
              />
              {homepagePopup.linkUrl && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#C8A96B]/90 backdrop-blur-sm text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#14213D] transition-colors border border-white/10 shadow-lg flex items-center gap-1.5 animate-bounce">
                  View Details <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

const Home = () => {
  return (
    <div className="relative">
      <Hero />
      <WelcomeSection />
      <CommitteeSection />
      <RegistrationTable />
      <JoinConference />
      <HomepagePopup />
    </div>
  );
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};


const FloatingActions = () => {
  const location = useLocation();
  const { contactSettings } = useConference();

  if (location.pathname === '/admin') return null;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-6 right-6 z-[120] flex flex-col items-center space-y-3.5 select-none no-print">
      {/* Call Secretariat Button */}
      <motion.a
        href={`tel:${contactSettings.phone}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="w-12 h-12 bg-[#C8A96B] text-white shadow-[0_4px_14px_rgba(200,169,107,0.25)] hover:bg-[#14213D] hover:text-white transition-all rounded-full shadow-lg flex items-center justify-center border border-softgray relative group cursor-pointer hover:text-[#00A8CC] transition-colors"
        aria-label="Call Secretariat"
      >
        <Phone className="w-5 h-5" />
        <div className="absolute right-full mr-4 bg-black border border-softgray text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 whitespace-nowrap shadow-xl pointer-events-none">
          Call secretariat
        </div>
      </motion.a>

      {/* WhatsApp Chat Button */}
      <motion.a
        href={`https://wa.me/${String(contactSettings?.whatsapp || '').replace(/[^0-9]/g, '')}`}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="w-12 h-12 bg-[#25d366] text-white rounded-full shadow-lg flex items-center justify-center border border-softgray relative group cursor-pointer hover:bg-[#20ba5a] transition-colors"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-5 h-5" />
        <div className="absolute right-full mr-4 bg-black border border-softgray text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 whitespace-nowrap shadow-xl pointer-events-none">
          Chat on WhatsApp
        </div>
      </motion.a>

      {/* Back to Top Button */}
      <motion.button
        onClick={scrollToTop}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="w-12 h-12 bg-[#C8A96B] text-white shadow-[0_4px_14px_rgba(200,169,107,0.25)] hover:bg-[#14213D] hover:text-white transition-all rounded-full shadow-lg flex items-center justify-center border border-softgray relative group cursor-pointer  hover:text-[#00A8CC] transition-colors"
        aria-label="Scroll to Top"
      >
        <ChevronUp className="w-5 h-5" />
        <div className="absolute right-full mr-4 bg-black border border-softgray text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 whitespace-nowrap shadow-xl pointer-events-none">
          Back to Top
        </div>
      </motion.button>
    </div>
  );
};

const Footer = () => {
  const location = useLocation();

  if (location.pathname === '/admin') return null;

  return (
    <footer
      className="pt-20 relative overflow-hidden border-t border-softgray no-print"
      id="contact"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(11, 19, 43, 0.93) 0%, rgba(5, 11, 24, 0.88) 100%), url('https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1920&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 60%',
        backgroundBlendMode: 'luminosity'
      }}
    >
      {/* Decorative Corner Triangles exactly like reference */}
      <div className="absolute bottom-0 left-0 w-0 h-0 border-t-[80px] border-t-transparent border-l-[80px] border-l-primary/30 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-0 h-0 border-b-[80px] border-b-transparent border-r-[80px] border-r-primary/30 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col items-center justify-center text-center">
        {/* Large Centered Branding Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <h2 className="text-4xl md:text-7xl font-black text-white uppercase tracking-wider font-sans drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            IAPHD NATCON2026-Vizag
          </h2>
          <div className="w-24 h-1 bg-[#C8A96B]/50 mx-auto mt-4 rounded-full"></div>
        </motion.div>

        {/* Dynamic Partner Subtitle */}
        <p className="text-white text-xs font-black uppercase tracking-[4px] mb-8">
          30<sup className="lowercase">th</sup> IAPHD National Conference
        </p>
      </div>

      {/* Gold Styled Bottom Bar */}
      <div className="bg-midnight/90 py-6 border-t border-softgray relative z-10 mt-5">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-primary  transition-colors text-xs font-bold uppercase tracking-wider leading-relaxed">
            Copyright 2026 All Rights Reserved by{' '}
            <a
              href="https://www.ambidexsoft.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-accent transition-colors"
            >
              Ambidex Software Solutions
            </a>
            {' '}||{' '}
            <Link to="/terms" className="hover:text-accent transition-colors underline">T&C</Link>
            {' '}||{' '}
            <Link to="/privacy" className="hover:text-accent transition-colors underline">Privacy Policy</Link>
            {' '}||{' '}
            <Link to="/refund-policy" className="hover:text-accent transition-colors underline">Refund Policy</Link>
            {' '}||{' '}
            <Link to="/faqs" className="hover:text-accent transition-colors underline">FAQs</Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

const SeoController = () => {
  const { pathname } = useLocation();
  const { seoSettings } = useConference();

  useEffect(() => {
    let key = 'home';
    if (pathname === '/committees') key = 'committees';
    else if (pathname === '/scientific') key = 'scientific';
    else if (pathname === '/registration') key = 'registration';
    else if (pathname === '/schedules') key = 'schedules';
    else if (pathname === '/submissions') key = 'submissions';
    else if (pathname === '/venue') key = 'venue';
    else if (pathname === '/trade') key = 'trade';
    else if (pathname === '/workshops') key = 'workshops';
    else if (pathname === '/tourist') key = 'tourist';
    else if (pathname === '/utility') key = 'utility';
    else if (pathname === '/faqs') key = 'faqs';
    else if (pathname === '/terms') key = 'faqs';
    else if (pathname === '/privacy') key = 'faqs';
    else if (pathname === '/refund-policy') key = 'faqs';
    else if (pathname.includes('/about')) key = 'about';

    const currentSeo = seoSettings?.[key] || seoSettings?.home;
    if (currentSeo) {
      document.title = currentSeo.title;

      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', currentSeo.description);

      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', currentSeo.keywords);
    }
  }, [pathname, seoSettings]);

  return null;
};

const MainAppRoutes = () => {
  const { disabledPages } = useConference();

  const getPage = (path, component, name) => {
    if (disabledPages?.[path]) {
      return <UnderConstruction pageName={name} />;
    }
    return component;
  };

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={getPage('/about', <AboutUs />, 'About Us')} />
      <Route path="/registration-guidelines" element={getPage('/registration-guidelines', <RegistrationGuidelines />, 'Registration Guidelines')} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/registration" element={getPage('/registration', <RegistrationForm />, 'Registration Tariff')} />
      <Route path="/registration-form" element={getPage('/registration-form', <RegistrationForm />, 'Online Registration Form')} />
      <Route path="/offline-registration" element={getPage('/offline-registration', <OfflineRegistration />, 'Offline Registration')} />
      <Route path="/venue" element={getPage('/venue', <Venue />, 'Venue & Accommodation')} />
      <Route path="/committees" element={getPage('/committees', <Committees />, 'Organizing Committee')} />
      <Route path="/scientific" element={getPage('/scientific', <Scientific />, 'Scientific Details')} />
      <Route path="/schedules" element={getPage('/schedules', <Schedules />, 'Event Schedules')} />
      <Route path="/trade" element={getPage('/trade', <Trade />, 'Trade & Sponsorship')} />
      <Route path="/abstract-guidelines" element={getPage('/abstract-guidelines', <AbstractGuidelines />, 'Abstract Guidelines')} />
      <Route path="/submissions" element={getPage('/submissions', <Submissions />, 'Scientific Submissions')} />
      <Route path="/workshops" element={getPage('/workshops', <Workshops />, 'Preconference Workshops')} />
      <Route path="/utility" element={<Utility />} />
      <Route path="/tourist" element={getPage('/tourist', <Tourist />, 'Tourist Attractions')} />
      <Route path="/faqs" element={<Faqs />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/refund-policy" element={<RefundPolicy />} />
      <Route path="/terms" element={<TermsConditions />} />
      <Route path="/contact" element={getPage('/contact', <Contact />, 'Contact Details')} />
    </Routes>
  );
};

const AppContent = () => {
  const { isPromoVideoOpen } = useConference();

  return (
    <Router basename="/">
      <ScrollToTop />
      <SeoController />
      {!isPromoVideoOpen && <Header />}
      <div className="relative z-10">
        <MainAppRoutes />
      </div>
      {!isPromoVideoOpen && <FloatingActions />}
      <ToastContainer />
      {!isPromoVideoOpen && <Footer />}
    </Router>
  );
};

const App = () => {
  return (
    <ConferenceProvider>
      <AppContent />
    </ConferenceProvider>
  );
};

export default App;

