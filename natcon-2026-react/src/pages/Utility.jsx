import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Search, ArrowLeft, FileCheck, HelpCircle, X, Printer, Lock, Unlock, Save, UserCheck, Eye, EyeOff, Image } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useConference } from '../context/ConferenceContext';
import Swal from 'sweetalert2';

// Custom SweetAlert styling helper matching premium conference brand
const showSwalAlert = (title, text, icon = 'warning') => {
  Swal.fire({
    title: title.toUpperCase(),
    text: text,
    icon: icon,
    confirmButtonText: 'OK',
    confirmButtonColor: '#00A8CC',
    background: '#ffffff',
    color: '#14213D',
    customClass: {
      popup: 'border border-softgray rounded-2xl shadow-2xl font-sans text-primary'
    }
  });
};

// Helper function to convert numeric Rupees to English words (Indian Numbering System format)
const numberToWords = (num) => {
  const amount = parseInt(num, 10);
  if (isNaN(amount) || amount === 0) return 'ZERO';

  const a = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
  const b = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];

  const convert = (n) => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' HUNDRED' + (n % 100 !== 0 ? ' AND ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' THOUSAND' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' LAKH' + (n % 100000 !== 0 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' CRORE' + (n % 10000000 !== 0 ? ' ' + convert(n % 10000000) : '');
  };

  return convert(amount) + ' ONLY';
};

// Format Date as DD/MM/YYYY
const formatDate = (dateString) => {
  if (!dateString) return new Date().toLocaleDateString('en-GB');
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB');
};

const Utility = () => {
  const {
    contactSettings,
    getRegistrationByQuery,
    headerLogos,
    resendConfirmationEmail,
    delegateSession,
    delegateLogin,
    delegateLogout,
    updateDelegateProfile,
    uploadImage
  } = useConference();

  const [activePortal, setActiveTab] = useState('receipt');
  const [isResending, setIsResending] = useState(false);
  const location = useLocation();

  // Detect and set active tab from URL query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'profile' || tab === 'receipt' || tab === 'regnumber') {
      setActiveTab(tab);
    }
  }, [location.search]);

  const handleResendEmail = async () => {
    if (!foundRecord || !foundRecord.id) return;
    setIsResending(true);
    try {
      const result = await resendConfirmationEmail(foundRecord.id);
      setIsResending(false);
      if (result && result.success) {
        showSwalAlert('Email Dispatched', `A confirmation email has been resent to ${foundRecord.email.toLowerCase()} successfully!`, 'success');
      } else {
        showSwalAlert('Dispatch Error', result.error || 'Failed to dispatch confirmation email. Please check your credentials or contact support.', 'error');
      }
    } catch (err) {
      setIsResending(false);
      console.error(err);
      showSwalAlert('Dispatch Error', 'Failed to dispatch confirmation email.', 'error');
    }
  };

  // Search state variables
  const [searchEmail, setSearchEmail] = useState('');
  const [searchMobile, setSearchMobile] = useState('');
  const [foundRecord, setFoundRecord] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Delegate profile portal states
  const [loginValue, setLoginValue] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState('');

  const [profileForm, setProfileForm] = useState({
    fullName: '',
    gender: '',
    institution: '',
    designation: '',
    councilRegNo: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    iaphdNo: '',
    foodPreference: 'Non-Vegetarian',
    hasAccompanying: 'no',
    accompanyingName: '',
    accompanyingCount: '',
    accompanyingFood: '',
    profilePic: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  // Sync profile editor fields when session loads
  useEffect(() => {
    if (delegateSession) {
      setProfileForm({
        fullName: delegateSession.fullName || '',
        gender: delegateSession.gender || '',
        institution: delegateSession.institution || '',
        designation: delegateSession.designation || '',
        councilRegNo: delegateSession.councilRegNo || '',
        address: delegateSession.address || '',
        city: delegateSession.city || '',
        state: delegateSession.state || '',
        pincode: delegateSession.pincode || '',
        iaphdNo: delegateSession.iaphdNo || '',
        foodPreference: delegateSession.foodPreference || 'Non-Vegetarian',
        hasAccompanying: delegateSession.hasAccompanying || 'no',
        accompanyingName: delegateSession.accompanyingName || '',
        accompanyingCount: delegateSession.accompanyingCount || '',
        accompanyingFood: delegateSession.accompanyingFood || '',
        profilePic: delegateSession.profilePic || '',
        newPassword: '',
        confirmNewPassword: ''
      });
      setPreviewPhotoUrl(delegateSession.profilePic || '');
    }
  }, [delegateSession]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showSwalAlert('File Too Large', 'Please upload a photo smaller than 2MB.', 'warning');
        return;
      }
      setProfilePhoto(file);
      setPreviewPhotoUrl(URL.createObjectURL(file));
    }
  };

  const handleDelegateLogin = async () => {
    if (!loginValue) {
      showSwalAlert('Login ID/Email Required', 'Please enter your Registration ID or Email Address.', 'warning');
      return;
    }
    if (!loginPassword) {
      showSwalAlert('Password Required', 'Please enter your password or registered mobile number.', 'warning');
      return;
    }

    setIsLoggingIn(true);
    const result = await delegateLogin(loginValue, loginPassword);
    setIsLoggingIn(false);

    if (result && result.success) {
      showSwalAlert('Success', 'Logged in successfully to profile manager!', 'success');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!profileForm.fullName) {
      showSwalAlert('Name Required', 'Please enter your full name.', 'warning');
      return;
    }

    if (profileForm.newPassword) {
      if (profileForm.newPassword !== profileForm.confirmNewPassword) {
        showSwalAlert('Password Mismatch', 'New password and confirm password do not match.', 'warning');
        return;
      }
      if (profileForm.newPassword.length < 4) {
        showSwalAlert('Weak Password', 'New password must be at least 4 characters long.', 'warning');
        return;
      }
    }

    setIsSavingProfile(true);
    let updatedPhotoUrl = profileForm.profilePic;

    try {
      if (profilePhoto) {
        updatedPhotoUrl = await uploadImage(profilePhoto);
      }
    } catch (uploadErr) {
      console.error("Error uploading profile photo:", uploadErr);
      showSwalAlert('Upload Failed', 'Failed to upload new profile photo. Please try again.', 'error');
      setIsSavingProfile(false);
      return;
    }

    const updateData = {
      id: delegateSession.id,
      password: loginPassword || delegateSession.password || delegateSession.mobile.replace(/\D/g, ''), // Authenticating password
      newPassword: profileForm.newPassword || '',
      fullName: profileForm.fullName,
      gender: profileForm.gender,
      institution: profileForm.institution,
      designation: profileForm.designation,
      councilRegNo: profileForm.councilRegNo,
      address: profileForm.address,
      city: profileForm.city,
      state: profileForm.state,
      pincode: profileForm.pincode,
      category: delegateSession.category, // Kept immutable
      tier: delegateSession.tier,         // Kept immutable
      iaphdNo: profileForm.iaphdNo,
      foodPreference: profileForm.foodPreference,
      hasAccompanying: profileForm.hasAccompanying,
      accompanyingName: profileForm.accompanyingName,
      accompanyingCount: profileForm.accompanyingCount,
      accompanyingFood: profileForm.accompanyingFood,
      profilePic: updatedPhotoUrl
    };

    const res = await updateDelegateProfile(updateData);
    setIsSavingProfile(false);
    if (res.success) {
      showSwalAlert('Success', 'Profile updated successfully!', 'success');
      if (profileForm.newPassword) {
        setLoginPassword(profileForm.newPassword);
      }
      setProfileForm(prev => ({ ...prev, newPassword: '', confirmNewPassword: '' }));
      setProfilePhoto(null);
    } else {
      showSwalAlert('Update Failed', res.error || 'Could not update profile.', 'error');
    }
  };

  // Search logic for E-Receipt
  const handleFetchReceipt = async () => {
    if (!searchEmail) {
      showSwalAlert('Email Required', 'Please enter your registered email address.', 'warning');
      return;
    }

    setIsSearching(true);
    try {
      const result = await getRegistrationByQuery('email', searchEmail);
      setIsSearching(false);

      if (result && result.success && result.record) {
        setFoundRecord(result.record);
        showSwalAlert('Success', 'Delegate registration details loaded successfully!', 'success');
      } else {
        showSwalAlert('Not Found', result.error || 'No registration record found for this email address. Please make sure it is correct or contact support.', 'error');
      }
    } catch (err) {
      setIsSearching(false);
      console.error("Search failed:", err);
      showSwalAlert('Search Error', 'Failed to retrieve details from the database.', 'error');
    }
  };

  // Recovery logic for Registration Number
  const handleSearchRegNumber = async () => {
    if (!searchMobile) {
      showSwalAlert('Mobile Required', 'Please enter your registered mobile number.', 'warning');
      return;
    }

    setIsSearching(true);
    try {
      const result = await getRegistrationByQuery('mobile', searchMobile);
      setIsSearching(false);

      if (result && result.success && result.record) {
        const record = result.record;
        showSwalAlert(
          'Record Found',
          `Delegate: DR. ${record.fullName.toUpperCase()}\nRegistration ID: ${record.id}\nPackage: ${record.tier.toUpperCase()} (${record.category})\nStatus: ${record.status}`,
          'success'
        );
      } else {
        showSwalAlert('Not Found', result.error || 'No registration found matching this mobile number. Please check the digits and try again.', 'error');
      }
    } catch (err) {
      setIsSearching(false);
      console.error("Recovery failed:", err);
      showSwalAlert('Recovery Error', 'Failed to retrieve details from the database.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-midnight text-primary pt-32 pb-20 relative overflow-x-hidden font-sans">
      {/* Dynamic CSS for watermarks, cursive fonts, check lines, and media printing */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playball&family=Poppins:wght@400;600;700;800;900&display=swap');
        
        .signature-font {
          font-family: 'Playball', 'Brush Script MT', cursive;
          color: #0c2340;
          line-height: 1;
        }
        
        .receipt-card {
          font-family: 'Poppins', sans-serif;
          background-color: white;
          color: #1a202c;
          position: relative;
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.4);
        }

        .overlay-no {
          font-size: 1.35vw;
        }
        .overlay-date {
          font-size: 1.35vw;
        }
        .overlay-name {
          font-size: 2vw;
        }
        .overlay-words {
          font-size: 1.25vw;
        }
        .overlay-by {
          font-size: 1.1vw;
        }
        .overlay-fee {
          font-size: 1.3vw;
        }
        .overlay-sig {
          font-size: 2vw;
        }

        @media print {
          @page {
            size: landscape;
            margin: 0;
          }

          #printable-receipt {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: auto !important;
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
            background-color: white !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
          }

          .overlay-no {
            font-size: 13.5px !important;
          }
          .overlay-date {
            font-size: 13.5px !important;
          }
          .overlay-name {
            font-size: 20px !important;
          }
          .overlay-words {
            font-size: 12.5px !important;
          }
          .overlay-by {
            font-size: 11px !important;
          }
          .overlay-fee {
            font-size: 18px !important;
          }
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 relative z-10">

        {/* Toggle navigation/back */}
        <AnimatePresence mode="wait">
          {!foundRecord ? (
            <motion.div
              key="search-panel"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="max-w-4xl mx-auto"
            >
              {/* Header */}
              <div className="mb-12">
                <Link to="/" className="inline-flex items-center text-primary text-xs font-black uppercase tracking-widest mb-6 hover:text-accent transition-colors">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                </Link>
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
                  Delegate <span className="text-primary italic">Utilities</span>
                </h1>
                <div className="flex space-x-4 border-b border-softgray pb-4">
                  <button
                    onClick={() => { setActiveTab('receipt'); setSearchEmail(''); }}
                    className={`text-[10px] font-black uppercase tracking-[4px] pb-4 border-b-2 transition-all ${activePortal === 'receipt' ? 'border-primary text-[#00A8CC]' : 'border-transparent text-primary/80'
                      }`}
                  >
                    Download E-Receipt
                  </button>
                  <button
                    onClick={() => { setActiveTab('regnumber'); setSearchMobile(''); }}
                    className={`text-[10px] font-black uppercase tracking-[4px] pb-4 border-b-2 transition-all ${activePortal === 'regnumber' ? 'border-primary text-[#00A8CC]' : 'border-transparent text-primary/80'
                      }`}
                  >
                    Find Reg Number
                  </button>
                  <button
                    onClick={() => { setActiveTab('profile'); }}
                    className={`text-[10px] font-black uppercase tracking-[4px] pb-4 border-b-2 transition-all ${activePortal === 'profile' ? 'border-primary text-[#00A8CC]' : 'border-transparent text-primary/80'
                      }`}
                  >
                    My Profile
                  </button>
                </div>
              </div>

              {activePortal === 'receipt' && (
                <div className="bg-secondary shadow-[0_4px_20px_rgba(20,33,61,0.05)] border border-softgray p-12 rounded-sm space-y-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full blur-2xl"></div>
                  <div className="flex items-center space-x-6 mb-8">
                    <div className="p-5 bg-primary/10 border border-primary/20 rounded-sm">
                      <FileCheck className="w-10 h-10 text-primary animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black uppercase tracking-tighter">Download E-Receipt</h3>
                      <p className="text-xs font-bold text-primary/80 uppercase tracking-widest">Access your official conference receipt and confirmation check</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Registered Email Address</label>
                      <input
                        type="email"
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleFetchReceipt(); }}
                        placeholder="e.g. delegate@gmail.com"
                        className="w-full bg-softgray/30 border border-softgray rounded-sm p-5 text-sm focus:border-primary outline-none transition-colors uppercase tracking-widest font-bold text-primary"
                      />
                    </div>
                    <button
                      onClick={handleFetchReceipt}
                      disabled={isSearching}
                      className="w-full py-5 bg-[#C8A96B] text-primary shadow-[0_4px_14px_rgba(200,169,107,0.25)] hover:bg-[#14213D] hover:text-[#00A8CC] hover:scale-[1.02] transition-all duration-300 font-black uppercase text-xs tracking-widest flex items-center justify-center border border-softgray disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSearching ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          SEARCHING DATABASE...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-3" /> Fetch E-Receipt
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {activePortal === 'regnumber' && (
                <div className="bg-secondary shadow-[0_4px_20px_rgba(20,33,61,0.05)] border border-softgray p-12 rounded-sm space-y-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full blur-2xl"></div>
                  <div className="flex items-center space-x-6 mb-8">
                    <div className="p-5 bg-primary/10 border border-primary/20 rounded-sm">
                      <Search className="w-10 h-10 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black uppercase tracking-tighter">Find Registration Number</h3>
                      <p className="text-xs font-bold text-primary/80 uppercase tracking-widest">Lost your unique NATCON ID? Recover it instantly here.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Mobile Number (digits only)</label>
                      <input
                        type="tel"
                        value={searchMobile}
                        onChange={(e) => setSearchMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSearchRegNumber(); }}
                        placeholder="e.g. 9876543210"
                        className="w-full bg-softgray/30 border border-softgray rounded-sm p-5 text-sm focus:border-primary outline-none transition-colors uppercase tracking-widest font-bold text-primary"
                      />
                    </div>
                    <button
                      onClick={handleSearchRegNumber}
                      disabled={isSearching}
                      className="w-full py-5 bg-primary text-midnight font-black uppercase text-xs tracking-widest hover:bg-[#C8A96B] hover:text-[#00A8CC] hover:scale-[1.02] transition-all flex items-center justify-center border border-softgray disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSearching ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-midnight" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          RECOVERING ID...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-3" /> Search Records
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {activePortal === 'profile' && (
                delegateSession ? (
                  /* Profile Editor View */
                  <div className="bg-secondary shadow-[0_4px_20px_rgba(20,33,61,0.05)] border border-softgray p-8 md:p-12 rounded-sm space-y-8 relative overflow-hidden text-left">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#00A8CC]/5 rounded-bl-full blur-2xl pointer-events-none"></div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-softgray">
                      <div className="flex items-center space-x-6">
                        <div className="relative">
                          {previewPhotoUrl ? (
                            <img
                              src={previewPhotoUrl}
                              alt="Delegate Profile"
                              className="w-20 h-20 rounded-full object-cover border-2 border-[#C8A96B] shadow-[0_0_15px_rgba(200,169,107,0.3)]"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-[#C8A96B]/30 flex items-center justify-center text-primary/60 font-black text-2xl uppercase">
                              {delegateSession.fullName ? delegateSession.fullName.charAt(0) : 'D'}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-primary">DR. {delegateSession.fullName}</h3>
                            <span className="bg-[#C8A96B]/15 border border-[#C8A96B]/30 text-[#C8A96B] text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm">
                              {delegateSession.id}
                            </span>
                          </div>
                          <p className="text-[10px] font-bold text-[#00A8CC] uppercase tracking-widest mt-1">
                            {delegateSession.tier.toUpperCase()} MEMBER ({delegateSession.category})
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={delegateLogout}
                        className="px-6 py-3 border border-red-500/30 hover:bg-red-500/10 text-red-400 hover:text-red-300 text-[10px] font-black uppercase tracking-widest transition-all rounded-sm self-start md:self-auto"
                      >
                        Logout Session
                      </button>
                    </div>

                    <form onSubmit={handleProfileUpdate} className="space-y-8">
                      {/* Personal & Professional Details */}
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase tracking-[3px] text-[#00A8CC] border-b border-[#00A8CC]/20 pb-2">
                          1. Personal & Professional Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                          <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Full Name (as printed on certificate)</label>
                            <input
                              type="text"
                              value={profileForm.fullName}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, fullName: e.target.value }))}
                              className="w-full  border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none transition-colors font-bold text-primary uppercase"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/40">Email Address (Non-editable)</label>
                            <input
                              type="email"
                              value={delegateSession.email}
                              disabled
                              className="w-full bg-[#14213D]/40 border border-white/5 rounded-sm p-4 text-sm outline-none font-bold text-primary/30 cursor-not-allowed"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/40">WhatsApp Mobile (Non-editable)</label>
                            <input
                              type="tel"
                              value={delegateSession.mobile}
                              disabled
                              className="w-full bg-[#14213D]/40 border border-white/5 rounded-sm p-4 text-sm outline-none font-bold text-primary/30 cursor-not-allowed"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Gender</label>
                            <select
                              value={profileForm.gender}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, gender: e.target.value }))}
                              className="w-full  border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none transition-colors font-bold text-primary"
                            >
                              <option value="">Select Gender</option>
                              <option value="MALE">Male</option>
                              <option value="Female">Female</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Dental Council Reg No.</label>
                            <input
                              type="text"
                              value={profileForm.councilRegNo}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, councilRegNo: e.target.value }))}
                              className="w-full  border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none transition-colors font-bold text-primary uppercase"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Institution / College / Clinic</label>
                            <input
                              type="text"
                              value={profileForm.institution}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, institution: e.target.value }))}
                              className="w-full  border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none transition-colors font-bold text-primary"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Designation</label>
                            <select
                              value={
                                !profileForm.designation
                                  ? ""
                                  : ["Principal", "Vice-Principal", "Head of the Department", "Professor", "Associate Professor", "Assistant Professor/ Senior Lecturer", "PG 1st year", "PG 2nd year", "PG 3rd year"].includes(profileForm.designation)
                                    ? profileForm.designation
                                    : "OTHERS"
                              }
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === "OTHERS") {
                                  setProfileForm(prev => ({ ...prev, designation: "Other" }));
                                } else {
                                  setProfileForm(prev => ({ ...prev, designation: val }));
                                }
                              }}
                              className="w-full  border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none transition-colors font-bold text-primary"
                            >
                              <option value="">Select Designation</option>
                              {["Principal", "Vice-Principal", "Head of the Department", "Professor", "Associate Professor", "Assistant Professor/ Senior Lecturer", "PG 1st year", "PG 2nd year", "PG 3rd year", "OTHERS"].map(d => (
                                <option key={d} value={d}>{d}</option>
                              ))}
                            </select>
                          </div>

                          {profileForm.designation !== "" && !["Principal", "Vice-Principal", "Head of the Department", "Professor", "Associate Professor", "Assistant Professor/ Senior Lecturer", "PG 1st year", "PG 2nd year", "PG 3rd year"].includes(profileForm.designation) && (
                            <div className="space-y-2 md:col-span-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-[#00A8CC] animate-pulse">Specify Designation</label>
                              <input
                                type="text"
                                value={profileForm.designation === "Other" ? "" : profileForm.designation}
                                onChange={(e) => setProfileForm(prev => ({ ...prev, designation: e.target.value }))}
                                className="w-full  border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none transition-colors font-bold text-primary"
                                placeholder="Enter your custom designation"
                              />
                            </div>
                          )}

                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">IAPHD No. (if member)</label>
                            <input
                              type="text"
                              value={profileForm.iaphdNo}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, iaphdNo: e.target.value }))}
                              className="w-full  border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none transition-colors font-bold text-primary uppercase"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Food Preference</label>
                            <select
                              value={profileForm.foodPreference}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, foodPreference: e.target.value }))}
                              className="w-full  border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none transition-colors font-bold text-primary"
                            >
                              <option value="Vegetarian">Vegetarian</option>
                              <option value="Non-Vegetarian">Non-Vegetarian</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Contact & Address Details */}
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase tracking-[3px] text-[#00A8CC] border-b border-[#00A8CC]/20 pb-2">
                          2. Contact & Address Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-2 md:col-span-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Address</label>
                            <textarea
                              value={profileForm.address}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                              rows={3}
                              className="w-full  border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none transition-colors font-bold text-primary"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">City</label>
                            <input
                              type="text"
                              value={profileForm.city}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, city: e.target.value }))}
                              className="w-full  border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none transition-colors font-bold text-primary"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">State</label>
                            <input
                              type="text"
                              value={profileForm.state}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, state: e.target.value }))}
                              className="w-full  border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none transition-colors font-bold text-primary"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Pincode</label>
                            <input
                              type="text"
                              value={profileForm.pincode}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                              className="w-full    border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none transition-colors font-bold text-primary"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Photo Badge Upload */}
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase tracking-[3px] text-[#00A8CC] border-b border-[#00A8CC]/20 pb-2">
                          3. Profile Badge Photo
                        </h4>
                        <div className="bg-softgray/10 border border-white/5 p-6 rounded-sm flex flex-col md:flex-row items-center gap-6">
                          <div className="relative shrink-0">
                            {previewPhotoUrl ? (
                              <img
                                src={previewPhotoUrl}
                                alt="Upload Preview"
                                className="w-24 h-24 rounded-full object-cover border-2 border-[#C8A96B]"
                              />
                            ) : (
                              <div className="w-24 h-24 rounded-full bg-midnight border-2 border-dashed border-white/10 flex items-center justify-center text-primary/30">
                                <Image className="w-8 h-8" />
                              </div>
                            )}
                          </div>
                          <div className="space-y-2 w-full">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#C8A96B] block">Upload Passport Size Photo (JPG/PNG, Max 2MB)</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoChange}
                              className="text-xs text-primary/60 file:mr-4 file:py-2.5 file:px-4 file:rounded-sm file:border-0 file:text-[9px] file:font-black file:uppercase file:tracking-wider file:bg-[#00A8CC]/10 file:text-[#00A8CC] hover:file:bg-[#00A8CC]/20 cursor-pointer"
                            />
                            <p className="text-[9px] text-primary/40 uppercase tracking-wide font-medium">This photo will print on your physical conference delegate badge.</p>
                          </div>
                        </div>
                      </div>

                      {/* Security Credentials */}
                      <div className="space-y-6 pt-4 border-t border-softgray">
                        <h4 className="text-[11px] font-black uppercase tracking-[3px] text-[#C8A96B] border-b border-[#C8A96B]/20 pb-2">
                          4. Security Credentials
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">New Password (leave empty to keep current)</label>
                            <input
                              type="password"
                              value={profileForm.newPassword}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, newPassword: e.target.value }))}
                              className="w-full  border border-[#C8A96B] rounded-sm p-4 text-sm focus:border-[#C8A96B] outline-none transition-colors font-bold text-primary"
                              placeholder="Min 4 characters"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Confirm New Password</label>
                            <input
                              type="password"
                              value={profileForm.confirmNewPassword}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, confirmNewPassword: e.target.value }))}
                              className="w-full  border border-[#C8A96B] rounded-sm p-4 text-sm focus:border-[#C8A96B] outline-none transition-colors font-bold text-primary"
                              placeholder="Re-type new password"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Save changes button */}
                      <button
                        type="submit"
                        disabled={isSavingProfile}
                        className="w-full py-5 bg-[#00A8CC] text-[#14213D] shadow-[0_4px_14px_rgba(0,168,204,0.25)] hover:bg-[#C8A96B] hover:text-primary hover:scale-[1.01] transition-all duration-300 font-black uppercase text-xs tracking-widest flex items-center justify-center disabled:opacity-50"
                      >
                        {isSavingProfile ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-midnight" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            SAVING PROFILE EDITS...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-3" /> Save Changes
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                ) : (
                  /* Login View */
                  <div className="bg-secondary shadow-[0_4px_20px_rgba(20,33,61,0.05)] border border-softgray p-12 rounded-sm space-y-8 relative overflow-hidden text-left">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full blur-2xl"></div>
                    <div className="flex items-center space-x-6 mb-8">
                      <div className="p-5 bg-primary/10 border border-primary/20 rounded-sm">
                        <Lock className="w-10 h-10 text-[#00A8CC] animate-pulse" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter">Delegate Login</h3>
                        <p className="text-xs font-bold text-primary/80 uppercase tracking-widest">Sign in to edit your profile details (excluding email/mobile)</p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Registration ID or Email Address</label>
                        <input
                          type="text"
                          value={loginValue}
                          onChange={(e) => setLoginValue(e.target.value)}
                          placeholder="e.g. NATCON-0001 or delegate@gmail.com"
                          className="w-full bg-softgray/30 border border-softgray rounded-sm p-5 text-sm focus:border-[#00A8CC] outline-none transition-colors uppercase tracking-widest font-bold text-primary text-left"
                        />
                      </div>
                      <div className="space-y-2 relative">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Profile Password / Mobile Number</label>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Enter your password (or registered 10-digit mobile number)"
                          className="w-full bg-softgray/30 border border-softgray rounded-sm p-5 text-sm focus:border-[#00A8CC] outline-none transition-colors font-bold text-primary"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(prev => !prev)}
                          className="absolute right-5 top-[48px] text-primary/50 hover:text-primary transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <button
                        onClick={handleDelegateLogin}
                        disabled={isLoggingIn}
                        className="w-full py-5 bg-[#C8A96B] text-primary shadow-[0_4px_14px_rgba(200,169,107,0.25)] hover:bg-[#14213D] hover:text-[#00A8CC] hover:scale-[1.02] transition-all duration-300 font-black uppercase text-xs tracking-widest flex items-center justify-center border border-softgray"
                      >
                        {isLoggingIn ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            AUTHENTICATING...
                          </>
                        ) : (
                          <>
                            <Unlock className="w-4 h-4 mr-3" /> Login to Profile
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )
              )}
            </motion.div>
          ) : (
            <motion.div
              key="receipt-preview-panel"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              {/* Receipt Control Panel */}
              <div className="bg-secondary shadow-[0_4px_20px_rgba(20,33,61,0.05)] border border-softgray p-6 border border-softgray rounded-sm flex flex-col sm:flex-row items-center justify-between gap-6 no-print">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => { setFoundRecord(null); setSearchEmail(''); }}
                    className="p-3 bg-softgray/30 border border-softgray hover:bg-softgray/50 border border-softgray rounded-sm text-primary/80 hover:text-accent transition-all cursor-pointer"
                    title="Close Receipt & Search Again"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h4 className="text-base font-black uppercase tracking-tight">Receipt Ready</h4>
                    <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">An official receipt has been sent to your registered email address.</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => setFoundRecord(null)}
                    className="flex-1 sm:flex-none px-6 py-4 border border-softgray hover:bg-softgray/30 text-[10px] font-black uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4 text-primary" /> Back to Search
                  </button>
                  <button
                    onClick={handleResendEmail}
                    disabled={isResending}
                    className="flex-1 sm:flex-none px-6 py-4 bg-primary text-primary border border-softgray hover:bg-primary/95 text-[10px] font-black uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isResending ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Resending...</span>
                      </>
                    ) : (
                      <>
                        <FileCheck className="w-4 h-4 text-[#00A8CC]" /> Resend Email
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* landscape Printable Check Receipt Card Component */}
              <div
                id="printable-receipt"
                className="receipt-card max-w-5xl mx-auto rounded-sm overflow-hidden select-none border border-[#cfbfa3] shadow-2xl bg-white relative"
              >
                {/* Background template image */}
                <img
                  src="./NATCON2026-Receipt.png"
                  alt="NATCON 2026 E-Receipt Template"
                  className="w-full h-auto block"
                />

                {/* Absolute overlay elements */}
                {/* 1. Receipt No (Registration ID) */}
                <div
                  className="absolute overlay-no font-black text-[#0f4c81] uppercase tracking-wide leading-none"
                  style={{ top: '34.7%', left: '7.9%' }}
                >
                  {foundRecord.id}
                </div>

                {/* 2. Date */}
                <div
                  className="absolute overlay-date font-extrabold text-[#0f4c81] uppercase tracking-wider leading-none"
                  style={{ top: '33.8%', left: '79.7%' }}
                >
                  {formatDate(foundRecord.paymentDate)}
                </div>

                {/* 3. Received with thanks from */}
                <div
                  className="absolute overlay-name signature-font italic text-[#0c2340] leading-none"
                  style={{ top: '42.8%', left: '26.5%' }}
                >
                  Dr. {foundRecord.fullName.toUpperCase()}
                </div>

                {/* 4. The sum of rupees */}
                <div
                  className="absolute overlay-words font-extrabold text-slate-800 uppercase tracking-wider leading-none"
                  style={{ top: '51.7%', left: '21%' }}
                >
                  {numberToWords(foundRecord.amountPaid)}
                </div>

                {/* 5. By (Transaction details / category / tier) */}
                <div
                  className="absolute overlay-by font-bold text-slate-700 tracking-wide leading-none"
                  style={{ top: '60.2%', left: '7.2%' }}
                >
                  {foundRecord.transactionId
                    ? `ONLINE TRANSACTION (REF: ${foundRecord.transactionId})`
                    : 'DIRECT BANK TRANSFER (MANUAL)'}
                  <span className="text-[#0f4c81] font-extrabold ml-2">({foundRecord.category} - {foundRecord.tier.toUpperCase()})</span>
                </div>

                {/* 6. Total Fee Box Amount (Centered in the white input area next to ₹) */}
                <div
                  className="absolute overlay-fee font-black text-slate-800 tracking-widest leading-none select-text"
                  style={{ top: '91%', left: '6%' }}
                >
                  {Number(foundRecord.amountPaid).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/-
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic assistance note */}
        <div className="mt-12 p-8 border border-softgray bg-softgray/30 border border-softgray rounded-sm flex items-start space-x-6 no-print">
          <HelpCircle className="w-6 h-6 text-primary/80 shrink-0" />
          <div className="space-y-2">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-primary/60">Need Assistance?</h5>
            <p className="text-[10px] font-medium text-primary/80 leading-relaxed tracking-wider uppercase">
              If you are unable to fetch your receipt or reg number, please contact our support team at <span className="text-primary">{contactSettings.supportEmail}</span> with your mobile number.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Utility;

