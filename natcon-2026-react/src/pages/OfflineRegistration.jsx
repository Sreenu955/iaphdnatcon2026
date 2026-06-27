import React, { useState, useEffect } from 'react';
import { useConference } from '../context/ConferenceContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  AlertCircle,
  Users,
  Briefcase,
  CheckCircle2,
  ArrowLeft,
  FileUp,
  Building,
  Check,
  QrCode,
  Calendar,
  CreditCard
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
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

const OfflineRegistration = () => {
  const { conferenceData, pricingPhase, addRegistration, checkDuplicateRegistration, uploadImage, getRegistrationByQuery } = useConference();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredData, setRegisteredData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [duplicateError, setDuplicateError] = useState(null);

  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    gender: '',
    mobile: '',
    institution: '',
    designation: '',
    councilRegNo: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    category: '',
    iaphdNo: '',
    tier: 'classic',
    foodPreference: 'Non-Vegetarian',
    hasAccompanying: 'no',
    accompanyingName: '',
    accompanyingCount: '',
    accompanyingFood: '',
    transactionId: '',
    paymentDate: new Date().toISOString().split('T')[0],
    amountPaid: '',
    photo: null,
    paymentScreenshot: null
  });

  const tiers = conferenceData.registration.tiers;

  // Calculate base amount dynamically without PG convenience fees and GST
  const getCompleteBaseAmount = () => {
    const selectedTier = tiers.find(t => t.id === formData.tier);
    if (!selectedTier || !formData.category) return 0;
    const pricingRow = selectedTier.pricing.find(p => p.category === formData.category);
    if (!pricingRow) return 0;
    let baseAmount = pricingRow[pricingPhase];
    if (formData.hasAccompanying === 'yes') {
      const accompanyingPricing = selectedTier.pricing.find(p => p.category === "Accompanying person/Spouse");
      if (accompanyingPricing) {
        const count = parseInt(formData.accompanyingCount, 10) || 1;
        baseAmount += count * accompanyingPricing[pricingPhase];
      }
    }
    return baseAmount;
  };

  // Automatically sync amountPaid state field with the calculated base amount
  useEffect(() => {
    const base = getCompleteBaseAmount();
    setFormData(prev => ({ ...prev, amountPaid: base > 0 ? String(base) : '' }));
  }, [formData.tier, formData.category, formData.hasAccompanying, formData.accompanyingCount]);

  useEffect(() => {
    const cached = localStorage.getItem('latestOfflineRegistration');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.id) {
          setRegisteredData(parsed);
          setIsSuccess(true);
        }
      } catch (e) {
        console.error("Failed to parse cached offline registration", e);
      }
    }
  }, []);

  const handleRegisterAnother = () => {
    localStorage.removeItem('latestOfflineRegistration');
    setIsSuccess(false);
    setRegisteredData(null);
    setStep(1);
    setFormData({
      email: '',
      fullName: '',
      gender: '',
      mobile: '',
      institution: '',
      designation: '',
      councilRegNo: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      category: '',
      iaphdNo: '',
      tier: 'classic',
      foodPreference: 'Non-Vegetarian',
      hasAccompanying: 'no',
      accompanyingName: '',
      accompanyingCount: '',
      accompanyingFood: '',
      transactionId: '',
      paymentDate: new Date().toISOString().split('T')[0],
      amountPaid: '',
      photo: null,
      paymentScreenshot: null
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mobile') {
      const cleaned = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, mobile: cleaned.slice(0, 10) }));
    } else if (name === 'pincode') {
      const cleaned = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, pincode: cleaned.slice(0, 6) }));
    } else if (name === 'category') {
      const isIaphdMember = value && value.includes('IAPHD') && !value.includes('Non-IAPHD');
      setFormData(prev => ({
        ...prev,
        category: value,
        iaphdNo: isIaphdMember ? prev.iaphdNo : ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (name === 'email' || name === 'mobile') {
      setDuplicateError(null);
    }
  };

  const handlePrefillFromFailed = async (type, value) => {
    if (!value) return;
    if (formData.fullName && formData.councilRegNo) {
      return;
    }

    try {
      const result = await getRegistrationByQuery(type, value);
      if (result && result.success && result.record && result.record.status === 'FAILED') {
        const record = result.record;
        setFormData(prev => ({
          ...prev,
          email: record.email || prev.email,
          fullName: record.fullName || prev.fullName,
          gender: record.gender || prev.gender,
          mobile: record.mobile || prev.mobile,
          institution: record.institution || prev.institution,
          designation: record.designation || prev.designation,
          councilRegNo: record.councilRegNo || prev.councilRegNo,
          address: record.address || prev.address,
          city: record.city || prev.city,
          state: record.state || prev.state,
          pincode: record.pincode || prev.pincode,
          category: record.category || prev.category,
          iaphdNo: record.iaphdNo || prev.iaphdNo,
          tier: record.tier || prev.tier,
          foodPreference: record.foodPreference || prev.foodPreference,
          hasAccompanying: record.hasAccompanying || prev.hasAccompanying,
          accompanyingName: record.accompanyingName || prev.accompanyingName,
          accompanyingCount: record.accompanyingCount || prev.accompanyingCount,
          accompanyingFood: record.accompanyingFood || prev.accompanyingFood,
          profilePic: record.profilePic || prev.profilePic
        }));

        showSwalAlert(
          'Details Restored',
          'We found your previous registration attempt and restored your details automatically!',
          'success'
        );
      }
    } catch (err) {
      console.warn("Failed to check for prefill data:", err);
    }
  };

  const handleEmailBlur = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && emailRegex.test(formData.email)) {
      await handlePrefillFromFailed('email', formData.email);
    }
  };

  const handleMobileBlur = async () => {
    const cleanMobile = formData.mobile.replace(/\D/g, '');
    if (cleanMobile.length >= 10) {
      await handlePrefillFromFailed('mobile', cleanMobile);
    }
  };

  const nextStep = async () => {
    if (step === 1) {
      if (!formData.fullName || !formData.email || !formData.mobile) {
        showSwalAlert('Profile Required', 'Please fill out all required profile details.', 'warning');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        showSwalAlert('Invalid Email', 'Please enter a valid email address.', 'warning');
        return;
      }

      const cleanMobile = formData.mobile.replace(/\D/g, '');
      if (cleanMobile.length < 10) {
        showSwalAlert('Invalid Phone', 'Please enter a valid 10-digit mobile number.', 'warning');
        return;
      }
      if (!formData.councilRegNo) {
        showSwalAlert('Dental Council Reg No. Required', 'Please enter your Dental Council Reg No.', 'warning');
        return;
      }

      setCheckingDuplicate(true);
      setDuplicateError(null);

      try {
        const checkResult = await checkDuplicateRegistration(formData.email, cleanMobile);
        setCheckingDuplicate(false);
        if (checkResult && checkResult.exists) {
          setDuplicateError(checkResult.error);
          showSwalAlert('Already Registered', checkResult.error, 'error');
          return;
        }
      } catch (err) {
        setCheckingDuplicate(false);
        console.error("Duplicate check error:", err);
      }
    }

    if (step === 2) {
      if (!formData.city) {
        showSwalAlert('City Required', 'Please enter your City.', 'warning');
        return;
      }
      if (!formData.state) {
        showSwalAlert('State Required', 'Please enter your State.', 'warning');
        return;
      }
      if (!formData.pincode || formData.pincode.length < 6) {
        showSwalAlert('Invalid Pincode', 'Please enter a valid 6-digit Pincode.', 'warning');
        return;
      }
      const isIaphdMember = formData.category && formData.category.includes('IAPHD') && !formData.category.includes('Non-IAPHD');
      if (isIaphdMember && !formData.iaphdNo) {
        showSwalAlert('IAPHD No. Required', 'Please enter your IAPHD No.', 'warning');
        return;
      }
      if (!formData.category) {
        showSwalAlert('Category Required', 'Please select your Category.', 'warning');
        return;
      }
    }

    if (step === 3) {
      if (!formData.foodPreference) {
        showSwalAlert('Food Preference Required', 'Please select your Food Preference.', 'warning');
        return;
      }
      if (formData.hasAccompanying === 'yes') {
        if (!formData.accompanyingName) {
          showSwalAlert('Accompanying Name Required', 'Please enter your accompanying person\'s name.', 'warning');
          return;
        }
        if (!formData.accompanyingCount || parseInt(formData.accompanyingCount, 10) <= 0) {
          showSwalAlert('Accompanying Count Required', 'Please enter the number of accompanying persons (must be 1 or more).', 'warning');
          return;
        }
        if (!formData.accompanyingFood) {
          showSwalAlert('Food Preference Required', 'Please select the food preference for the accompanying person.', 'warning');
          return;
        }
      }
    }

    setStep(prev => prev + 1);
  };

  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.mobile) {
      showSwalAlert('Profile Required', 'Please fill out all required profile details in the first step.', 'warning');
      setStep(1);
      return;
    }
    if (!formData.category || !formData.city) {
      showSwalAlert('Selection Required', 'Please select your Category and enter your City in the second step.', 'warning');
      setStep(2);
      return;
    }
    if (!formData.transactionId) {
      showSwalAlert('Transaction ID Required', 'Please enter your payment Transaction ID (Ref / UTR number).', 'warning');
      return;
    }
    if (!formData.paymentDate) {
      showSwalAlert('Payment Date Required', 'Please enter your payment Date.', 'warning');
      return;
    }
    if (!formData.amountPaid || parseFloat(formData.amountPaid) <= 0) {
      showSwalAlert('Amount Paid Required', 'Please enter a valid Amount Paid.', 'warning');
      return;
    }
    if (!formData.photo) {
      showSwalAlert('Passport Photo Required', 'Please upload your Passport Photo.', 'warning');
      return;
    }
    if (!formData.paymentScreenshot) {
      showSwalAlert('Payment Screenshot Required', 'Please upload your Payment Screenshot.', 'warning');
      return;
    }

    setIsSubmitting(true);
    let profilePicUrl = null;
    let paymentScreenshotUrl = null;
    try {
      if (formData.photo) {
        profilePicUrl = await uploadImage(formData.photo);
      }
    } catch (uploadErr) {
      console.error("Error uploading profile photo:", uploadErr);
    }

    try {
      if (formData.paymentScreenshot) {
        paymentScreenshotUrl = await uploadImage(formData.paymentScreenshot);
      }
    } catch (uploadErr) {
      console.error("Error uploading payment screenshot:", uploadErr);
    }

    const submissionData = {
      ...formData,
      profilePic: profilePicUrl,
      paymentScreenshot: paymentScreenshotUrl,
      status: 'PENDING',
      offline_online: 'offline',
      amountPaid: parseFloat(formData.amountPaid)
    };

    try {
      const saved = await addRegistration(submissionData);
      setRegisteredData(saved);
      localStorage.setItem('latestOfflineRegistration', JSON.stringify(saved));
      setIsSuccess(true);
    } catch (error) {
      console.error('Failed to resolve offline registration response:', error);
      if (error.message && (error.message.includes('already registered') || error.message.includes('Duplicate'))) {
        showSwalAlert('Already Registered', error.message, 'error');
        return;
      }
      const fallbackRecord = {
        ...submissionData,
        id: `OFFLINE-${Math.floor(1000 + Math.random() * 9000)}`
      };
      setRegisteredData(fallbackRecord);
      localStorage.setItem('latestOfflineRegistration', JSON.stringify(fallbackRecord));
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess && registeredData) {
    return (
      <div className="min-h-screen bg-midnight text-primary pt-32 pb-20 font-sans flex flex-col items-center justify-center relative overflow-x-hidden">
        <div className="max-w-xl w-full mx-auto px-4 space-y-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-500 animate-pulse">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tight text-primary">
              Registration Submitted!
            </h2>
            <p className="text-xs uppercase tracking-widest text-[#00A8CC] font-bold">
              Pending Admin Verification & Confirmation
            </p>
          </div>

          {/* Premium Light-themed Ticket Card */}
          <div className="bg-secondary border border-softgray rounded-xl overflow-hidden shadow-2xl relative">
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-midnight border-r border-softgray z-10"></div>
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-midnight border-l border-softgray z-10"></div>
            
            {/* Ticket Header */}
            <div className="p-6 border-b border-dashed border-softgray text-center">
              <span className="text-[9px] uppercase tracking-widest text-[#C8A96B] font-extrabold">30th IAPHD NATCON 2026</span>
              <h3 className="text-lg font-black tracking-tight text-primary mt-1">OFFLINE REGISTRATION TICKET</h3>
              <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[10px] font-bold uppercase tracking-widest">
                ● Pending Verification
              </div>
            </div>

            {/* Ticket Body */}
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center bg-lightbg p-3 rounded border border-softgray">
                <div className="flex flex-col">
                  <span className="text-[9px] text-primary/50 font-bold uppercase tracking-wider block">Status</span>
                  <strong className="text-amber-600 text-sm tracking-wide uppercase">Pending Admin Approval</strong>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[9px] text-primary/50 font-bold uppercase tracking-wider block">Submission Date</span>
                  <strong className="text-primary text-sm tracking-wide">
                    {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </strong>
                </div>
              </div>

              <div className="border-t border-softgray pt-4 space-y-3">
                <div>
                  <span className="text-[9px] text-primary/50 font-bold uppercase tracking-wider block">Delegate Name</span>
                  <strong className="text-primary text-sm">Dr. {registeredData.fullName.toUpperCase()}</strong>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] text-primary/50 font-bold uppercase tracking-wider block">Mobile Number</span>
                    <span className="text-primary text-xs font-mono">{registeredData.mobile}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-primary/50 font-bold uppercase tracking-wider block">Email Address</span>
                    <span className="text-primary text-xs truncate block">{registeredData.email}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] text-primary/50 font-bold uppercase tracking-wider block">Category / Tier</span>
                    <span className="text-primary text-xs font-bold uppercase">{registeredData.category} - {registeredData.tier}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-primary/50 font-bold uppercase tracking-wider block">Amount Paid</span>
                    <span className="text-emerald-600 text-xs font-bold tracking-widest">₹{registeredData.amountPaid}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] text-primary/50 font-bold uppercase tracking-wider block">Transaction ID</span>
                    <span className="text-primary text-xs font-mono">{registeredData.transactionId}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-primary/50 font-bold uppercase tracking-wider block">Payment Date</span>
                    <span className="text-primary text-xs font-mono">{registeredData.paymentDate}</span>
                  </div>
                </div>
                {registeredData.iaphdNo && (
                  <div>
                    <span className="text-[9px] text-primary/50 font-bold uppercase tracking-wider block">IAPHD Membership No</span>
                    <span className="text-primary text-xs font-mono">{registeredData.iaphdNo}</span>
                  </div>
                )}
                {registeredData.hasAccompanying === 'yes' && (
                  <div className="bg-lightbg p-3 rounded border border-softgray">
                    <span className="text-[9px] text-[#C8A96B] font-bold uppercase tracking-wider block">Accompanying Person ({registeredData.accompanyingCount})</span>
                    <span className="text-primary text-xs">{registeredData.accompanyingName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Ticket Footer */}
            <div className="p-6 bg-lightbg border-t border-softgray text-center space-y-4">
              <p className="text-[10px] text-primary/70 leading-relaxed uppercase tracking-wider">
                Please present your registered Email or Mobile at the offline registration counter to complete verification.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  onClick={handleRegisterAnother}
                  className="px-6 py-3 bg-[#00A8CC]/10 hover:bg-[#00A8CC] text-[#00A8CC] hover:text-white font-black uppercase text-[10px] tracking-widest rounded-sm transition-all border border-[#00A8CC]/20"
                >
                  Register Another
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 bg-[#C8A96B] hover:bg-[#C8A96B]/80 text-white font-black uppercase text-[10px] tracking-widest rounded-sm transition-all shadow-md"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight text-primary pt-32 pb-20 font-sans relative overflow-x-hidden">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center space-y-4 mb-16">
          <span className="text-[10px] font-black uppercase tracking-[6px] text-[#C8A96B]">OFFLINE REGISTRATION</span>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-primary">
            Manual/UPI Registration Gateway
          </h1>
          <p className="text-xs text-primary/75 max-w-xl mx-auto leading-relaxed uppercase tracking-widest">
            Register offline for the 30th IAPHD National Conference. Scan the QR code, complete payment, and fill out details below.
          </p>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="max-w-md mx-auto mb-16 relative">
          <div className="h-0.5 bg-softgray absolute left-0 right-0 top-1/2 -translate-y-1/2 z-0"></div>
          <div
            className="h-0.5 bg-gradient-to-r from-[#00A8CC] to-[#C8A96B] absolute left-0 top-1/2 -translate-y-1/2 transition-all duration-500 z-0"
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          ></div>
          
          <div className="flex justify-between relative z-10">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-500 border-2 ${
                    s < step
                      ? 'bg-gradient-to-r from-[#00A8CC] to-[#C8A96B] border-transparent text-white scale-110'
                      : s === step
                      ? 'bg-secondary border-[#00A8CC] text-[#00A8CC] scale-110 shadow-[0_0_15px_rgba(0,168,204,0.15)]'
                      : 'bg-secondary border-softgray text-primary/30'
                  }`}
                >
                  {s < step ? <Check className="w-4 h-4" /> : s}
                </div>
                <span className={`text-[8px] uppercase tracking-widest mt-2 font-bold ${s === step ? 'text-[#00A8CC]' : 'text-primary/45'}`}>
                  {s === 1 ? 'Profile' : s === 2 ? 'Details' : s === 3 ? 'Options' : 'Scan & Submit'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Body with step content transitions */}
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6 bg-secondary border border-softgray p-8 rounded-xl"
              >
                <h3 className="text-sm font-black uppercase tracking-[4px] text-[#00A8CC] flex items-center mb-6">
                  <User className="w-4 h-4 mr-3" /> Step 1: Personal Profile
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Full Name (As on Certificate)</label>
                    <input
                      type="text" name="fullName" value={formData.fullName} onChange={handleInputChange}
                      className="w-full bg-softgray/30 border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none text-primary transition-colors placeholder-primary/30"
                      placeholder="Dr. John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Gender</label>
                    <select
                      name="gender" value={formData.gender} onChange={handleInputChange}
                      className="w-full bg-white border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none text-primary transition-colors"
                    >
                      <option value="">Select Gender</option>
                      <option value="MALE">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Mobile Number (WhatsApp)</label>
                    <input
                      type="tel" name="mobile" value={formData.mobile} onChange={handleInputChange}
                      onBlur={handleMobileBlur}
                      className="w-full bg-softgray/30 border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none text-primary transition-colors placeholder-primary/30"
                      placeholder="10 digit number"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Email Address</label>
                    <input
                      type="email" name="email" value={formData.email} onChange={handleInputChange}
                      onBlur={handleEmailBlur}
                      className="w-full bg-softgray/30 border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none text-primary transition-colors placeholder-primary/30"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Dental Council Registration No.</label>
                    <input
                      type="text" name="councilRegNo" value={formData.councilRegNo} onChange={handleInputChange}
                      className="w-full bg-softgray/30 border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none text-primary transition-colors placeholder-primary/30"
                      placeholder="State Dental Council Reg No."
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={nextStep}
                    className="w-full py-4 bg-gradient-to-r from-[#00A8CC] to-[#C8A96B] hover:opacity-90 font-black uppercase tracking-widest text-xs flex items-center justify-center text-white transition-all duration-300 group"
                  >
                    Next Step <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6 bg-secondary border border-softgray p-8 rounded-xl"
              >
                <h3 className="text-sm font-black uppercase tracking-[4px] text-[#00A8CC] flex items-center mb-6">
                  <Building className="w-4 h-4 mr-3" /> Step 2: Professional & Location
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Institution / College / Clinic</label>
                    <input
                      type="text" name="institution" value={formData.institution} onChange={handleInputChange}
                      className="w-full bg-softgray/30 border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none text-primary transition-colors placeholder-primary/30"
                      placeholder="ANIDS Dental College"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Designation</label>
                    <select
                      name="designation" value={formData.designation} onChange={handleInputChange}
                      className="w-full bg-white border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none text-primary transition-colors"
                    >
                      <option value="">Select Designation</option>
                      {["Principal", "Vice-Principal", "Head of the Department", "Professor", "Associate Professor", "Assistant Professor/ Senior Lecturer", "PG 1st year", "PG 2nd year", "PG 3rd year", "Other"].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Category</label>
                    <select
                      name="category" value={formData.category} onChange={handleInputChange}
                      className="w-full bg-white border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none text-primary transition-colors"
                    >
                      <option value="">Select Category</option>
                      {tiers && tiers[0]?.pricing.map(p => (
                        <option key={p.category} value={p.category}>{p.category}</option>
                      ))}
                    </select>
                  </div>

                  {formData.category && formData.category.includes('IAPHD') && !formData.category.includes('Non-IAPHD') && (
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">IAPHD Membership No.</label>
                      <input
                        type="text" name="iaphdNo" value={formData.iaphdNo} onChange={handleInputChange}
                        className="w-full bg-softgray/30 border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none text-primary transition-colors placeholder-primary/30"
                        placeholder="IAPHD No."
                      />
                    </div>
                  )}

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Address</label>
                    <input
                      type="text" name="address" value={formData.address} onChange={handleInputChange}
                      className="w-full bg-softgray/30 border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none text-primary transition-colors placeholder-primary/30"
                      placeholder="Clinic / House Address"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">City</label>
                    <input
                      type="text" name="city" value={formData.city} onChange={handleInputChange}
                      className="w-full bg-softgray/30 border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none text-primary transition-colors placeholder-primary/30"
                      placeholder="City"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">State</label>
                    <input
                      type="text" name="state" value={formData.state} onChange={handleInputChange}
                      className="w-full bg-softgray/30 border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none text-primary transition-colors placeholder-primary/30"
                      placeholder="State"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Pincode</label>
                    <input
                      type="text" name="pincode" value={formData.pincode} onChange={handleInputChange}
                      className="w-full bg-softgray/30 border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none text-primary transition-colors placeholder-primary/30"
                      placeholder="6 digit pincode"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button onClick={prevStep} className="flex-1 py-4 border border-softgray text-primary font-black uppercase tracking-widest text-xs hover:bg-softgray/30 transition-all">Back</button>
                  <button onClick={nextStep} className="flex-[2] py-4 bg-[#C8A96B] text-white hover:bg-[#C8A96B]/90 font-black uppercase tracking-widest text-xs flex items-center justify-center transition-all group">
                    Next Step <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6 bg-secondary border border-softgray p-8 rounded-xl"
              >
                <h3 className="text-sm font-black uppercase tracking-[4px] text-[#00A8CC] flex items-center mb-6">
                  <Users className="w-4 h-4 mr-3" /> Step 3: Package & Preferences
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Select Package Tier</label>
                    <select
                      name="tier" value={formData.tier} onChange={handleInputChange}
                      className="w-full bg-white border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none text-primary transition-colors"
                    >
                      <option value="classic">Classic Package</option>
                      <option value="premium">Premium Package (With Gala Banquet)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Food Preference</label>
                    <select
                      name="foodPreference" value={formData.foodPreference} onChange={handleInputChange}
                      className="w-full bg-white border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none text-primary transition-colors"
                    >
                      <option value="Non-Vegetarian">Non-Vegetarian</option>
                      <option value="Vegetarian">Vegetarian</option>
                    </select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Accompanying Person/Spouse?</label>
                    <select
                      name="hasAccompanying" value={formData.hasAccompanying} onChange={handleInputChange}
                      className="w-full bg-white border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none text-primary transition-colors"
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>

                  {formData.hasAccompanying === 'yes' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 border-l-2 border-[#C8A96B] pl-4 space-y-2"
                    >
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Accompanying Person Name</label>
                        <input
                          type="text" name="accompanyingName" value={formData.accompanyingName} onChange={handleInputChange}
                          className="w-full bg-softgray/30 border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none text-primary transition-colors placeholder-primary/30"
                          placeholder="Spouse / Friend Name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Number of Persons</label>
                        <input
                          type="number" name="accompanyingCount" value={formData.accompanyingCount} onChange={handleInputChange}
                          className="w-full bg-softgray/30 border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none text-primary transition-colors placeholder-primary/30"
                          placeholder="e.g. 1"
                          min="1"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Accompanying Food Preference</label>
                        <select
                          name="accompanyingFood" value={formData.accompanyingFood} onChange={handleInputChange}
                          className="w-full bg-white border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none text-primary transition-colors"
                        >
                          <option value="">Select Food</option>
                          <option value="Non-Vegetarian">Non-Vegetarian</option>
                          <option value="Vegetarian">Vegetarian</option>
                        </select>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="flex gap-4 pt-6">
                  <button onClick={prevStep} className="flex-1 py-4 border border-softgray text-primary font-black uppercase tracking-widest text-xs hover:bg-softgray/30 transition-all">Back</button>
                  <button onClick={nextStep} className="flex-[2] py-4 bg-[#C8A96B] text-white hover:bg-[#C8A96B]/90 font-black uppercase tracking-widest text-xs flex items-center justify-center transition-all group">
                    Next Step <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6 bg-secondary border border-softgray p-8 rounded-xl"
              >
                <h3 className="text-sm font-black uppercase tracking-[4px] text-[#00A8CC] flex items-center mb-4">
                  <QrCode className="w-4 h-4 mr-3" /> Step 4: Scan & Pay Details
                </h3>

                {/* Scan & Pay Instructions */}
                <div className="bg-lightbg border border-softgray p-5 rounded-lg space-y-4 text-center">
                  <span className="text-[9px] uppercase tracking-widest text-[#C8A96B] font-extrabold block">Scan to Pay via UPI</span>
                  
                  <div className="flex justify-center">
                    <img
                      src="/pnb-qr.png"
                      alt="PNB UPI Scan & Pay QR Code"
                      className="w-56 h-auto border border-softgray rounded shadow-md"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-primary/60 uppercase tracking-widest block font-bold">UPI ID</span>
                    <strong className="text-primary text-sm font-mono tracking-wider block select-all">8985268420m@pnb</strong>
                  </div>

                  <div className="border-t border-softgray/80 pt-3">
                    <span className="text-[10px] text-primary/60 uppercase block font-bold tracking-wider">Registration Base Fee (No convenience fee / GST)</span>
                    <strong className="text-emerald-700 text-2xl font-black block mt-1">₹{getCompleteBaseAmount()}/-</strong>
                  </div>
                </div>

                {/* Manual Transaction Input Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Transaction ID / UTR Number *</label>
                    <input
                      type="text" name="transactionId" value={formData.transactionId} onChange={handleInputChange}
                      className="w-full bg-softgray/30 border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none text-primary transition-colors placeholder-primary/30"
                      placeholder="Enter 12-digit UPI UTR or bank reference ID"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Amount Paid (INR) *</label>
                    <input
                      type="number" name="amountPaid" value={formData.amountPaid} onChange={handleInputChange}
                      className="w-full bg-softgray/30 border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none text-primary transition-colors placeholder-primary/30"
                      placeholder="e.g. 3500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Payment Date *</label>
                    <input
                      type="date" name="paymentDate" value={formData.paymentDate} onChange={handleInputChange}
                      className="w-full bg-softgray/30 border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none text-primary transition-colors"
                    />
                  </div>

                  {/* Photo Upload Container */}
                  <div className="space-y-2 md:col-span-2 border-t border-softgray pt-6">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Upload Passport Photo *</label>
                    
                    <div className="border-2 border-dashed border-softgray rounded-lg p-6 text-center relative hover:border-[#00A8CC] transition-colors group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setFormData(prev => ({ ...prev, photo: file }));
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="space-y-2">
                        <FileUp className="w-8 h-8 mx-auto text-primary/40 group-hover:text-[#00A8CC] transition-colors" />
                        <div className="text-xs text-primary font-bold">
                          {formData.photo ? formData.photo.name : 'Choose Passport Photo'}
                        </div>
                        <p className="text-[9px] text-primary/50 uppercase tracking-wider">
                          Drag & Drop or Click to Browse (JPG, PNG - Max 2MB)
                        </p>
                      </div>
                    </div>

                    {formData.photo && (
                      <div className="flex justify-center pt-3">
                        <img
                          src={URL.createObjectURL(formData.photo)}
                          alt="Preview"
                          className="w-24 h-24 object-cover rounded-sm border border-softgray shadow-md"
                        />
                      </div>
                    )}
                  </div>

                  {/* Payment Screenshot Upload Container */}
                  <div className="space-y-2 md:col-span-2 border-t border-softgray pt-6">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Upload Payment Screenshot *</label>
                    
                    <div className="border-2 border-dashed border-softgray rounded-lg p-6 text-center relative hover:border-[#00A8CC] transition-colors group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setFormData(prev => ({ ...prev, paymentScreenshot: file }));
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="space-y-2">
                        <FileUp className="w-8 h-8 mx-auto text-primary/40 group-hover:text-[#00A8CC] transition-colors" />
                        <div className="text-xs text-primary font-bold">
                          {formData.paymentScreenshot ? formData.paymentScreenshot.name : 'Choose Payment Screenshot'}
                        </div>
                        <p className="text-[9px] text-primary/50 uppercase tracking-wider">
                          Drag & Drop or Click to Browse (JPG, PNG - Max 2MB)
                        </p>
                      </div>
                    </div>

                    {formData.paymentScreenshot && (
                      <div className="flex justify-center pt-3">
                        <img
                          src={URL.createObjectURL(formData.paymentScreenshot)}
                          alt="Payment Screenshot Preview"
                          className="w-24 h-24 object-cover rounded-sm border border-softgray shadow-md"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button onClick={prevStep} className="flex-1 py-4 border border-softgray text-primary font-black uppercase tracking-widest text-xs hover:bg-softgray/30 transition-all">Back</button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-[2] py-4 bg-gradient-to-r from-[#00A8CC] to-[#C8A96B] text-white hover:opacity-90 font-black uppercase tracking-widest text-xs flex items-center justify-center transition-all duration-300 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting Registration...' : 'Complete Registration'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default OfflineRegistration;
