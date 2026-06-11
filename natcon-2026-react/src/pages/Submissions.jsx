import React, { useState } from 'react';
import { useConference } from '../context/ConferenceContext';
import { motion } from 'framer-motion';
import { FileUp, FileText, Send, ArrowLeft, Info, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const Submissions = () => {
  const { abstractGuidelines, getRegistrationByQuery, uploadImage, addSubmission } = useConference();
  const [submissionType, setSubmissionType] = useState('abstract');
  
  // Verification states
  const [regId, setRegId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedDelegate, setVerifiedDelegate] = useState(null);
  
  // Upload and Submission states
  const [selectedCategory, setSelectedCategory] = useState('Oral Scientific Poster');
  const [uploadFile, setUploadFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const handleVerify = async () => {
    if (!regId) {
      Swal.fire({
        title: 'REQUIRED',
        text: 'Please enter your Registration ID / Unique ID.',
        icon: 'warning',
        confirmButtonColor: '#00A8CC',
        background: '#ffffff',
        color: '#14213D'
      });
      return;
    }
    
    setIsVerifying(true);
    try {
      const result = await getRegistrationByQuery('id', regId);
      setIsVerifying(false);
      
      if (result && result.success && result.record) {
        setVerifiedDelegate(result.record);
        Swal.fire({
          title: 'VERIFIED',
          text: `Welcome, Dr. ${result.record.fullName.toUpperCase()}! You are now authorized to submit files.`,
          icon: 'success',
          confirmButtonColor: '#00A8CC',
          background: '#ffffff',
          color: '#14213D'
        });
      } else {
        Swal.fire({
          title: 'NOT FOUND',
          text: result.error || 'No delegate found matching this Unique ID. Please check the ID and try again.',
          icon: 'error',
          confirmButtonColor: '#00A8CC',
          background: '#ffffff',
          color: '#14213D'
        });
      }
    } catch (err) {
      setIsVerifying(false);
      console.error(err);
      Swal.fire({
        title: 'ERROR',
        text: 'An error occurred while connecting to the database.',
        icon: 'error',
        confirmButtonColor: '#00A8CC',
        background: '#ffffff',
        color: '#14213D'
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (e.g. limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      Swal.fire({
        title: 'FILE TOO LARGE',
        text: 'The file size exceeds the 10MB limit.',
        icon: 'warning',
        confirmButtonColor: '#00A8CC',
        background: '#ffffff',
        color: '#14213D'
      });
      return;
    }
    
    setUploadFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      Swal.fire({
        title: 'FILE REQUIRED',
        text: 'Please select a file to submit.',
        icon: 'warning',
        confirmButtonColor: '#00A8CC',
        background: '#ffffff',
        color: '#14213D'
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Upload the file via the server API
      const fileUrl = await uploadImage(uploadFile);
      
      if (fileUrl) {
        // Record the submission in the MySQL database
        const saveRes = await addSubmission({
          regId: verifiedDelegate.id,
          type: submissionType,
          category: selectedCategory,
          fileUrl: fileUrl,
          fileName: uploadFile.name
        });
        
        setIsSubmitting(false);
        if (saveRes && saveRes.success) {
          setSubmissionSuccess(true);
          Swal.fire({
            title: 'SUBMISSION SUCCESSFUL',
            text: `Your ${submissionType} has been successfully submitted!`,
            icon: 'success',
            confirmButtonColor: '#00A8CC',
            background: '#ffffff',
            color: '#14213D'
          });
        } else {
          Swal.fire({
            title: 'SUBMISSION RECORD FAILED',
            text: saveRes.error || 'Uploaded file successfully, but failed to record the submission. Please try again.',
            icon: 'error',
            confirmButtonColor: '#00A8CC',
            background: '#ffffff',
            color: '#14213D'
          });
        }
      } else {
        setIsSubmitting(false);
        Swal.fire({
          title: 'UPLOAD FAILED',
          text: 'Failed to upload your file. Please try again or contact support.',
          icon: 'error',
          confirmButtonColor: '#00A8CC',
          background: '#ffffff',
          color: '#14213D'
        });
      }
    } catch (err) {
      setIsSubmitting(false);
      console.error(err);
      Swal.fire({
        title: 'SUBMISSION ERROR',
        text: 'An error occurred during submission. Please try again.',
        icon: 'error',
        confirmButtonColor: '#00A8CC',
        background: '#ffffff',
        color: '#14213D'
      });
    }
  };

  return (
    <div className="min-h-screen bg-midnight text-primary pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center md:text-left">
          <Link to="/" className="inline-flex items-center text-primary text-xs font-black uppercase tracking-widest mb-6 hover:text-accent transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
          <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-4">
            Submission <span className="text-[#00A8CC] italic">Portal</span>
          </h1>
          <p className="text-primary/80 font-bold uppercase tracking-[4px] text-xs">Delegate scientific abstract & presentation portal</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-10"
        >
          {/* Portal Select */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <button
              onClick={() => {
                setSubmissionType('abstract');
                setUploadFile(null);
              }}
              className={`p-10 rounded-sm border-2 transition-all text-left relative overflow-hidden group ${submissionType === 'abstract' ? 'border-[#00A8CC] bg-[#C8A96B]/5' : 'border-softgray bg-secondary shadow-[0_4px_20px_rgba(20,33,61,0.05)] border border-softgray hover:border-accent/30'
                }`}
            >
              <div className="relative z-10">
                <FileText className={`w-12 h-12 mb-6 ${submissionType === 'abstract' ? 'text-[#00A8CC]' : 'text-primary/80'}`} />
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Abstract Submission</h3>
                <p className="text-xs font-bold text-primary/80 uppercase tracking-widest leading-relaxed">Submit your research summary for scientific review.</p>
                <div className="mt-6 flex items-center text-[#00A8CC] font-black uppercase text-[10px] tracking-[4px]">
                  {submissionType === 'abstract' ? 'Portal Active' : 'Open Portal'} <Send className="ml-3 w-4 h-4" />
                </div>
              </div>
              {submissionType === 'abstract' && <div className="absolute top-0 right-0 w-32 h-32 bg-[#C8A96B]/10 rounded-bl-full" />}
            </button>

            <button
              onClick={() => {
                setSubmissionType('presentation');
                setUploadFile(null);
              }}
              className={`p-10 rounded-sm border-2 transition-all text-left relative overflow-hidden group ${submissionType === 'presentation' ? 'border-[#00A8CC] bg-[#C8A96B]/5' : 'border-softgray bg-secondary shadow-[0_4px_20px_rgba(20,33,61,0.05)] border border-softgray hover:border-accent/30'
                }`}
            >
              <div className="relative z-10">
                <FileUp className={`w-12 h-12 mb-6 ${submissionType === 'presentation' ? 'text-[#00A8CC]' : 'text-primary/80'}`} />
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Presentation Upload</h3>
                <p className="text-xs font-bold text-primary/80 uppercase tracking-widest leading-relaxed">Upload final PPT/PDF for accepted presentations.</p>
                <div className="mt-6 flex items-center text-[#00A8CC] font-black uppercase text-[10px] tracking-[4px]">
                  {submissionType === 'presentation' ? 'Portal Active' : 'Open Portal'} <Send className="ml-3 w-4 h-4" />
                </div>
              </div>
              {submissionType === 'presentation' && <div className="absolute top-0 right-0 w-32 h-32 bg-[#C8A96B]/10 rounded-bl-full" />}
            </button>
          </div>

          {submissionSuccess ? (
            <div className="bg-secondary shadow-[0_4px_20px_rgba(20,33,61,0.05)] border border-softgray p-8 md:p-16 rounded-sm text-center space-y-6">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
              <h2 className="text-3xl font-black uppercase tracking-tighter">Submission Received</h2>
              <p className="text-sm font-medium text-primary/80 leading-relaxed max-w-xl mx-auto">
                Thank you, Dr. <span className="font-black text-[#00A8CC]">{verifiedDelegate?.fullName.toUpperCase()}</span>. Your {submissionType} has been successfully submitted and stored under your Registration ID: <span className="font-black text-[#00A8CC]">{verifiedDelegate?.id}</span>.
              </p>
              <div className="bg-softgray/10 p-4 border border-softgray rounded-sm max-w-lg mx-auto">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary/60 block mb-1">Session Category</span>
                <span className="text-xs font-bold text-[#00A8CC] uppercase tracking-wider">{selectedCategory}</span>
              </div>
              <button
                onClick={() => {
                  setSubmissionSuccess(false);
                  setUploadFile(null);
                }}
                className="px-8 py-4 bg-[#C8A96B] hover:bg-[#14213D] text-white hover:text-accent font-black uppercase text-xs tracking-widest transition-all rounded-sm cursor-pointer"
              >
                Submit Another File
              </button>
            </div>
          ) : (
            /* Dynamic Form Area */
            <div className="bg-secondary shadow-[0_4px_20px_rgba(20,33,61,0.05)] border border-softgray p-8 md:p-16 rounded-sm">
              <div className="max-w-3xl mx-auto space-y-12">
                <div className="border-b border-softgray pb-8">
                  <h4 className="text-xs font-black uppercase tracking-[6px] text-[#00A8CC] mb-4">Submission Step 01</h4>
                  <h2 className="text-3xl font-black uppercase tracking-tighter">Enter Registration Number</h2>
                  <p className="text-primary/80 text-sm mt-4 leading-relaxed font-medium italic">
                    * You must be a registered delegate to submit abstracts or presentations. Please enter the Unique ID received in your confirmation email.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Registration ID / Unique ID</label>
                    <div className="flex gap-4">
                      <input
                        type="text"
                        value={regId}
                        onChange={(e) => setRegId(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleVerify(); }}
                        placeholder="e.g. REG-XXXX"
                        disabled={verifiedDelegate !== null}
                        className="flex-1 bg-softgray/30 border border-softgray rounded-sm p-5 text-sm focus:border-[#00A8CC] outline-none transition-colors uppercase tracking-widest font-bold"
                      />
                      {verifiedDelegate ? (
                        <button
                          onClick={() => {
                            setVerifiedDelegate(null);
                            setRegId('');
                            setUploadFile(null);
                          }}
                          className="px-8 py-5 bg-red-600 text-white font-black uppercase text-xs tracking-widest hover:bg-red-700 transition-all cursor-pointer"
                        >
                          Change
                        </button>
                      ) : (
                        <button
                          onClick={handleVerify}
                          disabled={isVerifying}
                          className="px-8 py-5 bg-[#C8A96B] text-white font-black uppercase text-xs tracking-widest hover:bg-[#14213D] hover:text-accent transition-all disabled:opacity-50 cursor-pointer"
                        >
                          {isVerifying ? 'Verifying...' : 'Verify'}
                        </button>
                      )}
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className={`space-y-8 pt-8 transition-all ${verifiedDelegate ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Select Session Category</label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full bg-softgray/30 border border-softgray rounded-sm p-4 text-xs font-bold uppercase outline-none"
                        >
                          <option value="Oral Scientific Poster">Oral Scientific Poster</option>
                          <option value="Quick Impact Presentation">Quick Impact Presentation</option>
                          <option value="Award Paper Session">Award Paper Session</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/80">
                          Upload {submissionType === 'abstract' ? 'Doc/PDF' : 'PPTX/PDF'}
                        </label>
                        <input
                          type="file"
                          accept={submissionType === 'abstract' ? '.pdf,.doc,.docx' : '.ppt,.pptx,.pdf'}
                          onChange={handleFileChange}
                          className="hidden"
                          id="submission-file-input"
                        />
                        <label
                          htmlFor="submission-file-input"
                          className="w-full bg-softgray/30 border border-softgray border border-dashed rounded-sm p-4 text-center cursor-pointer hover:border-[#00A8CC] transition-colors block"
                        >
                          <FileUp className="w-6 h-6 mx-auto mb-2 text-primary/80" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-primary/80">
                            {uploadFile ? `Selected: ${uploadFile.name}` : 'Click to Browse File'}
                          </span>
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !uploadFile}
                      className="w-full py-5 bg-[#C8A96B] text-white shadow-[0_4px_14px_rgba(200,169,107,0.25)] hover:bg-[#14213D] hover:text-[#00A8CC] hover:scale-[1.01] transition-all duration-300 font-black uppercase text-xs tracking-widest flex items-center justify-center border border-softgray disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isSubmitting ? 'Uploading Submission...' : 'Submit File'}
                    </button>
                  </form>
                </div>

                <div className="bg-[#C8A96B]/10 border border-[#00A8CC]/20 p-8 flex items-start space-x-6">
                  <Info className="w-8 h-8 text-[#00A8CC] shrink-0" />
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-primary">Review Guidelines</h5>
                    <p className="text-[10px] font-medium text-primary/60 leading-relaxed tracking-wider uppercase">
                      Before submitting, ensure your document follows the word limit ({abstractGuidelines?.rules?.[1] || '250 words for abstracts'}) and structure specified in the{' '}
                      <Link to="/abstract-guidelines" className="text-[#00A8CC] underline cursor-pointer">Abstract Guidelines</Link>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Submissions;
