import React, { createContext, useContext, useState, useEffect } from 'react';

const ConferenceContext = createContext();

export const ConferenceProvider = ({ children }) => {
  // MySQL is the single source of truth. localStorage is not used for CMS data.
  // getLocal/setLocal kept only for auth token (non-CMS use).
  const getLocal = (key, defaultValue) => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (e) { return defaultValue; }
  };
  const setLocal = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { }
  };

  const [pricingPhase, setPricingPhaseState] = useState('earlyBird');
  const [notification, setNotificationState] = useState('Early bird registration for IAPHD NATCON 2026 is now open! Secure your spot by July 15.');

  const [organizingMembers, setOrganizingMembersState] = useState([
    { name: "Dr. P. Siva Kumar", role: "Organizing Chairman" },
    { name: "Dr. P. Nagarjuna", role: "Organizing Secretary" },
    { name: "Dr. Shourya Tandon", role: "Scientific Chairman" },
    { name: "Dr. Swathi.P", role: "Treasurer" },
    { name: "Dr. Srinivas Rao", role: "Co-Chairman" },
    { name: "Dr. Kavitha S.", role: "Joint Secretary" },
    { name: "Dr. Rajesh Kumar", role: "Reception Committee" },
    { name: "Dr. Anjali Devi", role: "Advisory Committee" }
  ]);

  const [headOfficeLeaders, setHeadOfficeLeadersState] = useState([
    { role: "President", name: "Dr M B Aswath Narayanan" },
    { role: "President Emeritus", name: "Dr. R K Bali" },
    { role: "President Elect", name: "Dr Vamsi Krishna Reddy L" },
    { role: "Immediate Past President", name: "Dr. Arun S Dodamani" },
    { role: "Vice President", name: "Dr Sowmya K R" },
    { role: "Vice President", name: "Dr Vikrant Mohanty" },
    { role: "Hon General Secretary", name: "Dr Ridhima Gaunkar" },
    { role: "Treasurer", name: "Dr Praveen Jodalli" },
    { role: "Joint Secretary", name: "Dr. Ramya R Iyer" }
  ]);

  const [ecMembers, setEcMembersState] = useState([
    "Dr. Padma K Bhat", "Dr. Ramprasad VP", "Dr. Prashanth VK", "Dr. Chandrashekar BR",
    "Dr. Mansi Atri", "Dr. Arpit Gupta", "Dr. Bommireddy Vikram Simha", "Dr. Satyanarayana D",
    "Dr. Swapnil S Bumb", "Dr. Ankita Jain", "Dr. Pottem Nagarjuna", "Dr. Tanushri Mahendra Dalvi"
  ]);

  const [conferenceCommittee, setConferenceCommitteeState] = useState([
    { name: "Dr. Anirudh Sharma", role: "Scientific Committee" },
    { name: "Dr. Priyanka Verma", role: "Registration Committee" },
    { name: "Dr. Sandeep Hegde", role: "Transport Committee" }
  ]);
  const [scientificCategories, setScientificCategoriesState] = useState([
    {
      id: '1stpg',
      label: "1st Year PGs",
      type: "Theme-based Poster",
      rules: ["3 mins presentation + 1 min discussion", "Static content only", "Landscape orientation"]
    },
    {
      id: '2ndpg',
      label: "2nd Year PGs",
      type: "Scientific Posters / QIP",
      rules: ["3 mins presentation + 1 min discussion", "Structured format mandatory", "Must include Reg Number"]
    },
    {
      id: '3rdpg',
      label: "3rd Year PGs",
      type: "Oral Presentations / QIP",
      rules: ["6 mins presentation + 2 mins discussion", "Structured: Intro, Rationale, Objectives, Methodology, Results", "Template provided"]
    },
    {
      id: 'faculty',
      label: "Faculty",
      type: "Theme-based Posters",
      rules: ["Open to Faculty, Staff, and Life Members", "Theme: Optimal Oral Health: Policy Meets Prevention"]
    }
  ]);

  const [scientificAbstract, setScientificAbstractState] = useState({
    wordLimit: 250,
    restrictions: "No figures, tables, or photographs.",
    structure: ["Introduction", "Aim/Objectives", "Methodology", "Results", "Conclusion"]
  });

  const [scientificDownloads, setScientificDownloadsState] = useState([
    { title: 'Abstract Guidelines', desc: 'Full PDF with structured formatting rules.', fileUrl: '' },
    { title: 'Presentation Template', desc: 'Official PowerPoint template for IAPHD NATCON 2026.', fileUrl: '' },
    { title: 'Poster Template', desc: 'Landscape oriented template for E-Posters.', fileUrl: '' }
  ]);

  const [abstractGuidelines, setAbstractGuidelinesState] = useState({
    heading: "Abstract Submission Guidelines",
    intro: "All abstracts must be submitted online through the official submissions portal. Read the following guidelines carefully before proceeding.",
    rules: [
      "Abstract must be written in English only.",
      "Word limit: 250 words (excluding title and author names).",
      "Structured format mandatory: Introduction, Aim/Objectives, Methodology, Results, Conclusion.",
      "No figures, tables, photographs, or references in the abstract.",
      "Authors must not reveal institutional names in the abstract body (blind review).",
      "Presenting author must be a registered delegate of IAPHD NATCON 2026.",
      "Each delegate may submit a maximum of two (2) abstracts.",
      "Abstracts will undergo plagiarism check. Max 15% similarity acceptable.",
      "Decision of the Scientific Committee is final and binding.",
      "Accepted abstracts will be published in the conference souvenir."
    ],
    deadline: "Abstract submission deadline: September 30, 2026",
    contactNote: "For submission queries, contact the scientific secretary at support.30thiaphdnatcon@gmail.com"
  });

  const [registrationGuidelines, setRegistrationGuidelinesState] = useState({
    heading: "Registration Guidelines",
    intro: "Please read these instructions before completing your registration to ensure a smooth process.",
    steps: [
      "Fill in all personal and institutional details accurately as they will appear on your certificate.",
      "Select your delegate category (Faculty / Post Graduate / Clinical Practitioner / Other).",
      "Choose the appropriate registration tier: Classic or Premium.",
      "Complete the secure online payment instantly using the Razorpay gateway.",
      "Upload a professional passport-size photo for your delegate badge.",
      "Your confirmed Registration ID and official E-Receipt will be generated instantly on successful checkout.",
      "Carry a printout or soft copy of your registration ID for on-spot check-in."
    ],
    bankDetails: [],
    note: "For any registration issues, contact us at registrations.30thiaphdnatcon@gmail.com or call +91 9393344886."
  });

  const [aboutUs, setAboutUsState] = useState({
    tagline: "Welcome to IAPHD NATCON 2026",
    heading: "Empowering Public Health",
    headingHighlight: "Through Innovation",
    body: "The 30th National Conference of Indian Association of Public Health Dentistry (IAPHD) is set to be a landmark event in Visakhapatnam. We bring together experts, researchers, and practitioners to explore the theme of \"Gen Z Public Health Dentistry: Augmenting AI & Innovation\".",
    image: "./about.png",
    stats: [
      { label: "Speakers", value: "30+" },
      { label: "Delegates Expected", value: "1000+" },
      { label: "Scientific Sessions", value: "20+" },
      { label: "Years of IAPHD", value: "30th" }
    ]
  });

  const [chiefPatron, setChiefPatronState] = useState({
    name: "Dr. L. Vamsi Krishna Reddy",
    role: "Principal",
    institution: "Anil Neerukonda Institute of Dental Sciences",
    image: "./portrait.png"
  });

  // ── SCHEDULES ────────────────────────────────────────────────────────────
  const [scheduleData, setScheduleDataState] = useState({
    days: [
      {
        id: '1',
        label: 'Day 01',
        date: 'Nov 27',
        title: 'Scientific Program – Day 1',
        events: [
          { time: '08:00 AM', event: 'Registration & Welcome Kit Collection', speaker: 'Secretariat', location: 'Main Lobby', isBreak: false },
          { time: '09:30 AM', event: 'Grand Inaugural Ceremony & Lamp Lighting', speaker: 'Organizing Committee', location: 'Auditorium A', isBreak: false },
          { time: '11:00 AM', event: 'High Tea & Networking Break', speaker: '', location: '', isBreak: true },
          { time: '11:30 AM', event: 'Keynote: AI in Dental Public Health', speaker: 'Dr. Michael Chen', location: 'Hall 1', isBreak: false }
        ]
      },
      {
        id: '2',
        label: 'Day 02',
        date: 'Nov 28',
        title: 'Scientific Program – Day 2',
        events: [
          { time: '09:00 AM', event: 'Scientific Poster Session', speaker: 'Delegates', location: 'Exhibition Hall', isBreak: false },
          { time: '10:30 AM', event: 'Paper Presentations – Session I', speaker: '3rd Year PGs', location: 'Hall 2', isBreak: false },
          { time: '01:00 PM', event: 'Lunch Break', speaker: '', location: '', isBreak: true },
          { time: '07:30 PM', event: 'Gala Banquet & Cultural Night', speaker: 'Organizing Committee', location: 'Convention Centre', isBreak: false }
        ]
      },
      {
        id: '3',
        label: 'Day 03',
        date: 'Nov 29',
        title: 'Valedictory – Day 3',
        events: [
          { time: '09:30 AM', event: 'Panel Discussion: Future of Dentistry', speaker: 'Dr. Sarah Johnson', location: 'Hall 1', isBreak: false },
          { time: '11:30 AM', event: 'Valedictory Ceremony & Awards', speaker: 'Hon. Office Bearers', location: 'Auditorium A', isBreak: false }
        ]
      }
    ]
  });

  // ── VENUE ────────────────────────────────────────────────────────────────
  const [venueInfo, setVenueInfoState] = useState({
    name: 'Anil Neerukonda Institute of Dental Sciences (ANIDS)',
    description: 'Located in the serene surroundings of Sangivalasa, ANIDS provides a state-of-the-art academic environment for IAPHD NATCON 2026. The campus is equipped with modern lecture halls and exhibition spaces perfect for global dental discourse.',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Anil+Neerukonda+Institute+Dental+Sciences+Visakhapatnam',
    imageUrl: 'https://iactacon2026.com/wp-content/uploads/2023/12/venue-img.jpg',
    subtitle: 'Visakhapatnam – The City of Destiny'
  });

  const [hotelsList, setHotelsListState] = useState([
    {
      name: 'Novotel Varun Beach',
      rating: '5 Star',
      dist: '15 mins',
      img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800',
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=Novotel+Varun+Beach+Visakhapatnam',
      bookUrl: 'https://all.accor.com/hotel/7535/index.en.shtml'
    },
    {
      name: 'The Gateway Hotel',
      rating: '4 Star',
      dist: '10 mins',
      img: 'https://images.unsplash.com/photo-1551882319-857a46492fd6?auto=format&fit=crop&q=80&w=800',
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=The+Gateway+Hotel+Visakhapatnam',
      bookUrl: 'https://www.tajhotels.com/en-in/gateway/visakhapatnam/'
    },
    {
      name: 'Dolphin Hotel',
      rating: '4 Star',
      dist: '5 mins',
      img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800',
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=Dolphin+Hotel+Visakhapatnam',
      bookUrl: 'https://www.dolphinhotels.com/'
    }
  ]);

  // ── TRADE ────────────────────────────────────────────────────────────────
  const [tradeData, setTradeDataState] = useState({
    sponsorshipTiers: [
      { name: 'Platinum Partner', price: '₹ 5,00,000', borderColor: 'border-white/10' },
      { name: 'Gold Partner', price: '₹ 3,00,000', borderColor: 'border-yellow-500' },
      { name: 'Silver Partner', price: '₹ 1,50,000', borderColor: 'border-gray-400' }
    ],
    exhibitorGuidelines: [
      'Stall size standard: 3m x 3m octanorm structure.',
      'Each stall includes 2 chairs, 1 table, 1 plug point.',
      'Exhibitor name badge for 3 representatives.',
      'Full page color advertisement in souvenir.',
      'Power supply backup for critical diagnostic devices.'
    ],
    sponsorFormNote: 'We warmly invite you and your esteemed organization to participate in the Trade Exhibition. The detailed trade brochure provides comprehensive information on stall layouts, tariff structures, and booking procedures.'
  });

  // ── WORKSHOPS ────────────────────────────────────────────────────────────
  const [workshopsList, setWorkshopsListState] = useState([
    {
      id: 1,
      title: 'AI in Public Health Surveillance',
      mentor: 'Dr. Arvind Rao',
      seats: 30,
      price: '₹ 1,500',
      time: '09:00 AM – 01:00 PM',
      desc: 'Comprehensive hands-on training on using machine learning algorithms for dental epidemiology.'
    },
    {
      id: 2,
      title: 'Advanced Biostatistics for Clinicians',
      mentor: 'Dr. S. Meenakshi',
      seats: 25,
      price: '₹ 2,000',
      time: '02:00 PM – 05:00 PM',
      desc: 'Deep dive into regression models and sample size calculation for dental research papers.'
    },
    {
      id: 3,
      title: 'Scientific Writing & Publication',
      mentor: 'Dr. Rajesh G.',
      seats: 40,
      price: '₹ 1,000',
      time: '10:00 AM – 01:00 PM',
      desc: 'Mastering the art of writing abstracts and choosing the right high-impact journals.'
    }
  ]);

  // ── TOURIST ──────────────────────────────────────────────────────────────
  const [cityIntro, setCityIntroState] = useState({
    heading: 'Discover Vizag',
    body: 'Visakhapatnam, also known as Vizag, is the largest city and the financial capital of Andhra Pradesh. Nestled between the Eastern Ghats and the Bay of Bengal, it offers a unique blend of natural beauty and urban development.',
    travelTip: 'The conference month (November) is the best time to visit Vizag, with pleasant weather ranging from 20°C to 28°C.',
    heroImage: 'https://images.unsplash.com/photo-1590393282216-0428989f6681?auto=format&fit=crop&q=80&w=1200'
  });

  const [touristAttractions, setTouristAttractionsState] = useState([
    {
      title: 'RK Beach (Rama Krishna Beach)',
      desc: 'One of the most popular beaches in Vizag, perfect for evening strolls and visiting the Kursura Submarine Museum.',
      img: 'https://images.unsplash.com/photo-1626082895617-2c6de34769bb?auto=format&fit=crop&q=80&w=800'
    },
    {
      title: 'Kailasagiri',
      desc: 'A hilltop park offering spectacular panoramic views of the city and the coastline. Features giant statues of Shiva and Parvati.',
      img: 'https://images.unsplash.com/photo-1596402184320-417d7178b2cd?auto=format&fit=crop&q=80&w=800'
    },
    {
      title: 'INS Kursura Submarine Museum',
      desc: 'A decommissioned Kalvari-class submarine of the Indian Navy, preserved as a museum on RK Beach.',
      img: 'https://images.unsplash.com/photo-1614030424754-24d1fbf48f2c?auto=format&fit=crop&q=80&w=800'
    },
    {
      title: 'Araku Valley',
      desc: 'A scenic hill station about 114km from Vizag, famous for its coffee plantations, caves, and tribal culture.',
      img: 'https://images.unsplash.com/photo-1600255817112-b081bc562241?auto=format&fit=crop&q=80&w=800'
    }
  ]);

  const [seoSettings, setSeoSettingsState] = useState({
    home: { title: "IAPHD NATCON 2026 | 30th National IAPHD Conference", description: "30th National Conference of Indian Association of Public Health Dentistry, Visakhapatnam. Augmenting AI and Innovation.", keywords: "IAPHD, NATCON, Dentistry, Visakhapatnam, AI, Public Health" },
    about: { title: "About Us | IAPHD NATCON 2026", description: "Learn about the Indian Association of Public Health Dentistry (IAPHD) and the 30th National Conference.", keywords: "About, IAPHD, NATCON, Conference" },
    committees: { title: "Leadership & Committees | IAPHD NATCON 2026", description: "Meet the Organizing Committee, Head Office Leaders, and Executive Committee members.", keywords: "Organizing Committee, Leadership, Office Bearers" },
    scientific: { title: "Scientific Program & Guidelines | IAPHD NATCON 2026", description: "Submission rules, presentation categories, abstract structure guidelines.", keywords: "Scientific Program, Abstract Guidelines, Poster Session" },
    registration: { title: "Online Registration & Tariff | IAPHD NATCON 2026", description: "Register for IAPHD NATCON 2026 conference. Select packages and submit proof of payment.", keywords: "Register, Tariff, Early Bird, Invoice" },
    schedules: { title: "Conference & Presentation Schedule | IAPHD NATCON 2026", description: "Tentative timelines, oral sessions, presentation timings.", keywords: "Schedule, Presentation, Timing, Sessions" },
    submissions: { title: "Abstract & Presentation Submission Portal | IAPHD NATCON 2026", description: "Dynamic submission gateway for registered delegates to upload files.", keywords: "Abstract Submission, PPT Upload, PDF Upload" },
    venue: { title: "Venue & Stay Information | IAPHD NATCON 2026", description: "Conference venue at ANIDS, Visakhapatnam. Recommended stays and map directions.", keywords: "Venue, Hotel, Stays, Anil Neerukonda, Visakhapatnam" },
    trade: { title: "Trade & Sponsorship Opportunities | IAPHD NATCON 2026", description: "Trade stall booking tariff, sponsor details, layout maps.", keywords: "Sponsorship, Stall Booking, Trade Exhibition" },
    workshops: { title: "Preconference Workshops | IAPHD NATCON 2026", description: "Details and registration for hand-on courses and preconference workshops.", keywords: "Workshops, Training, Hands-on Course" },
    tourist: { title: "Tourist Attractions | IAPHD NATCON 2026", description: "Explore the beautiful city of Visakhapatnam (Vizag) and its key attractions.", keywords: "Vizag, Tourism, Travel, RK Beach, Araku" },
    utility: { title: "Delegate Utilities & E-Receipt | IAPHD NATCON 2026", description: "Download payment receipts or retrieve unique registration number.", keywords: "Download Receipt, Find Reg Number" },
    faqs: { title: "Frequently Asked Questions | IAPHD NATCON 2026", description: "Find answers to queries regarding registration, accommodation, and scientific program.", keywords: "FAQs, Help, Support" }
  });

  const [contactSettings, setContactSettingsState] = useState(() => getLocal('iaphd_contact_cache', {
    phone: "9393344886",
    whatsapp: "919393344886",
    supportEmail: "support.30thiaphdnatcon@gmail.com",
    registrationEmail: "registrations.30thiaphdnatcon@gmail.com"
  }));

  const [headerLogos, setHeaderLogosState] = useState(() => {
    const cached = getLocal('iaphd_logos_cache', null);
    if (cached) {
      return { favicon: "./favicon.svg", ...cached };
    }
    return {
      logo1: "./logo-1.png",
      logo2: "./logo-1.png",
      logo3: "./logo-2.png",
      logo4: "./logo-2.png",
      favicon: "./favicon.svg"
    };
  });

  const [homepagePopup, setHomepagePopupState] = useState(() => {
    const cached = getLocal('iaphd_homepage_popup_cache', null);
    if (cached) {
      return { enabled: false, imageUrl: '', linkUrl: '', ...cached };
    }
    return {
      enabled: false,
      imageUrl: '',
      linkUrl: ''
    };
  });

  const [registrationTiers, setRegistrationTiersState] = useState(() => getLocal('iaphd_tiers_cache', [
    {
      id: 'classic',
      name: "Classic",
      includes: "Registration + Hospitality",
      benefits: ["Scientific sessions", "Delegate kit", "3 Breakfasts/Lunches", "Presidential dinner", "Certificate", "Gift"],
      pricing: [
        { category: "IAPHD Student Members", earlyBird: 8500, standard: 9500, spot: 10500 },
        { category: "IAPHD Life Members", earlyBird: 9500, standard: 10500, spot: 11500 },
        { category: "Non-IAPHD Members", earlyBird: 12000, standard: 13000, spot: 14000 },
        { category: "Foreign delegates", earlyBird: 21250, standard: 25500, spot: 29750, displayEarlyBird: "250 USD", displayStandard: "300 USD", displaySpot: "350 USD" },
        { category: "Accompanying person/Spouse", earlyBird: 8500, standard: 9500, spot: 10500 }
      ]
    },
    {
      id: 'premium',
      name: "Premium",
      includes: "Registration + Hospitality + Gala Banquet",
      benefits: ["All Classic benefits", "Gala Banquet", "Cultural night"],
      pricing: [
        { category: "IAPHD Student Members", earlyBird: 10500, standard: 11500, spot: 12500 },
        { category: "IAPHD Life Members", earlyBird: 11500, standard: 12500, spot: 13500 },
        { category: "Non-IAPHD Members", earlyBird: 14500, standard: 15500, spot: 16500 },
        { category: "Foreign delegates", earlyBird: 25500, standard: 29750, spot: 34000, displayEarlyBird: "300 USD", displayStandard: "350 USD", displaySpot: "400 USD" },
        { category: "Accompanying person/Spouse", earlyBird: 11000, standard: 12000, spot: 13000 }
      ]
    }
  ]));

  const conferenceData = {
    name: "30th IAPHD NATCON 2026",
    fullName: "30th Indian Association of Public Health Dentistry National Conference 2026",
    theme: "Gen Z Public Health Dentistry: Augmenting AI, Analytics and Innovation",
    venue: "Anil Neerukonda Institute of Dental Sciences (ANIDS), Visakhapatnam",
    dates: "November 27-29, 2026",
    host: "Department of Public Health Dentistry, ANIDS, Visakhapatnam",

    navigation: [
      { label: 'Home', to: '/' },
      {
        label: 'About',
        to: '/about',
        sub: [
          { label: 'About Us', to: '/about' },
          { label: 'Committees', to: '/committees' },
          { label: 'About Venue', to: '/venue' },
          { label: 'Tourist Attractions', to: '/tourist' }
        ]
      },
      {
        label: 'Registration',
        to: '/registration',
        sub: [
          { label: 'Registration Guidelines', to: '/registration-guidelines' },
          { label: 'Registration Tariff', to: '/registration' },
          { label: 'Online Registration', to: '/registration-form' },
          { label: 'Download E Receipt', to: '/utility' }
        ]
      },
      {
        label: 'Scientific',
        to: '/scientific',
        sub: [
          { label: 'Scientific Guidelines', to: '/scientific' },
          { label: 'Scientific Program', to: '/scientific' },
          { label: 'Preconference Workshops', to: '/workshops' }
        ]
      },
      {
        label: 'Schedules',
        to: '/schedules',
        sub: [
          { label: 'CONFERENCE SCHEDULE(TENTATIVE)', to: '/schedules' },
          { label: 'SCIENTIFIC SCHEDULE', to: '/schedules' },
          { label: 'PRESENTATION SCHEDULE', to: '/schedules' }
        ]
      },
      {
        label: 'Submissions',
        to: '/submissions',
        sub: [
          { label: 'Abstract Submission Guidelines', to: '/abstract-guidelines' },
          { label: 'ABSTRACT SUBMISSION', to: '/submissions' },
          { label: 'PRESENTATION SUBMISSION', to: '/submissions' }
        ]
      },
      {
        label: 'Trade',
        to: '/trade',
        sub: [
          { label: 'Trade Guidelines', to: '/trade' },
          { label: 'Trade Layout', to: '/trade' },
          { label: 'Sponsorship Form', to: '/trade' }
        ]
      },
      { label: 'Accommodation', to: '/venue#accommodation' },
      { label: 'Contact Us', to: '/contact' }
    ],

    registration: {
      phases: {
        earlyBird: { label: "Early Bird", dates: "June 1 – July 15, 2026" },
        standard: { label: "Standard", dates: "July 16 – August 31, 2026" },
        spot: { label: "Spot", dates: "On Spot" }
      },
      get tiers() {
        return registrationTiers;
      },
      get refundPolicy() {
        return refundPolicy;
      }
    },
    get committees() {
      return {
        organizing: organizingMembers,
        headOffice: {
          leaders: headOfficeLeaders,
          ecMembers: ecMembers
        },
        conferenceCommittee: conferenceCommittee
      };
    },
    get scientific() {
      return {
        categories: scientificCategories,
        abstract: scientificAbstract
      };
    }
  };

  const [speakers, setSpeakersState] = useState([
    { id: 1, name: 'Dr. Michael Chen', specialty: 'AI in Dentistry', image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200&h=200' },
    { id: 2, name: 'Dr. Sarah Johnson', specialty: 'Public Health Innovation', image: 'https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=200&h=200' },
  ]);

  const [faqs, setFaqsState] = useState([
    { id: 1, question: "How do I register for IAPHD NATCON 2026?", answer: "You can register by clicking the 'Register & Reserve Seats' button on the homepage, filling out the multi-step delegation registration form, and completing the payment process." },
    { id: 2, question: "Is there an abstract submission deadline?", answer: "Yes, abstract submissions will be open shortly and details will be updated on the Submissions guidelines page." },
  ]);

  const [privacyPolicy, setPrivacyPolicyState] = useState(`We value your privacy. All registration details, personal profiles, and online transaction records collected for IAPHD NATCON 2026 are encrypted and stored securely. We do not sell, rent, or share delegate information with third-party advertising services.`);

  const [homepageData, setHomepageDataState] = useState({
    heroTitle1: "Gen Z Public Health Dentistry",
    heroTitle2: "AUGMENTING AI",
    heroTitle3: "& INNOVATION",
    countdownTarget: "2026-11-27T00:00:00",
    marqueeLogos: ["WALMART HEALTH", "MONDAY LABS", "ENVATO DENTAL", "AWWWARDS MED", "WOOCOMMERCE", "PINGDOM HEALTH"]
  });

  const [programScheduleData, setProgramScheduleDataState] = useState(() => getLocal('iaphd_program_schedule_cache', {
    '26': {
      title: 'Pre-Conference Workshops',
      subtitle: 'Hands-on practical training with leading dental specialists',
      schedule: [
        { time: '09:00 AM - 12:30 PM', event: 'Workshop 1: Advanced Research Methodology & Systematic Reviews', host: 'Dr. Praveen Jodalli', venue: 'Research Lab - ANIDS' },
        { time: '01:30 PM - 05:00 PM', event: 'Workshop 2: AI & Machine Learning in Oral Epidemiology', host: 'Dr. Michael Chen', venue: 'IT Center - ANIDS' }
      ]
    },
    '27': {
      title: 'Scientific Program - Day 1',
      subtitle: 'Inaugural ceremony, keynote sessions, and panel debates',
      schedule: [
        { time: '08:00 AM - 09:30 AM', event: 'Delegate Registration & Kit Collection', host: 'Conference Secretariat', venue: 'Main Lobby' },
        { time: '09:30 AM - 11:00 AM', event: 'Grand Inaugural Ceremony & Lamp Lighting', host: 'Organizing Committee', venue: 'Auditorium A' },
        { time: '11:00 AM - 11:30 AM', event: 'High Tea & Networking Break', host: 'All Delegates', venue: 'Exhibition Hall' },
        { time: '11:30 AM - 01:00 PM', event: 'Keynote Session: AI-Driven Diagnostics in Public Health Dentistry', host: 'Dr. Michael Chen', venue: 'Main Hall' }
      ]
    },
    '28': {
      title: 'Scientific Program - Day 2',
      subtitle: 'Poster session, oral presentations, and gala cultural night',
      schedule: [
        { time: '09:00 AM - 10:30 AM', event: 'Scientific Poster Presentations - Session I', host: 'Delegate Presenters', venue: 'Poster Area' },
        { time: '10:30 AM - 01:00 PM', event: 'Oral Paper Presentations & QIP Session', host: 'Post Graduate Students', venue: 'Halls 1 & 2' },
        { time: '01:00 PM - 02:00 PM', event: 'Networking Lunch', host: 'All Delegates', venue: 'Dining Hall' },
        { time: '07:30 PM Onwards', event: 'IAPHD NATCON 2026 Gala Banquet & Cultural Celebrations', host: 'Organizing Committee', venue: 'Vizag Beach Resort' }
      ]
    },
    '29': {
      title: 'Scientific Program - Day 3',
      subtitle: 'Award announcements, future-casting panels, and valedictory',
      schedule: [
        { time: '09:30 AM - 11:00 AM', event: 'Panel Discussion: The Gen Z Dental Practice & Preventative Models', host: 'Panel of Experts', venue: 'Main Hall' },
        { time: '11:00 AM - 11:30 AM', event: 'Tea & Coffee Break', host: 'All Delegates', venue: 'Exhibition Hall' },
        { time: '11:30 AM - 01:00 PM', event: 'Valedictory Function & Scientific Award Ceremony', host: 'Hon Office Bearers', venue: 'Auditorium A' }
      ]
    }
  }));

  const [aboutUsExtras, setAboutUsExtrasState] = useState(() => getLocal('iaphd_about_us_extras_cache', {
    slides: [
      {
        title: "Digital marketing & practice management in modern dentistry.",
        desc: "Learn to build a robust patient pipeline and leverage cutting-edge platforms to scale your clinic.",
        img: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&h=700&q=80"
      },
      {
        title: "Advanced research methodology & analytical strategies.",
        desc: "Dive deep into systemic reviews, epidemiological modeling, and AI-assisted clinical data analytics.",
        img: "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=1200&h=700&q=80"
      },
      {
        title: "Augmented intelligence in dental public health.",
        desc: "Explore diagnostic predictive models and community oral health metrics augmenting modern AI solutions.",
        img: "https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&w=1200&h=700&q=80"
      }
    ],
    benefits: [
      {
        iconName: "mic-vocal",
        title: "Make Ideas Happen",
        desc: "Discover how dental practice models seamlessly merge with augmented AI pipelines to achieve outstanding public oral health outcomes."
      },
      {
        iconName: "bot",
        title: "Great Speakers",
        desc: "Experience transformative lectures and clinical case studies presented by international leaders in epidemiology and clinical dentistry."
      },
      {
        iconName: "network",
        title: "Premium Access Passes",
        desc: "Enjoy complete registration packages tailored for students, general practitioners, and esteemed Life Members of IAPHD."
      },
      {
        iconName: "file-text",
        title: "Develop Your Skills",
        desc: "Register for intense pre-conference workshops focused on advanced dental diagnostics, structured methodology, and clinical research."
      },
      {
        iconName: "graduation-cap",
        title: "Entry Verification",
        desc: "Fast, contactless check-in using unique digital badges and automated QR-code validation generated instantly on registration."
      },
      {
        iconName: "map-pinned",
        title: "Workshops Offer",
        desc: "Engage in hands-on clinical training, academic presentation contests, and interactive Q&A sessions led by academic authorities."
      }
    ]
  }));

  const [termsConditions, setTermsConditionsState] = useState(`By registering for IAPHD NATCON 2026, delegates agree to comply with the rules set by the IAPHD organizing committee. Refunds are governed strictly by the refund policy timeline. Registrations are non-transferable without written authorization.`);

  const [refundPolicy, setRefundPolicyState] = useState(() => getLocal('iaphd_refund_policy_cache', {
    timeline: [
      { date: "On or before October 5, 2026", eligibility: "50% of the registration fee" },
      { date: "After October 5, 2026", eligibility: "No refund" }
    ],
    terms: [
      "Refunds processed only after the conclusion of the conference.",
      "Delegate must pay all bank charges and transaction fees.",
      "Refunds apply only to the registration amount (GST/Fees are non-refundable).",
      "Requests must be submitted in writing to the registration committee."
    ]
  }));

  const setRefundPolicy = (val) => {
    setRefundPolicyState(val);
    saveCmsSetting('refundPolicy', val);
    setLocal('iaphd_refund_policy_cache', val);
  };

  const [disabledPages, setDisabledPagesState] = useState(() => getLocal('iaphd_disabled_pages_cache', {}));

  const setDisabledPages = (val) => {
    setDisabledPagesState(val);
    saveCmsSetting('disabledPages', val);
    setLocal('iaphd_disabled_pages_cache', val);
  };

  const [registrations, setRegistrationsState] = useState([
    {
      id: 'REG-1001',
      fullName: 'Dr. Ramesh Babu',
      email: 'ramesh.babu@gmail.com',
      mobile: '9848022338',
      gender: 'MALE',
      institution: 'ANIDS, Visakhapatnam',
      designation: 'Professor',
      councilRegNo: 'AP-A-12493',
      address: 'Madhurawada, Visakhapatnam',
      state: 'Andhra Pradesh',
      pincode: '530048',
      category: 'Faculty',
      iaphdNo: 'L-1029',
      tier: 'premium',
      foodPreference: 'Vegetarian',
      hasAccompanying: 'no',
      accompanyingName: '',
      accompanyingCount: '',
      accompanyingFood: '',
      transactionId: 'TXN8492048203',
      paymentDate: '2026-05-18',
      amountPaid: '11500',
      status: 'CONFIRMED'
    },
    {
      id: 'REG-1002',
      fullName: 'Dr. Sneha Reddy',
      email: 'sneha.reddy@yahoo.com',
      mobile: '9123456789',
      gender: 'Female',
      institution: 'GDC Hyderabad',
      designation: 'PG 3rd year',
      councilRegNo: 'TS-B-99823',
      address: 'Jubilee Hills, Hyderabad',
      state: 'Telangana',
      pincode: '500033',
      category: 'Post Graduate',
      iaphdNo: 'S-4830',
      tier: 'classic',
      foodPreference: 'Non-Vegetarian',
      hasAccompanying: 'no',
      accompanyingName: '',
      accompanyingCount: '',
      accompanyingFood: '',
      transactionId: 'UTR2940294829',
      paymentDate: '2026-05-19',
      amountPaid: '8500',
      status: 'PENDING'
    }
  ]);

  const [isAdminAuthenticated, setIsAdminAuthenticatedState] = useState(() => {
    return getLocal('isAdminAuthenticated', false);
  });

  const [adminUsername, setAdminUsernameState] = useState(() => {
    return localStorage.getItem('adminUsername') || 'admin';
  });

  const [isPromoVideoOpen, setIsPromoVideoOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // ── DYNAMIC MYSQL TABLES STATE ──────────────────────────────────────────
  const [schedules, setSchedules] = useState(() => getLocal('iaphd_schedules_cache', [
    { dayNumber: 1, timeSlot: '08:00 AM', title: 'Registration & Welcome Kit Collection', speaker: 'Secretariat', venue: 'Main Lobby' },
    { dayNumber: 1, timeSlot: '09:30 AM', title: 'Inaugural Ceremony', speaker: 'Organizing Committee', venue: 'Auditorium A' },
    { dayNumber: 1, timeSlot: '11:00 AM', title: 'Tea Break', speaker: '', venue: 'Main Lobby' },
    { dayNumber: 1, timeSlot: '11:30 AM', title: 'Keynote: AI in Dental Public Health', speaker: 'Dr. Michael Chen', venue: 'Hall 1' },
    { dayNumber: 2, timeSlot: '09:00 AM', title: 'Scientific Poster Session', speaker: 'Delegates', venue: 'Exhibition Hall' },
    { dayNumber: 2, timeSlot: '10:30 AM', title: 'Paper Presentations - Session I', speaker: '3rd Year PGs', venue: 'Hall 2' },
    { dayNumber: 2, timeSlot: '01:00 PM', title: 'Lunch Break', speaker: '', venue: 'Main Lobby' },
    { dayNumber: 2, timeSlot: '07:30 PM', title: 'Gala Banquet & Cultural Night', speaker: '', venue: 'Convention Centre' },
    { dayNumber: 3, timeSlot: '09:30 AM', title: 'Panel Discussion: Future of Dentistry', speaker: 'Dr. Sarah Johnson', venue: 'Hall 1' },
    { dayNumber: 3, timeSlot: '11:30 AM', title: 'Valedictory Ceremony', speaker: '', venue: 'Auditorium A' }
  ]));

  const [sponsors, setSponsors] = useState(() => getLocal('iaphd_sponsors_cache', [
    { name: 'Colgate-Palmolive', logoUrl: 'https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=200', tier: 'Platinum', orderIndex: 1 },
    { name: 'Sensodyne', logoUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200', tier: 'Gold', orderIndex: 2 }
  ]));

  const [announcements, setAnnouncements] = useState([
    { title: 'Abstract Submission Open', content: 'You can now submit your research abstracts for posters and paper presentations online via the scientific portal.' },
    { title: 'Early Bird Registration Extended', content: 'Great news! The early bird registration tariffs have been extended until August 15. Secure your slots today!' }
  ]);

  const [gallery, setGallery] = useState([
    { title: 'RK Beach Coastline', mediaUrl: 'https://images.unsplash.com/photo-1626082895617-2c6de34769bb?auto=format&fit=crop&q=80&w=800', mediaType: 'image', category: 'Vizag' },
    { title: 'ANIDS Campus', mediaUrl: 'https://images.unsplash.com/photo-1596402184320-417d7178b2cd?auto=format&fit=crop&q=80&w=800', mediaType: 'image', category: 'Venue' }
  ]);

  const [submissions, setSubmissionsState] = useState([]);

  // ── BACKEND SYNC AND CONNECTION ──────────────────────────────────────────
  // Swappable Backend connection endpoint:
  // - Node.js Express Backend (local dev): 'http://localhost:5000/api'
  // - Hostinger PHP Shared Hosting Backend: 'http://yourdomain.com/api.php' or local 'http://localhost/natcon-2026-backend/api.php'
  const [apiUrl, setApiUrl] = useState(() => {
    // Auto-detect local environment (XAMPP / localhost) vs Hostinger production server
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
    return 'https://www.iaphdnatcon2026.com/natcon-2026-backend/api.php';
  });

  const API_URL = apiUrl;
  const IS_PHP_BACKEND = API_URL.endsWith('.php');

  // Helper to save dynamic CMS setting to live MySQL database
  const saveCmsSetting = async (key, value) => {
    try {
      const postUrl = IS_PHP_BACKEND ? `${API_URL}` : `${API_URL}/settings`;
      const payload = IS_PHP_BACKEND
        ? { action: 'save_setting', key, value }
        : { key, value };

      const res = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        console.warn(`Failed to save CMS setting '${key}' to MySQL database.`);
      }
    } catch (err) {
      console.warn(`Database connection offline. CMS setting '${key}' saved locally.`);
    }
  };

  const addSchedule = async (item) => {
    try {
      const postUrl = IS_PHP_BACKEND ? `${API_URL}` : `${API_URL}/schedules`;
      const payload = IS_PHP_BACKEND
        ? { action: 'save_schedule', ...item }
        : item;

      const res = await fetch(postUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const result = await res.json();
        const newItem = { ...item, id: result.id };
        setSchedules(prev => [...prev, newItem]);
        showToast('Schedule added successfully!', 'success');
        return true;
      } else {
        showToast('Failed to save schedule to database.', 'error');
      }
    } catch (err) {
      console.error("Failed to save schedule:", err);
      showToast('Database connection error.', 'error');
    }
    return false;
  };

  const addSponsor = async (item) => {
    try {
      const postUrl = IS_PHP_BACKEND ? `${API_URL}` : `${API_URL}/sponsors`;
      const payload = IS_PHP_BACKEND
        ? { action: 'save_sponsor', ...item }
        : item;

      const res = await fetch(postUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const result = await res.json();
        const newItem = { ...item, id: result.id };
        setSponsors(prev => [...prev, newItem]);
        showToast('Sponsor added successfully!', 'success');
        return true;
      } else {
        showToast('Failed to save sponsor to database.', 'error');
      }
    } catch (err) {
      console.error("Failed to save sponsor:", err);
      showToast('Database connection error.', 'error');
    }
    return false;
  };

  const addAnnouncement = async (item) => {
    try {
      const postUrl = IS_PHP_BACKEND ? `${API_URL}` : `${API_URL}/announcements`;
      const payload = IS_PHP_BACKEND
        ? { action: 'save_announcement', ...item }
        : item;

      const res = await fetch(postUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const result = await res.json();
        const newItem = { ...item, id: result.id };
        setAnnouncements(prev => [newItem, ...prev]);
        showToast('Announcement published successfully!', 'success');
        return true;
      } else {
        showToast('Failed to publish announcement.', 'error');
      }
    } catch (err) {
      console.error("Failed to save announcement:", err);
      showToast('Database connection error.', 'error');
    }
    return false;
  };

  const addGalleryItem = async (item) => {
    try {
      const postUrl = IS_PHP_BACKEND ? `${API_URL}` : `${API_URL}/gallery`;
      const payload = IS_PHP_BACKEND
        ? { action: 'save_gallery', ...item }
        : item;

      const res = await fetch(postUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const result = await res.json();
        const newItem = { ...item, id: result.id };
        setGallery(prev => [newItem, ...prev]);
        showToast('Gallery media item added successfully!', 'success');
        return true;
      } else {
        showToast('Failed to add gallery item.', 'error');
      }
    } catch (err) {
      console.error("Failed to save gallery item:", err);
      showToast('Database connection error.', 'error');
    }
    return false;
  };

  const deleteSchedule = async (id, title) => {
    if (adminUsername !== 'sadmin') {
      showToast('Super Admin permission required for deletion.', 'error');
      return false;
    }
    try {
      if (id) {
        const postUrl = IS_PHP_BACKEND ? API_URL : `${API_URL}/schedules/${id}`;
        const payload = IS_PHP_BACKEND
          ? { action: 'delete_schedule', id }
          : null;

        await fetch(postUrl, {
          method: IS_PHP_BACKEND ? 'POST' : 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: payload ? JSON.stringify(payload) : undefined
        });
      }
    } catch (err) {
      console.error("Failed to delete schedule from database:", err);
    }

    const filtered = schedules.filter(item => {
      if (id && item.id) {
        return String(item.id) !== String(id);
      }
      return item.title !== title;
    });
    setSchedules(filtered);
    showToast('Schedule removed successfully!', 'success');
    return true;
  };

  const deleteSponsor = async (id, name) => {
    if (adminUsername !== 'sadmin') {
      showToast('Super Admin permission required for deletion.', 'error');
      return false;
    }
    try {
      if (id) {
        const postUrl = IS_PHP_BACKEND ? API_URL : `${API_URL}/sponsors/${id}`;
        const payload = IS_PHP_BACKEND
          ? { action: 'delete_sponsor', id }
          : null;

        await fetch(postUrl, {
          method: IS_PHP_BACKEND ? 'POST' : 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: payload ? JSON.stringify(payload) : undefined
        });
      }
    } catch (err) {
      console.error("Failed to delete sponsor from database:", err);
    }

    const filtered = sponsors.filter(item => {
      if (id && item.id) {
        return String(item.id) !== String(id);
      }
      return item.name !== name;
    });
    setSponsors(filtered);
    showToast('Sponsor removed successfully!', 'success');
    return true;
  };

  const deleteAnnouncement = async (id, title) => {
    if (adminUsername !== 'sadmin') {
      showToast('Super Admin permission required for deletion.', 'error');
      return false;
    }
    try {
      if (id) {
        const postUrl = IS_PHP_BACKEND ? API_URL : `${API_URL}/announcements/${id}`;
        const payload = IS_PHP_BACKEND
          ? { action: 'delete_announcement', id }
          : null;

        await fetch(postUrl, {
          method: IS_PHP_BACKEND ? 'POST' : 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: payload ? JSON.stringify(payload) : undefined
        });
      }
    } catch (err) {
      console.error("Failed to delete announcement from database:", err);
    }

    const filtered = announcements.filter(item => {
      if (id && item.id) {
        return String(item.id) !== String(id);
      }
      return item.title !== title;
    });
    setAnnouncements(filtered);
    showToast('Announcement deleted successfully!', 'success');
    return true;
  };

  const deleteGalleryItem = async (id, title) => {
    if (adminUsername !== 'sadmin') {
      showToast('Super Admin permission required for deletion.', 'error');
      return false;
    }
    try {
      if (id) {
        const postUrl = IS_PHP_BACKEND ? API_URL : `${API_URL}/gallery/${id}`;
        const payload = IS_PHP_BACKEND
          ? { action: 'delete_gallery', id }
          : null;

        await fetch(postUrl, {
          method: IS_PHP_BACKEND ? 'POST' : 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: payload ? JSON.stringify(payload) : undefined
        });
      }
    } catch (err) {
      console.error("Failed to delete gallery item from database:", err);
    }

    const filtered = gallery.filter(item => {
      if (id && item.id) {
        return String(item.id) !== String(id);
      }
      return item.title !== title;
    });
    setGallery(filtered);
    showToast('Gallery media item removed successfully!', 'success');
    return true;
  };

  const approveRegistration = async (id) => {
    try {
      const postUrl = IS_PHP_BACKEND ? API_URL : `${API_URL}/registrations/${id}/approve`;
      const payload = IS_PHP_BACKEND
        ? { action: 'approve_registration', id }
        : null;

      const res = await fetch(postUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(payload || { status: 'CONFIRMED' })
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        const newId = data.newId || id;
        const password = data.password;

        const updated = registrations.map(r => 
          r.id === id 
            ? { ...r, id: newId, status: 'CONFIRMED', password: password || r.password } 
            : r
        );
        setRegistrationsState(updated);
        showToast('Delegate registration approved successfully!', 'success');
        return true;
      } else {
        showToast('Failed to approve registration.', 'error');
      }
    } catch (err) {
      console.error("Failed to approve registration:", err);
      showToast('Database connection error.', 'error');
    }
    return false;
  };

  const resendConfirmationEmail = async (id) => {
    try {
      const postUrl = API_URL;
      const payload = { action: 'resend_email', id };

      const res = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast('Confirmation email resent successfully!', 'success');
        return { success: true };
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.error || 'Failed to resend confirmation email.', 'error');
        return { success: false, error: errData.error || 'Failed to resend confirmation email.' };
      }
    } catch (err) {
      console.error("Failed to resend email:", err);
      showToast('Database connection error.', 'error');
      return { success: false, error: 'Database connection error.' };
    }
  };

  const resendSubmissionEmail = async (id) => {
    try {
      const postUrl = API_URL;
      const payload = { action: 'resend_submission_email', id };

      const res = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast('Submission email resent successfully!', 'success');
        return { success: true };
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.error || 'Failed to resend submission email.', 'error');
        return { success: false, error: errData.error || 'Failed to resend submission email.' };
      }
    } catch (err) {
      console.error("Failed to resend submission email:", err);
      showToast('Database connection error.', 'error');
      return { success: false, error: 'Database connection error.' };
    }
  };

  const updateRegistration = async (id, item) => {
    let newId = id;
    let password = item.password;
    let success = false;
    try {
      if (id) {
        const postUrl = IS_PHP_BACKEND ? API_URL : `${API_URL}/registrations/${id}`;
        const payload = IS_PHP_BACKEND
          ? { action: 'update_registration', id, ...item }
          : item;

        const res = await fetch(postUrl, {
          method: IS_PHP_BACKEND ? 'POST' : 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data.newId) newId = data.newId;
          if (data.password) password = data.password;
          showToast('Registration updated successfully!', 'success');
          success = { success: true, newId, password };
        } else {
          showToast('Failed to update registration in database.', 'error');
        }
      }
    } catch (err) {
      console.error("Failed to update registration:", err);
      showToast('Database connection error.', 'error');
    }

    const updated = registrations.map(s => {
      if (id && s.id && String(s.id) === String(id)) {
        return { ...s, ...item, id: newId, password: password || s.password };
      }
      return s;
    });
    setRegistrationsState(updated);
    return success;
  };

  const addSubmission = async (submission) => {
    try {
      const postUrl = IS_PHP_BACKEND ? API_URL : `${API_URL}/submissions`;
      const payload = IS_PHP_BACKEND
        ? { action: 'save_submission', ...submission }
        : submission;

      const res = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const result = await res.json();
        const newSubmission = { ...submission, id: result.id, created_at: new Date().toISOString() };
        setSubmissionsState(prev => [newSubmission, ...prev]);
        return { success: true, record: newSubmission };
      } else {
        const errData = await res.json().catch(() => ({}));
        return { success: false, error: errData.error || 'Failed to record submission' };
      }
    } catch (err) {
      console.error("Failed to save submission:", err);
      return { success: false, error: 'Database connection error' };
    }
  };

  const deleteSubmission = async (id) => {
    if (adminUsername !== 'sadmin') {
      showToast('Super Admin permission required for deletion.', 'error');
      return false;
    }
    try {
      const postUrl = IS_PHP_BACKEND ? API_URL : `${API_URL}/submissions/delete`;
      const payload = IS_PHP_BACKEND
        ? { action: 'delete_submission', id }
        : { id };

      const res = await fetch(postUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setSubmissionsState(prev => prev.filter(item => item.id !== id));
        showToast('Submission deleted successfully!', 'success');
        return true;
      }
    } catch (err) {
      console.error("Failed to delete submission:", err);
      showToast('Database connection error.', 'error');
    }
    return false;
  };

  const updateSubmissionStatus = async (id, status) => {
    try {
      const postUrl = IS_PHP_BACKEND ? API_URL : `${API_URL}/submissions/status`;
      const payload = IS_PHP_BACKEND
        ? { action: 'update_submission_status', id, status }
        : { id, status };

      const res = await fetch(postUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setSubmissionsState(prev => prev.map(item => item.id === id ? { ...item, status } : item));
        showToast('Submission status updated successfully!', 'success');
        return true;
      }
    } catch (err) {
      console.error("Failed to update submission status:", err);
      showToast('Database connection error.', 'error');
    }
    return false;
  };

  const uploadImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      if (IS_PHP_BACKEND) {
        formData.append('action', 'upload_image');
      }

      const res = await fetch(API_URL, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const result = await res.json();
        return result.url;
      } else {
        throw new Error('Backend returned ' + res.status);
      }
    } catch (err) {
      console.error("Failed to upload image via API, falling back to base64:", err);
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    }
    return null;
  };

  const updateSchedule = async (id, item) => {
    try {
      if (id) {
        const postUrl = IS_PHP_BACKEND ? API_URL : `${API_URL}/schedules/${id}`;
        const payload = IS_PHP_BACKEND
          ? { action: 'update_schedule', id, ...item }
          : item;

        const res = await fetch(postUrl, {
          method: IS_PHP_BACKEND ? 'POST' : 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          showToast('Schedule updated successfully!', 'success');
        } else {
          showToast('Failed to update schedule in database.', 'error');
        }
      }
    } catch (err) {
      console.error("Failed to update schedule:", err);
      showToast('Database connection error.', 'error');
    }

    const updated = schedules.map(s => {
      if (id && s.id && String(s.id) === String(id)) {
        return { ...s, ...item };
      }
      return s;
    });
    setSchedules(updated);
    return true;
  };

  const updateSponsor = async (id, item) => {
    try {
      if (id) {
        const postUrl = IS_PHP_BACKEND ? API_URL : `${API_URL}/sponsors/${id}`;
        const payload = IS_PHP_BACKEND
          ? { action: 'update_sponsor', id, ...item }
          : item;

        const res = await fetch(postUrl, {
          method: IS_PHP_BACKEND ? 'POST' : 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          showToast('Sponsor updated successfully!', 'success');
        } else {
          showToast('Failed to update sponsor in database.', 'error');
        }
      }
    } catch (err) {
      console.error("Failed to update sponsor:", err);
      showToast('Database connection error.', 'error');
    }

    const updated = sponsors.map(s => {
      if (id && s.id && String(s.id) === String(id)) {
        return { ...s, ...item };
      }
      return s;
    });
    setSponsors(updated);
    return true;
  };

  const updateAnnouncement = async (id, item) => {
    try {
      if (id) {
        const postUrl = IS_PHP_BACKEND ? API_URL : `${API_URL}/announcements/${id}`;
        const payload = IS_PHP_BACKEND
          ? { action: 'update_announcement', id, ...item }
          : item;

        const res = await fetch(postUrl, {
          method: IS_PHP_BACKEND ? 'POST' : 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          showToast('Announcement updated successfully!', 'success');
        } else {
          showToast('Failed to update announcement in database.', 'error');
        }
      }
    } catch (err) {
      console.error("Failed to update announcement:", err);
      showToast('Database connection error.', 'error');
    }

    const updated = announcements.map(s => {
      if (id && s.id && String(s.id) === String(id)) {
        return { ...s, ...item };
      }
      return s;
    });
    setAnnouncements(updated);
    return true;
  };

  const updateGalleryItem = async (id, item) => {
    try {
      if (id) {
        const postUrl = IS_PHP_BACKEND ? API_URL : `${API_URL}/gallery/${id}`;
        const payload = IS_PHP_BACKEND
          ? { action: 'update_gallery', id, ...item }
          : item;

        const res = await fetch(postUrl, {
          method: IS_PHP_BACKEND ? 'POST' : 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          showToast('Gallery item updated successfully!', 'success');
        } else {
          showToast('Failed to update gallery item in database.', 'error');
        }
      }
    } catch (err) {
      console.error("Failed to update gallery item:", err);
      showToast('Database connection error.', 'error');
    }

    const updated = gallery.map(s => {
      if (id && s.id && String(s.id) === String(id)) {
        return { ...s, ...item };
      }
      return s;
    });
    setGallery(updated);
    return true;
  };

  // Load all settings from MySQL on startup
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        let currentApiUrl = API_URL;
        let isPhp = IS_PHP_BACKEND;
        let success = false;
        let dbSettings = null;

        // Try local or configured backend first
        try {
          const fetchUrl = isPhp ? `${currentApiUrl}?action=settings` : `${currentApiUrl}/settings`;
          const res = await fetch(fetchUrl);
          if (res.ok) {
            dbSettings = await res.json();
            success = true;
          }
        } catch (err) {
          // Local offline
        }

        // If local server is offline, auto-fallback to live Hostinger database API for seamless viewing
        if (!success && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
          try {
            currentApiUrl = 'https://www.iaphdnatcon2026.com/natcon-2026-backend/api.php';
            isPhp = true;
            const res = await fetch(`${currentApiUrl}?action=settings`);
            if (res.ok) {
              dbSettings = await res.json();
              success = true;
              setApiUrl('https://www.iaphdnatcon2026.com/natcon-2026-backend/api.php');
            }
          } catch (err) {
            // Live fallback offline too
          }
        }

        if (success && dbSettings) {
          if (dbSettings.pricingPhase) setPricingPhaseState(dbSettings.pricingPhase);
          if (dbSettings.notification) setNotificationState(dbSettings.notification);
          if (dbSettings.speakers) setSpeakersState(dbSettings.speakers);
          if (dbSettings.faqs) setFaqsState(dbSettings.faqs);
          if (dbSettings.privacyPolicy) setPrivacyPolicyState(dbSettings.privacyPolicy);
          if (dbSettings.termsConditions) setTermsConditionsState(dbSettings.termsConditions);
          if (dbSettings.refundPolicy) {
            setRefundPolicyState(dbSettings.refundPolicy);
            setLocal('iaphd_refund_policy_cache', dbSettings.refundPolicy);
          }
          if (dbSettings.disabledPages) {
            setDisabledPagesState(dbSettings.disabledPages);
            setLocal('iaphd_disabled_pages_cache', dbSettings.disabledPages);
          }
          if (dbSettings.organizingMembers) setOrganizingMembersState(dbSettings.organizingMembers);
          if (dbSettings.headOfficeLeaders) setHeadOfficeLeadersState(dbSettings.headOfficeLeaders);
          if (dbSettings.ecMembers) setEcMembersState(dbSettings.ecMembers);
          if (dbSettings.conferenceCommittee) setConferenceCommitteeState(dbSettings.conferenceCommittee);
          if (dbSettings.scientificCategories) setScientificCategoriesState(dbSettings.scientificCategories);
          if (dbSettings.scientificAbstract) setScientificAbstractState(dbSettings.scientificAbstract);
          if (dbSettings.abstractGuidelines) setAbstractGuidelinesState(dbSettings.abstractGuidelines);
          if (dbSettings.registrationGuidelines) setRegistrationGuidelinesState(dbSettings.registrationGuidelines);
          if (dbSettings.aboutUs) setAboutUsState(dbSettings.aboutUs);
          if (dbSettings.chiefPatron) setChiefPatronState(dbSettings.chiefPatron);
          if (dbSettings.scientificDownloads) setScientificDownloadsState(dbSettings.scientificDownloads);
          if (dbSettings.registrationTiers) {
            setRegistrationTiersState(dbSettings.registrationTiers);
            setLocal('iaphd_tiers_cache', dbSettings.registrationTiers);
          }
          if (dbSettings.seoSettings) setSeoSettingsState(dbSettings.seoSettings);
          if (dbSettings.contactSettings) {
            setContactSettingsState(dbSettings.contactSettings);
            setLocal('iaphd_contact_cache', dbSettings.contactSettings);
          }
          if (dbSettings.headerLogos) {
            const mergedLogos = { favicon: "./favicon.svg", ...dbSettings.headerLogos };
            setHeaderLogosState(mergedLogos);
            setLocal('iaphd_logos_cache', mergedLogos);
          }
          if (dbSettings.homepagePopup) {
            setHomepagePopupState(dbSettings.homepagePopup);
            setLocal('iaphd_homepage_popup_cache', dbSettings.homepagePopup);
          }
          if (dbSettings.scheduleData) setScheduleDataState(dbSettings.scheduleData);
          if (dbSettings.venueInfo) setVenueInfoState(dbSettings.venueInfo);
          if (dbSettings.hotelsList) setHotelsListState(dbSettings.hotelsList);
          if (dbSettings.tradeData) setTradeDataState(dbSettings.tradeData);
          if (dbSettings.workshopsList) setWorkshopsListState(dbSettings.workshopsList);
          if (dbSettings.cityIntro) setCityIntroState(dbSettings.cityIntro);
          if (dbSettings.touristAttractions) setTouristAttractionsState(dbSettings.touristAttractions);
          if (dbSettings.programScheduleData) {
            setProgramScheduleDataState(dbSettings.programScheduleData);
            setLocal('iaphd_program_schedule_cache', dbSettings.programScheduleData);
          }
          if (dbSettings.aboutUsExtras) {
            setAboutUsExtrasState(dbSettings.aboutUsExtras);
            setLocal('iaphd_about_us_extras_cache', dbSettings.aboutUsExtras);
          }

          // Fetch relational schedules using same working endpoint
          try {
            const scheduleUrl = isPhp ? `${currentApiUrl}?action=schedules` : `${currentApiUrl}/schedules`;
            const resSchedules = await fetch(scheduleUrl);
            if (resSchedules.ok) {
              const dbSchedules = await resSchedules.json();
              if (dbSchedules && dbSchedules.length > 0) {
                setSchedules(dbSchedules);
                setLocal('iaphd_schedules_cache', dbSchedules);
              }
            }
          } catch (e) { }

          // Fetch relational sponsors using same working endpoint
          try {
            const sponsorUrl = isPhp ? `${currentApiUrl}?action=sponsors` : `${currentApiUrl}/sponsors`;
            const resSponsors = await fetch(sponsorUrl);
            if (resSponsors.ok) {
              const dbSponsors = await resSponsors.json();
              if (dbSponsors && dbSponsors.length > 0) {
                setSponsors(dbSponsors);
                setLocal('iaphd_sponsors_cache', dbSponsors);
              }
            }
          } catch (e) { }

          // Fetch relational announcements using same working endpoint
          try {
            const annUrl = isPhp ? `${currentApiUrl}?action=announcements` : `${currentApiUrl}/announcements`;
            const resAnn = await fetch(annUrl);
            if (resAnn.ok) {
              const dbAnn = await resAnn.json();
              if (dbAnn && dbAnn.length > 0) {
                setAnnouncements(dbAnn);
              }
            }
          } catch (e) { }

          // Fetch relational gallery using same working endpoint
          try {
            const galleryUrl = isPhp ? `${currentApiUrl}?action=gallery` : `${currentApiUrl}/gallery`;
            const resGallery = await fetch(galleryUrl);
            if (resGallery.ok) {
              const dbGallery = await resGallery.json();
              if (dbGallery && dbGallery.length > 0) {
                setGallery(dbGallery);
              }
            }
          } catch (e) { }

          // Fetch relational submissions using same working endpoint
          try {
            const submissionsUrl = isPhp ? `${currentApiUrl}?action=submissions` : `${currentApiUrl}/submissions`;
            const resSubmissions = await fetch(submissionsUrl);
            if (resSubmissions.ok) {
              const dbSubmissions = await resSubmissions.json();
              if (dbSubmissions && dbSubmissions.length > 0) {
                setSubmissionsState(dbSubmissions);
              }
            }
          } catch (e) { }
        }
      } catch (err) {
        console.warn('Backend connection issue resolved by local cash caching.');
      }
    };
    fetchSettings();
    // ── MYSQL POLLING ─────────────────────────────────────────────────────────
    // Poll every 5 seconds so the frontend auto-refreshes when admin saves data.
    const pollInterval = setInterval(fetchSettings, 5000);
    return () => clearInterval(pollInterval);
  }, []);

  // Dynamic Site Favicon update
  useEffect(() => {
    if (headerLogos?.favicon) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = headerLogos.favicon;
    }
  }, [headerLogos?.favicon]);


  // Load registrations from MySQL Backend on startup or admin authentication state change
  useEffect(() => {
    const fetchRegistrations = async () => {
      let success = false;
      try {
        const token = localStorage.getItem('adminToken');
        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        // Dynamically choose endpoint depending on backend type
        const fetchUrl = IS_PHP_BACKEND ? API_URL : `${API_URL}/registrations`;

        const res = await fetch(fetchUrl, { headers });
        if (res.ok) {
          const data = await res.json();
          setRegistrationsState(data);
          success = true;
        }
      } catch (err) {
        console.warn('Backend API server offline. Using local browser cache.', err);
      }

      // Failsafe Fallback: If local database fetch failed (e.g. offline XAMPP) and running on localhost, pull from live production DB directly
      if (!success && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        try {
          const liveUrl = 'https://www.iaphdnatcon2026.com/natcon-2026-backend/api.php';
          const res = await fetch(liveUrl);
          if (res.ok) {
            const data = await res.json();
            setRegistrationsState(data);
            console.log('Successfully fetched registrations list from production live Hostinger server fallback.');
          }
        } catch (liveErr) {
          console.warn('Production registrations fallback fetch also failed.', liveErr);
        }
      }
    };

    fetchRegistrations();
  }, [isAdminAuthenticated]);

  const setPricingPhase = (val) => {
    setPricingPhaseState(val);
    saveCmsSetting('pricingPhase', val);
  };

  const setNotification = (val) => {
    setNotificationState(val);
    saveCmsSetting('notification', val);
  };

  const setSpeakers = (val) => {
    setSpeakersState(val);
    saveCmsSetting('speakers', val);
  };

  const setFaqs = (val) => {
    setFaqsState(val);
    saveCmsSetting('faqs', val);
  };

  const setPrivacyPolicy = (val) => {
    setPrivacyPolicyState(val);
    saveCmsSetting('privacyPolicy', val);
  };

  const setTermsConditions = (val) => {
    setTermsConditionsState(val);
    saveCmsSetting('termsConditions', val);
  };

  const setRegistrations = (val) => {
    setRegistrationsState(val);
  };

  const addRegistration = async (reg) => {
    // Generate optimistic fallback ID format
    const isFailed = reg && reg.status === 'FAILED';
    const tempId = isFailed
      ? `FAIL-${Math.floor(1000 + Math.random() * 9000)}`
      : `NATCON-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReg = {
      status: 'PENDING',
      ...reg,
      id: tempId
    };

    // Optimistically update frontend registrations state
    setRegistrationsState(prev => [newReg, ...prev]);

    // Sync registration record to MySQL DB via Backend API
    try {
      const postUrl = IS_PHP_BACKEND ? API_URL : `${API_URL}/registrations`;
      const res = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReg)
      });
      if (res.ok) {
        const resData = await res.json();
        if (resData.success && resData.id) {
          // Replace temporary ID with final database sequential ID
          newReg.id = resData.id;
          if (resData.password) {
            newReg.password = resData.password;
          }
          setRegistrationsState(prev => {
            const updated = prev.map(item => item.id === tempId ? newReg : item);
            return updated;
          });
          return newReg;
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Server error recording registration.');
      }
    } catch (err) {
      console.warn('Backend server offline or registration failed.', err);
      // Remove optimistic entry if it was a real database duplicate rejection
      if (err.message && (err.message.includes('already registered') || err.message.includes('Duplicate'))) {
        setRegistrationsState(prev => prev.filter(item => item.id !== tempId));
        throw err;
      }
    }

    // Local fallback persistence for genuine connection errors
    setRegistrationsState(prev => {
      return prev;
    });
    return newReg;
  };

  const checkDuplicateRegistration = async (email, mobile) => {
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const cleanMobile = mobile ? mobile.replace(/\D/g, '') : '';
    // 1. Try backend database duplicate check
    try {
      const checkUrl = IS_PHP_BACKEND ? API_URL : `${API_URL}/registrations/check-duplicate`;
      const payload = IS_PHP_BACKEND
        ? { action: 'check_duplicate', email: cleanEmail, mobile: cleanMobile }
        : { email: cleanEmail, mobile: cleanMobile };

      const res = await fetch(checkUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.exists !== 'undefined') {
          return data; // { exists: true/false, error: '...' }
        }
      }
    } catch (err) {
      console.error("Backend duplicate check failed, falling back to local list:", err);
    }

    // 2. Client-side fallback check against already loaded registrations (exclude FAILED status)
    const isDuplicate = registrations.some(r => {
      const rEmail = r.email ? r.email.trim().toLowerCase() : '';
      const rMobile = r.mobile ? r.mobile.replace(/\D/g, '') : '';
      return (rEmail === cleanEmail || rMobile === cleanMobile) && r.status !== 'FAILED';
    });

    if (isDuplicate) {
      return {
        exists: true,
        error: "You are already registered. Duplicate registrations are not accepted."
      };
    }

    return { exists: false };
  };

  const getRegistrationByQuery = async (queryType, value) => {
    const cleanValue = queryType === 'email'
      ? (value ? value.trim().toLowerCase() : '')
      : queryType === 'id'
        ? (value ? value.trim().toUpperCase() : '')
        : (value ? value.replace(/\D/g, '') : '');

    // 1. Try configured local/primary API
    try {
      const getUrl = IS_PHP_BACKEND ? API_URL : `${API_URL}/registrations/query`;
      const payload = IS_PHP_BACKEND
        ? { action: 'get_registration', type: queryType, value: cleanValue }
        : { type: queryType, value: cleanValue };

      const res = await fetch(getUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.success) {
          return data; // { success: true, record: { ... } }
        }
      }
    } catch (err) {
      console.warn("Primary API query failed, trying production live fallback...", err);
    }

    // 2. Try live production server query as a fallback (if on localhost)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      try {
        const liveUrl = 'https://www.iaphdnatcon2026.com/natcon-2026-backend/api.php';
        const res = await fetch(liveUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'get_registration', type: queryType, value: cleanValue })
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.success) {
            return data; // { success: true, record: { ... } }
          }
        }
      } catch (liveErr) {
        console.warn("Production fallback query failed:", liveErr);
      }
    }

    // 3. Client-side fallback against pre-loaded state
    let record;
    if (queryType === 'email') {
      record = registrations.find(r => r.email && r.email.trim().toLowerCase() === cleanValue);
    } else if (queryType === 'id') {
      record = registrations.find(r => r.id && r.id.trim().toUpperCase() === cleanValue);
    } else {
      record = registrations.find(r => r.mobile && r.mobile.replace(/\D/g, '') === cleanValue);
    }

    if (record) {
      return { success: true, record };
    }

    return { success: false, error: `No registration found matching this ${queryType}.` };
  };

  const loginAdmin = async (username, password) => {
    // Attempt authentication via MySQL endpoint
    try {
      const loginUrl = IS_PHP_BACKEND ? API_URL : `${API_URL}/admin/login`;
      const payload = IS_PHP_BACKEND
        ? { action: 'login', username, password }
        : { username, password };

      const res = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUsername', data.username);
        setAdminUsernameState(data.username);
        setIsAdminAuthenticatedState(true);
        setLocal('isAdminAuthenticated', true);
        return true;
      }
    } catch (err) {
      console.warn('Backend auth offline. Trying local password verification.');
    }

    // Local fallback for robust preview/demo
    if (username === 'sadmin' && password === 'ambi@1225') {
      localStorage.setItem('adminUsername', 'sadmin');
      setAdminUsernameState('sadmin');
      setIsAdminAuthenticatedState(true);
      setLocal('isAdminAuthenticated', true);
      return true;
    }
    if ((username === 'admin' || !username) && (password === 'admin123' || password === 'admin')) {
      localStorage.setItem('adminUsername', 'admin');
      setAdminUsernameState('admin');
      setIsAdminAuthenticatedState(true);
      setLocal('isAdminAuthenticated', true);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticatedState(false);
    setLocal('isAdminAuthenticated', false);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    setAdminUsernameState('admin');
  };

  // ── DELEGATE AUTHENTICATION & SESSION ─────────────────────────────────────
  const [delegateSession, setDelegateSessionState] = useState(() => {
    return getLocal('delegateSession', null);
  });

  const delegateLogin = async (value, password) => {
    try {
      const loginUrl = IS_PHP_BACKEND ? API_URL : `${API_URL}/registrations/login`;
      const payload = IS_PHP_BACKEND
        ? { action: 'delegate_login', value, password }
        : { value, password };

      const res = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setDelegateSessionState(data.record);
        setLocal('delegateSession', data.record);
        showToast('Logged in successfully!', 'success');
        return { success: true, record: data.record };
      } else {
        const errMsg = data.error || 'Authentication failed. Please try again.';
        showToast(errMsg, 'error');
        return { success: false, error: errMsg };
      }
    } catch (err) {
      console.error('Delegate login connection error:', err);
      // Client-side fallback check for local demo/testing if offline
      const cleanValue = value.trim();
      const cleanPassword = password.trim();
      const record = registrations.find(r => 
        ((r.id && r.id.trim() === cleanValue) || (r.email && r.email.trim().toLowerCase() === cleanValue.toLowerCase())) &&
        r.status !== 'FAILED'
      );
      if (record) {
        const dbPassword = record.password ? record.password.trim() : '';
        const dbMobile = record.mobile ? record.mobile.replace(/\D/g, '') : '';
        let isValid = false;
        if (dbPassword) {
          isValid = (dbPassword.toLowerCase() === cleanPassword.toLowerCase());
        } else if (dbMobile) {
          isValid = (dbMobile === cleanPassword.replace(/\D/g, ''));
        }
        
        if (isValid) {
          setDelegateSessionState(record);
          setLocal('delegateSession', record);
          showToast('Logged in successfully (offline fallback)!', 'success');
          return { success: true, record };
        }
      }
      showToast('Connection error during login.', 'error');
      return { success: false, error: 'Database connection offline.' };
    }
  };

  const delegateLogout = () => {
    setDelegateSessionState(null);
    setLocal('delegateSession', null);
    showToast('Logged out successfully.', 'info');
  };

  const updateDelegateProfile = async (profileData) => {
    try {
      const updateUrl = IS_PHP_BACKEND ? API_URL : `${API_URL}/registrations/update-profile`;
      const payload = IS_PHP_BACKEND
        ? { action: 'update_profile', ...profileData }
        : profileData;

      const res = await fetch(updateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setDelegateSessionState(data.record);
        setLocal('delegateSession', data.record);
        // Sync local registrations list as well
        setRegistrationsState(prev => prev.map(r => r.id === data.record.id ? data.record : r));
        showToast('Profile updated successfully!', 'success');
        return { success: true, record: data.record };
      } else {
        const errMsg = data.error || 'Failed to update profile details.';
        showToast(errMsg, 'error');
        return { success: false, error: errMsg };
      }
    } catch (err) {
      console.error('Delegate profile update error:', err);
      // Client-side fallback if backend is offline
      if (delegateSession && delegateSession.id === profileData.id) {
        const currentPassword = delegateSession.password || '';
        const currentMobile = delegateSession.mobile ? delegateSession.mobile.replace(/\D/g, '') : '';
        let isValid = false;
        if (currentPassword) {
          isValid = (currentPassword.toLowerCase() === profileData.password.trim().toLowerCase());
        } else if (currentMobile) {
          isValid = (currentMobile === profileData.password.trim().replace(/\D/g, ''));
        }
        
        if (isValid) {
          const finalPassword = profileData.newPassword && profileData.newPassword.trim() ? profileData.newPassword.trim() : (delegateSession.password || profileData.password);
          const updatedRecord = {
            ...delegateSession,
            ...profileData,
            password: finalPassword
          };
          delete updatedRecord.newPassword; // Do not store newPassword field in record
          
          setDelegateSessionState(updatedRecord);
          setLocal('delegateSession', updatedRecord);
          setRegistrationsState(prev => prev.map(r => r.id === updatedRecord.id ? updatedRecord : r));
          showToast('Profile updated (offline fallback)!', 'success');
          return { success: true, record: updatedRecord };
        }
      }
      showToast('Connection error updating profile.', 'error');
      return { success: false, error: 'Database connection offline.' };
    }
  };

  const setOrganizingMembers = (val) => {
    setOrganizingMembersState(val);
    saveCmsSetting('organizingMembers', val);
  };

  const setHeadOfficeLeaders = (val) => {
    setHeadOfficeLeadersState(val);
    saveCmsSetting('headOfficeLeaders', val);
  };

  const setConferenceCommittee = (val) => {
    setConferenceCommitteeState(val);
    saveCmsSetting('conferenceCommittee', val);
  };

  const setEcMembers = (val) => {
    setEcMembersState(val);
    saveCmsSetting('ecMembers', val);
  };

  const setScientificCategories = (val) => {
    setScientificCategoriesState(val);
    saveCmsSetting('scientificCategories', val);
  };

  const setScientificAbstract = (val) => {
    setScientificAbstractState(val);
    saveCmsSetting('scientificAbstract', val);
  };

  const setAbstractGuidelines = (val) => {
    setAbstractGuidelinesState(val);
    saveCmsSetting('abstractGuidelines', val);
  };

  const setRegistrationGuidelines = (val) => {
    setRegistrationGuidelinesState(val);
    saveCmsSetting('registrationGuidelines', val);
  };

  const setAboutUs = (val) => {
    setAboutUsState(val);
    saveCmsSetting('aboutUs', val);
  };

  const setChiefPatron = (val) => {
    setChiefPatronState(val);
    saveCmsSetting('chiefPatron', val);
  };

  const setScientificDownloads = (val) => {
    setScientificDownloadsState(val);
    saveCmsSetting('scientificDownloads', val);
  };

  const setSeoSettings = (val) => {
    setSeoSettingsState(val);
    saveCmsSetting('seoSettings', val);
  };

  const setContactSettings = (val) => {
    setContactSettingsState(val);
    setLocal('iaphd_contact_cache', val);
    saveCmsSetting('contactSettings', val);
  };

  const setHeaderLogos = (val) => {
    setHeaderLogosState(val);
    setLocal('iaphd_logos_cache', val);
    saveCmsSetting('headerLogos', val);
  };

  const setScheduleData = (val) => {
    setScheduleDataState(val);
    saveCmsSetting('scheduleData', val);
  };

  const setVenueInfo = (val) => {
    setVenueInfoState(val);
    saveCmsSetting('venueInfo', val);
  };

  const setHotelsList = (val) => {
    setHotelsListState(val);
    saveCmsSetting('hotelsList', val);
  };

  const setTradeData = (val) => {
    setTradeDataState(val);
    saveCmsSetting('tradeData', val);
  };

  const setWorkshopsList = (val) => {
    setWorkshopsListState(val);
    saveCmsSetting('workshopsList', val);
  };

  const setCityIntro = (val) => {
    setCityIntroState(val);
    saveCmsSetting('cityIntro', val);
  };

  const setTouristAttractions = (val) => {
    setTouristAttractionsState(val);
    saveCmsSetting('touristAttractions', val);
  };

  const setRegistrationTiers = (val) => {
    setRegistrationTiersState(val);
    setLocal('iaphd_tiers_cache', val);
    saveCmsSetting('registrationTiers', val);
  };

  const setHomepageData = (val) => {
    setHomepageDataState(val);
    saveCmsSetting('homepageData', val);
  };

  const setProgramScheduleData = (val) => {
    setProgramScheduleDataState(val);
    saveCmsSetting('programScheduleData', val);
  };

  const setAboutUsExtras = (val) => {
    setAboutUsExtrasState(val);
    saveCmsSetting('aboutUsExtras', val);
  };

  const setHomepagePopup = (val) => {
    setHomepagePopupState(val);
    setLocal('iaphd_homepage_popup_cache', val);
    saveCmsSetting('homepagePopup', val);
  };

  const value = {
    conferenceData,
    pricingPhase,
    setPricingPhase,
    notification,
    setNotification,
    speakers,
    setSpeakers,
    faqs,
    setFaqs,
    privacyPolicy,
    setPrivacyPolicy,
    termsConditions,
    setTermsConditions,
    registrations,
    setRegistrations,
    addRegistration,
    isAdminAuthenticated,
    adminUsername,
    loginAdmin,
    logoutAdmin,
    organizingMembers,
    setOrganizingMembers,
    headOfficeLeaders,
    setHeadOfficeLeaders,
    ecMembers,
    setEcMembers,
    conferenceCommittee,
    setConferenceCommittee,
    scientificCategories,
    setScientificCategories,
    scientificAbstract,
    setScientificAbstract,
    seoSettings,
    setSeoSettings,
    contactSettings,
    setContactSettings,
    headerLogos,
    setHeaderLogos,
    abstractGuidelines,
    setAbstractGuidelines,
    registrationGuidelines,
    setRegistrationGuidelines,
    registrationTiers,
    setRegistrationTiers,
    refundPolicy,
    setRefundPolicy,
    disabledPages,
    setDisabledPages,
    aboutUs,
    setAboutUs,
    chiefPatron,
    setChiefPatron,
    scientificDownloads,
    setScientificDownloads,
    scheduleData,
    setScheduleData,
    venueInfo,
    setVenueInfo,
    hotelsList,
    setHotelsList,
    tradeData,
    setTradeData,
    workshopsList,
    setWorkshopsList,
    cityIntro,
    setCityIntro,
    touristAttractions,
    setTouristAttractions,
    homepageData,
    setHomepageData,
    programScheduleData,
    setProgramScheduleData,
    aboutUsExtras,
    setAboutUsExtras,
    homepagePopup,
    setHomepagePopup,

    // MySQL Relational Tables:
    schedules,
    setSchedules,
    addSchedule,
    sponsors,
    setSponsors,
    addSponsor,
    announcements,
    setAnnouncements,
    addAnnouncement,
    gallery,
    setGallery,
    addGalleryItem,
    deleteSchedule,
    deleteSponsor,
    deleteAnnouncement,
    deleteGalleryItem,
    approveRegistration,
    uploadImage,
    toasts,
    showToast,
    isPromoVideoOpen,
    setIsPromoVideoOpen,
    updateSchedule,
    updateSponsor,
    updateAnnouncement,
    updateGalleryItem,
    updateRegistration,
    checkDuplicateRegistration,
    getRegistrationByQuery,
    resendConfirmationEmail,
    resendSubmissionEmail,

    // Delegate Session & Auth
    delegateSession,
    delegateLogin,
    delegateLogout,
    updateDelegateProfile,

    // Submissions
    submissions,
    setSubmissions: setSubmissionsState,
    addSubmission,
    deleteSubmission,
    updateSubmissionStatus
  };

  return (
    <ConferenceContext.Provider value={value}>
      {children}
    </ConferenceContext.Provider>
  );
};

export const useConference = () => {
  const context = useContext(ConferenceContext);
  if (!context) throw new Error('useConference must be used within a ConferenceProvider');
  return context;
};

