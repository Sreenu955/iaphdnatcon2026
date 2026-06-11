const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Default data taken from ConferenceContext.jsx
const defaultData = {
  pricingPhase: 'earlyBird',
  notification: 'Early bird registration for IAPHD NATCON 2026 is now open! Secure your spot by July 15.',
  organizingMembers: [
    { name: "Dr. P. Siva Kumar", role: "Organizing Chairman" },
    { name: "Dr. P. Nagarjuna", role: "Organizing Secretary" },
    { name: "Dr. Shourya Tandon", role: "Scientific Chairman" },
    { name: "Dr. Swathi.P", role: "Treasurer" },
    { name: "Dr. Srinivas Rao", role: "Co-Chairman" },
    { name: "Dr. Kavitha S.", role: "Joint Secretary" },
    { name: "Dr. Rajesh Kumar", role: "Reception Committee" },
    { name: "Dr. Anjali Devi", role: "Advisory Committee" }
  ],
  headOfficeLeaders: [
    { role: "President", name: "Dr M B Aswath Narayanan" },
    { role: "President Emeritus", name: "Dr. R K Bali" },
    { role: "President Elect", name: "Dr Vamsi Krishna Reddy L" },
    { role: "Immediate Past President", name: "Dr. Arun S Dodamani" },
    { role: "Vice President", name: "Dr Sowmya K R" },
    { role: "Vice President", name: "Dr Vikrant Mohanty" },
    { role: "Hon General Secretary", name: "Dr Ridhima Gaunkar" },
    { role: "Treasurer", name: "Dr Praveen Jodalli" },
    { role: "Joint Secretary", name: "Dr. Ramya R Iyer" }
  ],
  ecMembers: [
    "Dr. Padma K Bhat", "Dr. Ramprasad VP", "Dr. Prashanth VK", "Dr. Chandrashekar BR", 
    "Dr. Mansi Atri", "Dr. Arpit Gupta", "Dr. Bommireddy Vikram Simha", "Dr. Satyanarayana D",
    "Dr. Swapnil S Bumb", "Dr. Ankita Jain", "Dr. Pottem Nagarjuna", "Dr. Tanushri Mahendra Dalvi"
  ],
  conferenceCommittee: [
    { name: "Dr. Anirudh Sharma", role: "Scientific Committee" },
    { name: "Dr. Priyanka Verma", role: "Registration Committee" },
    { name: "Dr. Sandeep Hegde", role: "Transport Committee" }
  ],
  scientificCategories: [
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
  ],
  scientificAbstract: {
    wordLimit: 250,
    restrictions: "No figures, tables, or photographs.",
    structure: ["Introduction", "Aim/Objectives", "Methodology", "Results", "Conclusion"]
  },
  abstractGuidelines: {
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
  },
  registrationGuidelines: {
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
  },
  aboutUs: {
    tagline: "Welcome to IAPHD NATCON 2026",
    heading: "Empowering Public Health",
    headingHighlight: "Through Innovation",
    body: "The 30th National Conference of Indian Association of Public Health Dentistry (IAPHD) is set to be a landmark event in Visakhapatnam. We bring together experts, researchers, and practitioners to explore the theme of \"Gen Z Public Health Dentistry: Augmenting AI & Innovation\".",
    stats: [
      { label: "Speakers", value: "30+" },
      { label: "Delegates Expected", value: "1000+" },
      { label: "Scientific Sessions", value: "20+" },
      { label: "Years of IAPHD", value: "30th" }
    ]
  },
  venueInfo: {
    name: 'Anil Neerukonda Institute of Dental Sciences (ANIDS)',
    description: 'Located in the serene surroundings of Sangivalasa, ANIDS provides a state-of-the-art academic environment for IAPHD NATCON 2026. The campus is equipped with modern lecture halls and exhibition spaces perfect for global dental discourse.',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Anil+Neerukonda+Institute+Dental+Sciences+Visakhapatnam',
    imageUrl: 'https://iactacon2026.com/wp-content/uploads/2023/12/venue-img.jpg',
    subtitle: 'Visakhapatnam – The City of Destiny'
  },
  hotelsList: [
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
  ],
  tradeData: {
    sponsorshipTiers: [
      { name: 'Platinum Partner', price: '₹ 5,00,000', borderColor: 'border-gray-200' },
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
  },
  workshopsList: [
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
  ],
  cityIntro: {
    heading: 'Discover Vizag',
    body: 'Visakhapatnam, also known as Vizag, is the largest city and the financial capital of Andhra Pradesh. Nestled between the Eastern Ghats and the Bay of Bengal, it offers a unique blend of natural beauty and urban development.',
    travelTip: 'The conference month (November) is the best time to visit Vizag, with pleasant weather ranging from 20°C to 28°C.',
    heroImage: 'https://images.unsplash.com/photo-1590393282216-0428989f6681?auto=format&fit=crop&q=80&w=1200'
  },
  touristAttractions: [
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
  ],
  seoSettings: {
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
  },
  contactSettings: {
    phone: "9393344886",
    whatsapp: "919393344886",
    supportEmail: "support.30thiaphdnatcon@gmail.com",
    registrationEmail: "registrations.30thiaphdnatcon@gmail.com"
  },
  headerLogos: {
    logo1: "./logo-1.png",
    logo2: "./logo-1.png",
    logo3: "./logo-2.png",
    logo4: "./logo-2.png"
  },
  speakers: [
    { id: 1, name: 'Dr. Michael Chen', specialty: 'AI in Dentistry', image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200&h=200' },
    { id: 2, name: 'Dr. Sarah Johnson', specialty: 'Public Health Innovation', image: 'https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=200&h=200' },
  ],
  faqs: [
    { id: 1, question: "How do I register for IAPHD NATCON 2026?", answer: "You can register by clicking the 'Register & Reserve Seats' button on the homepage, filling out the multi-step delegation registration form, and completing the payment process." },
    { id: 2, question: "Is there an abstract submission deadline?", answer: "Yes, abstract submissions will be open shortly and details will be updated on the Submissions guidelines page." },
  ],
  privacyPolicy: `We value your privacy. All registration details, personal profiles, and online transaction records collected for IAPHD NATCON 2026 are encrypted and stored securely. We do not sell, rent, or share delegate information with third-party advertising services.`,
  termsConditions: `By registering for IAPHD NATCON 2026, delegates agree to comply with the rules set by the IAPHD organizing committee. Refunds are governed strictly by the refund policy timeline. registrations are non-transferable without written authorization.`,
  scheduleData: {
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
  }
};

// Relational DB tables data seeding
const seededSchedules = [
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
];

const seededSponsors = [
  { name: 'Colgate-Palmolive', logoUrl: 'https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=200', tier: 'Platinum', orderIndex: 1 },
  { name: 'Sensodyne', logoUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200', tier: 'Gold', orderIndex: 2 }
];

const seededAnnouncements = [
  { title: 'Abstract Submission Open', content: 'You can now submit your research abstracts for posters and paper presentations online via the scientific portal.', isActive: 1 },
  { title: 'Early Bird Registration Extended', content: 'Great news! The early bird registration tariffs have been extended until August 15. Secure your slots today!', isActive: 1 }
];

const seededGallery = [
  { title: 'RK Beach Coastline', mediaUrl: 'https://images.unsplash.com/photo-1626082895617-2c6de34769bb?auto=format&fit=crop&q=80&w=800', mediaType: 'image', category: 'Vizag' },
  { title: 'ANIDS Campus', mediaUrl: 'https://images.unsplash.com/photo-1596402184320-417d7178b2cd?auto=format&fit=crop&q=80&w=800', mediaType: 'image', category: 'Venue' }
];

const seededRegistrations = [
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
    accompanyingCount: 0,
    accompanyingFood: '',
    transactionId: 'TXN8492048203',
    paymentDate: '2026-05-18',
    amountPaid: 11500.00,
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
    accompanyingCount: 0,
    accompanyingFood: '',
    transactionId: 'UTR2940294829',
    paymentDate: '2026-05-19',
    amountPaid: 8500.00,
    status: 'PENDING'
  }
];

async function seedDatabase(connection, dbName) {
  console.log(`\n🌱 Seeding initial records into database "${dbName}"...`);
  
  // 1. Seed CMS Settings Table
  const [settingsCount] = await connection.query('SELECT COUNT(*) AS count FROM settings');
  if (settingsCount[0].count === 0) {
    console.log('  👉 Seeding "settings" table with default CMS settings...');
    for (const [key, value] of Object.entries(defaultData)) {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await connection.query(
        'INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?',
        [key, stringValue, stringValue]
      );
    }
    console.log('  ✅ "settings" table seeded!');
  } else {
    console.log('  ⏭️  "settings" table already has data. Skipping.');
  }

  // 2. Seed Schedules Table
  const [schedulesCount] = await connection.query('SELECT COUNT(*) AS count FROM schedules');
  if (schedulesCount[0].count === 0) {
    console.log('  👉 Seeding "schedules" table...');
    for (const item of seededSchedules) {
      await connection.query(
        'INSERT INTO schedules (dayNumber, timeSlot, title, speaker, venue) VALUES (?, ?, ?, ?, ?)',
        [item.dayNumber, item.timeSlot, item.title, item.speaker, item.venue]
      );
    }
    console.log('  ✅ "schedules" table seeded!');
  } else {
    console.log('  ⏭️  "schedules" table already has data. Skipping.');
  }

  // 3. Seed Sponsors Table
  const [sponsorsCount] = await connection.query('SELECT COUNT(*) AS count FROM sponsors');
  if (sponsorsCount[0].count === 0) {
    console.log('  👉 Seeding "sponsors" table...');
    for (const item of seededSponsors) {
      await connection.query(
        'INSERT INTO sponsors (name, logoUrl, tier, orderIndex) VALUES (?, ?, ?, ?)',
        [item.name, item.logoUrl, item.tier, item.orderIndex]
      );
    }
    console.log('  ✅ "sponsors" table seeded!');
  } else {
    console.log('  ⏭️  "sponsors" table already has data. Skipping.');
  }

  // 4. Seed Announcements Table
  const [announcementsCount] = await connection.query('SELECT COUNT(*) AS count FROM announcements');
  if (announcementsCount[0].count === 0) {
    console.log('  👉 Seeding "announcements" table...');
    for (const item of seededAnnouncements) {
      await connection.query(
        'INSERT INTO announcements (title, content, isActive) VALUES (?, ?, ?)',
        [item.title, item.content, item.isActive]
      );
    }
    console.log('  ✅ "announcements" table seeded!');
  } else {
    console.log('  ⏭️  "announcements" table already has data. Skipping.');
  }

  // 5. Seed Gallery Table
  const [galleryCount] = await connection.query('SELECT COUNT(*) AS count FROM gallery');
  if (galleryCount[0].count === 0) {
    console.log('  👉 Seeding "gallery" table...');
    for (const item of seededGallery) {
      await connection.query(
        'INSERT INTO gallery (title, mediaUrl, mediaType, category) VALUES (?, ?, ?, ?)',
        [item.title, item.mediaUrl, item.mediaType, item.category]
      );
    }
    console.log('  ✅ "gallery" table seeded!');
  } else {
    console.log('  ⏭️  "gallery" table already has data. Skipping.');
  }

  // 6. Seed Registrations Table
  const [registrationsCount] = await connection.query('SELECT COUNT(*) AS count FROM registrations');
  if (registrationsCount[0].count === 0) {
    console.log('  👉 Seeding "registrations" table...');
    for (const item of seededRegistrations) {
      await connection.query(
        `INSERT INTO registrations 
        (id, fullName, email, mobile, gender, institution, designation, councilRegNo, address, state, pincode, tier, category, iaphdNo, foodPreference, hasAccompanying, accompanyingName, accompanyingCount, accompanyingFood, transactionId, paymentDate, amountPaid, status, offline_online) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id, item.fullName, item.email, item.mobile, item.gender, item.institution, item.designation,
          item.councilRegNo, item.address, item.state, item.pincode, item.tier, item.category, item.iaphdNo,
          item.foodPreference, item.hasAccompanying, item.accompanyingName, item.accompanyingCount,
          item.accompanyingFood, item.transactionId, item.paymentDate, item.amountPaid, item.status,
          item.offline_online || 'online'
        ]
      );
    }
    console.log('  ✅ "registrations" table seeded!');
  } else {
    console.log('  ⏭️  "registrations" table already has data. Skipping.');
  }
}

async function setupDatabase() {
  console.log('==================================================');
  console.log('🚀 Starting Local MySQL Database Setup for NATCON 2026');
  console.log('==================================================');

  // Load config from .env or defaults
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'natcon_db';

  console.log(`🔌 Connecting to MySQL Server at: mysql://${user}@${host}...`);

  let connection;
  try {
    connection = await mysql.createConnection({
      host,
      user,
      password
    });
    console.log('✅ Connected to MySQL server successfully!');
  } catch (error) {
    console.error('❌ Connection Failed! Please verify that:');
    console.error('  1. XAMPP is open.');
    console.error('  2. The MySQL service in XAMPP is started (running on green).');
    console.error(`  3. The credentials (host: ${host}, user: ${user}) are correct.`);
    console.error('  Error details:', error.message);
    process.exit(1);
  }

  try {
    // 2. Create the Database if not exists
    console.log(`📂 Ensuring database "${dbName}" exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ Database "${dbName}" is ready!`);

    // 3. Switch to the database
    await connection.changeUser({ database: dbName });
    console.log(`📂 Switched database context to: "${dbName}"`);

    // 4. Create Tables
    console.log('🛠️  Creating database schema tables...');

    // Delegates table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id VARCHAR(50) PRIMARY KEY,
        fullName VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        mobile VARCHAR(20) NOT NULL,
        gender VARCHAR(20),
        institution VARCHAR(255),
        designation VARCHAR(100),
        councilRegNo VARCHAR(100),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        pincode VARCHAR(20),
        tier VARCHAR(50) NOT NULL,
        category VARCHAR(50) NOT NULL,
        iaphdNo VARCHAR(50),
        foodPreference VARCHAR(50),
        hasAccompanying VARCHAR(10),
        accompanyingName VARCHAR(255),
        accompanyingCount INT DEFAULT 0,
        accompanyingFood VARCHAR(50),
        transactionId VARCHAR(100),
        paymentDate DATE,
        amountPaid DECIMAL(10, 2),
        status VARCHAR(20) DEFAULT 'PENDING',
        offline_online VARCHAR(20) DEFAULT 'online',
        profilePic LONGTEXT DEFAULT NULL,
        password VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('  👉 Table "registrations" created/verified.');

    // Admin table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('  👉 Table "admins" created/verified.');

    // Seed default Admin user
    // Credentials: Username = 'admin', Password = 'admin123'
    const [adminExists] = await connection.query('SELECT * FROM admins WHERE username = "admin"');
    if (adminExists.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await connection.query(
        'INSERT INTO admins (username, password) VALUES (?, ?)',
        ['admin', hashedPassword]
      );
      console.log('  👤 Seeded default admin account (User: admin, Pass: admin123).');
    } else {
      console.log('  👤 Default admin account already seeded.');
    }

    // Settings table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS settings (
        \`key\` VARCHAR(100) PRIMARY KEY,
        \`value\` LONGTEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('  👉 Table "settings" created/verified.');

    // Schedules table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS schedules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        dayNumber INT NOT NULL,
        timeSlot VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        speaker VARCHAR(255) NOT NULL,
        venue VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('  👉 Table "schedules" created/verified.');

    // Sponsors table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sponsors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        logoUrl TEXT NOT NULL,
        tier VARCHAR(100) NOT NULL,
        orderIndex INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('  👉 Table "sponsors" created/verified.');

    // Announcements table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        isActive BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('  👉 Table "announcements" created/verified.');

    // Gallery table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS gallery (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255),
        mediaUrl TEXT NOT NULL,
        mediaType VARCHAR(50) DEFAULT 'image',
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('  👉 Table "gallery" created/verified.');

    // Submissions table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        regId VARCHAR(50) NOT NULL,
        fullName VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        mobile VARCHAR(20) NOT NULL,
        type VARCHAR(50) NOT NULL,
        category VARCHAR(100) NOT NULL,
        fileUrl TEXT NOT NULL,
        fileName VARCHAR(255) DEFAULT NULL,
        status VARCHAR(20) DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (regId) REFERENCES registrations(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('  👉 Table "submissions" created/verified.');

    // Self-healing migration: Ensure offline_online exists in registrations
    const [offlineColExists] = await connection.query(`SHOW COLUMNS FROM registrations LIKE 'offline_online'`);
    if (offlineColExists.length === 0) {
      await connection.query(`ALTER TABLE registrations ADD COLUMN offline_online VARCHAR(20) DEFAULT 'online'`);
      console.log('  👉 Added missing "offline_online" column to "registrations" table.');
    }

    // Self-healing migration: Ensure profilePic exists and is LONGTEXT in registrations
    const [profilePicColExists] = await connection.query(`SHOW COLUMNS FROM registrations LIKE 'profilePic'`);
    if (profilePicColExists.length === 0) {
      await connection.query(`ALTER TABLE registrations ADD COLUMN profilePic LONGTEXT DEFAULT NULL`);
      console.log('  👉 Added missing "profilePic" column to "registrations" table.');
    } else {
      await connection.query(`ALTER TABLE registrations MODIFY COLUMN profilePic LONGTEXT DEFAULT NULL`);
      console.log('  👉 Ensured "profilePic" column is LONGTEXT in "registrations" table.');
    }

    // Self-healing migration: Ensure password exists in registrations
    const [passwordColExists] = await connection.query(`SHOW COLUMNS FROM registrations LIKE 'password'`);
    if (passwordColExists.length === 0) {
      await connection.query(`ALTER TABLE registrations ADD COLUMN password VARCHAR(255) DEFAULT NULL`);
      console.log('  👉 Added missing "password" column to "registrations" table.');
    }

    // Seed data into the primary Node.js DB
    await seedDatabase(connection, dbName);

    // 5. Also optionally create the hostinger-styled local database so api.php works right away!
    if (dbName !== 'u695381285_natcon2026') {
      console.log('\n📂 Ensuring default PHP API database "u695381285_natcon2026" also exists for testing api.php...');
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`u695381285_natcon2026\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      
      // Switch to u695381285_natcon2026 to import the same tables
      await connection.changeUser({ database: 'u695381285_natcon2026' });
      
      // Create the exact same tables in the PHP testing database
      const tables = [
        'registrations', 'admins', 'settings', 'schedules', 'sponsors', 'announcements', 'gallery', 'submissions'
      ];
      
      for (const table of tables) {
        await connection.query(`CREATE TABLE IF NOT EXISTS u695381285_natcon2026.${table} LIKE ${dbName}.${table}`);
      }
      
      // Self-healing migration for mirrored u695381285_natcon2026 table
      const [mirroredOfflineColExists] = await connection.query(`SHOW COLUMNS FROM u695381285_natcon2026.registrations LIKE 'offline_online'`);
      if (mirroredOfflineColExists.length === 0) {
        await connection.query(`ALTER TABLE u695381285_natcon2026.registrations ADD COLUMN offline_online VARCHAR(20) DEFAULT 'online'`);
        console.log('  👉 Added missing "offline_online" column to mirrored PHP "registrations" table.');
      }

      // Self-healing migration for mirrored u695381285_natcon2026 profilePic column
      const [mirroredProfilePicColExists] = await connection.query(`SHOW COLUMNS FROM u695381285_natcon2026.registrations LIKE 'profilePic'`);
      if (mirroredProfilePicColExists.length === 0) {
        await connection.query(`ALTER TABLE u695381285_natcon2026.registrations ADD COLUMN profilePic LONGTEXT DEFAULT NULL`);
        console.log('  👉 Added missing "profilePic" column to mirrored PHP "registrations" table.');
      } else {
        await connection.query(`ALTER TABLE u695381285_natcon2026.registrations MODIFY COLUMN profilePic LONGTEXT DEFAULT NULL`);
        console.log('  👉 Ensured mirrored "profilePic" column is LONGTEXT.');
      }

      // Self-healing migration for mirrored u695381285_natcon2026 password column
      const [mirroredPasswordColExists] = await connection.query(`SHOW COLUMNS FROM u695381285_natcon2026.registrations LIKE 'password'`);
      if (mirroredPasswordColExists.length === 0) {
        await connection.query(`ALTER TABLE u695381285_natcon2026.registrations ADD COLUMN password VARCHAR(255) DEFAULT NULL`);
        console.log('  👉 Added missing "password" column to mirrored PHP "registrations" table.');
      }
      
      // Seed admin in u695381285_natcon2026 too
      const [phpAdminExists] = await connection.query('SELECT * FROM admins WHERE username = "admin"');
      if (phpAdminExists.length === 0) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await connection.query(
          'INSERT INTO admins (username, password) VALUES (?, ?)',
          ['admin', hashedPassword]
        );
      }
      
      // Seed data into u695381285_natcon2026
      await seedDatabase(connection, 'u695381285_natcon2026');
      
      console.log('✅ PHP API Database "u695381285_natcon2026" is set up and mirrored!');
    } else {
      console.log('\n📂 Skipping PHP API mirror database creation as the primary database is already "u695381285_natcon2026".');
    }

    console.log('\n==================================================');
    console.log('🎉 LOCAL DATABASE SETUP & SEEDING COMPLETED SUCCESSFULLY! 🎉');
    console.log('==================================================');
    console.log(`📌 Your local database has been populated with all initial mock datasets!`);
    console.log(`   - Node.js DB: "${dbName}"`);
    console.log(`   - PHP API DB: "u695381285_natcon2026"`);
    console.log(`📌 Connection details:`);
    console.log(`   - Host: ${host}`);
    console.log(`   - User: ${user}`);
    console.log(`   - Password: (empty/none)`);
    console.log(`   - Port: 3306 (MySQL default)`);
    console.log('==================================================');

  } catch (error) {
    console.error('❌ Failed to construct database tables:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

setupDatabase();
