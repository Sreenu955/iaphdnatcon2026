import React, { useState, useEffect } from 'react';
import { useConference } from '../context/ConferenceContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  Bell,
  LogOut,
  TrendingUp,
  Clock,
  Edit,
  Save,
  ChevronRight,
  Plus,
  Lock,
  AlertCircle,
  CheckCircle,
  Search,
  Trash2,
  X,
  Mail,
  Globe,
  FileText,
  XCircle,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const RichTextArea = ({ value, onChange, placeholder = "", h = "h-40", className = "" }) => {
  const containerRef = React.useRef(null);
  const editorInstanceRef = React.useRef(null);
  const isUpdatingRef = React.useRef(false);

  React.useEffect(() => {
    let active = true;
    let localEditor = null;

    const initEditor = () => {
      if (!containerRef.current) return;
      if (editorInstanceRef.current) return;

      // Safeguard: Check the DOM to see if an editor is already initialized in this wrapper
      const wrapper = containerRef.current.parentNode;
      if (wrapper && wrapper.querySelector('.ck-editor')) {
        return;
      }

      window.ClassicEditor.create(containerRef.current, {
        placeholder: placeholder,
        toolbar: [
          'heading', '|',
          'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', '|',
          'undo', 'redo'
        ]
      })
        .then(editor => {
          if (!active) {
            editor.destroy();
            return;
          }
          editorInstanceRef.current = editor;
          localEditor = editor;

          // Set initial value
          editor.setData(value || '');

          // Listen for changes
          editor.model.document.on('change:data', () => {
            if (!isUpdatingRef.current) {
              const data = editor.getData();
              onChange({ target: { value: data } });
            }
          });
        })
        .catch(error => {
          console.error('Error initializing CKEditor:', error);
        });
    };

    // Load CKEditor CDN if not already loaded
    if (!window.ClassicEditor) {
      let script = document.querySelector('script[src="https://cdn.ckeditor.com/ckeditor5/36.0.1/classic/ckeditor.js"]');
      if (!script) {
        script = document.createElement('script');
        script.src = 'https://cdn.ckeditor.com/ckeditor5/36.0.1/classic/ckeditor.js';
        script.async = true;
        document.body.appendChild(script);
      }

      const handleLoad = () => {
        if (active) initEditor();
      };

      script.addEventListener('load', handleLoad);

      return () => {
        active = false;
        script.removeEventListener('load', handleLoad);
        if (localEditor) {
          localEditor.destroy()
            .then(() => {
              editorInstanceRef.current = null;
            })
            .catch(err => console.error('Error destroying CKEditor:', err));
        }
      };
    } else {
      initEditor();
      return () => {
        active = false;
        if (localEditor) {
          localEditor.destroy()
            .then(() => {
              editorInstanceRef.current = null;
            })
            .catch(err => console.error('Error destroying CKEditor:', err));
        } else if (editorInstanceRef.current) {
          editorInstanceRef.current.destroy()
            .then(() => {
              editorInstanceRef.current = null;
            })
            .catch(err => console.error('Error destroying CKEditor:', err));
        }
      };
    }
  }, []);

  // Sync value changes from parent (but avoid circular updates)
  React.useEffect(() => {
    if (editorInstanceRef.current && value !== undefined) {
      const currentData = editorInstanceRef.current.getData();
      if (currentData !== value) {
        isUpdatingRef.current = true;
        editorInstanceRef.current.setData(value || '');
        isUpdatingRef.current = false;
      }
    }
  }, [value]);

  return (
    <div className={`ckeditor-wrapper text-black rounded-xl overflow-hidden border border-softgray ${className}`}>
      <textarea ref={containerRef} style={{ display: 'none' }} defaultValue={value || ''} />
    </div>
  );
};

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

const AdminDashboard = () => {
  const {
    pricingPhase,
    setPricingPhase,
    notification,
    setNotification,
    conferenceData,
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
    // Live MySQL Relational elements
    schedules,
    addSchedule,
    deleteSchedule,
    sponsors,
    addSponsor,
    deleteSponsor,
    announcements,
    addAnnouncement,
    deleteAnnouncement,
    gallery,
    addGalleryItem,
    deleteGalleryItem,
    approveRegistration,
    resendConfirmationEmail,
    resendSubmissionEmail,
    addRegistration,
    uploadImage,
    updateSchedule,
    updateSponsor,
    updateAnnouncement,
    updateGalleryItem,
    showToast,
    setSchedules,
    setSponsors,
    setAnnouncements,
    setGallery,
    updateRegistration,
    homepageData, setHomepageData,
    programScheduleData, setProgramScheduleData,
    aboutUsExtras, setAboutUsExtras,
    venueInfo, setVenueInfo,
    hotelsList, setHotelsList,
    cityIntro, setCityIntro,
    touristAttractions, setTouristAttractions,
    workshopsList, setWorkshopsList,
    tradeData, setTradeData,
    homepagePopup, setHomepagePopup,
    submissions,
    deleteSubmission,
    updateSubmissionStatus
  } = useConference();

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'registrations', 'speakers', 'notifications', 'settings'
  const [activeContentTab, setActiveContentTab] = useState('faqs');
  const [tariffs, setTariffsState] = useState(registrationTiers || []);

  useEffect(() => {
    if (registrationTiers) {
      setTariffsState(registrationTiers);
    }
  }, [registrationTiers]);

  const setTariffs = (val) => {
    setTariffsState(val);
    setRegistrationTiers(val);
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReg, setSelectedReg] = useState(null); // Detail modal
  const [editingReg, setEditingReg] = useState(null); // Edit modal
  const [creatingOfflineReg, setCreatingOfflineReg] = useState(false); // Offline registration creation modal
  const [offlineRegForm, setOfflineRegForm] = useState({
    fullName: '', email: '', mobile: '', gender: '', institution: '', designation: '',
    councilRegNo: '', address: '', city: '', state: '', pincode: '', category: 'Faculty',
    iaphdNo: '', tier: 'classic', foodPreference: '', hasAccompanying: 'no',
    accompanyingName: '', accompanyingCount: 0, accompanyingFood: '', amountPaid: 0,
    transactionId: ''
  });
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Dynamic Admin Favicon
  useEffect(() => {
    let link = document.querySelector("link[rel~='icon']");
    const created = !link;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }

    const originalFavicon = headerLogos?.favicon || link.getAttribute('href') || '/favicon.svg';
    const adminFavicon = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔒</text></svg>";
    link.href = adminFavicon;

    return () => {
      if (created) {
        link.remove();
      } else {
        link.href = originalFavicon;
      }
    };
  }, [headerLogos]);

  const handleExportCSV = () => {
    const headers = [
      'Registration ID', 
      'Full Name', 
      'Email', 
      'Phone / Mobile', 
      'Gender', 
      'Institution', 
      'Designation', 
      'Council Registration No', 
      'Address', 
      'City', 
      'State', 
      'Pincode', 
      'Registration Tier', 
      'Category', 
      'IAPHD Number', 
      'Food Preference', 
      'Has Accompanying Person', 
      'Accompanying Person Name', 
      'Accompanying Person Count', 
      'Accompanying Person Food Preference', 
      'Transaction ID', 
      'Payment Date', 
      'Amount Paid', 
      'Payment Status', 
      'Offline/Online Mode', 
      'Profile Pic Uploaded',
      'Payment Screenshot URL',
      'Registration Date'
    ];

    const csvData = [
      headers.join(','),
      ...registrations.map(reg => [
        reg.id || '',
        `"${(reg.fullName || '').replace(/"/g, '""')}"`,
        `"${(reg.email || '').replace(/"/g, '""')}"`,
        `"${(reg.mobile || '').replace(/"/g, '""')}"`,
        `"${(reg.gender || '').replace(/"/g, '""')}"`,
        `"${(reg.institution || '').replace(/"/g, '""')}"`,
        `"${(reg.designation || '').replace(/"/g, '""')}"`,
        `"${(reg.councilRegNo || '').replace(/"/g, '""')}"`,
        `"${(reg.address || '').replace(/\r?\n|\r/g, ' ').replace(/"/g, '""')}"`,
        `"${(reg.city || '').replace(/"/g, '""')}"`,
        `"${(reg.state || '').replace(/"/g, '""')}"`,
        `"${(reg.pincode || '').replace(/"/g, '""')}"`,
        `"${(reg.tier || '').replace(/"/g, '""')}"`,
        `"${(reg.category || '').replace(/"/g, '""')}"`,
        `"${(reg.iaphdNo || '').replace(/"/g, '""')}"`,
        `"${(reg.foodPreference || '').replace(/"/g, '""')}"`,
        `"${(reg.hasAccompanying || 'no').replace(/"/g, '""')}"`,
        `"${(reg.accompanyingName || '').replace(/"/g, '""')}"`,
        reg.accompanyingCount || 0,
        `"${(reg.accompanyingFood || '').replace(/"/g, '""')}"`,
        `"${(reg.transactionId || '').replace(/"/g, '""')}"`,
        reg.paymentDate || '',
        reg.amountPaid || 0,
        `"${(reg.status || 'PENDING').replace(/"/g, '""')}"`,
        `"${(reg.offline_online || 'online').replace(/"/g, '""')}"`,
        reg.profilePic ? 'Yes' : 'No',
        `"${(reg.paymentScreenshot || '')}"`,
        reg.created_at || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'registered_delegates_master_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Speaker Form State
  const [newSpeakerName, setNewSpeakerName] = useState('');
  const [newSpeakerSpecialty, setNewSpeakerSpecialty] = useState('');
  const [newSpeakerImg, setNewSpeakerImg] = useState('https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200&h=200');

  const handleLogin = async (e) => {
    e.preventDefault();
    const success = await loginAdmin(loginUsername, loginPassword);
    if (!success) {
      setLoginError('Invalid administrator credentials.');
    } else {
      setLoginError('');
      setLoginUsername('');
      setLoginPassword('');
    }
  };

  const handleAddSpeaker = (e) => {
    e.preventDefault();
    if (!newSpeakerName || !newSpeakerSpecialty) return;
    const added = [...speakers, { id: Date.now(), name: newSpeakerName, specialty: newSpeakerSpecialty, image: newSpeakerImg }];
    setSpeakers(added);
    setNewSpeakerName('');
    setNewSpeakerSpecialty('');
  };

  // Committee Form States
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgRole, setNewOrgRole] = useState('');
  const [newOrgImg, setNewOrgImg] = useState('');

  const [newLeaderName, setNewLeaderName] = useState('');
  const [newLeaderRole, setNewLeaderRole] = useState('');

  const [newEcName, setNewEcName] = useState('');

  const [newCommitteeName, setNewCommitteeName] = useState('');
  const [newCommitteeRole, setNewCommitteeRole] = useState('');
  const [selectedSeoPage, setSelectedSeoPage] = useState('home');

  const handleAddScientificCategory = () => {
    const added = [...scientificCategories, {
      id: `cat-${Date.now()}`,
      label: "New Category Label",
      type: "New Presentation Type",
      rules: ["3 mins presentation + 1 min discussion", "Static content only"]
    }];
    setScientificCategories(added);
  };

  const handleAddOrgMember = (e) => {
    e.preventDefault();
    if (!newOrgName || !newOrgRole) return;

    const added = [...organizingMembers, { name: newOrgName, role: newOrgRole, img: newOrgImg }];
    setOrganizingMembers(added);
    setNewOrgName('');
    setNewOrgRole('');
    setNewOrgImg('');
  };

  const handleAddLeaderMember = (e) => {
    e.preventDefault();
    if (!newLeaderName || !newLeaderRole) return;
    const added = [...headOfficeLeaders, { name: newLeaderName, role: newLeaderRole }];
    setHeadOfficeLeaders(added);
    setNewLeaderName('');
    setNewLeaderRole('');
  };

  const handleAddCommitteeMember = (e) => {
    e.preventDefault();
    if (!newCommitteeName || !newCommitteeRole) return;
    const added = [...conferenceCommittee, { name: newCommitteeName, role: newCommitteeRole }];
    setConferenceCommittee(added);
    setNewCommitteeName('');
    setNewCommitteeRole('');
  };

  const handleAddEcMember = (e) => {
    e.preventDefault();
    if (!newEcName) return;
    const added = [...ecMembers, newEcName];
    setEcMembers(added);
    setNewEcName('');
  };

  // ── LIVE RELATIONAL TABLES STATES & HANDLERS ────────────────────────────
  // Schedule Form State
  const [newSchedDay, setNewSchedDay] = useState(1);
  const [newSchedTime, setNewSchedTime] = useState('');
  const [newSchedTitle, setNewSchedTitle] = useState('');
  const [newSchedSpeaker, setNewSchedSpeaker] = useState('');
  const [newSchedVenue, setNewSchedVenue] = useState('');

  // Sponsor Form State
  const [newSponName, setNewSponName] = useState('');
  const [newSponLogo, setNewSponLogo] = useState('');
  const [newSponTier, setNewSponTier] = useState('Platinum');
  const [newSponOrder, setNewSponOrder] = useState(1);

  // Announcement Form State
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newAnnLinkUrl, setNewAnnLinkUrl] = useState('');
  const [newAnnPdfUrl, setNewAnnPdfUrl] = useState('');
  const [isAnnUploading, setIsAnnUploading] = useState(false);

  // Gallery Form State
  const [newGalTitle, setNewGalTitle] = useState('');
  const [newGalUrl, setNewGalUrl] = useState('');
  const [newGalType, setNewGalType] = useState('image');
  const [newGalCat, setNewGalCat] = useState('Venue');

  const [isSponUploading, setIsSponUploading] = useState(false);
  const [isGalUploading, setIsGalUploading] = useState(false);

  const handleSponsorLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsSponUploading(true);
    const uploadedUrl = await uploadImage(file);
    if (uploadedUrl) {
      setNewSponLogo(uploadedUrl);
    }
    setIsSponUploading(false);
  };

  const handleGalleryMediaChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsGalUploading(true);
    const uploadedUrl = await uploadImage(file);
    if (uploadedUrl) {
      setNewGalUrl(uploadedUrl);
    }
    setIsGalUploading(false);
  };

  const handleAnnPdfChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsAnnUploading(true);
    const uploadedUrl = await uploadImage(file);
    if (uploadedUrl) {
      setNewAnnLinkUrl(uploadedUrl); // Auto-populate redirect link with the uploaded PDF absolute URL!
      setNewAnnPdfUrl(uploadedUrl);
    }
    setIsAnnUploading(false);
  };

  const handleEditAnnPdfChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsEditAnnUploading(true);
    const uploadedUrl = await uploadImage(file);
    if (uploadedUrl) {
      setEditAnnLinkUrl(uploadedUrl); // Auto-populate redirect link with the uploaded PDF absolute URL!
      setEditAnnPdfUrl(uploadedUrl);
    }
    setIsEditAnnUploading(false);
  };

  // ── CMS CRUD EDITING STATES & HANDLERS ──────────────────────────────────
  const [editId, setEditId] = useState(null);
  const [editType, setEditType] = useState(''); // 'schedule', 'sponsor', 'announcement', 'gallery'

  // Edit Schedule fields
  const [editSchedDay, setEditSchedDay] = useState(1);
  const [editSchedTime, setEditSchedTime] = useState('');
  const [editSchedTitle, setEditSchedTitle] = useState('');
  const [editSchedSpeaker, setEditSchedSpeaker] = useState('');
  const [editSchedVenue, setEditSchedVenue] = useState('');

  // Edit Sponsor fields
  const [editSponName, setEditSponName] = useState('');
  const [editSponLogo, setEditSponLogo] = useState('');
  const [editSponTier, setEditSponTier] = useState('Platinum');
  const [editSponOrder, setEditSponOrder] = useState(1);
  const [isEditSponUploading, setIsEditSponUploading] = useState(false);

  // Edit Announcement fields
  const [editAnnTitle, setEditAnnTitle] = useState('');
  const [editAnnContent, setEditAnnContent] = useState('');
  const [editAnnIsActive, setEditAnnIsActive] = useState(true);
  const [editAnnLinkUrl, setEditAnnLinkUrl] = useState('');
  const [editAnnPdfUrl, setEditAnnPdfUrl] = useState('');
  const [isEditAnnUploading, setIsEditAnnUploading] = useState(false);

  // Edit Gallery fields
  const [editGalTitle, setEditGalTitle] = useState('');
  const [editGalUrl, setEditGalUrl] = useState('');
  const [editGalType, setEditGalType] = useState('image');
  const [editGalCat, setEditGalCat] = useState('Venue');
  const [isEditGalUploading, setIsEditGalUploading] = useState(false);

  const openEditModal = (type, item) => {
    setEditId(item.id || null);
    setEditType(type);

    if (type === 'schedule') {
      setEditSchedDay(item.dayNumber || 1);
      setEditSchedTime(item.timeSlot || '');
      setEditSchedTitle(item.title || '');
      setEditSchedSpeaker(item.speaker || '');
      setEditSchedVenue(item.venue || '');
    } else if (type === 'sponsor') {
      setEditSponName(item.name || '');
      setEditSponLogo(item.logoUrl || '');
      setEditSponTier(item.tier || 'Platinum');
      setEditSponOrder(item.orderIndex || 1);
    } else if (type === 'announcement') {
      setEditAnnTitle(item.title || '');
      const parsed = parseAnnouncementContent(item.content);
      setEditAnnContent(parsed.desc);
      setEditAnnLinkUrl(parsed.linkUrl);
      setEditAnnPdfUrl(parsed.pdfUrl);
      setEditAnnIsActive(item.isActive !== undefined ? !!item.isActive : true);
    } else if (type === 'gallery') {
      setEditGalTitle(item.title || '');
      setEditGalUrl(item.mediaUrl || '');
      setEditGalType(item.mediaType || 'image');
      setEditGalCat(item.category || 'Venue');
    }
  };

  const closeEditModal = () => {
    setEditId(null);
    setEditType('');
  };

  const handleEditSponsorLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsEditSponUploading(true);
    const uploadedUrl = await uploadImage(file);
    if (uploadedUrl) {
      setEditSponLogo(uploadedUrl);
    }
    setIsEditSponUploading(false);
  };

  const handleEditGalleryMediaChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsEditGalUploading(true);
    const uploadedUrl = await uploadImage(file);
    if (uploadedUrl) {
      setEditGalUrl(uploadedUrl);
    }
    setIsEditGalUploading(false);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    let success = false;

    if (editType === 'schedule') {
      success = await updateSchedule(editId, {
        dayNumber: Number(editSchedDay),
        timeSlot: editSchedTime,
        title: editSchedTitle,
        speaker: editSchedSpeaker,
        venue: editSchedVenue
      });
    } else if (editType === 'sponsor') {
      success = await updateSponsor(editId, {
        name: editSponName,
        logoUrl: editSponLogo,
        tier: editSponTier,
        orderIndex: Number(editSponOrder)
      });
    } else if (editType === 'announcement') {
      success = await updateAnnouncement(editId, {
        title: editAnnTitle,
        content: JSON.stringify({ desc: editAnnContent, linkUrl: editAnnLinkUrl, pdfUrl: editAnnPdfUrl }),
        isActive: editAnnIsActive
      });
    } else if (editType === 'gallery') {
      success = await updateGalleryItem(editId, {
        title: editGalTitle,
        mediaUrl: editGalUrl,
        mediaType: editGalType,
        category: editGalCat
      });
    }

    if (success) {
      closeEditModal();
    }
  };

  const handleAddScheduleLocal = async (e) => {
    e.preventDefault();
    if (!newSchedTime || !newSchedTitle) return;
    const success = await addSchedule({
      dayNumber: Number(newSchedDay),
      timeSlot: newSchedTime,
      title: newSchedTitle,
      speaker: newSchedSpeaker,
      venue: newSchedVenue
    });
    if (success) {
      setNewSchedTime('');
      setNewSchedTitle('');
      setNewSchedSpeaker('');
      setNewSchedVenue('');
    }
  };

  const handleAddSponsorLocal = async (e) => {
    e.preventDefault();
    if (!newSponName || !newSponLogo) return;
    const success = await addSponsor({
      name: newSponName,
      logoUrl: newSponLogo,
      tier: newSponTier,
      orderIndex: Number(newSponOrder)
    });
    if (success) {
      setNewSponName('');
      setNewSponLogo('');
      setNewSponOrder(1);
    }
  };

  const handleAddAnnouncementLocal = async (e) => {
    e.preventDefault();
    if (!newAnnTitle) return;
    const success = await addAnnouncement({
      title: newAnnTitle,
      content: JSON.stringify({ desc: newAnnContent, linkUrl: newAnnLinkUrl, pdfUrl: newAnnPdfUrl }),
      isActive: true
    });
    if (success) {
      setNewAnnTitle('');
      setNewAnnContent('');
      setNewAnnLinkUrl('');
      setNewAnnPdfUrl('');
    }
  };

  const handleAddGalleryItemLocal = async (e) => {
    e.preventDefault();
    if (!newGalTitle || !newGalUrl) return;
    const success = await addGalleryItem({
      title: newGalTitle,
      mediaUrl: newGalUrl,
      mediaType: newGalType,
      category: newGalCat
    });
    if (success) {
      setNewGalTitle('');
      setNewGalUrl('');
    }
  };

  const handleDeleteSpeaker = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "This will remove this speaker profile.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        const updated = speakers.filter(s => s.id !== id);
        setSpeakers(updated);
        showToast('Speaker profile removed successfully!', 'success');
      }
    });
  };

  // Dynamic calculations
  const totalRegistrations = registrations.length;
  const onlineRegistrations = registrations.filter(r => r.offline_online !== 'offline').length;
  const offlineRegistrations = registrations.filter(r => r.offline_online === 'offline').length;
  const failedRegistrations = registrations.filter(r => r.status === 'FAILED').length;
  const successRevenue = registrations.filter(r => r.status === 'CONFIRMED').reduce((acc, curr) => acc + (Number(curr.amountPaid) || 0), 0);

  // Filter registrations
  const filteredRegs = registrations.filter(r => {
    const term = searchTerm.toLowerCase();
    return (
      r.fullName.toLowerCase().includes(term) ||
      r.email.toLowerCase().includes(term) ||
      r.id.toLowerCase().includes(term) ||
      (r.institution && r.institution.toLowerCase().includes(term)) ||
      (r.status && r.status.toLowerCase().includes(term)) ||
      (r.offline_online && r.offline_online.toLowerCase().includes(term)) ||
      (r.mobile && r.mobile.toLowerCase().includes(term))
    );
  });

  // Filter submissions
  const filteredSubmissions = (submissions || []).filter(sub => {
    const term = searchTerm.toLowerCase();
    const subRegId = sub.regId || sub.regid || '';
    const subFullName = sub.fullName || sub.fullname || '';
    const subStatus = sub.status || 'PENDING';
    return (
      subRegId.toLowerCase().includes(term) ||
      subFullName.toLowerCase().includes(term) ||
      subStatus.toLowerCase().includes(term) ||
      (sub.email && sub.email.toLowerCase().includes(term)) ||
      (sub.category && sub.category.toLowerCase().includes(term)) ||
      (sub.type && sub.type.toLowerCase().includes(term))
    );
  });

  const handleExportSubmissionsCSV = () => {
    const headers = ['ID', 'Registration ID', 'Author Name', 'Email', 'Mobile', 'Submission Type', 'Category', 'File URL', 'Filename', 'Status', 'Submission Date'];
    const csvData = [
      headers.join(','),
      ...(submissions || []).map(sub => [
        sub.id,
        sub.regId || sub.regid || '',
        `"${sub.fullName || sub.fullname || ''}"`,
        `"${sub.email || ''}"`,
        `"${sub.mobile || ''}"`,
        sub.type || '',
        `"${sub.category || ''}"`,
        `"${sub.fileUrl || sub.fileurl || ''}"`,
        `"${sub.fileName || sub.filename || ''}"`,
        sub.status || 'PENDING',
        sub.created_at || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'abstract_submissions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Authentication Gate Screen
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070b19] flex items-center justify-center p-4 font-sans relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C8A96B]/15 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-900/15 rounded-full blur-[120px] pointer-events-none"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-slate-950/60 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl relative space-y-8"
        >
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#C8A96B] via-[#00A8CC] to-[#C8A96B] rounded-t-2xl"></div>

          <div className="text-center space-y-3">
            <div className="w-14 h-14 bg-[#C8A96B]/10 rounded-full flex items-center justify-center mx-auto text-[#C8A96B] border border-[#C8A96B]/20">
              <Lock className="w-6 h-6 animate-pulse" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Admin Gateway</h2>
            <p className="text-[10px] text-white/60 uppercase tracking-widest font-bold">Authorized personnel access only</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/70">Security Username</label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="Enter username..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-[#00A8CC] focus:ring-1 focus:ring-[#00A8CC] outline-none transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/70">Security Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-[#00A8CC] focus:ring-1 focus:ring-[#00A8CC] outline-none transition-all"
                required
              />
            </div>

            {loginError && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center text-xs text-red-400 font-bold uppercase tracking-wide gap-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-[#00A8CC] shrink-0 mt-0.5" />
              <p className="text-[9px] font-bold text-white/50 uppercase leading-relaxed tracking-wider">
                Demo access credentials: Enter <span className="text-[#00A8CC] font-black">admin</span> / <span className="text-[#00A8CC] font-black">admin123</span> or superadmin <span className="text-[#00A8CC] font-black">sadmin</span> / <span className="text-[#00A8CC] font-black">ambi@1225</span>.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-[#C8A96B] to-[#ff8585] text-white shadow-[0_4px_20px_rgba(200,169,107,0.3)] hover:shadow-[0_4px_25px_rgba(200,169,107,0.5)] hover:scale-[1.01] active:scale-[0.99] font-black uppercase tracking-[4px] text-[10px] rounded-xl transition-all cursor-pointer"
            >
              Authenticate
            </button>
          </form>

          <div className="text-center">
            <Link to="/" className="text-xs font-bold text-white/60 hover:text-[#C8A96B] uppercase tracking-widest transition-colors">
              ← Return to Conference Site
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-gray-900 font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-[#14213D] text-white hidden md:flex flex-col border-r border-white/5 shadow-xl">
        <div className="p-8 border-b border-white/10">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#C8A96B] to-[#ff8585] rounded-xl flex items-center justify-center font-black text-white shadow-md shadow-[#C8A96B]/20">N</div>
            <span className="text-xl font-black tracking-tighter italic uppercase">NATCON <span className="text-[#00A8CC]">Admin</span></span>
          </Link>
        </div>

        <nav className="flex-1 mt-8 pr-6 space-y-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'registrations', icon: Users, label: 'Registrations' },
            { id: 'abstracts', icon: FileText, label: 'Abstracts' },
            { id: 'settings', icon: Settings, label: 'Site Settings' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-6 py-3.5 transition-all group cursor-pointer border-l-4 ${activeTab === item.id
                ? 'bg-gradient-to-r from-[#C8A96B]/15 to-transparent text-[#C8A96B] border-[#C8A96B] font-bold rounded-r-xl'
                : 'text-white/60 hover:text-white hover:bg-white/5 border-transparent rounded-r-xl'
                }`}
            >
              <item.icon className={`w-5 h-5 mr-4 ${activeTab === item.id ? 'text-[#C8A96B]' : 'text-white/40 group-hover:text-white transition-colors'}`} />
              <span className="text-xs font-semibold uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-white/10">
          <button
            onClick={logoutAdmin}
            className="flex items-center text-white/60 hover:text-[#C8A96B] transition-colors uppercase tracking-[4px] text-[10px] font-black w-full text-left cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-10 shadow-sm z-10">
          <div className="flex items-center text-slate-400 text-xs font-semibold uppercase tracking-widest">
            Pages <ChevronRight className="w-4 h-4 mx-2 text-slate-300" /> <span className="text-gray-900 capitalize font-bold">{activeTab}</span>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-semibold text-slate-600">Administrator</span>
              <img src="https://ui-avatars.com/api/?name=Admin&background=14213d&color=fff" className="w-10 h-10 rounded-xl shadow-sm border border-slate-100" alt="Avatar" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 space-y-10">
          {/* Welcome Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black tracking-tight uppercase text-gray-900">Control Room</h1>
              <p className="text-slate-400 text-xs font-semibold mt-1 uppercase tracking-widest">Managing: <span className="text-gray-800 font-bold">{conferenceData.name}</span></p>
            </div>
            <button
              onClick={() => {
                setOfflineRegForm({
                  fullName: '', email: '', mobile: '', gender: '', institution: '', designation: '',
                  councilRegNo: '', address: '', city: '', state: '', pincode: '', category: 'Faculty',
                  iaphdNo: '', tier: 'classic', foodPreference: '', hasAccompanying: 'no',
                  accompanyingName: '', accompanyingCount: 0, accompanyingFood: '', amountPaid: 0,
                  transactionId: 'OFFLINE-' + Date.now()
                });
                setCreatingOfflineReg(true);
              }}
              className="bg-gradient-to-r from-[#C8A96B] to-[#ff8585] text-white shadow-[0_4px_14px_rgba(200,169,107,0.25)] hover:shadow-[0_4px_20px_rgba(200,169,107,0.4)] hover:-translate-y-0.5 active:translate-y-0 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center transition-all cursor-pointer border-0"
            >
              <Plus className="w-4 h-4 mr-2" /> Offline Registration
            </button>
          </div>

          {/* Tab 1: Dashboard View */}
          {activeTab === 'dashboard' && (
            <div className="space-y-10">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {[
                  { label: 'Total Registrations', value: totalRegistrations.toString(), icon: Users, borderClass: 'border-l-4 border-[#C8A96B]', glowColor: 'bg-[#C8A96B]/5' },
                  { label: 'Online Registrations', value: onlineRegistrations.toString(), icon: Globe, borderClass: 'border-l-4 border-blue-500', glowColor: 'bg-blue-500/5' },
                  { label: 'Offline Registrations', value: offlineRegistrations.toString(), icon: FileText, borderClass: 'border-l-4 border-orange-500', glowColor: 'bg-orange-500/5' },
                  { label: 'Failed Registrations', value: failedRegistrations.toString(), icon: XCircle, borderClass: 'border-l-4 border-red-500', glowColor: 'bg-red-500/5' },
                  { label: 'Successful Revenue', value: `₹${successRevenue.toLocaleString()}`, icon: TrendingUp, borderClass: 'border-l-4 border-emerald-500', glowColor: 'bg-emerald-500/5' },
                ].map((stat, i) => (
                  <div key={i} className={`bg-white p-6 rounded-2xl border border-slate-100 ${stat.borderClass} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all relative overflow-hidden group`}>
                    <div className={`absolute top-0 right-0 w-16 h-16 ${stat.glowColor} rounded-bl-full transition-all group-hover:w-20 group-hover:h-20`}></div>
                    <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[2px] mb-2">{stat.label}</h3>
                    <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                    <stat.icon className="w-5 h-5 text-[#00A8CC] mt-4 opacity-75 group-hover:scale-110 transition-transform" />
                  </div>
                ))}
              </div>

              <div className="space-y-10">
                {/* Global Pricing Toggle */}
                <section className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                  <h2 className="text-sm font-black uppercase tracking-[4px] mb-8 flex items-center text-gray-800">
                    <TrendingUp className="w-5 h-5 mr-4 text-[#00A8CC]" /> Global Pricing Toggle
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(conferenceData.registration.phases).map(([key, phase]) => (
                      <button
                        key={key}
                        onClick={() => setPricingPhase(key)}
                        className={`p-6 rounded-2xl border-2 text-left transition-all cursor-pointer ${pricingPhase === key
                          ? 'border-[#C8A96B] bg-[#14213D] text-white shadow-lg scale-102'
                          : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200 hover:bg-slate-100/50'
                          }`}
                      >
                        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${pricingPhase === key ? 'text-[#C8A96B]' : 'text-slate-400'}`}>Phase</p>
                        <p className="text-lg font-black uppercase tracking-tighter mb-2">{phase.label}</p>
                        <div className={`h-[1.5px] w-10 mb-4 ${pricingPhase === key ? 'bg-[#C8A96B]' : 'bg-slate-200'}`}></div >
                        <p className={`text-[10px] font-bold ${pricingPhase === key ? 'text-white/80' : 'text-slate-400'}`}>{phase.dates}</p>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Latest Registrations */}
                <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-8 space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                    <h2 className="text-sm font-black uppercase tracking-[4px] text-gray-800">Recent Signups</h2>
                    <button onClick={() => setActiveTab('registrations')} className="text-[#00A8CC] font-black text-[10px] uppercase tracking-widest hover:underline cursor-pointer">View All</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50/70">
                        <tr className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <th className="px-6 py-4">ID</th>
                          <th className="px-6 py-4">Delegate</th>
                          <th className="px-6 py-4">Tier</th>
                          <th className="px-6 py-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {registrations.slice(0, 4).map((reg) => (
                          <tr key={reg.id} className="hover:bg-slate-50/50 transition-colors text-xs font-semibold text-slate-600">
                            <td className="px-6 py-4 font-black text-[#00A8CC]">{reg.id}</td>
                            <td className="px-6 py-4 text-gray-900 font-bold">{reg.fullName}</td>
                            <td className="px-6 py-4 uppercase text-[10px] tracking-wider font-semibold">{reg.tier}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${reg.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                                }`}>
                                {reg.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </div>
          )}

          {/* Tab 2: Registrations List View */}
          {activeTab === 'registrations' && (
            <section className="bg-white rounded-xl border border-softgray shadow-sm overflow-hidden p-8 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-[4px]">Registered Delegates</h2>
                  <p className="text-[10px] text-primary/80 uppercase tracking-widest mt-1">Manage and verify delegate profiles & payments</p>
                </div>
                <div className="flex gap-4 items-center w-full sm:w-auto">
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-primary/80" />
                    <input
                      type="text"
                      placeholder="Search delegates by name, email, ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-gray-50 border border-softgray rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium w-full outline-none focus:border-[#00A8CC] transition-colors"
                    />
                  </div>
                  <button
                    onClick={handleExportCSV}
                    className="bg-gradient-to-r from-[#C8A96B] to-[#ff8585] text-white shadow-md hover:shadow-[0_4px_15px_rgba(200,169,107,0.35)] hover:-translate-y-0.5 active:translate-y-0 hover:opacity-95 transition-all cursor-pointer px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#C8A96B] transition-colors whitespace-nowrap"
                  >
                    Export CSV
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50">
                    <tr className="text-left text-[10px] font-black uppercase tracking-widest text-primary/80">
                      <th className="px-6 py-4">Reg ID</th>
                      <th className="px-6 py-4">Delegate Name</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Phone</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredRegs.map((reg) => (
                      <tr key={reg.id} className="hover:bg-gray-50/50 transition-colors text-xs font-bold text-primary/80">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-black text-[#00A8CC]">{reg.id}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest ${reg.offline_online === 'offline' ? 'bg-slate-100 text-slate-600' : 'bg-blue-50 text-blue-600'
                              }`}>
                              {reg.offline_online === 'offline' ? 'Offline' : 'Online'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-gray-900">{reg.fullName}</p>
                            <p className="text-[10px] text-primary/80 font-medium normal-case">{reg.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">{reg.category}</td>
                        <td className="px-6 py-4">{reg.mobile}</td>
                        <td className="px-6 py-4 text-gray-900 font-black">₹{Number(reg.amountPaid).toLocaleString()}</td>
                        <td className="px-6 py-4 font-sans">
                          <select
                            value={reg.status || 'PENDING'}
                            onChange={(e) => {
                              const newStatus = e.target.value;
                              Swal.fire({
                                title: 'Change Registration Status',
                                text: `Are you sure you want to change status to ${newStatus}?`,
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonColor: '#3085d6',
                                cancelButtonColor: '#d33',
                                confirmButtonText: 'Yes, change it!'
                              }).then((result) => {
                                if (result.isConfirmed) {
                                  updateRegistration(reg.id, { status: newStatus });
                                }
                              });
                            }}
                            className={`px-2 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider outline-none border cursor-pointer transition-colors duration-200 ${reg.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                reg.status === 'FAILED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                  'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="FAILED">FAILED</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 flex gap-2 flex-wrap">
                          <button
                            onClick={() => setSelectedReg(reg)}
                            title="View Registration"
                            className="bg-gradient-to-r from-[#C8A96B] to-[#ff8585] text-white p-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center shadow-md hover:-translate-y-0.5 active:translate-y-0 hover:opacity-95"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingReg({ ...reg })}
                            title="Edit Registration"
                            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center shadow-md hover:-translate-y-0.5 active:translate-y-0"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          {reg.status !== 'CONFIRMED' && reg.status !== 'FAILED' && (
                            <button
                              onClick={() => {
                                Swal.fire({
                                  title: 'Confirm Approval',
                                  text: `Are you sure you want to approve Dr. ${reg.fullName.toUpperCase()}'s registration?`,
                                  icon: 'question',
                                  showCancelButton: true,
                                  confirmButtonColor: '#10b981',
                                  cancelButtonColor: '#3085d6',
                                  confirmButtonText: 'Yes, approve it!'
                                }).then((result) => {
                                  if (result.isConfirmed) {
                                    approveRegistration(reg.id);
                                  }
                                });
                              }}
                              title="Approve Registration"
                              className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center shadow-md hover:-translate-y-0.5 active:translate-y-0"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              try {
                                showToast('Resending confirmation email...', 'info');
                                const res = await resendConfirmationEmail(reg.id);
                                if (res.success) {
                                  showToast('Email resent successfully!', 'success');
                                } else {
                                  showToast(res.error || 'Failed to resend email.', 'error');
                                }
                              } catch (err) {
                                showToast('Error: ' + err.message, 'error');
                              }
                            }}
                            title="Resend Confirmation Email"
                            className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center shadow-md hover:-translate-y-0.5 active:translate-y-0"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Tab 3: Speakers Profiles View */}
          {activeTab === 'speakers' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Speaker Profile Editor */}
              <div className="lg:col-span-1">
                <section className="bg-white p-8 rounded-xl border border-softgray shadow-sm space-y-6">
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-[4px]">Add Speaker</h2>
                    <p className="text-[10px] text-primary/80 uppercase tracking-widest mt-1">Insert new profile to live speakers listing</p>
                  </div>

                  <form onSubmit={handleAddSpeaker} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Speaker Name</label>
                      <input
                        type="text"
                        value={newSpeakerName}
                        onChange={(e) => setNewSpeakerName(e.target.value)}
                        placeholder="Dr. Name Surname"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#00A8CC] focus:ring-1 focus:ring-[#00A8CC] transition-all"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Specialty / Topic</label>
                      <input
                        type="text"
                        value={newSpeakerSpecialty}
                        onChange={(e) => setNewSpeakerSpecialty(e.target.value)}
                        placeholder="e.g. AI & Analytics"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#00A8CC] focus:ring-1 focus:ring-[#00A8CC] transition-all"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Avatar Image URL</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newSpeakerImg}
                          onChange={(e) => setNewSpeakerImg(e.target.value)}
                          className="w-full bg-gray-50 border border-softgray rounded-xl p-4 text-xs text-primary/80 focus:outline-none focus:border-[#00A8CC] transition-colors"
                          required
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            if (e.target.files[0]) {
                              const url = await uploadImage(e.target.files[0]);
                              if (url) setNewSpeakerImg(url);
                            }
                          }}
                          className="w-24 text-[9px] file:mr-2 file:py-1 file:px-2 file:rounded-xl file:border-0 file:text-[9px] file:font-black file:bg-[#C8A96B] file:text-white hover:file:bg-[#C8A96B] transition-colors cursor-pointer"
                        />
                      </div>
                    </div>

                    <button type="submit" className="w-full py-4 bg-gradient-to-r from-[#C8A96B] to-[#ff8585] text-white shadow-md hover:shadow-[0_4px_15px_rgba(200,169,107,0.35)] hover:-translate-y-0.5 active:translate-y-0 hover:opacity-95 transition-all cursor-pointer font-black uppercase tracking-[4px] text-[10px] rounded-xl hover:bg-[#C8A96B] transition-all flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" /> Add Speaker Profile
                    </button>
                  </form>
                </section>
              </div>

              {/* Speaker List Table */}
              <div className="lg:col-span-2">
                <section className="bg-white rounded-xl border border-softgray shadow-sm overflow-hidden">
                  <div className="p-8 border-b border-gray-50">
                    <h2 className="text-sm font-black uppercase tracking-[4px]">Expert Speakers</h2>
                  </div>
                  <table className="w-full">
                    <thead className="bg-gray-50/50">
                      <tr className="text-left text-[10px] font-black uppercase tracking-widest text-primary/80">
                        <th className="px-8 py-4">Speaker</th>
                        <th className="px-8 py-4">Specialty</th>
                        <th className="px-8 py-4">Status</th>
                        <th className="px-8 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {speakers.map((speaker) => (
                        <tr key={speaker.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-8 py-4">
                            <div className="flex items-center">
                              <img src={speaker.image} className="w-10 h-10 rounded-xl shadow-sm mr-4 object-cover" alt="" />
                              <div>
                                <p className="font-bold text-gray-900 text-xs">{speaker.name}</p>
                                <p className="text-[9px] text-primary/80 uppercase font-bold tracking-widest italic">Confirmed</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-4 text-xs font-bold text-black-300 uppercase">{speaker.specialty}</td>
                          <td className="px-8 py-4">
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest">Active</span>
                          </td>
                          <td className="px-8 py-4 text-right">
                            {adminUsername === 'sadmin' && (
                              <button
                                onClick={() => handleDeleteSpeaker(speaker.id)}
                                className="text-black-300 hover:text-primary transition-colors p-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              </div>
            </div>
          )}

          {/* Tab 4: Abstracts Submissions View */}
          {activeTab === 'abstracts' && (
            <section className="bg-white rounded-xl border border-softgray shadow-sm overflow-hidden p-8 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-[4px]">Scientific Abstract & Presentation Submissions</h2>
                  <p className="text-[10px] text-primary/80 uppercase tracking-widest mt-1">Review research files uploaded by verified delegates</p>
                </div>
                <div className="flex gap-4 items-center w-full sm:w-auto">
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-primary/80" />
                    <input
                      type="text"
                      placeholder="Search submissions by ID, name, email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-gray-50 border border-softgray rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium w-full outline-none focus:border-[#00A8CC] transition-colors"
                    />
                  </div>
                  <button
                    onClick={handleExportSubmissionsCSV}
                    className="bg-gradient-to-r from-[#C8A96B] to-[#ff8585] text-white shadow-md hover:shadow-[0_4px_15px_rgba(200,169,107,0.35)] hover:-translate-y-0.5 active:translate-y-0 hover:opacity-95 transition-all cursor-pointer px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#C8A96B] transition-colors whitespace-nowrap"
                  >
                    Export CSV
                  </button>
                </div>
              </div>

              {/* Submissions Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50">
                    <tr className="text-left text-[10px] font-black uppercase tracking-widest text-primary/80">
                      <th className="px-6 py-4">Reg ID</th>
                      <th className="px-6 py-4">Author Details</th>
                      <th className="px-6 py-4">Submission Type</th>
                      <th className="px-6 py-4">Session Category</th>
                      <th className="px-6 py-4">File Submission</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Submitted At</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredSubmissions.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-10 text-xs font-bold text-slate-400 uppercase tracking-widest">No submissions found.</td>
                      </tr>
                    ) : (
                      filteredSubmissions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors text-xs font-bold text-primary/80">
                          <td className="px-6 py-4">
                            <span className="font-black text-[#00A8CC]">{sub.regId || sub.regid}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-gray-900 font-bold uppercase">{sub.fullName || sub.fullname}</p>
                              <p className="text-[10px] text-primary/80 font-medium normal-case">{sub.email}</p>
                              <p className="text-[10px] text-primary/80 font-medium normal-case">{sub.mobile}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${sub.type === 'abstract' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                              {sub.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 uppercase text-[10px]">{sub.category}</td>
                          <td className="px-6 py-4">
                            <a
                              href={sub.fileUrl || sub.fileurl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center text-[#00A8CC] hover:underline"
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              <span className="max-w-[200px] truncate normal-case">{sub.fileName || sub.filename || 'View Uploaded File'}</span>
                            </a>
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={sub.status || 'PENDING'}
                              onChange={(e) => {
                                const newStatus = e.target.value;
                                Swal.fire({
                                  title: 'Change Submission Status',
                                  text: `Are you sure you want to change submission status to ${newStatus}?`,
                                  icon: 'warning',
                                  showCancelButton: true,
                                  confirmButtonColor: '#3085d6',
                                  cancelButtonColor: '#d33',
                                  confirmButtonText: 'Yes, change it!'
                                }).then((result) => {
                                  if (result.isConfirmed) {
                                    updateSubmissionStatus(sub.id, newStatus);
                                  }
                                });
                              }}
                              className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider outline-none border cursor-pointer ${sub.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                sub.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-100' :
                                  'bg-amber-50 text-amber-700 border-amber-100'
                                }`}
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="APPROVED">APPROVED</option>
                              <option value="REJECTED">REJECTED</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 text-[10px] font-medium text-slate-500">
                            {new Date(sub.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                          </td>
                          <td className="px-6 py-4">
                            {adminUsername === 'sadmin' && (
                              <button
                                onClick={() => {
                                  Swal.fire({
                                    title: 'Are you sure?',
                                    text: "This will permanently remove this submission entry.",
                                    icon: 'warning',
                                    showCancelButton: true,
                                    confirmButtonColor: '#d33',
                                    cancelButtonColor: '#3085d6',
                                    confirmButtonText: 'Yes, delete it!'
                                  }).then((result) => {
                                    if (result.isConfirmed) {
                                      deleteSubmission(sub.id);
                                    }
                                  })
                                }}
                                className="text-red-600 hover:text-red-800 transition-colors p-2 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Tab 5: Site Settings Content Tab */}
          {activeTab === 'settings' && (
            <section className="bg-white p-8 rounded-xl border border-softgray shadow-sm space-y-8">
              <div className="flex flex-col border-b border-softgray pb-6 gap-2">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-[#00A8CC]" />
                  <h2 className="text-sm font-black uppercase tracking-[4px]">
                    Dynamic Content Manager
                  </h2>
                </div>
                <p className="text-primary/80 text-[10px] font-bold uppercase tracking-widest">
                  Real-time customization of website copy, settings, & guidelines. Select a section to modify:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {/* 1. Website Pages */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 border-b border-slate-200/60 pb-3">
                    <div className="w-8 h-8 bg-blue-100/60 rounded-xl flex items-center justify-center text-blue-600">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">Website Pages</h3>
                      <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Frontend layout & text</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {[
                      { id: 'homepage', label: 'Homepage' },
                      { id: 'about-us', label: 'About Us' },
                      { id: 'committees', label: 'Committees' },
                      { id: 'venue-hotels', label: 'Venue & Hotels' },
                      { id: 'tourist', label: 'Tourist Attractions' },
                      { id: 'contacts', label: 'Contact Details' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveContentTab(tab.id)}
                        className={`w-full text-left px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider rounded-xl border transition-all cursor-pointer flex items-center justify-between ${activeContentTab === tab.id
                          ? 'bg-[#14213D] border-[#C8A96B] text-white shadow-md font-extrabold translate-x-1'
                          : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                      >
                        <span>{tab.label}</span>
                        {activeContentTab === tab.id && <div className="w-1.5 h-1.5 bg-[#C8A96B] rounded-full"></div>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Conference Data */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 border-b border-slate-200/60 pb-3">
                    <div className="w-8 h-8 bg-amber-100/60 rounded-xl flex items-center justify-center text-amber-600">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">Conference Data</h3>
                      <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Events, Tiers, Sponsors</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {[
                      { id: 'program-summary', label: 'Program Summary' },
                      { id: 'schedules', label: 'Event Schedules' },
                      { id: 'workshops', label: 'Workshops' },
                      { id: 'tariffs', label: 'Reg. Tariffs' },
                      { id: 'trade', label: 'Trade & Sponsors' },
                      { id: 'sponsors', label: 'Sponsors Logos' },
                      { id: 'gallery', label: 'Media Gallery' },
                      { id: 'announcements', label: 'Announcements' },
                      { id: 'faqs', label: 'FAQs' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveContentTab(tab.id)}
                        className={`w-full text-left px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider rounded-xl border transition-all cursor-pointer flex items-center justify-between ${activeContentTab === tab.id
                          ? 'bg-[#14213D] border-[#C8A96B] text-white shadow-md font-extrabold translate-x-1'
                          : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                      >
                        <span>{tab.label}</span>
                        {activeContentTab === tab.id && <div className="w-1.5 h-1.5 bg-[#C8A96B] rounded-full"></div>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Guidelines & SEO */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 border-b border-slate-200/60 pb-3">
                    <div className="w-8 h-8 bg-emerald-100/60 rounded-xl flex items-center justify-center text-emerald-600">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">Guidelines & SEO</h3>
                      <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Rules, Status, Branding</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {[
                      { id: 'scientific-rules', label: 'Scientific Rules' },
                      { id: 'abstract-guidelines', label: 'Abstract Guidelines' },
                      { id: 'reg-guidelines', label: 'Reg. Guidelines' },
                      { id: 'header-logos', label: 'Header Logos' },
                      { id: 'seo', label: 'SEO Settings' },
                      { id: 'pages-status', label: 'Page Status Manager' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveContentTab(tab.id)}
                        className={`w-full text-left px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider rounded-xl border transition-all cursor-pointer flex items-center justify-between ${activeContentTab === tab.id
                          ? 'bg-[#14213D] border-[#C8A96B] text-white shadow-md font-extrabold translate-x-1'
                          : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                      >
                        <span>{tab.label}</span>
                        {activeContentTab === tab.id && <div className="w-1.5 h-1.5 bg-[#C8A96B] rounded-full"></div>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Legal Policies */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 border-b border-slate-200/60 pb-3">
                    <div className="w-8 h-8 bg-purple-100/60 rounded-xl flex items-center justify-center text-purple-600">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">Legal Policies</h3>
                      <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Terms, Privacy, Refund</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {[
                      { id: 'tc', label: 'Terms & Conditions' },
                      { id: 'privacy', label: 'Privacy Policy' },
                      { id: 'refund-policy', label: 'Refund Policy' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveContentTab(tab.id)}
                        className={`w-full text-left px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider rounded-xl border transition-all cursor-pointer flex items-center justify-between ${activeContentTab === tab.id
                          ? 'bg-[#14213D] border-[#C8A96B] text-white shadow-md font-extrabold translate-x-1'
                          : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                      >
                        <span>{tab.label}</span>
                        {activeContentTab === tab.id && <div className="w-1.5 h-1.5 bg-[#C8A96B] rounded-full"></div>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {activeContentTab === 'homepage' && (
                <div className="space-y-8">
                  <div className="bg-gray-50 border border-softgray rounded-xl p-6 space-y-6">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">Homepage Data</h3>
                      <p className="text-[10px] text-primary/80 uppercase tracking-widest mt-1">Manage Hero text and Countdown timer</p>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Hero Title 1</label>
                        <input
                          type="text"
                          value={homepageData?.heroTitle1 || ''}
                          onChange={(e) => setHomepageData({ ...homepageData, heroTitle1: e.target.value })}
                          className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Hero Title 2 (Highlight Last Word)</label>
                        <input
                          type="text"
                          value={homepageData?.heroTitle2 || ''}
                          onChange={(e) => setHomepageData({ ...homepageData, heroTitle2: e.target.value })}
                          className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Hero Title 3</label>
                        <input
                          type="text"
                          value={homepageData?.heroTitle3 || ''}
                          onChange={(e) => setHomepageData({ ...homepageData, heroTitle3: e.target.value })}
                          className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Countdown Target Date (e.g., 2026-11-27T00:00:00)</label>
                        <input
                          type="text"
                          value={homepageData?.countdownTarget || ''}
                          onChange={(e) => setHomepageData({ ...homepageData, countdownTarget: e.target.value })}
                          className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-softgray rounded-xl p-6 space-y-6">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">Homepage Promo Popup</h3>
                      <p className="text-[10px] text-primary/80 uppercase tracking-widest mt-1">Configure modal popup for the landing page</p>
                    </div>
                    <div className="space-y-4">
                      {/* Active Toggle */}
                      <div className="flex items-center justify-between p-3 bg-white border border-softgray rounded-xl">
                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-700">Enable Popup Modal</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={homepagePopup?.enabled || false}
                            onChange={(e) => setHomepagePopup({ ...homepagePopup, enabled: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00A8CC]"></div>
                        </label>
                      </div>

                      {/* Image Upload/URL */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Popup Image (File Upload)</label>
                        <div className="flex items-center gap-4">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (file) {
                                showToast('Uploading image...', 'info');
                                try {
                                  const url = await uploadImage(file);
                                  if (url) {
                                    setHomepagePopup({ ...homepagePopup, imageUrl: url });
                                    showToast('Image uploaded successfully!', 'success');
                                  } else {
                                    showToast('Upload failed', 'error');
                                  }
                                } catch (err) {
                                  showToast('Upload failed', 'error');
                                }
                              }
                            }}
                            className="text-xs text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-wider file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                          />
                          {homepagePopup?.imageUrl && (
                            <img src={homepagePopup.imageUrl} className="h-10 w-10 object-contain border border-softgray rounded bg-white p-1" alt="Popup preview" />
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Or Paste Image URL</label>
                        <input
                          type="text"
                          value={homepagePopup?.imageUrl || ''}
                          onChange={(e) => setHomepagePopup({ ...homepagePopup, imageUrl: e.target.value })}
                          className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                          placeholder="e.g. ./banner.png"
                        />
                      </div>

                      {/* Hyperlink Redirect */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Click Hyperlink (Redirect URL)</label>
                        <input
                          type="text"
                          value={homepagePopup?.linkUrl || ''}
                          onChange={(e) => setHomepagePopup({ ...homepagePopup, linkUrl: e.target.value })}
                          className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                          placeholder="e.g., /registration or https://example.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeContentTab === 'faqs' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-black-300">Live FAQ List</h4>
                    <button
                      onClick={() => setFaqs([...faqs, { id: Date.now(), question: "New FAQ Question?", answer: "New FAQ Answer." }])}
                      className="px-4 py-2 bg-gradient-to-r from-[#C8A96B] to-[#ff8585] text-white shadow-md hover:shadow-[0_4px_15px_rgba(200,169,107,0.35)] hover:-translate-y-0.5 active:translate-y-0 hover:opacity-95 transition-all cursor-pointer rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center hover:bg-[#C8A96B] transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add New FAQ
                    </button>
                  </div>
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {faqs.map((faq, index) => (
                      <div key={faq.id} className="p-4 bg-gray-50 border border-softgray rounded-xl relative group space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black uppercase tracking-widest text-[#00A8CC]">FAQ #{index + 1}</span>
                          <button
                            onClick={() => setFaqs(faqs.filter(f => f.id !== faq.id))}
                            className="text-primary/80 hover:text-primary transition-colors text-[9px] font-bold uppercase tracking-widest"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) => {
                              const updated = [...faqs];
                              updated[index].question = e.target.value;
                              setFaqs(updated);
                            }}
                            className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                            placeholder="Question"
                          />
                          <RichTextArea
                            value={faq.answer}
                            onChange={(e) => {
                              const updated = [...faqs];
                              updated[index].answer = e.target.value;
                              setFaqs(updated);
                            }}
                            placeholder="Answer"
                            h="h-20"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeContentTab === 'schedules' && (
                <div className="space-y-8">
                  <div className="bg-gray-50 border border-softgray rounded-xl p-6 space-y-6">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">Add Schedule Session</h3>
                      <p className="text-[10px] text-primary/80 uppercase tracking-widest mt-1">Insert a new event session directly into the MySQL database</p>
                    </div>

                    <form onSubmit={handleAddScheduleLocal} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Day Number</label>
                        <select
                          value={newSchedDay}
                          onChange={(e) => setNewSchedDay(Number(e.target.value))}
                          className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                        >
                          <option value={1}>Day 1</option>
                          <option value={2}>Day 2</option>
                          <option value={3}>Day 3</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Time Slot</label>
                        <input
                          type="text"
                          value={newSchedTime}
                          onChange={(e) => setNewSchedTime(e.target.value)}
                          placeholder="e.g. 09:30 AM"
                          className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                          required
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Session Event Title</label>
                        <input
                          type="text"
                          value={newSchedTitle}
                          onChange={(e) => setNewSchedTitle(e.target.value)}
                          placeholder="e.g. Keynote Address"
                          className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Speaker (Optional)</label>
                        <input
                          type="text"
                          value={newSchedSpeaker}
                          onChange={(e) => setNewSchedSpeaker(e.target.value)}
                          placeholder="Speaker name"
                          className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Venue / Location</label>
                        <input
                          type="text"
                          value={newSchedVenue}
                          onChange={(e) => setNewSchedVenue(e.target.value)}
                          placeholder="e.g. Auditorium A"
                          className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                        />
                      </div>
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-[#C8A96B] to-[#ff8585] text-white shadow-md hover:shadow-[0_4px_15px_rgba(200,169,107,0.35)] hover:-translate-y-0.5 active:translate-y-0 hover:opacity-95 transition-all cursor-pointer rounded-xl py-3 text-[10px] font-black uppercase tracking-widest hover:bg-[#C8A96B] transition-colors cursor-pointer md:col-span-5 animate-pulse"
                      >
                        Insert Session Record
                      </button>
                    </form>

                    <div className="max-h-80 overflow-y-auto border border-gray-150 rounded-xl bg-white">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-black uppercase tracking-wider text-black-300">
                            <th className="px-4 py-3">Day</th>
                            <th className="px-4 py-3">Time</th>
                            <th className="px-4 py-3">Session Title</th>
                            <th className="px-4 py-3">Speaker</th>
                            <th className="px-4 py-3">Venue</th>
                            <th className="px-4 py-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-150">
                          {schedules.map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-3 font-bold text-gray-800">Day {item.dayNumber}</td>
                              <td className="px-4 py-3 text-black-300 font-bold">{item.timeSlot}</td>
                              <td className="px-4 py-3 text-gray-900 font-bold">{item.title}</td>
                              <td className="px-4 py-3 text-black-300">{item.speaker || 'N/A'}</td>
                              <td className="px-4 py-3 text-black-300">{item.venue || 'N/A'}</td>
                              <td className="px-4 py-3 text-right space-x-3">
                                <button
                                  type="button"
                                  onClick={() => openEditModal('schedule', item)}
                                  className="text-blue-500 hover:text-blue-700 font-black uppercase tracking-widest text-[9px] cursor-pointer"
                                >
                                  Edit
                                </button>
                                {adminUsername === 'sadmin' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      Swal.fire({
                                        title: 'Are you sure?',
                                        text: `This will permanently remove the schedule slot "${item.title}".`,
                                        icon: 'warning',
                                        showCancelButton: true,
                                        confirmButtonColor: '#d33',
                                        cancelButtonColor: '#3085d6',
                                        confirmButtonText: 'Yes, remove it!'
                                      }).then((result) => {
                                        if (result.isConfirmed) {
                                          deleteSchedule(item.id, item.title);
                                        }
                                      });
                                    }}
                                    className="text-primary/80 hover:text-primary font-black uppercase tracking-widest text-[9px] cursor-pointer"
                                  >
                                    Remove
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeContentTab === 'sponsors' && (
                <div className="space-y-8">
                  <div className="bg-gray-50 border border-softgray rounded-xl p-6 space-y-6">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">Add Corporate Sponsor</h3>
                      <p className="text-[10px] text-primary/80 uppercase tracking-widest mt-1">Insert a sponsor logo directly into the MySQL database</p>
                    </div>

                    <form onSubmit={handleAddSponsorLocal} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Sponsor Name</label>
                        <input
                          type="text"
                          value={newSponName}
                          onChange={(e) => setNewSponName(e.target.value)}
                          placeholder="e.g. Colgate"
                          className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Logo Image File</label>
                        <div className="flex items-center space-x-2 w-full bg-white border border-softgray rounded-xl p-2 text-xs font-bold text-gray-800 focus-within:border-[#00A8CC]">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleSponsorLogoChange}
                            className="w-full text-xs text-black-300 file:mr-2 file:py-1 file:px-2 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-gray-100 file:text-[#00A8CC] hover:file:bg-gray-200"
                            required={!newSponLogo}
                          />
                          {isSponUploading && <span className="text-[9px] uppercase font-bold text-primary/80 shrink-0">Uploading...</span>}
                          {newSponLogo && !isSponUploading && (
                            <img src={newSponLogo} className="h-6 w-10 object-contain border border-softgray p-0.5 shrink-0 bg-white" alt="" />
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Sponsor Tier</label>
                        <select
                          value={newSponTier}
                          onChange={(e) => setNewSponTier(e.target.value)}
                          className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                        >
                          <option value="Platinum">Platinum</option>
                          <option value="Gold">Gold</option>
                          <option value="Silver">Silver</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Display Order</label>
                        <input
                          type="number"
                          value={newSponOrder}
                          onChange={(e) => setNewSponOrder(Number(e.target.value))}
                          className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-[#C8A96B] to-[#ff8585] text-white shadow-md hover:shadow-[0_4px_15px_rgba(200,169,107,0.35)] hover:-translate-y-0.5 active:translate-y-0 hover:opacity-95 transition-all cursor-pointer rounded-xl py-3 text-[10px] font-black uppercase tracking-widest hover:bg-[#C8A96B] transition-colors cursor-pointer md:col-span-4"
                      >
                        Add Sponsor
                      </button>
                    </form>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white p-6 rounded-xl border border-gray-150">
                      {sponsors.map((item, idx) => (
                        <div key={idx} className="border border-softgray p-4 rounded-xl relative group flex flex-col items-center justify-center bg-gray-50">
                          <div className="absolute top-2 right-2 flex space-x-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => openEditModal('sponsor', item)}
                              className="text-blue-500 hover:text-blue-700 text-[10px] font-black uppercase tracking-wider cursor-pointer"
                            >
                              Edit
                            </button>
                            {adminUsername === 'sadmin' && (
                              <button
                                type="button"
                                onClick={() => {
                                  Swal.fire({
                                    title: 'Are you sure?',
                                    text: `This will permanently remove the sponsor "${item.name}".`,
                                    icon: 'warning',
                                    showCancelButton: true,
                                    confirmButtonColor: '#d33',
                                    cancelButtonColor: '#3085d6',
                                    confirmButtonText: 'Yes, remove it!'
                                  }).then((result) => {
                                    if (result.isConfirmed) {
                                      deleteSponsor(item.id, item.name);
                                    }
                                  });
                                }}
                                className="text-primary/80 hover:text-red-500 text-xs font-bold cursor-pointer"
                              >
                                ×
                              </button>
                            )}
                          </div>
                          <img src={item.logoUrl} className="h-12 object-contain mb-3" alt="" />
                          <p className="text-[10px] font-black uppercase text-gray-800">{item.name}</p>
                          <span className="text-[8px] bg-red-100 text-[#00A8CC] px-2 py-0.5 rounded-xl font-black uppercase tracking-widest mt-1">{item.tier}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeContentTab === 'announcements' && (
                <div className="space-y-8">
                  <div className="bg-gray-50 border border-softgray rounded-xl p-6 space-y-6">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">Add Live Announcement / Alert</h3>
                      <p className="text-[10px] text-primary/80 uppercase tracking-widest mt-1">Publish news notifications to the dynamic scrolling alert banner</p>
                    </div>

                    <form onSubmit={handleAddAnnouncementLocal} className="space-y-4 font-sans">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Announcement Title</label>
                        <input
                          type="text"
                          value={newAnnTitle}
                          onChange={(e) => setNewAnnTitle(e.target.value)}
                          placeholder="e.g. Abstract Guidelines Updated"
                          className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Announcement Detail Content</label>
                        <RichTextArea
                          value={newAnnContent}
                          onChange={(e) => setNewAnnContent(e.target.value)}
                          placeholder="Enter details..."
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Redirect Link / URL (Optional)</label>
                          <input
                            type="text"
                            value={newAnnLinkUrl}
                            onChange={(e) => setNewAnnLinkUrl(e.target.value)}
                            placeholder="e.g. https://www.website.com/info"
                            className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Upload PDF Document (Optional)</label>
                          <div className="flex items-center space-x-2 w-full bg-white border border-softgray rounded-xl p-2 text-xs font-bold text-gray-800 focus-within:border-[#00A8CC]">
                            <input
                              type="file"
                              accept="application/pdf"
                              onChange={handleAnnPdfChange}
                              className="w-full text-xs text-black-300 file:mr-2 file:py-1 file:px-2 file:rounded-xl file:border-0 file:text-[9px] file:font-black file:bg-[#C8A96B] file:text-white hover:file:bg-[#14213D] hover:file:text-accent transition-all cursor-pointer"
                            />
                            {isAnnUploading && <span className="text-[9px] uppercase font-black text-[#00A8CC] shrink-0 animate-pulse">Uploading...</span>}
                            {newAnnPdfUrl && !isAnnUploading && (
                              <span className="text-[8px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-black uppercase tracking-widest shrink-0">✓ Uploaded</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="bg-[#C8A96B] hover:bg-[#14213D] text-white hover:text-accent shadow-md hover:shadow-[0_4px_15px_rgba(200,169,107,0.35)] hover:-translate-y-0.5 active:translate-y-0 hover:opacity-95 transition-all cursor-pointer rounded-xl py-3 text-[10px] font-black uppercase tracking-widest transition-colors w-full"
                      >
                        Publish Announcement
                      </button>
                    </form>

                    <div className="space-y-4">
                      {announcements.map((item, idx) => {
                        const parsed = parseAnnouncementContent(item.content);
                        const descText = parsed.desc;
                        const linkUrl = parsed.linkUrl;
                        const pdfUrl = parsed.pdfUrl;
                        const redirect = pdfUrl || linkUrl;

                        return (
                          <div key={idx} className="p-5 bg-white border border-gray-150 rounded-xl relative font-sans">
                            <div className="absolute top-4 right-4 flex space-x-3">
                              <button
                                type="button"
                                onClick={() => openEditModal('announcement', item)}
                                className="text-blue-500 hover:text-blue-700 text-[10px] font-black uppercase tracking-widest cursor-pointer"
                              >
                                Edit
                              </button>
                              {adminUsername === 'sadmin' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    Swal.fire({
                                      title: 'Are you sure?',
                                      text: `This will permanently delete the announcement "${item.title}".`,
                                      icon: 'warning',
                                      showCancelButton: true,
                                      confirmButtonColor: '#d33',
                                      cancelButtonColor: '#3085d6',
                                      confirmButtonText: 'Yes, delete it!'
                                    }).then((result) => {
                                      if (result.isConfirmed) {
                                        deleteAnnouncement(item.id, item.title);
                                      }
                                    });
                                  }}
                                  className="text-primary/80 hover:text-red-500 text-[10px] font-black uppercase tracking-widest cursor-pointer"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                            <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 mb-2 pr-16">{item.title}</h4>
                            <p className="text-xs text-black-300 font-bold leading-relaxed">{descText}</p>
                            {redirect && (
                              <a
                                href={redirect}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[9px] text-[#00A8CC] hover:text-[#C8A96B] hover:underline font-black uppercase tracking-widest mt-3 pt-2 border-t border-softgray w-full"
                              >
                                🔗 Attached Link / PDF Document
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeContentTab === 'gallery' && (
                <div className="space-y-8">
                  <div className="bg-gray-50 border border-softgray rounded-xl p-6 space-y-6">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">Add Photo Gallery Media</h3>
                      <p className="text-[10px] text-primary/80 uppercase tracking-widest mt-1">Upload and link scenic Vizag attractions and conference venue graphics</p>
                    </div>

                    <form onSubmit={handleAddGalleryItemLocal} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Media Title</label>
                        <input
                          type="text"
                          value={newGalTitle}
                          onChange={(e) => setNewGalTitle(e.target.value)}
                          placeholder="e.g. RK Beach sunset"
                          className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Media File</label>
                        <div className="flex items-center space-x-2 w-full bg-white border border-softgray rounded-xl p-2 text-xs font-bold text-gray-800 focus-within:border-[#00A8CC]">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleGalleryMediaChange}
                            className="w-full text-xs text-black-300 file:mr-2 file:py-1 file:px-2 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-gray-100 file:text-[#00A8CC] hover:file:bg-gray-200"
                            required={!newGalUrl}
                          />
                          {isGalUploading && <span className="text-[9px] uppercase font-bold text-primary/80 shrink-0">Uploading...</span>}
                          {newGalUrl && !isGalUploading && (
                            <img src={newGalUrl} className="h-6 w-10 object-contain border border-softgray p-0.5 shrink-0 bg-white" alt="" />
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Media Type</label>
                        <select
                          value={newGalType}
                          onChange={(e) => setNewGalType(e.target.value)}
                          className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                        >
                          <option value="image">Image</option>
                          <option value="video">Video</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Category</label>
                        <select
                          value={newGalCat}
                          onChange={(e) => setNewGalCat(e.target.value)}
                          className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                        >
                          <option value="Venue">Venue</option>
                          <option value="Vizag">Vizag Attractions</option>
                          <option value="Event">Event Highlights</option>
                        </select>
                      </div>
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-[#C8A96B] to-[#ff8585] text-white shadow-md hover:shadow-[0_4px_15px_rgba(200,169,107,0.35)] hover:-translate-y-0.5 active:translate-y-0 hover:opacity-95 transition-all cursor-pointer rounded-xl py-3 text-[10px] font-black uppercase tracking-widest hover:bg-[#C8A96B] transition-colors cursor-pointer md:col-span-4"
                      >
                        Add Media Item
                      </button>
                    </form>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white p-6 rounded-xl border border-gray-150">
                      {gallery.map((item, idx) => (
                        <div key={idx} className="border border-softgray p-2 rounded-xl relative group bg-gray-50">
                          <div className="absolute top-2 right-2 flex space-x-1.5 z-10">
                            <button
                              type="button"
                              onClick={() => openEditModal('gallery', item)}
                              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black cursor-pointer"
                            >
                              ✎
                            </button>
                            {adminUsername === 'sadmin' && (
                              <button
                                type="button"
                                onClick={() => {
                                  Swal.fire({
                                    title: 'Are you sure?',
                                    text: `This will permanently remove the gallery item "${item.title}".`,
                                    icon: 'warning',
                                    showCancelButton: true,
                                    confirmButtonColor: '#d33',
                                    cancelButtonColor: '#3085d6',
                                    confirmButtonText: 'Yes, remove it!'
                                  }).then((result) => {
                                    if (result.isConfirmed) {
                                      deleteGalleryItem(item.id, item.title);
                                    }
                                  });
                                }}
                                className="text-white bg-black/60 hover:bg-red-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                              >
                                ×
                              </button>
                            )}
                          </div>
                          <img src={item.mediaUrl} className="w-full h-24 object-cover rounded-xl mb-2" alt="" />
                          <p className="text-[9px] font-black uppercase text-gray-800 truncate">{item.title}</p>
                          <span className="text-[7px] bg-blue-100 text-[#00A8CC] px-2 py-0.5 rounded-xl font-black uppercase tracking-widest">{item.category}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeContentTab === 'committees' && (
                <div className="space-y-8">
                  {/* Chief Patron Manager */}
                  <div className="bg-gray-50 border border-softgray rounded-xl p-6 space-y-6">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">Chief Patron Details</h3>
                      <p className="text-[10px] text-primary/80 uppercase tracking-widest mt-1">Manage the chief patron details displayed on the Committees page</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Patron Name</label>
                        <input
                          type="text"
                          value={chiefPatron?.name || ''}
                          onChange={(e) => setChiefPatron({ ...chiefPatron, name: e.target.value })}
                          className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Role / Title</label>
                        <input
                          type="text"
                          value={chiefPatron?.role || ''}
                          onChange={(e) => setChiefPatron({ ...chiefPatron, role: e.target.value })}
                          className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Institution</label>
                        <input
                          type="text"
                          value={chiefPatron?.institution || ''}
                          onChange={(e) => setChiefPatron({ ...chiefPatron, institution: e.target.value })}
                          className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Patron Photo URL</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={chiefPatron?.image || ''}
                          onChange={(e) => setChiefPatron({ ...chiefPatron, image: e.target.value })}
                          placeholder="Photo URL or Upload"
                          className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                        />
                        <div className="relative flex items-center justify-center bg-[#C8A96B] hover:bg-gradient-to-r from-[#C8A96B] to-[#ff8585] text-white shadow-md hover:shadow-[0_4px_15px_rgba(200,169,107,0.35)] hover:-translate-y-0.5 active:translate-y-0 hover:opacity-95 transition-all cursor-pointer px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer min-w-[120px] text-center">
                          <span>Upload Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              if (e.target.files && e.target.files[0]) {
                                try {
                                  showToast('Uploading image...', 'info');
                                  const url = await uploadImage(e.target.files[0]);
                                  if (url) {
                                    setChiefPatron({ ...chiefPatron, image: url });
                                    showToast('Image uploaded successfully!', 'success');
                                  } else {
                                    showToast('Image upload failed.', 'error');
                                  }
                                } catch (err) {
                                  showToast('Upload error: ' + err.message, 'error');
                                }
                              }
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Organizing Committee Manager */}
                  <div className="bg-gray-50 border border-softgray rounded-xl p-6 space-y-6">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">Organizing Committee</h3>
                      <p className="text-[10px] text-primary/80 uppercase tracking-widest mt-1">Manage the host association hosts and organizers</p>
                    </div>

                    <form onSubmit={handleAddOrgMember} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Member Name</label>
                        <input
                          type="text"
                          value={newOrgName}
                          onChange={(e) => setNewOrgName(e.target.value)}
                          placeholder="e.g. Dr. Ramesh Kumar"
                          className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Designation / Role</label>
                        <input
                          type="text"
                          value={newOrgRole}
                          onChange={(e) => setNewOrgRole(e.target.value)}
                          placeholder="e.g. Scientific Co-Chairman"
                          className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Member Photo</label>
                        <div className="relative border border-dashed border-gray-300 hover:border-[#00A8CC] rounded-xl bg-white text-center cursor-pointer transition-all flex items-center justify-between px-3 h-[46px] overflow-hidden group">
                          {newOrgImg ? (
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center space-x-2 truncate">
                                <img
                                  src={newOrgImg}
                                  className="w-8 h-8 rounded-xl object-cover border border-softgray shadow-sm shrink-0"
                                  alt="Preview"
                                />
                                <span className="text-[10px] font-black uppercase tracking-wider text-green-600 truncate">Photo selected</span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setNewOrgImg('');
                                }}
                                className="text-primary/80 hover:text-red-600 font-bold text-base shrink-0 p-1 relative z-20 cursor-pointer"
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    try {
                                      showToast('Uploading image...', 'info');
                                      const url = await uploadImage(e.target.files[0]);
                                      if (url) {
                                        setNewOrgImg(url);
                                        showToast('Image uploaded successfully!', 'success');
                                      } else {
                                        showToast('Image upload failed.', 'error');
                                      }
                                    } catch (err) {
                                      showToast('Upload error: ' + err.message, 'error');
                                    }
                                  }
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              />
                              <div className="flex items-center space-x-2 truncate">
                                <svg className="w-4 h-4 text-primary/80 shrink-0 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-[10px] font-black uppercase tracking-wider text-primary/80 group-hover:text-primary/80 transition-colors">
                                  Upload Photo
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-[#C8A96B] to-[#ff8585] text-white shadow-md hover:shadow-[0_4px_15px_rgba(200,169,107,0.35)] hover:-translate-y-0.5 active:translate-y-0 hover:opacity-95 transition-all cursor-pointer rounded-xl py-3 text-[10px] font-black uppercase tracking-widest hover:bg-[#C8A96B] transition-colors cursor-pointer"
                      >
                        Add Member
                      </button>
                    </form>

                    <div className="max-h-60 overflow-y-auto border border-gray-150 rounded-xl bg-white">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-black uppercase tracking-wider text-black-300">
                            <th className="px-4 py-3">Member</th>
                            <th className="px-4 py-3">Role</th>
                            <th className="px-4 py-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-150">
                          {organizingMembers.map((member, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <div className="flex items-center">
                                  <img
                                    src={member.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=002147&color=fff&size=128`}
                                    className="w-10 h-10 rounded-xl shadow-sm mr-4 object-cover border border-softgray"
                                    alt={member.name}
                                    onError={(e) => {
                                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=002147&color=fff&size=128`;
                                    }}
                                  />
                                  <span className="font-bold text-gray-900">{member.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-black-300 font-medium">{member.role}</td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => setOrganizingMembers(organizingMembers.filter((_, i) => i !== idx))}
                                  className="text-primary/80 hover:text-primary font-black uppercase tracking-widest text-[9px] cursor-pointer"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Office Bearers Manager */}
                  <div className="bg-gray-50 border border-softgray rounded-xl p-6 space-y-6">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">Head Office Members (Office Bearers)</h3>
                      <p className="text-[10px] text-primary/80 uppercase tracking-widest mt-1">Manage core executive head office leadership roles</p>
                    </div>

                    <form onSubmit={handleAddLeaderMember} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Leader Name</label>
                        <input
                          type="text"
                          value={newLeaderName}
                          onChange={(e) => setNewLeaderName(e.target.value)}
                          placeholder="e.g. Dr. R K Bali"
                          className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Role / Office</label>
                        <input
                          type="text"
                          value={newLeaderRole}
                          onChange={(e) => setNewLeaderRole(e.target.value)}
                          placeholder="e.g. Hon. General Secretary"
                          className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-[#C8A96B] to-[#ff8585] text-white shadow-md hover:shadow-[0_4px_15px_rgba(200,169,107,0.35)] hover:-translate-y-0.5 active:translate-y-0 hover:opacity-95 transition-all cursor-pointer rounded-xl py-3 text-[10px] font-black uppercase tracking-widest hover:bg-[#C8A96B] transition-colors cursor-pointer"
                      >
                        Add Leader
                      </button>
                    </form>

                    <div className="max-h-60 overflow-y-auto border border-gray-150 rounded-xl bg-white">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-black uppercase tracking-wider text-black-300">
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Role</th>
                            <th className="px-4 py-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-150">
                          {headOfficeLeaders.map((member, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-3 font-bold text-gray-800">{member.name}</td>
                              <td className="px-4 py-3 text-black-300 font-medium">{member.role}</td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => setHeadOfficeLeaders(headOfficeLeaders.filter((_, i) => i !== idx))}
                                  className="text-primary/80 hover:text-primary font-black uppercase tracking-widest text-[9px] cursor-pointer"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Conference Committee Manager */}
                  <div className="bg-gray-50 border border-softgray rounded-xl p-6 space-y-6">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">Conference Committee Members</h3>
                      <p className="text-[10px] text-primary/80 uppercase tracking-widest mt-1">Manage the full list of conference committee members</p>
                    </div>

                    <form onSubmit={handleAddCommitteeMember} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Member Name</label>
                        <input
                          type="text"
                          value={newCommitteeName}
                          onChange={(e) => setNewCommitteeName(e.target.value)}
                          placeholder="e.g. Dr. Anirudh Sharma"
                          className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Role / Committee</label>
                        <input
                          type="text"
                          value={newCommitteeRole}
                          onChange={(e) => setNewCommitteeRole(e.target.value)}
                          placeholder="e.g. Scientific Committee"
                          className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-[#C8A96B] to-[#ff8585] text-white shadow-md hover:shadow-[0_4px_15px_rgba(200,169,107,0.35)] hover:-translate-y-0.5 active:translate-y-0 hover:opacity-95 transition-all cursor-pointer rounded-xl py-3 text-[10px] font-black uppercase tracking-widest hover:bg-[#C8A96B] transition-colors cursor-pointer"
                      >
                        Add Member
                      </button>
                    </form>

                    <div className="max-h-60 overflow-y-auto border border-gray-150 rounded-xl bg-white">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-black uppercase tracking-wider text-black-300">
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Role</th>
                            <th className="px-4 py-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-150">
                          {conferenceCommittee.map((member, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-3 font-bold text-gray-800">{member.name}</td>
                              <td className="px-4 py-3 text-black-300 font-medium">{member.role}</td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => setConferenceCommittee(conferenceCommittee.filter((_, i) => i !== idx))}
                                  className="text-primary/80 hover:text-primary font-black uppercase tracking-widest text-[9px] cursor-pointer"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* EC Members Manager */}
                  <div className="bg-gray-50 border border-softgray rounded-xl p-6 space-y-6">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">Executive Committee Members</h3>
                      <p className="text-[10px] text-primary/80 uppercase tracking-widest mt-1">Manage the national Executive Committee advisory member list</p>
                    </div>

                    <form onSubmit={handleAddEcMember} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Member Name</label>
                        <input
                          type="text"
                          value={newEcName}
                          onChange={(e) => setNewEcName(e.target.value)}
                          placeholder="e.g. Dr. Swapnil S Bumb"
                          className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-[#C8A96B] to-[#ff8585] text-white shadow-md hover:shadow-[0_4px_15px_rgba(200,169,107,0.35)] hover:-translate-y-0.5 active:translate-y-0 hover:opacity-95 transition-all cursor-pointer rounded-xl py-3 text-[10px] font-black uppercase tracking-widest hover:bg-[#C8A96B] transition-colors cursor-pointer"
                      >
                        Add EC Member
                      </button>
                    </form>

                    <div className="max-h-60 overflow-y-auto border border-gray-150 rounded-xl bg-white p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {ecMembers.map((name, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-gray-50 border border-softgray rounded-xl p-3 text-xs">
                            <span className="font-bold text-gray-800">{name}</span>
                            <button
                              type="button"
                              onClick={() => setEcMembers(ecMembers.filter((_, i) => i !== idx))}
                              className="text-primary/80 hover:text-primary font-black uppercase tracking-widest text-[9px] ml-2 shrink-0 cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeContentTab === 'scientific-rules' && (
                <div className="space-y-8">
                  {/* Scientific Abstract Rules card */}
                  <div className="bg-gray-50 border border-softgray rounded-xl p-6 space-y-6">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">Abstract Submission Standards</h3>
                      <p className="text-[10px] text-primary/80 uppercase tracking-widest mt-1">Configure structural abstract parameters and limits</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Abstract Word Limit</label>
                        <input
                          type="number"
                          value={scientificAbstract.wordLimit}
                          onChange={(e) => setScientificAbstract({ ...scientificAbstract, wordLimit: parseInt(e.target.value) || 0 })}
                          className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Formatting Restrictions</label>
                        <input
                          type="text"
                          value={scientificAbstract.restrictions}
                          onChange={(e) => setScientificAbstract({ ...scientificAbstract, restrictions: e.target.value })}
                          className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Required Abstract Structure Sections (Comma-separated)</label>
                      <input
                        type="text"
                        value={scientificAbstract.structure?.join(', ') || ''}
                        onChange={(e) => setScientificAbstract({ ...scientificAbstract, structure: e.target.value.split(',').map(s => s.trim()) })}
                        className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                      />
                    </div>
                  </div>

                  {/* Scientific Presentation Categories card */}
                  <div className="bg-gray-50 border border-softgray rounded-xl p-6 space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">Presentation Categories</h3>
                        <p className="text-[10px] text-primary/80 uppercase tracking-widest mt-1">Configure dynamic pg & faculty presentation rules</p>
                      </div>
                      <button
                        onClick={handleAddScientificCategory}
                        className="px-4 py-2 bg-gradient-to-r from-[#C8A96B] to-[#ff8585] text-white shadow-md hover:shadow-[0_4px_15px_rgba(200,169,107,0.35)] hover:-translate-y-0.5 active:translate-y-0 hover:opacity-95 transition-all cursor-pointer rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center hover:bg-[#C8A96B] transition-colors cursor-pointer font-sans"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Category
                      </button>
                    </div>

                    <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                      {scientificCategories.map((cat, idx) => (
                        <div key={cat.id || idx} className="p-4 bg-white border border-gray-150 rounded-xl space-y-4 relative group">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#00A8CC]">Category #{idx + 1}</span>
                            <button
                              onClick={() => setScientificCategories(scientificCategories.filter((_, i) => i !== idx))}
                              className="text-primary/80 hover:text-primary transition-colors text-[9px] font-bold uppercase tracking-widest cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[9px] font-black uppercase tracking-widest text-primary/80">Category Tag Label</label>
                              <input
                                type="text"
                                value={cat.label}
                                onChange={(e) => {
                                  const updated = [...scientificCategories];
                                  updated[idx].label = e.target.value;
                                  setScientificCategories(updated);
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#00A8CC] focus:ring-1 focus:ring-[#00A8CC] transition-all"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] font-black uppercase tracking-widest text-primary/80">Presentation Roster Type</label>
                              <input
                                type="text"
                                value={cat.type}
                                onChange={(e) => {
                                  const updated = [...scientificCategories];
                                  updated[idx].type = e.target.value;
                                  setScientificCategories(updated);
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#00A8CC] focus:ring-1 focus:ring-[#00A8CC] transition-all"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-primary/80">Mandatory Rules (One per line)</label>
                            <textarea
                              value={cat.rules?.join('\n') || ''}
                              onChange={(e) => {
                                const updated = [...scientificCategories];
                                updated[idx].rules = e.target.value.split('\n').filter(Boolean);
                                setScientificCategories(updated);
                              }}
                              className="w-full bg-gray-50 border border-softgray rounded-xl p-3 text-xs text-primary/80 focus:outline-none focus:border-[#00A8CC] h-24"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeContentTab === 'contacts' && (
                <div className="bg-gray-50 border border-softgray rounded-xl p-6 space-y-6">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">Dynamic Secretariat & Support Contact Details</h3>
                    <p className="text-[10px] text-primary/80 uppercase tracking-widest mt-1">Configure dynamic contacts rendered live on all frontend screens</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Secretariat Voice Phone Number</label>
                      <input
                        type="text"
                        value={contactSettings.phone}
                        onChange={(e) => setContactSettings({ ...contactSettings, phone: e.target.value })}
                        placeholder="e.g. 9393344886"
                        className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-black-300">WhatsApp Link Country+Number (No spaces/special characters)</label>
                      <input
                        type="text"
                        value={contactSettings.whatsapp}
                        onChange={(e) => setContactSettings({ ...contactSettings, whatsapp: e.target.value })}
                        placeholder="e.g. 919393344886"
                        className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Official Support Email Address</label>
                      <input
                        type="email"
                        value={contactSettings.supportEmail}
                        onChange={(e) => setContactSettings({ ...contactSettings, supportEmail: e.target.value })}
                        placeholder="e.g. support.30thiaphdnatcon@gmail.com"
                        className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Registrations Desk Email Address</label>
                      <input
                        type="email"
                        value={contactSettings.registrationEmail}
                        onChange={(e) => setContactSettings({ ...contactSettings, registrationEmail: e.target.value })}
                        placeholder="e.g. registrations.30thiaphdnatcon@gmail.com"
                        className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                      />
                    </div>
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-green-600">✓ Auto-saves reactively and instantly updates floaters & assistance widgets site-wide</p>
                </div>
              )}

              {activeContentTab === 'header-logos' && (
                <div className="bg-gray-50 border border-softgray rounded-xl p-6 space-y-6">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">Dynamic Header & Contact Logos</h3>
                    <p className="text-[10px] text-primary/80 uppercase tracking-widest mt-1">Upload and configure the four official header logos displayed live at the top of all pages</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Website Favicon */}
                    <div className="bg-white border border-gray-150 p-6 rounded-xl space-y-4 shadow-sm md:col-span-2">
                      <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#00A8CC]">Website Favicon (Browser Tab Icon)</span>
                        {headerLogos?.favicon && (
                          <img src={headerLogos.favicon} className="h-8 w-8 object-contain bg-white border border-softgray p-0.5" alt="Favicon Preview" />
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-primary/80">Favicon File Upload</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              if (e.target.files && e.target.files[0]) {
                                showToast('Uploading Favicon...', 'info');
                                const url = await uploadImage(e.target.files[0]);
                                if (url) {
                                  setHeaderLogos({ ...headerLogos, favicon: url });
                                  showToast('Favicon uploaded successfully!', 'success');
                                } else {
                                  showToast('Favicon upload failed.', 'error');
                                }
                              }
                            }}
                            className="w-full text-xs text-black-300 file:mr-2 file:py-1 file:px-2 file:rounded-xl file:border-0 file:text-[9px] file:font-semibold file:bg-gray-100 file:text-[#00A8CC] hover:file:bg-gray-200 cursor-pointer"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-primary/80">Or Paste Favicon Image URL</label>
                          <input
                            type="text"
                            value={headerLogos?.favicon || ''}
                            onChange={(e) => setHeaderLogos({ ...headerLogos, favicon: e.target.value })}
                            placeholder="e.g. ./favicon.svg"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#00A8CC] focus:ring-1 focus:ring-[#00A8CC] transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Logo 1 */}
                    <div className="bg-white border border-gray-150 p-6 rounded-xl space-y-4 shadow-sm">
                      <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#00A8CC]">Logo 1 (Left Logo A)</span>
                        {headerLogos?.logo1 && (
                          <img src={headerLogos.logo1} className="h-10 object-contain bg-white border border-softgray p-0.5" alt="" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-primary/80">Logo 1 File Upload</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                              showToast('Uploading Logo 1...', 'info');
                              const url = await uploadImage(e.target.files[0]);
                              if (url) {
                                setHeaderLogos({ ...headerLogos, logo1: url });
                                showToast('Logo 1 uploaded successfully!', 'success');
                              } else {
                                showToast('Logo 1 upload failed.', 'error');
                              }
                            }
                          }}
                          className="w-full text-xs text-black-300 file:mr-2 file:py-1 file:px-2 file:rounded-xl file:border-0 file:text-[9px] file:font-semibold file:bg-gray-100 file:text-[#00A8CC] hover:file:bg-gray-200 cursor-pointer"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-primary/80">Or Paste Logo 1 Image URL</label>
                        <input
                          type="text"
                          value={headerLogos?.logo1 || ''}
                          onChange={(e) => setHeaderLogos({ ...headerLogos, logo1: e.target.value })}
                          placeholder="e.g. ./logo-1.png"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#00A8CC] focus:ring-1 focus:ring-[#00A8CC] transition-all"
                        />
                      </div>
                    </div>

                    {/* Logo 2 */}
                    <div className="bg-white border border-gray-150 p-6 rounded-xl space-y-4 shadow-sm">
                      <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#00A8CC]">Logo 2 (Left Logo B)</span>
                        {headerLogos?.logo2 && (
                          <img src={headerLogos.logo2} className="h-10 object-contain bg-white border border-softgray p-0.5" alt="" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-primary/80">Logo 2 File Upload</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                              showToast('Uploading Logo 2...', 'info');
                              const url = await uploadImage(e.target.files[0]);
                              if (url) {
                                setHeaderLogos({ ...headerLogos, logo2: url });
                                showToast('Logo 2 uploaded successfully!', 'success');
                              } else {
                                showToast('Logo 2 upload failed.', 'error');
                              }
                            }
                          }}
                          className="w-full text-xs text-black-300 file:mr-2 file:py-1 file:px-2 file:rounded-xl file:border-0 file:text-[9px] file:font-semibold file:bg-gray-100 file:text-[#00A8CC] hover:file:bg-gray-200 cursor-pointer"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-primary/80">Or Paste Logo 2 Image URL</label>
                        <input
                          type="text"
                          value={headerLogos?.logo2 || ''}
                          onChange={(e) => setHeaderLogos({ ...headerLogos, logo2: e.target.value })}
                          placeholder="e.g. ./logo-1.png"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#00A8CC] focus:ring-1 focus:ring-[#00A8CC] transition-all"
                        />
                      </div>
                    </div>

                    {/* Logo 3 */}
                    <div className="bg-white border border-gray-150 p-6 rounded-xl space-y-4 shadow-sm">
                      <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#00A8CC]">Logo 3 (Right Logo A)</span>
                        {headerLogos?.logo3 && (
                          <img src={headerLogos.logo3} className="h-10 object-contain bg-white border border-softgray p-0.5" alt="" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-primary/80">Logo 3 File Upload</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                              showToast('Uploading Logo 3...', 'info');
                              const url = await uploadImage(e.target.files[0]);
                              if (url) {
                                setHeaderLogos({ ...headerLogos, logo3: url });
                                showToast('Logo 3 uploaded successfully!', 'success');
                              } else {
                                showToast('Logo 3 upload failed.', 'error');
                              }
                            }
                          }}
                          className="w-full text-xs text-black-300 file:mr-2 file:py-1 file:px-2 file:rounded-xl file:border-0 file:text-[9px] file:font-semibold file:bg-gray-100 file:text-[#00A8CC] hover:file:bg-gray-200 cursor-pointer"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-primary/80">Or Paste Logo 3 Image URL</label>
                        <input
                          type="text"
                          value={headerLogos?.logo3 || ''}
                          onChange={(e) => setHeaderLogos({ ...headerLogos, logo3: e.target.value })}
                          placeholder="e.g. ./logo-2.png"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#00A8CC] focus:ring-1 focus:ring-[#00A8CC] transition-all"
                        />
                      </div>
                    </div>

                    {/* Logo 4 */}
                    <div className="bg-white border border-gray-150 p-6 rounded-xl space-y-4 shadow-sm">
                      <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#00A8CC]">Logo 4 (Right Logo B)</span>
                        {headerLogos?.logo4 && (
                          <img src={headerLogos.logo4} className="h-10 object-contain bg-white border border-softgray p-0.5" alt="" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-primary/80">Logo 4 File Upload</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                              showToast('Uploading Logo 4...', 'info');
                              const url = await uploadImage(e.target.files[0]);
                              if (url) {
                                setHeaderLogos({ ...headerLogos, logo4: url });
                                showToast('Logo 4 uploaded successfully!', 'success');
                              } else {
                                showToast('Logo 4 upload failed.', 'error');
                              }
                            }
                          }}
                          className="w-full text-xs text-black-300 file:mr-2 file:py-1 file:px-2 file:rounded-xl file:border-0 file:text-[9px] file:font-semibold file:bg-gray-100 file:text-[#00A8CC] hover:file:bg-gray-200 cursor-pointer"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-primary/80">Or Paste Logo 4 Image URL</label>
                        <input
                          type="text"
                          value={headerLogos?.logo4 || ''}
                          onChange={(e) => setHeaderLogos({ ...headerLogos, logo4: e.target.value })}
                          placeholder="e.g. ./logo-2.png"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#00A8CC] focus:ring-1 focus:ring-[#00A8CC] transition-all"
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-green-600">✓ Auto-saves reactively and instantly updates headers site-wide</p>
                </div>
              )}

              {activeContentTab === 'seo' && (
                <div className="bg-gray-50 border border-softgray rounded-xl p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">SEO Meta & Crawler Tag Manager</h3>
                      <p className="text-[10px] text-primary/80 uppercase tracking-widest mt-1">Configure search engine titles, descriptions, and dynamic keywords</p>
                    </div>
                    <div>
                      <select
                        value={selectedSeoPage}
                        onChange={(e) => setSelectedSeoPage(e.target.value)}
                        className="bg-white border border-softgray rounded-xl p-2 text-xs font-black uppercase tracking-wider text-gray-800 focus:outline-none focus:border-[#00A8CC] cursor-pointer"
                      >
                        <option value="home">Homepage Roster</option>
                        <option value="about">About Association</option>
                        <option value="committees">Committees Page</option>
                        <option value="scientific">Scientific Guidelines</option>
                        <option value="registration">Delegate Registration</option>
                        <option value="schedules">Timelines & Schedules</option>
                        <option value="submissions">Submissions Gateway</option>
                        <option value="venue">Venue & Stays</option>
                        <option value="trade">Trade & Exhibition</option>
                        <option value="workshops">Workshops Program</option>
                        <option value="tourist">Tourist Attractions</option>
                        <option value="utility">Delegate Utilities</option>
                        <option value="faqs">General FAQs</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Search Engine Tab Title</label>
                      <input
                        type="text"
                        value={seoSettings[selectedSeoPage]?.title || ''}
                        onChange={(e) => {
                          const updated = { ...seoSettings };
                          updated[selectedSeoPage].title = e.target.value;
                          setSeoSettings(updated);
                        }}
                        placeholder="Page Title"
                        className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Meta Crawler Description (Recommended: 150-160 characters)</label>
                      <textarea
                        value={seoSettings[selectedSeoPage]?.description || ''}
                        onChange={(e) => {
                          const updated = { ...seoSettings };
                          updated[selectedSeoPage].description = e.target.value;
                          setSeoSettings(updated);
                        }}
                        placeholder="Page Description"
                        className="w-full bg-white border border-softgray rounded-xl p-3 text-xs text-primary/80 focus:outline-none focus:border-[#00A8CC] h-24 leading-relaxed"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Search Keywords (Comma-separated list)</label>
                      <input
                        type="text"
                        value={seoSettings[selectedSeoPage]?.keywords || ''}
                        onChange={(e) => {
                          const updated = { ...seoSettings };
                          updated[selectedSeoPage].keywords = e.target.value;
                          setSeoSettings(updated);
                        }}
                        placeholder="e.g. Dentistry, NATCON, Public Health, Vizag"
                        className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                      />
                    </div>
                  </div>

                  <p className="text-[9px] font-black uppercase tracking-widest text-green-600">✓ Auto-saves and updates the head title, description, and keywords in the DOM on routing</p>
                </div>
              )}

              {activeContentTab === 'abstract-guidelines' && (
                <div className="space-y-8">
                  <div className="bg-gray-50 border border-softgray rounded-xl p-6 space-y-6">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">Abstract Submission Guidelines</h3>
                      <p className="text-[10px] text-primary/80 uppercase tracking-widest mt-1">Content shown on the Submissions page — Guidelines tab</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Page Heading</label>
                        <input
                          type="text"
                          value={abstractGuidelines.heading}
                          onChange={(e) => setAbstractGuidelines({ ...abstractGuidelines, heading: e.target.value })}
                          className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Submission Deadline Text</label>
                        <input
                          type="text"
                          value={abstractGuidelines.deadline}
                          onChange={(e) => setAbstractGuidelines({ ...abstractGuidelines, deadline: e.target.value })}
                          className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Introduction / Intro Paragraph</label>
                      <RichTextArea
                        value={abstractGuidelines.intro}
                        onChange={(e) => setAbstractGuidelines({ ...abstractGuidelines, intro: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Rules / Guidelines (One per line)</label>
                      <textarea
                        value={abstractGuidelines.rules?.join('\n') || ''}
                        onChange={(e) => setAbstractGuidelines({ ...abstractGuidelines, rules: e.target.value.split('\n').filter(Boolean) })}
                        className="w-full bg-white border border-softgray rounded-xl p-3 text-xs text-primary/80 focus:outline-none focus:border-[#00A8CC] h-48 leading-relaxed"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Contact / Support Note</label>
                      <input
                        type="text"
                        value={abstractGuidelines.contactNote}
                        onChange={(e) => setAbstractGuidelines({ ...abstractGuidelines, contactNote: e.target.value })}
                        className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                      />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-green-600">✓ Auto-saves and updates Submissions Guidelines tab in real-time</p>
                  </div>

                  {/* Scientific Zone Templates Manager */}
                  <div className="bg-gray-50 border border-softgray rounded-xl p-6 space-y-6">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">Scientific Guidelines & Template Downloads</h3>
                      <p className="text-[10px] text-primary/80 uppercase tracking-widest mt-1">Configure templates and download files displayed on the Scientific Zone page</p>
                    </div>

                    <div className="space-y-6">
                      {scientificDownloads?.map((doc, idx) => (
                        <div key={idx} className="p-4 bg-white border border-gray-150 rounded-xl space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[9px] font-black uppercase tracking-widest text-primary/80">Document Title</label>
                              <input
                                type="text"
                                value={doc.title}
                                onChange={(e) => {
                                  const updated = [...scientificDownloads];
                                  updated[idx] = { ...doc, title: e.target.value };
                                  setScientificDownloads(updated);
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#00A8CC] focus:ring-1 focus:ring-[#00A8CC] transition-all"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] font-black uppercase tracking-widest text-primary/80">Description</label>
                              <input
                                type="text"
                                value={doc.desc}
                                onChange={(e) => {
                                  const updated = [...scientificDownloads];
                                  updated[idx] = { ...doc, desc: e.target.value };
                                  setScientificDownloads(updated);
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#00A8CC] focus:ring-1 focus:ring-[#00A8CC] transition-all"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-primary/80">Download Link / File URL</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={doc.fileUrl || ''}
                                onChange={(e) => {
                                  const updated = [...scientificDownloads];
                                  updated[idx] = { ...doc, fileUrl: e.target.value };
                                  setScientificDownloads(updated);
                                }}
                                placeholder="Paste file URL or select file to upload (PDF, PPTX, etc.)"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#00A8CC] focus:ring-1 focus:ring-[#00A8CC] transition-all"
                              />
                              <div className="relative flex items-center justify-center bg-[#C8A96B] hover:bg-gradient-to-r from-[#C8A96B] to-[#ff8585] text-white shadow-md hover:shadow-[0_4px_15px_rgba(200,169,107,0.35)] hover:-translate-y-0.5 active:translate-y-0 hover:opacity-95 transition-all cursor-pointer px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors cursor-pointer min-w-[120px] text-center">
                                <span>Upload File</span>
                                <input
                                  type="file"
                                  accept=".pdf,.ppt,.pptx,.doc,.docx,.png,.jpg,.jpeg"
                                  onChange={async (e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      try {
                                        showToast('Uploading template file...', 'info');
                                        const url = await uploadImage(e.target.files[0]);
                                        if (url) {
                                          const updated = [...scientificDownloads];
                                          updated[idx] = { ...doc, fileUrl: url };
                                          setScientificDownloads(updated);
                                          showToast('Template file uploaded successfully!', 'success');
                                        } else {
                                          showToast('File upload failed.', 'error');
                                        }
                                      } catch (err) {
                                        showToast('Upload error: ' + err.message, 'error');
                                      }
                                    }
                                  }}
                                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeContentTab === 'reg-guidelines' && (
                <div className="space-y-8">
                  <div className="bg-gray-50 border border-softgray rounded-xl p-6 space-y-6">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">Registration Guidelines</h3>
                      <p className="text-[10px] text-primary/80 uppercase tracking-widest mt-1">Content shown on the Registration page sidebar panel</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Panel Heading</label>
                        <input
                          type="text"
                          value={registrationGuidelines.heading}
                          onChange={(e) => setRegistrationGuidelines({ ...registrationGuidelines, heading: e.target.value })}
                          className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Intro / Note</label>
                        <input
                          type="text"
                          value={registrationGuidelines.intro}
                          onChange={(e) => setRegistrationGuidelines({ ...registrationGuidelines, intro: e.target.value })}
                          className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Registration Steps (Rich Text Details)</label>
                      <RichTextArea
                        value={typeof registrationGuidelines.steps === 'string' ? registrationGuidelines.steps : (registrationGuidelines.steps?.join('\n') || '')}
                        onChange={(e) => setRegistrationGuidelines({ ...registrationGuidelines, steps: e.target.value })}
                        placeholder="Enter registration steps..."
                        h="h-48"
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-softgray pb-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300 font-bold">Custom Information / Payment Addons</label>
                        <button
                          onClick={() => {
                            const updatedAddons = [...(registrationGuidelines.bankDetails || []), { title: 'New Details Section', intro: '', text: 'Enter details here...' }];
                            setRegistrationGuidelines({ ...registrationGuidelines, bankDetails: updatedAddons });
                          }}
                          className="bg-[#C8A96B] hover:bg-[#14213D] text-white hover:text-accent shadow-sm px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center transition-colors cursor-pointer"
                        >
                          <Plus className="w-2.5 h-2.5 mr-1" /> Add Section
                        </button>
                      </div>

                      <div className="space-y-4">
                        {registrationGuidelines.bankDetails?.map((row, idx) => (
                          <div key={idx} className="bg-white p-4 border border-softgray rounded-xl space-y-3 relative font-sans">
                            <button
                              onClick={() => {
                                const updated = [...registrationGuidelines.bankDetails];
                                updated.splice(idx, 1);
                                setRegistrationGuidelines({ ...registrationGuidelines, bankDetails: updated });
                              }}
                              className="absolute top-4 right-4 text-primary/80 hover:text-red-500 cursor-pointer transition-colors"
                              title="Delete Section"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            <div className="space-y-2 pr-8">
                              <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 font-bold">Section Heading</label>
                              <input
                                type="text"
                                value={row.title || row.label || ''}
                                onChange={(e) => {
                                  const updated = [...registrationGuidelines.bankDetails];
                                  updated[idx] = { ...row, title: e.target.value, label: e.target.value };
                                  setRegistrationGuidelines({ ...registrationGuidelines, bankDetails: updated });
                                }}
                                placeholder="e.g. Bank Account Details"
                                className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 font-bold">Intro / Note</label>
                              <input
                                type="text"
                                value={row.intro || row.note || ''}
                                onChange={(e) => {
                                  const updated = [...registrationGuidelines.bankDetails];
                                  updated[idx] = { ...row, intro: e.target.value, note: e.target.value };
                                  setRegistrationGuidelines({ ...registrationGuidelines, bankDetails: updated });
                                }}
                                placeholder="e.g. Please use the following details for manual bank transfers..."
                                className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 font-bold">Description / Section Content (Rich Text Details)</label>
                              <RichTextArea
                                value={row.text || row.value || ''}
                                onChange={(e) => {
                                  const updated = [...registrationGuidelines.bankDetails];
                                  updated[idx] = { ...row, text: e.target.value, value: e.target.value };
                                  setRegistrationGuidelines({ ...registrationGuidelines, bankDetails: updated });
                                }}
                                placeholder="Enter instructions or details..."
                                h="h-48"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Footer Note / Contact Line</label>
                      <input
                        type="text"
                        value={registrationGuidelines.note}
                        onChange={(e) => setRegistrationGuidelines({ ...registrationGuidelines, note: e.target.value })}
                        className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                      />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-green-600">✓ Auto-saves and updates Registration page sidebar in real-time</p>
                  </div>
                </div>
              )}

              {activeContentTab === 'about-us' && (
                <div className="space-y-8">
                  <div className="bg-gray-50 border border-softgray rounded-xl p-6 space-y-6">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">About Us — Homepage Welcome Section</h3>
                      <p className="text-[10px] text-primary/80 uppercase tracking-widest mt-1">Controls the "Welcome / About" section on the Homepage</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Section Tagline</label>
                        <input
                          type="text"
                          value={aboutUs.tagline}
                          onChange={(e) => setAboutUs({ ...aboutUs, tagline: e.target.value })}
                          className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Heading Line 1</label>
                        <input
                          type="text"
                          value={aboutUs.heading}
                          onChange={(e) => setAboutUs({ ...aboutUs, heading: e.target.value })}
                          className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Heading Line 2 (Highlighted)</label>
                        <input
                          type="text"
                          value={aboutUs.headingHighlight}
                          onChange={(e) => setAboutUs({ ...aboutUs, headingHighlight: e.target.value })}
                          className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Welcome Section Image</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={aboutUs.image || ''}
                          onChange={(e) => setAboutUs({ ...aboutUs, image: e.target.value })}
                          placeholder="Image URL (e.g. ./about.png or uploaded image url)"
                          className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                        />
                        <div className="relative flex items-center justify-center bg-[#C8A96B] hover:bg-gradient-to-r from-[#C8A96B] to-[#ff8585] text-white shadow-md hover:shadow-[0_4px_15px_rgba(200,169,107,0.35)] hover:-translate-y-0.5 active:translate-y-0 hover:opacity-95 transition-all cursor-pointer px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer min-w-[120px] text-center">
                          <span>Upload Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              if (e.target.files && e.target.files[0]) {
                                try {
                                  showToast('Uploading image...', 'info');
                                  const url = await uploadImage(e.target.files[0]);
                                  if (url) {
                                    setAboutUs({ ...aboutUs, image: url });
                                    showToast('Image uploaded successfully!', 'success');
                                  } else {
                                    showToast('Image upload failed.', 'error');
                                  }
                                } catch (err) {
                                  showToast('Upload error: ' + err.message, 'error');
                                }
                              }
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Body Paragraph</label>
                      <RichTextArea
                        value={aboutUs.body}
                        onChange={(e) => setAboutUs({ ...aboutUs, body: e.target.value })}
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Stat Cards (First = image overlay stat)</label>
                      {aboutUs.stats?.map((stat, idx) => (
                        <div key={idx} className="grid grid-cols-3 gap-4 items-center">
                          <span className="text-[9px] font-black uppercase tracking-widest text-black-300">Card {idx + 1}</span>
                          <input
                            type="text"
                            value={stat.value}
                            onChange={(e) => {
                              const updated = [...aboutUs.stats];
                              updated[idx].value = e.target.value;
                              setAboutUs({ ...aboutUs, stats: updated });
                            }}
                            placeholder="Value (e.g. 30+)"
                            className="bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                          />
                          <input
                            type="text"
                            value={stat.label}
                            onChange={(e) => {
                              const updated = [...aboutUs.stats];
                              updated[idx].label = e.target.value;
                              setAboutUs({ ...aboutUs, stats: updated });
                            }}
                            placeholder="Label"
                            className="bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                          />
                        </div>
                      ))}
                      <button
                        onClick={() => setAboutUs({ ...aboutUs, stats: [...(aboutUs.stats || []), { value: '', label: '' }] })}
                        className="flex items-center text-[9px] font-black uppercase tracking-widest text-[#00A8CC] hover:text-primary transition-colors"
                      >
                        <Plus className="w-3 h-3 mr-1" /> Add Stat Card
                      </button>
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-green-600">✓ Auto-saves and updates the Homepage About/Welcome section in real-time</p>
                  </div>

                  <div className="bg-gray-50 border border-softgray rounded-xl p-6 space-y-6 mt-8">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">About Us Slides</h3>
                        <p className="text-[10px] text-primary/80 uppercase tracking-widest mt-1">Manage the hero slideshow on the About page</p>
                      </div>
                      <button
                        onClick={() => {
                          const newSlides = [...(aboutUsExtras?.slides || []), { title: '', desc: '', img: '' }];
                          setAboutUsExtras({ ...aboutUsExtras, slides: newSlides });
                        }}
                        className="bg-gradient-to-r from-[#C8A96B] to-[#ff8585] text-white shadow-md hover:shadow-[0_4px_15px_rgba(200,169,107,0.35)] hover:-translate-y-0.5 active:translate-y-0 hover:opacity-95 transition-all cursor-pointer px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center hover:bg-[#C8A96B] transition-colors"
                      >
                        <Plus className="w-3 h-3 mr-2" /> Add Slide
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      {aboutUsExtras?.slides?.map((slide, index) => (
                        <div key={index} className="bg-white border border-softgray rounded-xl p-4 relative">
                          <button
                            onClick={() => {
                              const newSlides = [...aboutUsExtras.slides];
                              newSlides.splice(index, 1);
                              setAboutUsExtras({ ...aboutUsExtras, slides: newSlides });
                            }}
                            className="absolute top-4 right-4 text-primary/80 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <div className="space-y-4 pr-8">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Slide Title</label>
                              <input
                                type="text"
                                value={slide.title}
                                onChange={(e) => {
                                  const newSlides = [...aboutUsExtras.slides];
                                  newSlides[index] = { ...slide, title: e.target.value };
                                  setAboutUsExtras({ ...aboutUsExtras, slides: newSlides });
                                }}
                                className="w-full border-b border-softgray p-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Slide Description</label>
                              <RichTextArea
                                value={slide.desc}
                                onChange={(e) => {
                                  const newSlides = [...aboutUsExtras.slides];
                                  newSlides[index] = { ...slide, desc: e.target.value };
                                  setAboutUsExtras({ ...aboutUsExtras, slides: newSlides });
                                }}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Image URL</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={slide.img}
                                  onChange={(e) => {
                                    const newSlides = [...aboutUsExtras.slides];
                                    newSlides[index] = { ...slide, img: e.target.value };
                                    setAboutUsExtras({ ...aboutUsExtras, slides: newSlides });
                                  }}
                                  className="w-full border-b border-softgray p-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                                />
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={async (e) => {
                                    if (e.target.files[0]) {
                                      const url = await uploadImage(e.target.files[0]);
                                      if (url) {
                                        const newSlides = [...aboutUsExtras.slides];
                                        newSlides[index] = { ...slide, img: url };
                                        setAboutUsExtras({ ...aboutUsExtras, slides: newSlides });
                                      }
                                    }
                                  }}
                                  className="w-24 text-[9px] file:mr-2 file:py-1 file:px-2 file:rounded-xl file:border-0 file:text-[9px] file:font-black file:bg-[#C8A96B] file:text-white hover:file:bg-[#C8A96B] transition-colors cursor-pointer"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center mt-8 border-t border-softgray pt-8">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">Benefits Grid</h3>
                        <p className="text-[10px] text-primary/80 uppercase tracking-widest mt-1">Manage the 'Why Attend' items</p>
                      </div>
                      <button
                        onClick={() => {
                          const newBenefits = [...(aboutUsExtras?.benefits || []), { iconName: 'Star', title: '', desc: '' }];
                          setAboutUsExtras({ ...aboutUsExtras, benefits: newBenefits });
                        }}
                        className="bg-gradient-to-r from-[#C8A96B] to-[#ff8585] text-white shadow-md hover:shadow-[0_4px_15px_rgba(200,169,107,0.35)] hover:-translate-y-0.5 active:translate-y-0 hover:opacity-95 transition-all cursor-pointer px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center hover:bg-[#C8A96B] transition-colors"
                      >
                        <Plus className="w-3 h-3 mr-2" /> Add Benefit
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {aboutUsExtras?.benefits?.map((benefit, index) => (
                        <div key={index} className="bg-white border border-softgray rounded-xl p-4 relative">
                          <button
                            onClick={() => {
                              const newBenefits = [...aboutUsExtras.benefits];
                              newBenefits.splice(index, 1);
                              setAboutUsExtras({ ...aboutUsExtras, benefits: newBenefits });
                            }}
                            className="absolute top-4 right-4 text-primary/80 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <div className="space-y-4 pr-8">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Lucide Icon Name</label>
                              <input
                                type="text"
                                value={benefit.iconName}
                                onChange={(e) => {
                                  const newBenefits = [...aboutUsExtras.benefits];
                                  newBenefits[index] = { ...benefit, iconName: e.target.value };
                                  setAboutUsExtras({ ...aboutUsExtras, benefits: newBenefits });
                                }}
                                placeholder="e.g. Lightbulb, Trophy, Users"
                                className="w-full border-b border-softgray p-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Title</label>
                              <input
                                type="text"
                                value={benefit.title}
                                onChange={(e) => {
                                  const newBenefits = [...aboutUsExtras.benefits];
                                  newBenefits[index] = { ...benefit, title: e.target.value };
                                  setAboutUsExtras({ ...aboutUsExtras, benefits: newBenefits });
                                }}
                                className="w-full border-b border-softgray p-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Description</label>
                              <RichTextArea
                                value={benefit.desc}
                                onChange={(e) => {
                                  const newBenefits = [...aboutUsExtras.benefits];
                                  newBenefits[index] = { ...benefit, desc: e.target.value };
                                  setAboutUsExtras({ ...aboutUsExtras, benefits: newBenefits });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeContentTab === 'program-summary' && (
                <div className="space-y-8">
                  <div className="bg-gray-50 border border-softgray rounded-xl p-6 space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">Program Summary Manager</h3>
                        <p className="text-[10px] text-primary/80 uppercase tracking-widest mt-1">Manage the homepage event timeline</p>
                      </div>
                      <button
                        onClick={() => {
                          const newDays = [...(programScheduleData?.days || []), { id: Date.now().toString(), label: '', date: '', title: '', events: [] }];
                          setProgramScheduleData({ ...programScheduleData, days: newDays });
                        }}
                        className="bg-gradient-to-r from-[#C8A96B] to-[#ff8585] text-white shadow-md hover:shadow-[0_4px_15px_rgba(200,169,107,0.35)] hover:-translate-y-0.5 active:translate-y-0 hover:opacity-95 transition-all cursor-pointer px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center hover:bg-[#C8A96B] transition-colors"
                      >
                        <Plus className="w-3 h-3 mr-2" /> Add Day
                      </button>
                    </div>

                    <div className="space-y-6">
                      {programScheduleData?.days?.map((day, dayIndex) => (
                        <div key={dayIndex} className="bg-white border border-softgray rounded-xl p-4 relative">
                          <button
                            onClick={() => {
                              const newDays = [...programScheduleData.days];
                              newDays.splice(dayIndex, 1);
                              setProgramScheduleData({ ...programScheduleData, days: newDays });
                            }}
                            className="absolute top-4 right-4 text-primary/80 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Day Label</label>
                              <input
                                type="text"
                                value={day.label}
                                onChange={(e) => {
                                  const newDays = [...programScheduleData.days];
                                  newDays[dayIndex] = { ...day, label: e.target.value };
                                  setProgramScheduleData({ ...programScheduleData, days: newDays });
                                }}
                                placeholder="e.g. Day 01"
                                className="w-full border-b border-softgray p-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Date</label>
                              <input
                                type="text"
                                value={day.date}
                                onChange={(e) => {
                                  const newDays = [...programScheduleData.days];
                                  newDays[dayIndex] = { ...day, date: e.target.value };
                                  setProgramScheduleData({ ...programScheduleData, days: newDays });
                                }}
                                placeholder="e.g. Nov 27"
                                className="w-full border-b border-softgray p-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Title</label>
                              <input
                                type="text"
                                value={day.title}
                                onChange={(e) => {
                                  const newDays = [...programScheduleData.days];
                                  newDays[dayIndex] = { ...day, title: e.target.value };
                                  setProgramScheduleData({ ...programScheduleData, days: newDays });
                                }}
                                placeholder="e.g. Scientific Program - Day 1"
                                className="w-full border-b border-softgray p-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                              />
                            </div>
                          </div>

                          <div className="mt-6 border-t border-softgray pt-4">
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/80">Events</h4>
                              <button
                                onClick={() => {
                                  const newDays = [...programScheduleData.days];
                                  const newEvents = [...(day.events || []), { time: '', event: '', speaker: '', location: '', isBreak: false }];
                                  newDays[dayIndex] = { ...day, events: newEvents };
                                  setProgramScheduleData({ ...programScheduleData, days: newDays });
                                }}
                                className="text-[#00A8CC] hover:text-primary text-[10px] font-black uppercase tracking-widest flex items-center"
                              >
                                <Plus className="w-3 h-3 mr-1" /> Add Event
                              </button>
                            </div>
                            <div className="space-y-3">
                              {day.events?.map((ev, evIndex) => (
                                <div key={evIndex} className="flex flex-wrap md:flex-nowrap gap-2 items-center bg-gray-50 p-2 rounded-xl border border-softgray">
                                  <input
                                    type="text"
                                    value={ev.time}
                                    onChange={(e) => {
                                      const newDays = [...programScheduleData.days];
                                      const newEvents = [...day.events];
                                      newEvents[evIndex] = { ...ev, time: e.target.value };
                                      newDays[dayIndex] = { ...day, events: newEvents };
                                      setProgramScheduleData({ ...programScheduleData, days: newDays });
                                    }}
                                    placeholder="Time"
                                    className="w-full md:w-24 bg-white border border-softgray p-2 text-[10px] font-bold focus:outline-none"
                                  />
                                  <input
                                    type="text"
                                    value={ev.event}
                                    onChange={(e) => {
                                      const newDays = [...programScheduleData.days];
                                      const newEvents = [...day.events];
                                      newEvents[evIndex] = { ...ev, event: e.target.value };
                                      newDays[dayIndex] = { ...day, events: newEvents };
                                      setProgramScheduleData({ ...programScheduleData, days: newDays });
                                    }}
                                    placeholder="Event Name"
                                    className="w-full flex-1 bg-white border border-softgray p-2 text-[10px] font-bold focus:outline-none"
                                  />
                                  <input
                                    type="text"
                                    value={ev.speaker}
                                    onChange={(e) => {
                                      const newDays = [...programScheduleData.days];
                                      const newEvents = [...day.events];
                                      newEvents[evIndex] = { ...ev, speaker: e.target.value };
                                      newDays[dayIndex] = { ...day, events: newEvents };
                                      setProgramScheduleData({ ...programScheduleData, days: newDays });
                                    }}
                                    placeholder="Speaker"
                                    className="w-full md:w-32 bg-white border border-softgray p-2 text-[10px] font-bold focus:outline-none"
                                  />
                                  <input
                                    type="text"
                                    value={ev.location}
                                    onChange={(e) => {
                                      const newDays = [...programScheduleData.days];
                                      const newEvents = [...day.events];
                                      newEvents[evIndex] = { ...ev, location: e.target.value };
                                      newDays[dayIndex] = { ...day, events: newEvents };
                                      setProgramScheduleData({ ...programScheduleData, days: newDays });
                                    }}
                                    placeholder="Location"
                                    className="w-full md:w-32 bg-white border border-softgray p-2 text-[10px] font-bold focus:outline-none"
                                  />
                                  <label className="flex items-center text-[9px] font-black uppercase text-black-300 md:w-20">
                                    <input
                                      type="checkbox"
                                      checked={ev.isBreak}
                                      onChange={(e) => {
                                        const newDays = [...programScheduleData.days];
                                        const newEvents = [...day.events];
                                        newEvents[evIndex] = { ...ev, isBreak: e.target.checked };
                                        newDays[dayIndex] = { ...day, events: newEvents };
                                        setProgramScheduleData({ ...programScheduleData, days: newDays });
                                      }}
                                      className="mr-1"
                                    />
                                    Break
                                  </label>
                                  <button
                                    onClick={() => {
                                      const newDays = [...programScheduleData.days];
                                      const newEvents = [...day.events];
                                      newEvents.splice(evIndex, 1);
                                      newDays[dayIndex] = { ...day, events: newEvents };
                                      setProgramScheduleData({ ...programScheduleData, days: newDays });
                                    }}
                                    className="text-primary/80 hover:text-red-500 p-2"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeContentTab === 'venue-hotels' && (
                <div className="space-y-8">
                  {/* Venue Info Section */}
                  <div className="bg-gray-50 border border-softgray rounded-xl p-6 space-y-6">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">Venue Information</h3>
                      <p className="text-[10px] text-primary/80 uppercase tracking-widest mt-1">Manage the primary conference venue details</p>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Venue Name</label>
                          <input
                            type="text"
                            value={venueInfo?.name || ''}
                            onChange={(e) => setVenueInfo({ ...venueInfo, name: e.target.value })}
                            className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Subtitle</label>
                          <input
                            type="text"
                            value={venueInfo?.subtitle || ''}
                            onChange={(e) => setVenueInfo({ ...venueInfo, subtitle: e.target.value })}
                            className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Description</label>
                        <RichTextArea
                          value={venueInfo?.description || ''}
                          onChange={(e) => setVenueInfo({ ...venueInfo, description: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Image URL</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={venueInfo?.imageUrl || ''}
                              onChange={(e) => setVenueInfo({ ...venueInfo, imageUrl: e.target.value })}
                              className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                            />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                if (e.target.files[0]) {
                                  const url = await uploadImage(e.target.files[0]);
                                  if (url) setVenueInfo({ ...venueInfo, imageUrl: url });
                                }
                              }}
                              className="w-24 text-[9px] file:mr-2 file:py-1 file:px-2 file:rounded-xl file:border-0 file:text-[9px] file:font-black file:bg-[#C8A96B] file:text-white hover:file:bg-[#C8A96B] transition-colors cursor-pointer"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Google Maps URL</label>
                          <input
                            type="text"
                            value={venueInfo?.mapUrl || ''}
                            onChange={(e) => setVenueInfo({ ...venueInfo, mapUrl: e.target.value })}
                            className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hotels List Section */}
                  <div className="bg-gray-50 border border-softgray rounded-xl p-6 space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">Recommended Hotels</h3>
                        <p className="text-[10px] text-primary/80 uppercase tracking-widest mt-1">Manage lodging recommendations</p>
                      </div>
                      <button
                        onClick={() => {
                          const newHotels = [...(hotelsList || []), { name: '', rating: '', dist: '', img: '', mapUrl: '', bookUrl: '' }];
                          setHotelsList(newHotels);
                        }}
                        className="bg-gradient-to-r from-[#C8A96B] to-[#ff8585] text-white shadow-md hover:shadow-[0_4px_15px_rgba(200,169,107,0.35)] hover:-translate-y-0.5 active:translate-y-0 hover:opacity-95 transition-all cursor-pointer px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center hover:bg-[#C8A96B] transition-colors"
                      >
                        <Plus className="w-3 h-3 mr-2" /> Add Hotel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      {hotelsList?.map((hotel, index) => (
                        <div key={index} className="bg-white border border-softgray rounded-xl p-4 relative">
                          <button
                            onClick={() => {
                              const newHotels = [...hotelsList];
                              newHotels.splice(index, 1);
                              setHotelsList(newHotels);
                            }}
                            className="absolute top-4 right-4 text-primary/80 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Hotel Name</label>
                              <input
                                type="text"
                                value={hotel.name}
                                onChange={(e) => {
                                  const newHotels = [...hotelsList];
                                  newHotels[index] = { ...hotel, name: e.target.value };
                                  setHotelsList(newHotels);
                                }}
                                className="w-full border-b border-softgray p-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Rating</label>
                              <input
                                type="text"
                                value={hotel.rating}
                                onChange={(e) => {
                                  const newHotels = [...hotelsList];
                                  newHotels[index] = { ...hotel, rating: e.target.value };
                                  setHotelsList(newHotels);
                                }}
                                placeholder="e.g. 5 Star"
                                className="w-full border-b border-softgray p-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Distance from Venue</label>
                              <input
                                type="text"
                                value={hotel.dist}
                                onChange={(e) => {
                                  const newHotels = [...hotelsList];
                                  newHotels[index] = { ...hotel, dist: e.target.value };
                                  setHotelsList(newHotels);
                                }}
                                placeholder="e.g. 15 mins"
                                className="w-full border-b border-softgray p-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Image URL</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={hotel.img}
                                  onChange={(e) => {
                                    const newHotels = [...hotelsList];
                                    newHotels[index] = { ...hotel, img: e.target.value };
                                    setHotelsList(newHotels);
                                  }}
                                  className="w-full border-b border-softgray p-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                                />
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={async (e) => {
                                    if (e.target.files[0]) {
                                      const url = await uploadImage(e.target.files[0]);
                                      if (url) {
                                        const newHotels = [...hotelsList];
                                        newHotels[index] = { ...hotel, img: url };
                                        setHotelsList(newHotels);
                                      }
                                    }
                                  }}
                                  className="w-24 text-[9px] file:mr-2 file:py-1 file:px-2 file:rounded-xl file:border-0 file:text-[9px] file:font-black file:bg-[#C8A96B] file:text-white hover:file:bg-[#C8A96B] transition-colors cursor-pointer"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Map URL</label>
                              <input
                                type="text"
                                value={hotel.mapUrl}
                                onChange={(e) => {
                                  const newHotels = [...hotelsList];
                                  newHotels[index] = { ...hotel, mapUrl: e.target.value };
                                  setHotelsList(newHotels);
                                }}
                                className="w-full border-b border-softgray p-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                              />
                            </div>

                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeContentTab === 'tourist' && (
                <div className="space-y-8">
                  {/* City Intro Section */}
                  <div className="bg-gray-50 border border-softgray rounded-xl p-6 space-y-6">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">City Introduction</h3>
                      <p className="text-[10px] text-primary/80 uppercase tracking-widest mt-1">Manage the destination overview text</p>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Heading</label>
                        <input
                          type="text"
                          value={cityIntro?.heading || ''}
                          onChange={(e) => setCityIntro({ ...cityIntro, heading: e.target.value })}
                          className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Body Content</label>
                        <RichTextArea
                          value={cityIntro?.body || ''}
                          onChange={(e) => setCityIntro({ ...cityIntro, body: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Travel Tip</label>
                        <input
                          type="text"
                          value={cityIntro?.travelTip || ''}
                          onChange={(e) => setCityIntro({ ...cityIntro, travelTip: e.target.value })}
                          className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Hero Image URL</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={cityIntro?.heroImage || ''}
                            onChange={(e) => setCityIntro({ ...cityIntro, heroImage: e.target.value })}
                            className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                          />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              if (e.target.files[0]) {
                                const url = await uploadImage(e.target.files[0]);
                                if (url) setCityIntro({ ...cityIntro, heroImage: url });
                              }
                            }}
                            className="w-24 text-[9px] file:mr-2 file:py-1 file:px-2 file:rounded-xl file:border-0 file:text-[9px] file:font-black file:bg-[#C8A96B] file:text-white hover:file:bg-[#C8A96B] transition-colors cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tourist Attractions Section */}
                  <div className="bg-gray-50 border border-softgray rounded-xl p-6 space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">Attractions List</h3>
                        <p className="text-[10px] text-primary/80 uppercase tracking-widest mt-1">Manage nearby places to visit</p>
                      </div>
                      <button
                        onClick={() => {
                          const newAttractions = [...(touristAttractions || []), { title: '', desc: '', img: '', distance: '', mapUrl: '' }];
                          setTouristAttractions(newAttractions);
                        }}
                        className="bg-gradient-to-r from-[#C8A96B] to-[#ff8585] text-white shadow-md hover:shadow-[0_4px_15px_rgba(200,169,107,0.35)] hover:-translate-y-0.5 active:translate-y-0 hover:opacity-95 transition-all cursor-pointer px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center hover:bg-[#C8A96B] transition-colors"
                      >
                        <Plus className="w-3 h-3 mr-2" /> Add Attraction
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {touristAttractions?.map((item, index) => (
                        <div key={index} className="bg-white border border-softgray rounded-xl p-4 relative">
                          <button
                            onClick={() => {
                              const newAttractions = [...touristAttractions];
                              newAttractions.splice(index, 1);
                              setTouristAttractions(newAttractions);
                            }}
                            className="absolute top-4 right-4 text-primary/80 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <div className="space-y-4 pr-8 font-sans">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Title</label>
                              <input
                                type="text"
                                value={item.title}
                                onChange={(e) => {
                                  const newAttractions = [...touristAttractions];
                                  newAttractions[index] = { ...item, title: e.target.value };
                                  setTouristAttractions(newAttractions);
                                }}
                                className="w-full border-b border-softgray p-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Description (Rich Text)</label>
                              <RichTextArea
                                value={item.desc}
                                onChange={(e) => {
                                  const newAttractions = [...touristAttractions];
                                  newAttractions[index] = { ...item, desc: e.target.value };
                                  setTouristAttractions(newAttractions);
                                }}
                                placeholder="Write attractive guidelines..."
                                h="h-24"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Image URL</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={item.img}
                                  onChange={(e) => {
                                    const newAttractions = [...touristAttractions];
                                    newAttractions[index] = { ...item, img: e.target.value };
                                    setTouristAttractions(newAttractions);
                                  }}
                                  className="w-full border-b border-softgray p-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                                />
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={async (e) => {
                                    if (e.target.files[0]) {
                                      const url = await uploadImage(e.target.files[0]);
                                      if (url) {
                                        const newAttractions = [...touristAttractions];
                                        newAttractions[index] = { ...item, img: url };
                                        setTouristAttractions(newAttractions);
                                      }
                                    }
                                  }}
                                  className="w-24 text-[9px] file:mr-2 file:py-1 file:px-2 file:rounded-xl file:border-0 file:text-[9px] file:font-black file:bg-[#C8A96B] file:text-white hover:file:bg-[#C8A96B] transition-colors cursor-pointer"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Distance from Venue</label>
                                <input
                                  type="text"
                                  value={item.distance || ''}
                                  onChange={(e) => {
                                    const newAttractions = [...touristAttractions];
                                    newAttractions[index] = { ...item, distance: e.target.value };
                                    setTouristAttractions(newAttractions);
                                  }}
                                  placeholder="e.g. 15 km from ANIDS"
                                  className="w-full border-b border-softgray p-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Map URL</label>
                                <input
                                  type="text"
                                  value={item.mapUrl || ''}
                                  onChange={(e) => {
                                    const newAttractions = [...touristAttractions];
                                    newAttractions[index] = { ...item, mapUrl: e.target.value };
                                    setTouristAttractions(newAttractions);
                                  }}
                                  placeholder="Google Map link"
                                  className="w-full border-b border-softgray p-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeContentTab === 'workshops' && (
                <div className="space-y-8">
                  <div className="bg-gray-50 border border-softgray rounded-xl p-6 space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">Workshops List</h3>
                        <p className="text-[10px] text-primary/80 uppercase tracking-widest mt-1">Manage Preconference Workshops</p>
                      </div>
                      <button
                        onClick={() => {
                          const newWorkshops = [...(workshopsList || []), { id: Date.now(), title: '', mentor: '', seats: '', price: '', time: '', desc: '' }];
                          setWorkshopsList(newWorkshops);
                        }}
                        className="bg-gradient-to-r from-[#C8A96B] to-[#ff8585] text-white shadow-md hover:shadow-[0_4px_15px_rgba(200,169,107,0.35)] hover:-translate-y-0.5 active:translate-y-0 hover:opacity-95 transition-all cursor-pointer px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center hover:bg-[#C8A96B] transition-colors"
                      >
                        <Plus className="w-3 h-3 mr-2" /> Add Workshop
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      {workshopsList?.map((workshop, index) => (
                        <div key={index} className="bg-white border border-softgray rounded-xl p-4 relative">
                          <button
                            onClick={() => {
                              const newWorkshops = [...workshopsList];
                              newWorkshops.splice(index, 1);
                              setWorkshopsList(newWorkshops);
                            }}
                            className="absolute top-4 right-4 text-primary/80 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-8">
                            <div>
                              <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Workshop Title</label>
                              <input
                                type="text"
                                value={workshop.title}
                                onChange={(e) => {
                                  const newWorkshops = [...workshopsList];
                                  newWorkshops[index] = { ...workshop, title: e.target.value };
                                  setWorkshopsList(newWorkshops);
                                }}
                                className="w-full border-b border-softgray p-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Mentor</label>
                              <input
                                type="text"
                                value={workshop.mentor}
                                onChange={(e) => {
                                  const newWorkshops = [...workshopsList];
                                  newWorkshops[index] = { ...workshop, mentor: e.target.value };
                                  setWorkshopsList(newWorkshops);
                                }}
                                className="w-full border-b border-softgray p-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Total Seats</label>
                              <input
                                type="number"
                                value={workshop.seats}
                                onChange={(e) => {
                                  const newWorkshops = [...workshopsList];
                                  newWorkshops[index] = { ...workshop, seats: e.target.value };
                                  setWorkshopsList(newWorkshops);
                                }}
                                className="w-full border-b border-softgray p-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Price</label>
                              <input
                                type="text"
                                value={workshop.price}
                                onChange={(e) => {
                                  const newWorkshops = [...workshopsList];
                                  newWorkshops[index] = { ...workshop, price: e.target.value };
                                  setWorkshopsList(newWorkshops);
                                }}
                                placeholder="e.g. ₹ 1,500"
                                className="w-full border-b border-softgray p-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Time</label>
                              <input
                                type="text"
                                value={workshop.time}
                                onChange={(e) => {
                                  const newWorkshops = [...workshopsList];
                                  newWorkshops[index] = { ...workshop, time: e.target.value };
                                  setWorkshopsList(newWorkshops);
                                }}
                                placeholder="e.g. 09:00 AM – 01:00 PM"
                                className="w-full border-b border-softgray p-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Description</label>
                            <RichTextArea
                              value={workshop.desc}
                              onChange={(e) => {
                                const newWorkshops = [...workshopsList];
                                newWorkshops[index] = { ...workshop, desc: e.target.value };
                                setWorkshopsList(newWorkshops);
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeContentTab === 'trade' && (
                <div className="space-y-8">
                  {/* Sponsorship Tiers */}
                  <div className="bg-gray-50 border border-softgray rounded-xl p-6 space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">Sponsorship Tiers</h3>
                        <p className="text-[10px] text-primary/80 uppercase tracking-widest mt-1">Manage Trade Partners and Costs</p>
                      </div>
                      <button
                        onClick={() => {
                          const newTiers = [...(tradeData?.sponsorshipTiers || []), { name: '', price: '', borderColor: 'border-softgray' }];
                          setTradeData({ ...tradeData, sponsorshipTiers: newTiers });
                        }}
                        className="bg-gradient-to-r from-[#C8A96B] to-[#ff8585] text-white shadow-md hover:shadow-[0_4px_15px_rgba(200,169,107,0.35)] hover:-translate-y-0.5 active:translate-y-0 hover:opacity-95 transition-all cursor-pointer px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center hover:bg-[#C8A96B] transition-colors"
                      >
                        <Plus className="w-3 h-3 mr-2" /> Add Tier
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {tradeData?.sponsorshipTiers?.map((tier, index) => (
                        <div key={index} className="bg-white border border-softgray rounded-xl p-4 relative">
                          <button
                            onClick={() => {
                              const newTiers = [...tradeData.sponsorshipTiers];
                              newTiers.splice(index, 1);
                              setTradeData({ ...tradeData, sponsorshipTiers: newTiers });
                            }}
                            className="absolute top-4 right-4 text-primary/80 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <div className="space-y-4 pr-8">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Tier Name</label>
                              <input
                                type="text"
                                value={tier.name}
                                onChange={(e) => {
                                  const newTiers = [...tradeData.sponsorshipTiers];
                                  newTiers[index] = { ...tier, name: e.target.value };
                                  setTradeData({ ...tradeData, sponsorshipTiers: newTiers });
                                }}
                                className="w-full border-b border-softgray p-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Price</label>
                              <input
                                type="text"
                                value={tier.price}
                                onChange={(e) => {
                                  const newTiers = [...tradeData.sponsorshipTiers];
                                  newTiers[index] = { ...tier, price: e.target.value };
                                  setTradeData({ ...tradeData, sponsorshipTiers: newTiers });
                                }}
                                placeholder="e.g. ₹ 5,00,000"
                                className="w-full border-b border-softgray p-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Border Color Class</label>
                              <select
                                value={tier.borderColor}
                                onChange={(e) => {
                                  const newTiers = [...tradeData.sponsorshipTiers];
                                  newTiers[index] = { ...tier, borderColor: e.target.value };
                                  setTradeData({ ...tradeData, sponsorshipTiers: newTiers });
                                }}
                                className="w-full border border-softgray p-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                              >
                                <option value="border-softgray">Platinum (Gray 200)</option>
                                <option value="border-yellow-500">Gold (Yellow 500)</option>
                                <option value="border-gray-400">Silver (Gray 400)</option>
                                <option value="border-orange-500">Bronze (Orange 500)</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Exhibitor Guidelines */}
                  <div className="bg-gray-50 border border-softgray rounded-xl p-6 space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">Exhibitor Guidelines</h3>
                        <p className="text-[10px] text-primary/80 uppercase tracking-widest mt-1">Rules and stall information list</p>
                      </div>
                      <button
                        onClick={() => {
                          const newGuidelines = [...(tradeData?.exhibitorGuidelines || []), ''];
                          setTradeData({ ...tradeData, exhibitorGuidelines: newGuidelines });
                        }}
                        className="text-[#00A8CC] hover:text-primary text-[10px] font-black uppercase tracking-widest flex items-center"
                      >
                        <Plus className="w-3 h-3 mr-1" /> Add Rule
                      </button>
                    </div>
                    <div className="space-y-3">
                      {tradeData?.exhibitorGuidelines?.map((guideline, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={guideline}
                            onChange={(e) => {
                              const newGuidelines = [...tradeData.exhibitorGuidelines];
                              newGuidelines[index] = e.target.value;
                              setTradeData({ ...tradeData, exhibitorGuidelines: newGuidelines });
                            }}
                            className="w-full flex-1 bg-white border border-softgray p-3 text-[11px] font-medium focus:outline-none focus:border-[#00A8CC]"
                          />
                          <button
                            onClick={() => {
                              const newGuidelines = [...tradeData.exhibitorGuidelines];
                              newGuidelines.splice(index, 1);
                              setTradeData({ ...tradeData, exhibitorGuidelines: newGuidelines });
                            }}
                            className="text-primary/80 hover:text-red-500 p-3 bg-white border border-softgray"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sponsor Form Note */}
                  <div className="bg-gray-50 border border-softgray rounded-xl p-6 space-y-4">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">Sponsor Form Note</h3>
                    </div>
                    <RichTextArea
                      value={tradeData?.sponsorFormNote || ''}
                      onChange={(e) => setTradeData({ ...tradeData, sponsorFormNote: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {activeContentTab === 'tariffs' && (
                <div className="space-y-8">
                  <div className="bg-gray-50 border border-softgray rounded-xl p-6 space-y-6">
                    <div className="flex justify-between items-center border-b border-softgray pb-4">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">Registration Tariffs</h3>
                        <p className="text-[10px] text-primary/80 uppercase tracking-widest mt-1">Manage Pricing Tiers, Benefits and Category Costs</p>
                      </div>
                      <button
                        onClick={() => {
                          const newTiers = [...tariffs, {
                            id: 'tier-' + Date.now(),
                            name: "New Package",
                            includes: "Benefits & Perks included",
                            benefits: ["Benefit 1"],
                            pricing: [
                              { category: "Student Members", earlyBird: 8000, standard: 9000, spot: 10000 },
                              { category: "Life Members", earlyBird: 9000, standard: 10000, spot: 11000 },
                              { category: "Non-Members", earlyBird: 11000, standard: 12000, spot: 13000 }
                            ]
                          }];
                          setTariffs(newTiers);
                        }}
                        className="bg-gradient-to-r from-[#C8A96B] to-[#ff8585] text-white shadow-md hover:shadow-[0_4px_15px_rgba(200,169,107,0.35)] hover:-translate-y-0.5 active:translate-y-0 hover:opacity-95 transition-all cursor-pointer px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center hover:bg-[#C8A96B] transition-colors"
                      >
                        <Plus className="w-3 h-3 mr-2" /> Add Package Tier
                      </button>
                    </div>

                    <div className="space-y-8">
                      {tariffs?.map((tierObj, tierIndex) => (
                        <div key={tierObj.id || tierIndex} className="bg-white border border-softgray rounded-2xl p-6 relative shadow-sm hover:shadow-md transition-all duration-300">
                          <button
                            onClick={() => {
                              const newTiers = [...tariffs];
                              newTiers.splice(tierIndex, 1);
                              setTariffs(newTiers);
                            }}
                            className="absolute top-6 right-6 text-primary/80 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <div className="space-y-6 font-sans">
                            {/* Tier Main Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Tier Name</label>
                                <input
                                  type="text"
                                  value={tierObj.name || ''}
                                  onChange={(e) => {
                                    const newTiers = [...tariffs];
                                    newTiers[tierIndex] = { ...tierObj, name: e.target.value };
                                    setTariffs(newTiers);
                                  }}
                                  className="w-full border-b border-softgray p-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Includes Description</label>
                                <input
                                  type="text"
                                  value={tierObj.includes || ''}
                                  onChange={(e) => {
                                    const newTiers = [...tariffs];
                                    newTiers[tierIndex] = { ...tierObj, includes: e.target.value };
                                    setTariffs(newTiers);
                                  }}
                                  className="w-full border-b border-softgray p-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                                />
                              </div>
                            </div>

                            {/* Benefits Management */}
                            <div className="pt-4 border-t border-softgray space-y-3">
                              <div className="flex justify-between items-center">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/80">Included Benefits & Items</h4>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newTiers = [...tariffs];
                                    const newBenefits = [...(tierObj.benefits || []), "New Benefit Item"];
                                    newTiers[tierIndex] = { ...tierObj, benefits: newBenefits };
                                    setTariffs(newTiers);
                                  }}
                                  className="text-[9px] font-black uppercase text-[#00A8CC] hover:text-[#C8A96B] transition-colors cursor-pointer"
                                >
                                  + Add Benefit
                                </button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {tierObj.benefits?.map((benefit, benIndex) => (
                                  <div key={benIndex} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                                    <input
                                      type="text"
                                      value={benefit}
                                      onChange={(e) => {
                                        const newTiers = [...tariffs];
                                        const newBenefits = [...tierObj.benefits];
                                        newBenefits[benIndex] = e.target.value;
                                        newTiers[tierIndex] = { ...tierObj, benefits: newBenefits };
                                        setTariffs(newTiers);
                                      }}
                                      className="w-full bg-transparent text-xs font-semibold text-gray-800 focus:outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newTiers = [...tariffs];
                                        const newBenefits = [...tierObj.benefits];
                                        newBenefits.splice(benIndex, 1);
                                        newTiers[tierIndex] = { ...tierObj, benefits: newBenefits };
                                        setTariffs(newTiers);
                                      }}
                                      className="text-slate-400 hover:text-red-500 cursor-pointer"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Categories and Pricing grid */}
                            <div className="pt-4 border-t border-softgray space-y-3">
                              <div className="flex justify-between items-center">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/80">Category Rates & Costs</h4>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newTiers = [...tariffs];
                                    const newPricing = [...(tierObj.pricing || []), { category: "New Category", earlyBird: 8000, standard: 9000, spot: 10000 }];
                                    newTiers[tierIndex] = { ...tierObj, pricing: newPricing };
                                    setTariffs(newTiers);
                                  }}
                                  className="text-[9px] font-black uppercase text-[#00A8CC] hover:text-[#C8A96B] transition-colors cursor-pointer"
                                >
                                  + Add Category Rate
                                </button>
                              </div>
                              <div className="space-y-3">
                                {tierObj.pricing?.map((row, rowIndex) => (
                                  <div key={rowIndex} className="border border-softgray rounded-xl p-3 bg-slate-50 flex flex-col md:flex-row items-stretch md:items-center gap-3 relative pr-10">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newTiers = [...tariffs];
                                        const newPricing = [...tierObj.pricing];
                                        newPricing.splice(rowIndex, 1);
                                        newTiers[tierIndex] = { ...tierObj, pricing: newPricing };
                                        setTariffs(newTiers);
                                      }}
                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>

                                    <div className="flex-1 space-y-1">
                                      <label className="text-[8px] font-black uppercase text-slate-400 block">Category Label</label>
                                      <input
                                        type="text"
                                        value={row.category || ''}
                                        onChange={(e) => {
                                          const newTiers = [...tariffs];
                                          const newPricing = [...tierObj.pricing];
                                          newPricing[rowIndex] = { ...row, category: e.target.value };
                                          newTiers[tierIndex] = { ...tierObj, pricing: newPricing };
                                          setTariffs(newTiers);
                                        }}
                                        className="w-full bg-white border border-softgray rounded-lg p-2 text-xs font-bold text-gray-800 focus:outline-none"
                                        placeholder="e.g. PG Student"
                                      />
                                    </div>
                                    <div className="w-full md:w-28 space-y-1">
                                      <label className="text-[8px] font-black uppercase text-slate-400 block">Early Bird (₹)</label>
                                      <input
                                        type="number"
                                        value={row.earlyBird || ''}
                                        onChange={(e) => {
                                          const newTiers = [...tariffs];
                                          const newPricing = [...tierObj.pricing];
                                          newPricing[rowIndex] = { ...row, earlyBird: Number(e.target.value) };
                                          newTiers[tierIndex] = { ...tierObj, pricing: newPricing };
                                          setTariffs(newTiers);
                                        }}
                                        className="w-full bg-white border border-softgray rounded-lg p-2 text-xs font-bold text-gray-800 focus:outline-none"
                                      />
                                    </div>
                                    <div className="w-full md:w-28 space-y-1">
                                      <label className="text-[8px] font-black uppercase text-slate-400 block">Standard (₹)</label>
                                      <input
                                        type="number"
                                        value={row.standard || ''}
                                        onChange={(e) => {
                                          const newTiers = [...tariffs];
                                          const newPricing = [...tierObj.pricing];
                                          newPricing[rowIndex] = { ...row, standard: Number(e.target.value) };
                                          newTiers[tierIndex] = { ...tierObj, pricing: newPricing };
                                          setTariffs(newTiers);
                                        }}
                                        className="w-full bg-white border border-softgray rounded-lg p-2 text-xs font-bold text-gray-800 focus:outline-none"
                                      />
                                    </div>
                                    <div className="w-full md:w-28 space-y-1">
                                      <label className="text-[8px] font-black uppercase text-slate-400 block">Spot (₹)</label>
                                      <input
                                        type="number"
                                        value={row.spot || ''}
                                        onChange={(e) => {
                                          const newTiers = [...tariffs];
                                          const newPricing = [...tierObj.pricing];
                                          newPricing[rowIndex] = { ...row, spot: Number(e.target.value) };
                                          newTiers[tierIndex] = { ...tierObj, pricing: newPricing };
                                          setTariffs(newTiers);
                                        }}
                                        className="w-full bg-white border border-softgray rounded-lg p-2 text-xs font-bold text-gray-800 focus:outline-none"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeContentTab === 'tc' && (
                <div className="space-y-4">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-primary/80">Terms & Conditions Document (Rich Text)</label>
                  <RichTextArea
                    value={termsConditions}
                    onChange={(e) => setTermsConditions(e.target.value)}
                    h="h-60"
                  />
                  <p className="text-[9px] font-black uppercase tracking-widest text-green-600">✓ Auto-saves to client components</p>
                </div>
              )}

              {activeContentTab === 'privacy' && (
                <div className="space-y-4">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-primary/80">Privacy Policy Document (Rich Text)</label>
                  <RichTextArea
                    value={privacyPolicy}
                    onChange={(e) => setPrivacyPolicy(e.target.value)}
                    h="h-60"
                  />
                  <p className="text-[9px] font-black uppercase tracking-widest text-green-600">✓ Auto-saves to client components</p>
                </div>
              )}

              {activeContentTab === 'refund-policy' && (
                <div className="space-y-8">
                  <div className="bg-gray-50 border border-softgray rounded-xl p-6 space-y-6">
                    <div className="flex justify-between items-center border-b border-softgray pb-4">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">Refund Policy Timeline</h3>
                        <p className="text-[10px] text-primary/80 uppercase tracking-widest mt-1">Manage cancellation timeline dates and corresponding refund eligibility rates</p>
                      </div>
                      <button
                        onClick={() => {
                          const newTimeline = [...(refundPolicy?.timeline || []), { date: 'New Date/Timeline Range', eligibility: '50% of the registration fee' }];
                          setRefundPolicy({ ...refundPolicy, timeline: newTimeline });
                        }}
                        className="bg-[#C8A96B] hover:bg-[#14213D] text-white hover:text-accent shadow-md hover:shadow-[0_4px_15px_rgba(200,169,107,0.35)] hover:-translate-y-0.5 active:translate-y-0 hover:opacity-95 transition-all cursor-pointer px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center transition-colors"
                      >
                        <Plus className="w-3 h-3 mr-2" /> Add Timeline Row
                      </button>
                    </div>

                    <div className="space-y-4">
                      {refundPolicy?.timeline?.map((row, index) => (
                        <div key={index} className="flex gap-4 items-center bg-white p-4 border border-softgray rounded-xl relative shadow-sm">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Cancellation Date / Range</label>
                              <input
                                type="text"
                                value={row.date}
                                onChange={(e) => {
                                  const newTimeline = [...refundPolicy.timeline];
                                  newTimeline[index] = { ...row, date: e.target.value };
                                  setRefundPolicy({ ...refundPolicy, timeline: newTimeline });
                                }}
                                className="w-full border-b border-softgray p-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                                placeholder="e.g., On or before October 5, 2026"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Refund Eligibility Rate</label>
                              <input
                                type="text"
                                value={row.eligibility}
                                onChange={(e) => {
                                  const newTimeline = [...refundPolicy.timeline];
                                  newTimeline[index] = { ...row, eligibility: e.target.value };
                                  setRefundPolicy({ ...refundPolicy, timeline: newTimeline });
                                }}
                                className="w-full border-b border-softgray p-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                                placeholder="e.g., 50% of the registration fee"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const newTimeline = [...refundPolicy.timeline];
                              newTimeline.splice(index, 1);
                              setRefundPolicy({ ...refundPolicy, timeline: newTimeline });
                            }}
                            className="text-primary/80 hover:text-red-500 transition-colors mt-4 self-center cursor-pointer"
                            title="Delete Row"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-softgray rounded-xl p-6 space-y-6">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">Refund Terms & Conditions</h3>
                      <p className="text-[10px] text-primary/80 uppercase tracking-widest mt-1">Specify additional terms, rules, and guidelines for cancellations (one per line)</p>
                    </div>

                    <textarea
                      value={refundPolicy?.terms?.join('\n') || ''}
                      onChange={(e) => {
                        const lines = e.target.value.split('\n');
                        setRefundPolicy({ ...refundPolicy, terms: lines });
                      }}
                      className="w-full bg-white border border-softgray rounded-xl p-4 text-xs text-primary focus:outline-none focus:border-[#00A8CC] h-64 leading-relaxed"
                      placeholder="Enter each rule / guideline item on a new line..."
                    />
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-green-600">✓ Auto-saves to MySQL database and client pages</p>
                </div>
              )}

              {activeContentTab === 'pages-status' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 border border-softgray rounded-xl p-6 space-y-6">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">Dynamic Page Accessibility Manager</h3>
                      <p className="text-[10px] text-primary/80 uppercase tracking-widest mt-1">Activate pages for public viewing or temporarily direct them to the Under Construction page</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: '/about', label: 'About Us', desc: 'About Visakhapatnam & introductory notes.' },
                        { key: '/committees', label: 'Organizing Committee', desc: 'List of organizing members & leaders.' },
                        { key: '/venue', label: 'Venue & Accommodation', desc: 'ANIDS campus maps, details & hotel list.' },
                        { key: '/tourist', label: 'Tourist Attractions', desc: 'Guide to local sights & sightseeing spots.' },
                        { key: '/registration-guidelines', label: 'Registration Guidelines', desc: 'Guidelines and criteria for registrations.' },
                        { key: '/registration', label: 'Registration & Pricing', desc: 'Pricing packages, category tariffs & checkout.' },
                        { key: '/scientific', label: 'Scientific Details', desc: 'Abstract rules, academic criteria & program notes.' },
                        { key: '/schedules', label: 'Event Schedules', desc: 'Tentative daily agendas and presentation times.' },
                        { key: '/submissions', label: 'Abstract Submissions', desc: 'Delegate scientific abstract upload forms.' },
                        { key: '/workshops', label: 'Preconference Workshops', desc: 'Mentor-led specialized Masterclass details.' },
                        { key: '/trade', label: 'Trade & Sponsors', desc: 'Trade guidelines, stalls layout and sponsorship form.' },
                        { key: '/contact', label: 'Contact Details', desc: 'Direct desk coordinates & phone details.' }
                      ].map((item) => {
                        const isEnabled = !disabledPages?.[item.key];
                        return (
                          <div
                            key={item.key}
                            className={`p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 shadow-sm hover:shadow-md ${isEnabled
                              ? 'bg-white border-green-200'
                              : 'bg-slate-50 border-amber-200'
                              }`}
                          >
                            <div className="space-y-1 select-none font-sans">
                              <h4 className="text-xs font-black uppercase tracking-tight text-gray-800 flex items-center gap-2">
                                {item.label}
                                <span className={`inline-block w-1.5 h-1.5 rounded-full ${isEnabled ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}></span>
                              </h4>
                              <p className="text-[10px] text-slate-500 leading-normal uppercase tracking-wider font-semibold">{item.desc}</p>
                              <span className="inline-block text-[9px] font-black uppercase text-slate-400 tracking-wider">Route: {item.key}</span>
                            </div>

                            {/* Premium styled toggle / Checkbox */}
                            <label className="relative inline-flex items-center cursor-pointer shrink-0 font-sans">
                              <input
                                type="checkbox"
                                checked={isEnabled}
                                onChange={(e) => {
                                  const updated = { ...disabledPages };
                                  updated[item.key] = !e.target.checked; // disabled = !checked
                                  // Synchronously toggle related registration-form path
                                  if (item.key === '/registration') {
                                    updated['/registration-form'] = !e.target.checked;
                                  }
                                  setDisabledPages(updated);
                                }}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C8A96B]"></div>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-green-600">✓ Changes save instantly and globally redirect deactivated pages</p>
                </div>
              )}
            </section>
          )}

          {/* Admin Footer */}
          <footer className="mt-16 pt-6 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <p>
              &copy; {new Date().getFullYear()} NATCON Admin Control Room. All Rights Reserved.
            </p>
            <p className="flex items-center gap-1.5">
              <span>Developed by</span>
              <a
                href="https://www.ambidexsoft.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C8A96B] hover:text-[#00A8CC] transition-colors underline font-bold"
              >
                Ambidex Software Solutions
              </a>
            </p>
          </footer>
        </div>
      </main>

      {/* Dynamic Edit Modal Overlay */}
      {editId && (
        <div className="fixed inset-0 bg-[#C8A96B]/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl relative">
            <button
              onClick={closeEditModal}
              className="absolute top-6 right-6 text-primary/80 hover:text-primary font-black uppercase text-[10px] tracking-widest cursor-pointer"
            >
              Close
            </button>
            <div className="border-b border-softgray pb-4 mb-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#00A8CC]">Edit Settings</span>
              <h3 className="text-xl font-black uppercase tracking-tighter text-gray-900 mt-1">Update {editType}</h3>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-5">
              {editType === 'schedule' && (
                <div className="space-y-4 font-bold">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Day Number</label>
                      <select
                        value={editSchedDay}
                        onChange={(e) => setEditSchedDay(Number(e.target.value))}
                        className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                      >
                        <option value={1}>Day 1</option>
                        <option value={2}>Day 2</option>
                        <option value={3}>Day 3</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Time Slot</label>
                      <input
                        type="text"
                        value={editSchedTime}
                        onChange={(e) => setEditSchedTime(e.target.value)}
                        placeholder="e.g. 09:30 AM"
                        className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Title</label>
                    <input
                      type="text"
                      value={editSchedTitle}
                      onChange={(e) => setEditSchedTitle(e.target.value)}
                      placeholder="Event Title"
                      className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Speaker Name</label>
                      <input
                        type="text"
                        value={editSchedSpeaker}
                        onChange={(e) => setEditSchedSpeaker(e.target.value)}
                        placeholder="Dr. Speaker"
                        className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Venue</label>
                      <input
                        type="text"
                        value={editSchedVenue}
                        onChange={(e) => setEditSchedVenue(e.target.value)}
                        placeholder="e.g. Main Lobby"
                        className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {editType === 'sponsor' && (
                <div className="space-y-4 font-bold">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Sponsor Name</label>
                      <input
                        type="text"
                        value={editSponName}
                        onChange={(e) => setEditSponName(e.target.value)}
                        placeholder="e.g. Colgate"
                        className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Sponsor Tier</label>
                      <select
                        value={editSponTier}
                        onChange={(e) => setEditSponTier(e.target.value)}
                        className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                      >
                        <option value="Platinum">Platinum</option>
                        <option value="Gold">Gold</option>
                        <option value="Silver">Silver</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Display Order</label>
                      <input
                        type="number"
                        value={editSponOrder}
                        onChange={(e) => setEditSponOrder(Number(e.target.value))}
                        className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Logo Image File</label>
                      <div className="flex items-center space-x-2 w-full bg-white border border-softgray rounded-xl p-2 text-xs font-bold text-gray-800 focus-within:border-[#00A8CC]">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEditSponsorLogoChange}
                          className="w-full text-xs text-black-300 file:mr-2 file:py-1 file:px-2 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-gray-100 file:text-[#00A8CC] hover:file:bg-gray-200"
                        />
                        {isEditSponUploading && <span className="text-[9px] uppercase font-bold text-primary/80 shrink-0">Uploading...</span>}
                        {editSponLogo && !isEditSponUploading && (
                          <img src={editSponLogo} className="h-6 w-10 object-contain border border-softgray p-0.5 shrink-0 bg-white" alt="" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {editType === 'announcement' && (
                <div className="space-y-4 font-bold">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Announcement Title</label>
                    <input
                      type="text"
                      value={editAnnTitle}
                      onChange={(e) => setEditAnnTitle(e.target.value)}
                      placeholder="Title"
                      className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Content Detail</label>
                    <RichTextArea
                      value={editAnnContent}
                      onChange={(e) => setEditAnnContent(e.target.value)}
                      placeholder="Content Details"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Redirect Link / URL (Optional)</label>
                      <input
                        type="text"
                        value={editAnnLinkUrl}
                        onChange={(e) => setEditAnnLinkUrl(e.target.value)}
                        placeholder="e.g. https://www.website.com/info"
                        className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Upload PDF Document (Optional)</label>
                      <div className="flex items-center space-x-2 w-full bg-white border border-softgray rounded-xl p-2 text-xs font-bold text-gray-800 focus-within:border-[#00A8CC]">
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={handleEditAnnPdfChange}
                          className="w-full text-xs text-black-300 file:mr-2 file:py-1 file:px-2 file:rounded-xl file:border-0 file:text-[9px] file:font-black file:bg-[#C8A96B] file:text-white hover:file:bg-[#14213D] hover:file:text-accent transition-all cursor-pointer font-sans"
                        />
                        {isEditAnnUploading && <span className="text-[9px] uppercase font-black text-[#00A8CC] shrink-0 animate-pulse font-sans">Uploading...</span>}
                        {editAnnPdfUrl && !isEditAnnUploading && (
                          <span className="text-[8px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-black uppercase tracking-widest shrink-0 font-sans">✓ Uploaded</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="editAnnIsActive"
                      checked={editAnnIsActive}
                      onChange={(e) => setEditAnnIsActive(e.target.checked)}
                      className="w-4 h-4 text-[#00A8CC] border-softgray rounded focus:ring-[#00A8CC] cursor-pointer"
                    />
                    <label htmlFor="editAnnIsActive" className="text-xs font-black uppercase tracking-wider text-gray-800 cursor-pointer select-none">
                      Enable Announcement (Active Ticker Alert)
                    </label>
                  </div>
                </div>
              )}

              {editType === 'gallery' && (
                <div className="space-y-4 font-bold">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Media Title</label>
                      <input
                        type="text"
                        value={editGalTitle}
                        onChange={(e) => setEditGalTitle(e.target.value)}
                        placeholder="Media Title"
                        className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Category</label>
                      <select
                        value={editGalCat}
                        onChange={(e) => setEditGalCat(e.target.value)}
                        className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                      >
                        <option value="Venue">Venue</option>
                        <option value="Vizag">Vizag Attractions</option>
                        <option value="Event">Event Highlights</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Media Type</label>
                      <select
                        value={editGalType}
                        onChange={(e) => setEditGalType(e.target.value)}
                        className="w-full bg-white border border-softgray rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00A8CC]"
                      >
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Media File</label>
                      <div className="flex items-center space-x-2 w-full bg-white border border-softgray rounded-xl p-2 text-xs font-bold text-gray-800 focus-within:border-[#00A8CC]">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEditGalleryMediaChange}
                          className="w-full text-xs text-black-300 file:mr-2 file:py-1 file:px-2 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-gray-100 file:text-[#00A8CC] hover:file:bg-gray-200"
                        />
                        {isEditGalUploading && <span className="text-[9px] uppercase font-bold text-primary/80 shrink-0">Uploading...</span>}
                        {editGalUrl && !isEditGalUploading && (
                          <img src={editGalUrl} className="h-6 w-10 object-contain border border-softgray p-0.5 shrink-0 bg-white" alt="" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isEditSponUploading || isEditGalUploading}
                className="w-full bg-[#C8A96B] hover:bg-gradient-to-r from-[#C8A96B] to-[#ff8585] text-white shadow-md hover:shadow-[0_4px_15px_rgba(200,169,107,0.35)] hover:-translate-y-0.5 active:translate-y-0 hover:opacity-95 transition-all cursor-pointer py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed mt-4 cursor-pointer"
              >
                {isEditSponUploading || isEditGalUploading ? 'Uploading Image...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View Registration Modal */}
      {selectedReg && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-softgray flex justify-between items-center bg-gray-50 sticky top-0 z-10">
              <h2 className="text-sm font-black uppercase tracking-[4px]">Delegate Profile: {selectedReg.id}</h2>
              <button onClick={() => setSelectedReg(null)} className="text-primary/80 hover:text-red-500 font-bold text-xl">×</button>
            </div>
            <div className="p-8 space-y-8">
              <div className="flex items-center gap-6 pb-6 border-b border-softgray">
                <img src={selectedReg.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedReg.fullName || 'User')}&background=002147&color=fff`} className="w-24 h-24 rounded-xl object-cover border-4 border-gray-50 shadow-sm" alt="Profile" />
                <div>
                  <h3 className="text-2xl font-black text-gray-900">{selectedReg.fullName}</h3>
                  <p className="text-xs font-bold text-black-300 uppercase tracking-widest">{selectedReg.designation} • {selectedReg.institution}</p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${selectedReg.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {selectedReg.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 text-sm">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-primary/80 mb-1">Contact Info</p>
                  <p className="font-bold text-gray-800">{selectedReg.email}</p>
                  <p className="font-bold text-gray-800">{selectedReg.mobile}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-primary/80 mb-1">Demographics</p>
                  <p className="font-bold text-gray-800">{selectedReg.gender || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-primary/80 mb-1">Registration Category</p>
                  <p className="font-bold text-gray-800">{selectedReg.category}</p>
                  <p className="font-bold text-gray-800">Tier: {selectedReg.tier}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-primary/80 mb-1">Professional Details</p>
                  <p className="font-bold text-gray-800">Council Reg: {selectedReg.councilRegNo || 'N/A'}</p>
                  <p className="font-bold text-gray-800">IAPHD No: {selectedReg.iaphdNo || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-[10px] font-black uppercase tracking-wider text-primary/80 mb-1">Address</p>
                  <p className="font-bold text-gray-800">{selectedReg.address}, {selectedReg.state} - {selectedReg.pincode}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-primary/80 mb-1">Preferences</p>
                  <p className="font-bold text-gray-800">Food: {selectedReg.foodPreference || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-primary/80 mb-1">Accompanying Person</p>
                  {selectedReg.hasAccompanying === 'yes' ? (
                    <p className="font-bold text-gray-800">{selectedReg.accompanyingName} ({selectedReg.accompanyingCount}) - Food: {selectedReg.accompanyingFood}</p>
                  ) : (
                    <p className="font-bold text-gray-800">None</p>
                  )}
                </div>
                <div className="md:col-span-2 p-4 bg-gray-50 rounded-xl border border-softgray">
                  <p className="text-[10px] font-black uppercase tracking-wider text-primary/80 mb-2">Payment Details</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-black-300">Transaction ID: <span className="text-gray-900">{selectedReg.transactionId || 'N/A'}</span></p>
                      <p className="text-xs font-bold text-black-300">Date: <span className="text-gray-900">{selectedReg.paymentDate || 'N/A'}</span></p>
                      {selectedReg.paymentScreenshot && (
                        <p className="text-xs font-bold text-black-300 mt-1">
                          Proof: <a href={selectedReg.paymentScreenshot} target="_blank" rel="noopener noreferrer" className="text-[#00A8CC] hover:underline inline-flex items-center gap-1 font-bold">
                            View Receipt Screenshot ↗
                          </a>
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-[#00A8CC]">₹{selectedReg.amountPaid || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-softgray pt-6">
                <h4 className="text-[10px] font-black uppercase tracking-[2px] text-primary/80 mb-4">Complete Registration Record</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6 text-sm bg-gray-50 p-6 rounded-xl border border-softgray">
                  {Object.entries(selectedReg).map(([key, value]) => {
                    if (key === 'profilePic') return null;
                    return (
                      <div key={key} className="break-words">
                        <p className="text-[9px] font-black uppercase tracking-wider text-primary/80 mb-0.5">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                        <p className="font-bold text-gray-800 text-xs">{(value !== null && value !== undefined && value !== '') ? value.toString() : <span className="text-primary/80 italic">Empty</span>}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-softgray gap-4">
                {selectedReg.status !== 'CONFIRMED' && (
                  <button
                    onClick={async () => {
                      const res = await approveRegistration(selectedReg.id);
                      if (res && res.success) {
                        setSelectedReg({ ...selectedReg, id: res.newId || selectedReg.id, status: 'CONFIRMED' });
                      }
                    }}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-colors"
                  >
                    Verify & Confirm
                  </button>
                )}
                <button
                  onClick={() => setSelectedReg(null)}
                  className="px-6 py-3 bg-gradient-to-r from-[#C8A96B] to-[#ff8585] text-white shadow-md hover:shadow-[0_4px_15px_rgba(200,169,107,0.35)] hover:-translate-y-0.5 active:translate-y-0 hover:opacity-95 transition-all cursor-pointer rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#C8A96B] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Registration Modal */}
      {editingReg && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-softgray flex justify-between items-center bg-gray-50 sticky top-0 z-10">
              <h2 className="text-sm font-black uppercase tracking-[4px]">Edit Registration: {editingReg.id}</h2>
              <button onClick={() => setEditingReg(null)} className="text-primary/80 hover:text-red-500 font-bold text-xl">×</button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2 md:col-span-3">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Profile Picture</label>
                  <div className="flex items-center gap-4">
                    <img src={editingReg.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(editingReg.fullName || 'User')}&background=002147&color=fff`} className="w-16 h-16 rounded-xl object-cover border border-softgray" alt="Profile" />
                    <input type="file" accept="image/*" onChange={async (e) => {
                      if (e.target.files[0]) {
                        const url = await uploadImage(e.target.files[0]);
                        if (url) setEditingReg({ ...editingReg, profilePic: url });
                      }
                    }} className="text-xs" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Full Name</label>
                  <input type="text" value={editingReg.fullName || ''} onChange={(e) => setEditingReg({ ...editingReg, fullName: e.target.value })} className="w-full bg-gray-50 border border-softgray rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#00A8CC]" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Email</label>
                  <input type="email" value={editingReg.email || ''} onChange={(e) => setEditingReg({ ...editingReg, email: e.target.value })} className="w-full bg-gray-50 border border-softgray rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#00A8CC]" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Mobile</label>
                  <input type="text" value={editingReg.mobile || ''} onChange={(e) => setEditingReg({ ...editingReg, mobile: e.target.value })} className="w-full bg-gray-50 border border-softgray rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#00A8CC]" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Gender</label>
                  <select value={editingReg.gender || ''} onChange={(e) => setEditingReg({ ...editingReg, gender: e.target.value })} className="w-full bg-gray-50 border border-softgray rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#00A8CC]">
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Institution</label>
                  <input type="text" value={editingReg.institution || ''} onChange={(e) => setEditingReg({ ...editingReg, institution: e.target.value })} className="w-full bg-gray-50 border border-softgray rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#00A8CC]" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Designation</label>
                  <input type="text" value={editingReg.designation || ''} onChange={(e) => setEditingReg({ ...editingReg, designation: e.target.value })} className="w-full bg-gray-50 border border-softgray rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#00A8CC]" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Council Reg No</label>
                  <input type="text" value={editingReg.councilRegNo || ''} onChange={(e) => setEditingReg({ ...editingReg, councilRegNo: e.target.value })} className="w-full bg-gray-50 border border-softgray rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#00A8CC]" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Address</label>
                  <input type="text" value={editingReg.address || ''} onChange={(e) => setEditingReg({ ...editingReg, address: e.target.value })} className="w-full bg-gray-50 border border-softgray rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#00A8CC]" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black-300">State</label>
                  <input type="text" value={editingReg.state || ''} onChange={(e) => setEditingReg({ ...editingReg, state: e.target.value })} className="w-full bg-gray-50 border border-softgray rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#00A8CC]" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Pincode</label>
                  <input type="text" value={editingReg.pincode || ''} onChange={(e) => setEditingReg({ ...editingReg, pincode: e.target.value })} className="w-full bg-gray-50 border border-softgray rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#00A8CC]" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Category</label>
                  <select value={editingReg.category || ''} onChange={(e) => setEditingReg({ ...editingReg, category: e.target.value })} className="w-full bg-gray-50 border border-softgray rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#00A8CC]">
                    <option value="Faculty">Faculty</option>
                    <option value="Post Graduate">Post Graduate</option>
                    <option value="Clinical Practitioner">Clinical Practitioner</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black-300">IAPHD No</label>
                  <input type="text" value={editingReg.iaphdNo || ''} onChange={(e) => setEditingReg({ ...editingReg, iaphdNo: e.target.value })} className="w-full bg-gray-50 border border-softgray rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#00A8CC]" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Tier</label>
                  <select value={editingReg.tier || ''} onChange={(e) => setEditingReg({ ...editingReg, tier: e.target.value })} className="w-full bg-gray-50 border border-softgray rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#00A8CC]">
                    <option value="classic">Classic</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Food Preference</label>
                  <select value={editingReg.foodPreference || ''} onChange={(e) => setEditingReg({ ...editingReg, foodPreference: e.target.value })} className="w-full bg-gray-50 border border-softgray rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#00A8CC]">
                    <option value="">Select...</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Has Accompanying?</label>
                  <select value={editingReg.hasAccompanying || 'no'} onChange={(e) => setEditingReg({ ...editingReg, hasAccompanying: e.target.value })} className="w-full bg-gray-50 border border-softgray rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#00A8CC]">
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Accompanying Name</label>
                  <input type="text" value={editingReg.accompanyingName || ''} onChange={(e) => setEditingReg({ ...editingReg, accompanyingName: e.target.value })} disabled={editingReg.hasAccompanying !== 'yes'} className="w-full bg-gray-50 border border-softgray rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#00A8CC] disabled:opacity-50" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Accompanying Count</label>
                  <input type="number" value={editingReg.accompanyingCount || ''} onChange={(e) => setEditingReg({ ...editingReg, accompanyingCount: e.target.value })} disabled={editingReg.hasAccompanying !== 'yes'} className="w-full bg-gray-50 border border-softgray rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#00A8CC] disabled:opacity-50" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Accompanying Food</label>
                  <input type="text" value={editingReg.accompanyingFood || ''} onChange={(e) => setEditingReg({ ...editingReg, accompanyingFood: e.target.value })} disabled={editingReg.hasAccompanying !== 'yes'} className="w-full bg-gray-50 border border-softgray rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#00A8CC] disabled:opacity-50" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Transaction ID</label>
                  <input type="text" readOnly value={editingReg.transactionId || ''} onChange={(e) => setEditingReg({ ...editingReg, transactionId: e.target.value })} className="w-full bg-gray-50 border border-softgray rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#00A8CC]" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Payment Date</label>
                  <input type="date" value={editingReg.paymentDate || ''} onChange={(e) => setEditingReg({ ...editingReg, paymentDate: e.target.value })} className="w-full bg-gray-50 border border-softgray rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#00A8CC]" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Amount Paid</label>
                  <input type="number" value={editingReg.amountPaid || 0} onChange={(e) => setEditingReg({ ...editingReg, amountPaid: e.target.value })} className="w-full bg-gray-50 border border-softgray rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#00A8CC]" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Status</label>
                  <select value={editingReg.status || ''} onChange={(e) => setEditingReg({ ...editingReg, status: e.target.value })} className="w-full bg-gray-50 border border-softgray rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#00A8CC]">
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-4 pt-6 border-t border-softgray">
                <button
                  onClick={() => setEditingReg(null)}
                  className="px-6 py-3 bg-gray-100 text-primary/80 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    updateRegistration(editingReg.id, editingReg);
                    setEditingReg(null);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-[#C8A96B] to-[#ff8585] text-white shadow-md hover:shadow-[0_4px_15px_rgba(200,169,107,0.35)] hover:-translate-y-0.5 active:translate-y-0 hover:opacity-95 transition-all cursor-pointer rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#C8A96B] transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Create Offline Registration Modal */}
      {creatingOfflineReg && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-softgray flex justify-between items-center bg-gray-50 sticky top-0 z-10">
              <h2 className="text-sm font-black uppercase tracking-[4px]">New Offline Registration</h2>
              <button onClick={() => setCreatingOfflineReg(false)} className="text-primary/80 hover:text-red-500 font-bold text-xl">×</button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Full Name *</label>
                  <input type="text" value={offlineRegForm.fullName || ''} onChange={(e) => setOfflineRegForm({ ...offlineRegForm, fullName: e.target.value })} className="w-full bg-gray-50 border border-softgray rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#00A8CC]" placeholder="Dr. Name Surname" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Email *</label>
                  <input type="email" value={offlineRegForm.email || ''} onChange={(e) => setOfflineRegForm({ ...offlineRegForm, email: e.target.value })} className="w-full bg-gray-50 border border-softgray rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#00A8CC]" placeholder="email@address.com" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Mobile *</label>
                  <input type="text" value={offlineRegForm.mobile || ''} onChange={(e) => setOfflineRegForm({ ...offlineRegForm, mobile: e.target.value })} className="w-full bg-gray-50 border border-softgray rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#00A8CC]" placeholder="Phone number" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Gender</label>
                  <select value={offlineRegForm.gender || ''} onChange={(e) => setOfflineRegForm({ ...offlineRegForm, gender: e.target.value })} className="w-full bg-gray-50 border border-softgray rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#00A8CC]">
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Institution</label>
                  <input type="text" value={offlineRegForm.institution || ''} onChange={(e) => setOfflineRegForm({ ...offlineRegForm, institution: e.target.value })} className="w-full bg-gray-50 border border-softgray rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#00A8CC]" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Designation</label>
                  <input type="text" value={offlineRegForm.designation || ''} onChange={(e) => setOfflineRegForm({ ...offlineRegForm, designation: e.target.value })} className="w-full bg-gray-50 border border-softgray rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#00A8CC]" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Council Reg No</label>
                  <input type="text" value={offlineRegForm.councilRegNo || ''} onChange={(e) => setOfflineRegForm({ ...offlineRegForm, councilRegNo: e.target.value })} className="w-full bg-gray-50 border border-softgray rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#00A8CC]" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Address</label>
                  <input type="text" value={offlineRegForm.address || ''} onChange={(e) => setOfflineRegForm({ ...offlineRegForm, address: e.target.value })} className="w-full bg-gray-50 border border-softgray rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#00A8CC]" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black-300">City</label>
                  <input type="text" value={offlineRegForm.city || ''} onChange={(e) => setOfflineRegForm({ ...offlineRegForm, city: e.target.value })} className="w-full bg-gray-50 border border-softgray rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#00A8CC]" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black-300">State</label>
                  <input type="text" value={offlineRegForm.state || ''} onChange={(e) => setOfflineRegForm({ ...offlineRegForm, state: e.target.value })} className="w-full bg-gray-50 border border-softgray rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#00A8CC]" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Pincode</label>
                  <input type="text" value={offlineRegForm.pincode || ''} onChange={(e) => setOfflineRegForm({ ...offlineRegForm, pincode: e.target.value })} className="w-full bg-gray-50 border border-softgray rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#00A8CC]" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Category *</label>
                  <select value={offlineRegForm.category || 'Faculty'} onChange={(e) => setOfflineRegForm({ ...offlineRegForm, category: e.target.value })} className="w-full bg-gray-50 border border-softgray rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#00A8CC]" required>
                    <option value="Faculty">Faculty</option>
                    <option value="Post Graduate">Post Graduate</option>
                    <option value="Clinical Practitioner">Clinical Practitioner</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black-300">IAPHD No</label>
                  <input type="text" value={offlineRegForm.iaphdNo || ''} onChange={(e) => setOfflineRegForm({ ...offlineRegForm, iaphdNo: e.target.value })} className="w-full bg-gray-50 border border-softgray rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#00A8CC]" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Tier *</label>
                  <select value={offlineRegForm.tier || 'classic'} onChange={(e) => setOfflineRegForm({ ...offlineRegForm, tier: e.target.value })} className="w-full bg-gray-50 border border-softgray rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#00A8CC]" required>
                    <option value="classic">Classic</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Food Preference</label>
                  <select value={offlineRegForm.foodPreference || ''} onChange={(e) => setOfflineRegForm({ ...offlineRegForm, foodPreference: e.target.value })} className="w-full bg-gray-50 border border-softgray rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#00A8CC]">
                    <option value="">Select...</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Has Accompanying?</label>
                  <select value={offlineRegForm.hasAccompanying || 'no'} onChange={(e) => setOfflineRegForm({ ...offlineRegForm, hasAccompanying: e.target.value })} className="w-full bg-gray-50 border border-softgray rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#00A8CC]">
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Accompanying Name</label>
                  <input type="text" value={offlineRegForm.accompanyingName || ''} onChange={(e) => setOfflineRegForm({ ...offlineRegForm, accompanyingName: e.target.value })} disabled={offlineRegForm.hasAccompanying !== 'yes'} className="w-full bg-gray-50 border border-softgray rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#00A8CC] disabled:opacity-50" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Accompanying Count</label>
                  <input type="number" value={offlineRegForm.accompanyingCount || 0} onChange={(e) => setOfflineRegForm({ ...offlineRegForm, accompanyingCount: parseInt(e.target.value) || 0 })} disabled={offlineRegForm.hasAccompanying !== 'yes'} className="w-full bg-gray-50 border border-softgray rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#00A8CC] disabled:opacity-50" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Accompanying Food</label>
                  <input type="text" value={offlineRegForm.accompanyingFood || ''} onChange={(e) => setOfflineRegForm({ ...offlineRegForm, accompanyingFood: e.target.value })} disabled={offlineRegForm.hasAccompanying !== 'yes'} className="w-full bg-gray-50 border border-softgray rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#00A8CC] disabled:opacity-50" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Offline Receipt/Ref ID</label>
                  <input type="text" value={offlineRegForm.transactionId || ''} onChange={(e) => setOfflineRegForm({ ...offlineRegForm, transactionId: e.target.value })} className="w-full bg-gray-50 border border-softgray rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#00A8CC]" placeholder="e.g. cash, UTR" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Registration Date</label>
                  <input type="date" value={offlineRegForm.paymentDate || new Date().toISOString().split('T')[0]} onChange={(e) => setOfflineRegForm({ ...offlineRegForm, paymentDate: e.target.value })} className="w-full bg-gray-50 border border-softgray rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#00A8CC]" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black-300">Amount Paid *</label>
                  <input type="number" value={offlineRegForm.amountPaid || 0} onChange={(e) => setOfflineRegForm({ ...offlineRegForm, amountPaid: parseFloat(e.target.value) || 0 })} className="w-full bg-gray-50 border border-softgray rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#00A8CC]" required />
                </div>
              </div>
              <div className="flex justify-end space-x-4 pt-6 border-t border-softgray">
                <button
                  type="button"
                  onClick={() => setCreatingOfflineReg(false)}
                  className="px-6 py-3 bg-gray-100 text-primary/80 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!offlineRegForm.fullName || !offlineRegForm.email || !offlineRegForm.mobile) {
                      showToast('Please fill out Name, Email, and Mobile fields.', 'error');
                      return;
                    }
                    try {
                      showToast('Creating offline registration...', 'info');
                      const finalPayload = {
                        ...offlineRegForm,
                        status: 'CONFIRMED',
                        offline_online: 'offline',
                        paymentDate: offlineRegForm.paymentDate || new Date().toISOString().split('T')[0]
                      };
                      const created = await addRegistration(finalPayload);
                      if (created) {
                        showToast(`Registration ${created.id} created successfully!`, 'success');
                        setCreatingOfflineReg(false);
                        // Trigger page reload to refresh registrations
                        window.location.reload();
                      } else {
                        showToast('Failed to create offline registration.', 'error');
                      }
                    } catch (err) {
                      showToast(err.message || 'Error occurred.', 'error');
                    }
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-[#C8A96B] to-[#ff8585] text-white shadow-md hover:shadow-[0_4px_15px_rgba(200,169,107,0.35)] hover:-translate-y-0.5 active:translate-y-0 hover:opacity-95 transition-all cursor-pointer rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#C8A96B] transition-colors"
                >
                  Create Registration
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

