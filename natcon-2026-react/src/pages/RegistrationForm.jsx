import React, { useState, useEffect } from 'react';
import { useConference } from '../context/ConferenceContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  ChevronRight,
  AlertCircle,
  Users,
  Briefcase,
  CheckCircle2,
  ArrowLeft,
  FileUp,
  Building,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import RegistrationTable from '../components/RegistrationTable';
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

// Helper to load external scripts dynamically
const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
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

const RegistrationForm = () => {
  const { conferenceData, pricingPhase, addRegistration, registrationGuidelines, checkDuplicateRegistration, uploadImage, getRegistrationByQuery } = useConference();
  const location = useLocation();
  const navigate = useNavigate();
  const isFormPage = location.pathname === '/registration-form';

  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredData, setRegisteredData] = useState(null);
  const paymentMethod = 'online';
  const [isPaying, setIsPaying] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [duplicateError, setDuplicateError] = useState(null);
  const [isGuidelinesExpanded, setIsGuidelinesExpanded] = useState(false);
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
    addGalaBanquet: 'no',
    transactionId: '',
    paymentDate: '',
    amountPaid: '',
    photo: null,
    paymentScreenshot: null
  });

  const tiers = conferenceData.registration.tiers;

  useEffect(() => {
    const cached = localStorage.getItem('latestRegistration');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.id) {
          setRegisteredData(parsed);
          setIsSuccess(true);
        }
      } catch (e) {
        console.error("Failed to parse cached registration", e);
      }
    }
  }, []);

  const handleRegisterAnother = () => {
    localStorage.removeItem('latestRegistration');
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
      addGalaBanquet: 'no',
      transactionId: '',
      paymentDate: '',
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
    
    // Only prefill if critical profile data (like fullName) is still empty
    // so we don't overwrite user edits if they're actively editing
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

  const calculateConvenienceFee = (base) => {
    return base * 0.02;
  };

  const calculateGstOnFee = (fee) => {
    return fee * 0.18;
  };

  const calculateTotal = () => {
    const base = getCompleteBaseAmount();
    if (base <= 0) return 0;
    const fee = calculateConvenienceFee(base);
    const gst = calculateGstOnFee(fee);
    return Math.round((base + fee + gst) * 100) / 100;
  };

  const getBaseAmount = () => {
    const selectedTier = tiers.find(t => t.id === formData.tier);
    if (!selectedTier || !formData.category) return 0;
    const pricingRow = selectedTier.pricing.find(p => p.category === formData.category);
    if (!pricingRow) return 0;
    return pricingRow[pricingPhase];
  };

  const getAccompanyingTotal = () => {
    if (formData.hasAccompanying !== 'yes') return 0;
    const selectedTier = tiers.find(t => t.id === formData.tier);
    if (!selectedTier) return 0;
    const accompanyingPricing = selectedTier.pricing.find(p => p.category === "Accompanying person/Spouse");
    if (!accompanyingPricing) return 0;
    const count = parseInt(formData.accompanyingCount, 10) || 1;
    return count * accompanyingPricing[pricingPhase];
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
        showSwalAlert('Category Required', 'Please select your  Category.', 'warning');
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
      showSwalAlert('Selection Required', 'Please select your  Category and enter your City in the second step.', 'warning');
      setStep(2);
      return;
    }
    if (!formData.transactionId || !formData.paymentDate || !formData.amountPaid) {
      showSwalAlert('Payment Details Required', 'Please fill out all manual payment fields (Transaction ID, Date, and Amount).', 'warning');
      return;
    }

    setIsPaying(true);
    let profilePicUrl = null;
    try {
      if (formData.photo) {
        profilePicUrl = await uploadImage(formData.photo);
      }
    } catch (uploadErr) {
      console.error("Error uploading profile photo:", uploadErr);
    }
    setIsPaying(false);

    const submissionData = {
      ...formData,
      profilePic: profilePicUrl,
      status: 'PENDING',
      offline_online: 'online'
    };

    try {
      const saved = await addRegistration(submissionData);
      setRegisteredData(saved);
      localStorage.setItem('latestRegistration', JSON.stringify(saved));
      setIsSuccess(true);
    } catch (error) {
      console.error('Failed to resolve manual registration response:', error);
      if (error.message && (error.message.includes('already registered') || error.message.includes('Duplicate'))) {
        showSwalAlert('Already Registered', error.message, 'error');
        return;
      }
      const fallbackRecord = {
        ...submissionData,
        id: `NATCON-${Math.floor(1000 + Math.random() * 9000)}`
      };
      setRegisteredData(fallbackRecord);
      localStorage.setItem('latestRegistration', JSON.stringify(fallbackRecord));
      setIsSuccess(true);
    }
  };

  const handleOnlinePaymentAndRegister = async () => {
    if (!formData.fullName || !formData.email || !formData.mobile) {
      showSwalAlert('Profile Required', 'Please fill out all required profile details in the first step.', 'warning');
      setStep(1);
      return;
    }
    if (!formData.category || !formData.city) {
      showSwalAlert('Selection Required', 'Please select your  Category and enter your City in the second step.', 'warning');
      setStep(2);
      return;
    }
    if (!formData.photo) {
      showSwalAlert('Passport Photo Required', 'Please upload your  Passport Photo in Step 4.', 'warning');
      return;
    }
    const finalAmount = calculateTotal();
    if (finalAmount <= 0) {
      showSwalAlert('Tariff Row Selection Required', 'Please select your  Category and Registration Type (Tier) first.', 'warning');
      return;
    }

    setIsPaying(true);

    let profilePicUrl = null;
    try {
      if (formData.photo) {
        profilePicUrl = await uploadImage(formData.photo);
      }
    } catch (uploadErr) {
      console.error("Error uploading profile photo:", uploadErr);
    }

    const isLoaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!isLoaded) {
      showSwalAlert('Connection Error', 'Failed to load Razorpay Payment Gateway SDK. Please check your internet connection.', 'error');
      setIsPaying(false);
      return;
    }

    const options = {
      key: 'rzp_test_SoRhYUYZD5NZRE', // Provided test key
      amount: finalAmount * 100, // in paise
      currency: 'INR',
      name: '30th IAPHD NATCON 2026',
      description: `${formData.tier.toUpperCase()} Registration - ${formData.category}`,
      image: 'https://iaphdnatcon2026.com/natcon-2026-backend/uploads/img_6a17dc268e90c8.65457545.png',
      handler: async function (response) {
        setIsPaying(false);
        setIsFinalizing(true);
        const paymentId = response.razorpay_payment_id;

        // Save registration with status 'CONFIRMED'
        const submissionData = {
          ...formData,
          profilePic: profilePicUrl,
          transactionId: paymentId,
          paymentDate: new Date().toISOString().split('T')[0],
          amountPaid: finalAmount,
          status: 'CONFIRMED',
          offline_online: 'online'
        };

        try {
          const saved = await addRegistration(submissionData);
          setRegisteredData(saved);
          localStorage.setItem('latestRegistration', JSON.stringify(saved));
          setIsSuccess(true);
        } catch (error) {
          console.error('Failed to resolve registration response:', error);
          if (error.message && (error.message.includes('already registered') || error.message.includes('Duplicate'))) {
            showSwalAlert('Already Registered', error.message, 'error');
            return;
          }
          // Fallback to local submissionData in case of connection interrupt
          const fallbackRecord = {
            ...submissionData,
            profilePic: profilePicUrl,
            id: `NATCON-${Math.floor(1000 + Math.random() * 9000)}`
          };
          setRegisteredData(fallbackRecord);
          localStorage.setItem('latestRegistration', JSON.stringify(fallbackRecord));
          setIsSuccess(true);
        } finally {
          setIsFinalizing(false);
        }
      },
      prefill: {
        name: formData.fullName,
        email: formData.email,
        contact: formData.mobile,
      },
      notes: {
        institution: formData.institution,
        designation: formData.designation,
        category: formData.category,
        tier: formData.tier,
        hasAccompanying: formData.hasAccompanying
      },
      theme: {
        color: '#00A8CC' // Premium brand red
      },
      modal: {
        ondismiss: async function () {
          setIsPaying(false);
          if (!formData.fullName || !formData.email || !formData.mobile) {
            console.warn("Skipped saving failed checkout record because profile data is empty.");
            return;
          }
          try {
            // Save the failed/aborted checkout record in the database
            const failedSubmission = {
              ...formData,
              profilePic: profilePicUrl,
              transactionId: 'FAILED-' + Date.now(),
              paymentDate: new Date().toISOString().split('T')[0],
              amountPaid: finalAmount,
              status: 'FAILED',
              offline_online: 'online'
            };
            await addRegistration(failedSubmission);
            console.log("Failed/Aborted checkout record saved in database.");
          } catch (e) {
            console.error("Failed to insert failed payment record:", e);
          }
        }
      }
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      showSwalAlert('Payment Gateway Error', 'There was an error opening the Razorpay Payment Gateway.', 'error');
      setIsPaying(false);
    }
  };

  if (isSuccess && registeredData) {
    return (
      <div className="min-h-screen bg-midnight text-primary pt-32 pb-20 font-sans flex flex-col items-center justify-center relative overflow-x-hidden">
        {/* Dynamic CSS for watermarks, cursive fonts, check lines */}
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

          @media (max-width: 768px) {
            .overlay-no { font-size: 9px !important; }
            .overlay-date { font-size: 9px !important; }
            .overlay-name { font-size: 14px !important; }
            .overlay-words { font-size: 8px !important; }
            .overlay-by { font-size: 7px !important; }
            .overlay-fee { font-size: 10px !important; }
          }
        `}</style>

        <div className="max-w-4xl w-full mx-auto px-4 space-y-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-[#C8A96B]/10 rounded-full flex items-center justify-center mx-auto text-[#00A8CC] animate-pulse">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tight">
              {registeredData.status === 'CONFIRMED' ? 'Registration Confirmed!' : 'Registration Submitted'}
            </h2>
            <p className="text-xs uppercase tracking-widest text-[#00A8CC] font-bold">Your e-receipt has been generated and emailed to you.</p>
          </div>

          {/* landscape E-Receipt Card Component */}
          <div
            id="printable-receipt"
            className="receipt-card max-w-4xl mx-auto rounded-sm overflow-hidden select-none border border-[#cfbfa3] shadow-2xl bg-white relative"
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
              {registeredData.id}
            </div>

            {/* 2. Date */}
            <div
              className="absolute overlay-date font-extrabold text-[#0f4c81] uppercase tracking-wider leading-none"
              style={{ top: '33.8%', left: '79.7%' }}
            >
              {formatDate(registeredData.paymentDate)}
            </div>

            {/* 3. Received with thanks from */}
            <div
              className="absolute overlay-name signature-font italic text-[#0c2340] leading-none"
              style={{ top: '42.8%', left: '26.5%' }}
            >
              Dr. {registeredData.fullName.toUpperCase()}
            </div>

            {/* 4. The sum of rupees */}
            <div
              className="absolute overlay-words font-extrabold text-slate-800 uppercase tracking-wider leading-none"
              style={{ top: '51.7%', left: '21%' }}
            >
              {numberToWords(registeredData.amountPaid)}
            </div>

            {/* 5. By (Transaction details / category / tier) */}
            <div
              className="absolute overlay-by font-bold text-slate-700 tracking-wide leading-none"
              style={{ top: '60.2%', left: '7.2%' }}
            >
              {registeredData.transactionId
                ? `ONLINE TRANSACTION (REF: ${registeredData.transactionId})`
                : 'DIRECT BANK TRANSFER (MANUAL)'}
              <span className="text-[#0f4c81] font-extrabold ml-2">({registeredData.category} - {registeredData.tier.toUpperCase()})</span>
            </div>

            {/* 6. Total Fee Box Amount (Centered in the white input area next to ₹) */}
            <div
              className="absolute overlay-fee font-black text-slate-800 tracking-widest leading-none select-text"
              style={{ top: '91%', left: '6%' }}
            >
              {Number(registeredData.amountPaid).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/-
            </div>
          </div>

          {/* Credentials Display Box */}
          {registeredData && (
            <div className="bg-white/5 border border-white/10 p-6 rounded-sm max-w-4xl mx-auto relative overflow-hidden shadow-2xl">
              <div className="absolute -right-10 -top-10 w-24 h-24 rounded-full bg-[#00A8CC]/10 blur-xl pointer-events-none"></div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
                <div className="space-y-2">
                  <h3 className="text-sm font-black uppercase text-[#C8A96B] tracking-wider flex items-center gap-2">
                    🔑 Profile Access Credentials
                  </h3>
                  <p className="text-[10px] text-primary/75 font-semibold uppercase tracking-wider leading-relaxed">
                    Use your registration ID and password to log in and edit your profile details at any time.
                  </p>
                  <div className="flex flex-wrap gap-4 mt-3">
                    <div className="bg-midnight/40 border border-white/5 px-4 py-2 rounded-sm">
                      <span className="text-[9px] text-primary/50 font-bold uppercase block tracking-widest">Registration ID / Email</span>
                      <strong className="text-[#00A8CC] font-mono text-sm tracking-wider">{registeredData.id}</strong>
                    </div>
                    <div className="bg-midnight/40 border border-white/5 px-4 py-2 rounded-sm">
                      <span className="text-[9px] text-primary/50 font-bold uppercase block tracking-widest">Profile Password</span>
                      <strong className="text-emerald-400 font-mono text-sm tracking-wider">
                        {registeredData.password || (registeredData.mobile ? registeredData.mobile.replace(/\D/g, '') : 'N/A')}
                      </strong>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2 shrink-0 md:text-right">
                  <Link
                    to="/utility?tab=profile"
                    className="inline-flex items-center justify-center px-5 py-3 bg-[#00A8CC] hover:bg-[#C8A96B] text-midnight hover:text-white font-black uppercase text-[10px] tracking-widest rounded-sm transition-all shadow-[0_4px_12px_rgba(0,168,204,0.15)] hover:scale-[1.02]"
                  >
                    Go to My Profile <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                  <p className="text-[9px] text-primary/30 uppercase font-bold tracking-wider">
                    Immutable: Email & Mobile Number
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-[#C8A96B]/5 border border-[#00A8CC]/20 p-5 rounded-sm flex items-start space-x-3 max-w-4xl mx-auto">
            <AlertCircle className="w-5 h-5 text-[#00A8CC] shrink-0 mt-0.5" />
            <div className="text-[10px] font-bold text-primary/60 uppercase leading-relaxed tracking-wider">
              {registeredData.status === 'CONFIRMED' ? (
                <>
                  <p className="text-green-400 font-black mb-1">Instant Verification Complete</p>
                  Your online payment has been securely captured via Razorpay. Your unique credentials and a copy of this e-receipt have been sent to <span className="text-[#00A8CC]">{registeredData.email}</span>. See you in Visakhapatnam!
                </>
              ) : (
                <>
                  <p className="text-primary font-black mb-1">Verification in Progress</p>
                  Our secretariat is currently validating your manual transaction ID/UTR. Your official E-Receipt and Registration Number details will be dispatched to <span className="text-[#00A8CC]">{registeredData.email}</span> shortly.
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 max-w-4xl mx-auto">
            <Link to="/" className="flex-1 py-4 bg-softgray/30 border border-softgray hover:bg-softgray/50 text-center font-black uppercase text-xs tracking-widest rounded-sm transition-all border border-softgray">
              Back to Home
            </Link>
            <button
              onClick={handleRegisterAnother}
              className="flex-1 py-4 bg-[#C8A96B] hover:bg-[#14213D] text-center font-black uppercase text-xs tracking-widest rounded-sm transition-all text-white border border-transparent shadow-[0_4px_14px_rgba(200,169,107,0.25)] hover:scale-[1.02]"
            >
              Register Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight text-primary pt-32 pb-20 font-sans">
      {/* Premium High-Tech Checkout & Finalization Loader Overlay */}
      <AnimatePresence>
        {(isPaying || isFinalizing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#030712]/98 backdrop-blur-2xl text-white font-sans text-center px-4 overflow-hidden"
          >
            {/* Pulsing Neon Background Ambient Glows */}
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-[#00A8CC]/10 blur-[120px] pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[#C8A96B]/10 blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>

            {/* Glowing AI / Innovation Rotating Core */}
            <div className="relative flex items-center justify-center mb-10">
              {/* Outer Neon Orbit Particles (Floating Dot Elements) */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute w-48 h-48 rounded-full border border-dashed border-[#00A8CC]/20 flex items-center justify-center"
              >
                <div className="absolute -top-1 w-2 h-2 rounded-full bg-[#00A8CC] shadow-[0_0_15px_#00A8CC]"></div>
              </motion.div>

              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute w-36 h-36 rounded-full border border-dashed border-[#C8A96B]/20 flex items-center justify-center"
              >
                <div className="absolute -bottom-1 w-2 h-2 rounded-full bg-[#C8A96B] shadow-[0_0_15px_#C8A96B]"></div>
              </motion.div>

              {/* Central Pulsing Glowing Node Core */}
              <div className="relative w-20 h-20 rounded-full bg-[#0d1527] border border-white/10 flex items-center justify-center shadow-[0_0_50px_rgba(0,168,204,0.3)] z-10">
                <svg className="animate-spin h-10 w-10 text-[#00A8CC] filter drop-shadow-[0_0_8px_#00A8CC]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-15" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                  <path className="opacity-85" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </div>

            {/* Dynamic Status Text & Headings */}
            <div className="space-y-4 max-w-lg z-10 px-4">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center space-x-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-[#00A8CC] shadow-inner"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#00A8CC] animate-ping"></span>
                <span>Secure Payment Gateway Connection Active</span>
              </motion.div>

              <motion.h3
                key={isPaying ? 'paying' : 'finalizing'}
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -15, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white"
              >
                {isPaying ? (
                  <>Initializing <span className="text-[#00A8CC] italic">Secure Checkout</span></>
                ) : (
                  <>Payment <span className="text-[#C8A96B] italic">Secured Successfully</span></>
                )}
              </motion.h3>

              <motion.p
                key={isPaying ? 'paying-desc' : 'finalizing-desc'}
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -15, opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="text-xs md:text-sm font-medium text-white/70 tracking-wide leading-relaxed"
              >
                {isPaying ? (
                  "Configuring Razorpay merchant pipeline and establishing 256-bit SSL handshake. Please complete your transaction in the secure window..."
                ) : (
                  "Compiling  registration database nodes, allocating sequence indices, and dispatching credentials and official E-Receipt..."
                )}
              </motion.p>
            </div>

            {/* Sleek High-Tech Shimmering Progress Bar */}
            <div className="w-64 md:w-80 h-1 bg-white/10 rounded-full overflow-hidden mt-8 relative z-10">
              <div className="absolute top-0 left-0 h-full w-1/2 bg-gradient-to-r from-[#00A8CC] to-[#C8A96B] rounded-full animate-shimmer-bar"></div>
            </div>

            {/* Safety Warning */}
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 bg-white/5 border border-white/10 rounded-xl p-4 text-[9px] uppercase font-bold tracking-widest text-white/50 max-w-sm z-10 leading-relaxed shadow-inner"
            >
              Please do not close this browser tab, refresh, or navigate away. Your registration will finalize automatically.
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center text-primary text-xs font-black uppercase tracking-widest mb-6 hover:text-accent transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
            {isFormPage ? (
              <>Online <span className="text-[#00A8CC] italic">Registration</span></>
            ) : (
              <>Registration <span className="text-[#00A8CC] italic">Tariff</span></>
            )}
          </h1>

          {isFormPage && (
            <div className="flex space-x-4 mt-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-[#C8A96B] shadow-[0_0_10px_#00A8CC]' : 'bg-softgray/50'}`}></div>
              ))}
            </div>
          )}
        </div>

        {!isFormPage ? (
          <div className="max-w-5xl mx-auto pt-6">
            <RegistrationTable onProceed={() => navigate('/registration-form')} plain={true} />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Form Side */}
            <div className="lg:col-span-2 space-y-8">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <div className="bg-secondary shadow-[0_4px_20px_rgba(20,33,61,0.05)] border border-softgray p-8 rounded-sm border border-softgray space-y-6">
                      <h3 className="text-sm font-black uppercase tracking-[4px] text-[#00A8CC] flex items-center">
                        <User className="w-4 h-4 mr-3" />  Profile
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Full Name (AS ON CERTIFICATE)</label>
                          <input
                            type="text" name="fullName" value={formData.fullName} onChange={handleInputChange}
                            className="w-full bg-softgray/30 border border-softgray border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none transition-colors"
                            placeholder="Dr. John Doe"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Gender</label>
                          <select
                            name="gender" value={formData.gender} onChange={handleInputChange}
                            className="w-full  border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none transition-colors"
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
                            className="w-full bg-softgray/30 border border-softgray border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none transition-colors"
                            placeholder="+91 98765 43210"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Email Address</label>
                          <input
                            type="email" name="email" value={formData.email} onChange={handleInputChange}
                            onBlur={handleEmailBlur}
                            className="w-full bg-softgray/30 border border-softgray border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none transition-colors"
                            placeholder="john@example.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Institution/College/Clinic</label>
                          <input
                            type="text" name="institution" value={formData.institution} onChange={handleInputChange}
                            className="w-full bg-softgray/30 border border-softgray border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none transition-colors"
                            placeholder="Name of Institution"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Designation</label>
                          <select
                            name="designationSelect"
                            value={
                              !formData.designation
                                ? ""
                                : ["Principal", "Vice-Principal", "Head of the Department", "Professor", "Associate Professor", "Assistant Professor/ Senior Lecturer", "PG 1st year", "PG 2nd year", "PG 3rd year"].includes(formData.designation)
                                  ? formData.designation
                                  : "OTHERS"
                            }
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "OTHERS") {
                                setFormData(prev => ({ ...prev, designation: "Other" }));
                              } else {
                                setFormData(prev => ({ ...prev, designation: val }));
                              }
                            }}
                            className="w-full  border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none transition-colors"
                          >
                            <option value="">Select Designation</option>
                            {["Principal", "Vice-Principal", "Head of the Department", "Professor", "Associate Professor", "Assistant Professor/ Senior Lecturer", "PG 1st year", "PG 2nd year", "PG 3rd year", "OTHERS"].map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>

                        {/* Other Designation Textbox */}
                        {(formData.designation !== "" && !["Principal", "Vice-Principal", "Head of the Department", "Professor", "Associate Professor", "Assistant Professor/ Senior Lecturer", "PG 1st year", "PG 2nd year", "PG 3rd year"].includes(formData.designation)) && (
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#00A8CC] animate-pulse">Specify Designation</label>
                            <input
                              type="text"
                              name="designation"
                              value={formData.designation === "Other" ? "" : formData.designation}
                              onChange={handleInputChange}
                              className="w-full bg-softgray/30 border border-softgray border border-accent/30 rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none transition-colors"
                              placeholder="Enter your custom designation"
                            />
                          </div>
                        )}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Dental Council Reg No.</label>
                          <input
                            type="text" name="councilRegNo" value={formData.councilRegNo} onChange={handleInputChange}
                            className="w-full bg-softgray/30 border border-softgray border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none transition-colors"
                            placeholder="Reg No."
                          />
                        </div>
                      </div>

                      {duplicateError && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-red-500/10 border border-red-500/30 p-4 rounded-sm flex items-start space-x-3 text-red-400 mt-4"
                        >
                          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                          <div className="text-xs font-bold uppercase tracking-wider leading-relaxed text-left">
                            <p className="font-black mb-1">Registration Error</p>
                            {duplicateError} Please use different credentials or contact support if you believe this is a mistake.
                          </div>
                        </motion.div>
                      )}
                    </div>
                    <button
                      onClick={nextStep}
                      disabled={checkingDuplicate}
                      className="w-full py-5 bg-[#C8A96B] text-white shadow-[0_4px_14px_rgba(200,169,107,0.25)] hover:bg-[#14213D] hover:text-[#00A8CC] hover:scale-[1.02] font-black uppercase tracking-widest text-xs flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 group"
                    >
                      {checkingDuplicate ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Verifying Profile details...
                        </>
                      ) : (
                        <>Next Step <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                      )}
                    </button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <div className="bg-secondary shadow-[0_4px_20px_rgba(20,33,61,0.05)] border border-softgray p-8 rounded-sm border border-softgray space-y-6">
                      <h3 className="text-sm font-black uppercase tracking-[4px] text-[#00A8CC] flex items-center">
                        <MapPin className="w-4 h-4 mr-3" /> Address & Category
                      </h3>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Address for Communication</label>
                          <textarea
                            name="address" value={formData.address} onChange={handleInputChange}
                            className="w-full bg-softgray/30 border border-softgray border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none transition-colors h-24"
                            placeholder="Your complete address"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2 col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">City</label>
                            <input
                              type="text" name="city" value={formData.city} onChange={handleInputChange}
                              className="w-full bg-softgray/30 border border-softgray border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none transition-colors"
                              placeholder="City"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">State</label>
                            <input
                              type="text" name="state" value={formData.state} onChange={handleInputChange}
                              className="w-full bg-softgray/30 border border-softgray border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none transition-colors"
                              placeholder="State"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">PINCODE</label>
                            <input
                              type="text" name="pincode" value={formData.pincode} onChange={handleInputChange}
                              className="w-full bg-softgray/30 border border-softgray border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none transition-colors"
                              placeholder="6 digits"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Category</label>
                            <select
                              name="category" value={formData.category} onChange={handleInputChange}
                              className="w-full  border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none transition-colors"
                            >
                              <option value="">Select Category</option>
                              {tiers && tiers[0]?.pricing.map(p => (
                                <option key={p.category} value={p.category}>{p.category}</option>
                              ))}
                            </select>
                          </div>
                          {formData.category && formData.category.includes('IAPHD') && !formData.category.includes('Non-IAPHD') && (
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">IAPHD Membership No.</label>
                              <input
                                type="text" name="iaphdNo" value={formData.iaphdNo} onChange={handleInputChange}
                                className="w-full bg-softgray/30 border border-softgray border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none transition-colors"
                                placeholder="Membership No."
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <button onClick={prevStep} className="flex-1 py-5 border border-softgray font-black uppercase tracking-widest text-xs hover:bg-softgray/30 border border-softgray transition-all">Back</button>
                      <button onClick={nextStep} className="flex-[2] py-5 bg-[#C8A96B] text-white shadow-[0_4px_14px_rgba(200,169,107,0.25)] hover:bg-[#14213D] hover:text-[#00A8CC] hover:scale-[1.02] font-black uppercase tracking-widest text-xs flex items-center justify-center transition-all duration-300 group">
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
                    className="space-y-6"
                  >
                    <div className="bg-secondary shadow-[0_4px_20px_rgba(20,33,61,0.05)] border border-softgray p-8 rounded-sm border border-softgray space-y-8">
                      <h3 className="text-sm font-black uppercase tracking-[4px] text-[#00A8CC] flex items-center">
                        <Briefcase className="w-4 h-4 mr-3" /> Conference Details
                      </h3>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Registration Type</label>
                        <div className="grid grid-cols-2 gap-3">
                          {["CLASSIC", "PREMIUM"].map(t => (
                            <button
                              key={t}
                              onClick={() => setFormData(prev => ({ ...prev, tier: t.toLowerCase(), addGalaBanquet: 'no' }))}
                              className={`p-4 border text-[10px] font-bold uppercase tracking-widest text-center transition-all ${formData.tier === t.toLowerCase() ? 'border-[#00A8CC] bg-[#C8A96B] text-white shadow-[0_4px_14px_rgba(200,169,107,0.25)] hover:bg-[#14213D] hover:text-white transition-all' : 'border-softgray bg-softgray/30 border border-softgray text-primary/80 hover:border-softgray'
                                }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>


                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Food Preference</label>
                        <div className="flex space-x-8">
                          {["Vegetarian", "Non-Vegetarian"].map(opt => (
                            <label key={opt} className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="radio" name="foodPreference" value={opt} checked={formData.foodPreference === opt} onChange={handleInputChange}
                                className="w-4 h-4 accent-primary"
                              />
                              <span className="text-xs font-bold uppercase tracking-widest">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4 pt-6 border-t border-softgray">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Any accompanying person(s)?</label>
                        <div className="flex space-x-8">
                          {['yes', 'no'].map(opt => (
                            <label key={opt} className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="radio" name="hasAccompanying" value={opt} checked={formData.hasAccompanying === opt} onChange={handleInputChange}
                                className="w-4 h-4 accent-primary"
                              />
                              <span className="text-xs font-bold uppercase tracking-widest">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {formData.hasAccompanying === 'yes' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          className="space-y-6 pt-4 border-t border-softgray"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Accompanying Person's Name</label>
                              <input
                                type="text" name="accompanyingName" value={formData.accompanyingName} onChange={handleInputChange}
                                className="w-full bg-softgray/30 border border-softgray border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none transition-colors"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Number of Accompanying Persons</label>
                              <input
                                type="number" name="accompanyingCount" value={formData.accompanyingCount} onChange={handleInputChange}
                                className="w-full bg-softgray/30 border border-softgray border border-softgray rounded-sm p-4 text-sm focus:border-[#00A8CC] outline-none transition-colors"
                              />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Food Preference (Accompanying)</label>
                              <div className="flex space-x-8 mt-2">
                                {["Vegetarian", "Non-Vegetarian"].map(opt => (
                                  <label key={opt} className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                      type="radio" name="accompanyingFood" value={opt} checked={formData.accompanyingFood === opt} onChange={handleInputChange}
                                      className="w-4 h-4 accent-primary"
                                    />
                                    <span className="text-xs font-bold uppercase tracking-widest">{opt}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                    <div className="flex gap-4">
                      <button onClick={prevStep} className="flex-1 py-5 border border-softgray font-black uppercase tracking-widest text-xs hover:bg-softgray/30 border border-softgray transition-all">Back</button>
                      <button onClick={nextStep} className="flex-[2] py-5 bg-[#C8A96B] text-white shadow-[0_4px_14px_rgba(200,169,107,0.25)] hover:bg-[#14213D] hover:text-[#00A8CC] hover:scale-[1.02] font-black uppercase tracking-widest text-xs flex items-center justify-center transition-all duration-300 group">
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
                    className="space-y-6"
                  >
                    <div className="bg-secondary shadow-[0_4px_20px_rgba(20,33,61,0.05)] border border-softgray p-8 rounded-sm border border-softgray space-y-8">
                      <h3 className="text-sm font-black uppercase tracking-[4px] text-[#00A8CC] flex items-center">
                        <CreditCard className="w-4 h-4 mr-3" /> Payment & Uploads
                      </h3>

                      {/* Passport Photo (Always Required/Shown) */}
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/80"> Passport Photo</label>
                        <div className="relative group cursor-pointer">
                          <input
                            type="file" accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={(e) => setFormData(prev => ({ ...prev, photo: e.target.files[0] }))}
                          />
                          <div className="border-2 border-dashed border-softgray group-hover:border-[#00A8CC]/50 transition-colors p-6 text-center space-y-2 rounded-sm">
                            <FileUp className="w-8 h-8 text-primary/80 group-hover:text-primary mx-auto transition-colors" />
                            <p className="text-[9px] font-bold text-primary/80 uppercase tracking-widest">
                              {formData.photo ? formData.photo.name : 'Click or Drag to Upload Passport Photo'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Secure Checkout Summary */}
                      <div className="space-y-6 pt-6 border-t border-softgray">
                        <div className="bg-softgray/30 border border-softgray p-6 rounded-sm space-y-4 border border-softgray">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-[#00A8CC]">Secure Checkout Summary</h4>
                          <div className="space-y-2 text-xs font-bold uppercase tracking-wider text-primary/60">
                            <div className="flex justify-between border-b border-softgray pb-2">
                              <span> Name</span>
                              <span className="text-primary">{formData.fullName || 'Not entered'}</span>
                            </div>
                            <div className="flex justify-between border-b border-softgray pb-2">
                              <span>Email Address</span>
                              <span className="text-primary normal-case">{formData.email || 'Not entered'}</span>
                            </div>
                            <div className="flex justify-between border-b border-softgray pb-2">
                              <span>Selected Package</span>
                              <span className="text-primary">{formData.tier} - {formData.category || 'N/A'}</span>
                            </div>

                            {formData.hasAccompanying === 'yes' && (
                              <div className="flex justify-between border-b border-softgray pb-2 text-[#00A8CC]">
                                <span>Accompanying Person Add-on (x{parseInt(formData.accompanyingCount, 10) || 1})</span>
                                <span>+ ₹{getAccompanyingTotal().toLocaleString()}</span>
                              </div>
                            )}
                            {getCompleteBaseAmount() > 0 && (
                              <>
                                <div className="flex justify-between border-b border-softgray pb-2 text-primary/60 text-[11px]">
                                  <span>Base Registration Amount</span>
                                  <span>₹{getCompleteBaseAmount().toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between border-b border-softgray pb-2 text-primary/60 text-[11px]">
                                  <span>Convenience Fee (2%)</span>
                                  <span>₹{calculateConvenienceFee(getCompleteBaseAmount()).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between border-b border-softgray pb-2 text-primary/60 text-[11px]">
                                  <span>GST on Convenience Fee (18%)</span>
                                  <span>₹{calculateGstOnFee(calculateConvenienceFee(getCompleteBaseAmount())).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                              </>
                            )}
                            <div className="flex justify-between pt-2 text-sm font-black text-primary">
                              <span>Total Amount Payable</span>
                              <span className="text-[#00A8CC]">₹{calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-softgray/30 border border-softgray border border-softgray p-5 rounded-sm flex items-start space-x-3">
                          <AlertCircle className="w-4 h-4 text-[#00A8CC] shrink-0 mt-0.5" />
                          <p className="text-[9px] font-bold text-primary/80 uppercase leading-relaxed tracking-wider">
                            You are checking out in <span className="text-[#00A8CC] font-black">Test Mode</span>. Use card details or UPI mocks provided in the gateway to complete the payment.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={prevStep}
                        disabled={isPaying}
                        className="flex-1 py-5 border border-softgray font-black uppercase tracking-widest text-xs hover:bg-softgray/30 border border-softgray disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Back
                      </button>

                      <button
                        type="button"
                        onClick={handleOnlinePaymentAndRegister}
                        disabled={isPaying}
                        className="flex-[2] py-5 bg-[#C8A96B] text-white shadow-[0_4px_14px_rgba(200,169,107,0.25)] hover:bg-[#14213D] hover:text-[#00A8CC] hover:scale-[1.02] font-black uppercase tracking-widest text-xs flex items-center justify-center disabled:bg-[#C8A96B]/50 disabled:text-white/70 disabled:cursor-not-allowed transition-all duration-300 group shadow-[0_10px_25px_rgba(200,169,107,0.35)]"
                      >
                        {isPaying ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            INITIALIZING SECURE CHECKOUT...
                          </>
                        ) : (
                          <>
                            PAY & REGISTER SECURELY <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Panel: Guidelines (scrollable separately) on top + Order Summary on bottom */}
            <div className="lg:col-span-1 space-y-6">
              {/* Dynamic Registration Guidelines Panel - Accordion style */}
              <div className="bg-secondary shadow-[0_4px_20px_rgba(20,33,61,0.05)] border border-softgray border border-softgray rounded-sm overflow-hidden transition-all duration-300">
                <button
                  type="button"
                  onClick={() => setIsGuidelinesExpanded(!isGuidelinesExpanded)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-softgray/30 border border-softgray transition-colors cursor-pointer select-none"
                >
                  <div className="flex items-center space-x-3">
                    <span className="shrink-0 w-2 h-2 rounded-full bg-[#C8A96B] animate-pulse"></span>
                    <span className="text-[10px] font-black uppercase tracking-[3px] text-primary/80">Registration Guidelines</span>
                  </div>
                  {isGuidelinesExpanded ? (
                    <ChevronUp className="w-4 h-4 text-primary/60" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-primary/60 animate-bounce" />
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {isGuidelinesExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden border-t border-softgray"
                    >
                      <div className="p-6 space-y-4 bg-softgray/30">
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-tighter text-primary">{registrationGuidelines.heading}</h4>
                          <p className="text-[10px] text-primary/80 mt-2 leading-relaxed">{registrationGuidelines.intro}</p>
                        </div>

                        {/* Scrollable Container with custom padding and spacing */}
                        <div className="max-h-[180px] overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-accent/20">
                          {registrationGuidelines.steps.map((step, i) => (
                            <div key={i} className="flex items-start space-x-3">
                              <span className="shrink-0 w-5 h-5 bg-[#C8A96B]/10 border border-[#00A8CC]/20 rounded-sm flex items-center justify-center text-[9px] font-black text-[#00A8CC]">{i + 1}</span>
                              <p className="text-[10px] font-medium text-primary/60 leading-relaxed">{step}</p>
                            </div>
                          ))}
                        </div>

                        <p className="text-[9px] text-primary/80 leading-relaxed italic border-t border-softgray pt-2">{registrationGuidelines.note}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Order Summary - Rendered below Guidelines */}
              <div className="bg-secondary shadow-[0_4px_20px_rgba(20,33,61,0.05)] border border-softgray border border-softgray p-8 rounded-sm sticky top-32">
                <h3 className="text-xs font-black uppercase tracking-[4px] text-primary/80 mb-8 border-b border-softgray pb-4">Order Summary</h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-black uppercase text-[#00A8CC] tracking-widest">Selected Tier</p>
                      <p className="text-xl font-black uppercase tracking-tighter">{formData.tier}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase text-primary/80 tracking-widest">Phase</p>
                      <p className="text-xs font-bold uppercase">{pricingPhase}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-primary/80 tracking-widest"> Category</p>
                    <p className="text-sm font-bold text-primary uppercase">{formData.category || 'Not Selected'}</p>
                    {formData.category === 'Foreign delegates' && formData.tier && (
                      <p className="text-[8px] font-black text-[#00A8CC] uppercase tracking-widest leading-relaxed">
                        ({formData.tier === 'classic' ? '250 USD' : '300 USD'} converted to INR)
                      </p>
                    )}
                  </div>

                  <div className="pt-6 border-t border-softgray space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-primary/80 uppercase tracking-widest">Base Amount</span>
                      <span className="text-lg font-black text-primary">
                        {typeof getBaseAmount() === 'number' ? `₹${getBaseAmount().toLocaleString()}` : getBaseAmount()}
                      </span>
                    </div>

                    {formData.hasAccompanying === 'yes' && (
                      <div className="flex justify-between items-center text-[#00A8CC]">
                        <span className="text-xs font-bold uppercase tracking-widest">
                          Accompanying (x{parseInt(formData.accompanyingCount, 10) || 1})
                        </span>
                        <span className="text-sm font-black">+ ₹{getAccompanyingTotal().toLocaleString()}</span>
                      </div>
                    )}
                    {getCompleteBaseAmount() > 0 && (
                      <>
                        <div className="flex justify-between items-center text-primary/60 text-[10px]">
                          <span className="font-bold uppercase tracking-widest">Base Registration</span>
                          <span className="font-bold">₹{getCompleteBaseAmount().toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-primary/60 text-[10px]">
                          <span className="font-bold uppercase tracking-widest">Convenience Fee (2%)</span>
                          <span className="font-bold">₹{calculateConvenienceFee(getCompleteBaseAmount()).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center text-primary/60 text-[10px]">
                          <span className="font-bold uppercase tracking-widest">GST on Fee (18%)</span>
                          <span className="font-bold">₹{calculateGstOnFee(calculateConvenienceFee(getCompleteBaseAmount())).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-primary/80 uppercase tracking-widest">GST (18%)</span>
                      <span className="text-xs font-bold text-primary/80 uppercase tracking-widest">Included</span>
                    </div>
                    <div className="h-[1px] bg-softgray/50 w-full"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-black text-primary uppercase tracking-tighter">Total Payable</span>
                      <span className="text-3xl font-black text-[#00A8CC] tracking-tighter">
                        {typeof calculateTotal() === 'number' ? `₹${calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : calculateTotal()}
                      </span>
                    </div>
                  </div>

                  <div className="bg-softgray/30 border border-softgray p-4 rounded-sm border border-softgray flex items-start space-x-3">
                    <AlertCircle className="w-4 h-4 text-[#00A8CC] shrink-0 mt-0.5" />
                    <p className="text-[9px] font-bold text-primary/80 uppercase leading-relaxed tracking-wider">
                      Registration fee includes kit, certificate, and meals.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationForm;

