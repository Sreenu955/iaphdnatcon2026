const mysql = require('mysql2/promise');
require('dotenv').config();

// The default data from setup-db.js to seed if missing
const defaultData = {
  notification: 'Early bird registration for IAPHD NATCON 2026 is now open! Secure your spot by July 15.',
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
  scientificDownloads: [
    { title: 'Abstract Guidelines', desc: 'Full PDF with structured formatting rules.', fileUrl: '' },
    { title: 'Presentation Template', desc: 'Official PowerPoint template for IAPHD NATCON 2026.', fileUrl: '' },
    { title: 'Poster Template', desc: 'Landscape oriented template for E-Posters.', fileUrl: '' }
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
  homepageData: {
    heroTitle1: "Gen Z Public Health Dentistry",
    heroTitle2: "AUGMENTING AI",
    heroTitle3: "& INNOVATION",
    countdownTarget: "2026-11-27T00:00:00",
    marqueeLogos: ["WALMART HEALTH", "MONDAY LABS", "ENVATO DENTAL", "AWWWARDS MED", "WOOCOMMERCE", "PINGDOM HEALTH"]
  },
  programScheduleData: {
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
  },
  aboutUsExtras: {
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
  }
};

async function seedProduction() {
  let connection;
  try {
    console.log('Connecting to production database at srv2215.hstgr.io...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: 3306
    });

    console.log('Successfully connected! Fetching existing settings...');
    const [rows] = await connection.query('SELECT `key` FROM settings');
    const existingKeys = rows.map(r => r.key);
    console.log('Existing settings keys in production:', existingKeys);

    let seededCount = 0;
    for (const [key, value] of Object.entries(defaultData)) {
      if (!existingKeys.includes(key)) {
        console.log(`👉 Key "${key}" is missing. Seeding it...`);
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        await connection.query(
          'INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?',
          [key, stringValue, stringValue]
        );
        seededCount++;
      } else {
        console.log(`⏭️ Key "${key}" already exists. Skipping.`);
      }
    }

    console.log(`\n🎉 DONE! Seeded ${seededCount} missing settings into production successfully!`);

  } catch (err) {
    console.error('❌ SEEDING FAILED:', err.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seedProduction();
