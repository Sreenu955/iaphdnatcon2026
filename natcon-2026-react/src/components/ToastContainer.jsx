import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useConference } from '../context/ConferenceContext';

const ToastContainer = () => {
  const { toasts } = useConference();

  return (
    <div className="fixed top-6 right-6 z-[99999] flex flex-col gap-3 w-full max-w-xs md:max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          let bgColor = 'bg-white/80 backdrop-blur-md';
          let borderColor = 'border-gray-250';
          let textColor = 'text-gray-800';
          let Icon = Info;
          let iconColor = 'text-blue-500';

          if (toast.type === 'success') {
            bgColor = 'bg-emerald-50/90 backdrop-blur-md';
            borderColor = 'border-emerald-200';
            textColor = 'text-emerald-900';
            Icon = CheckCircle2;
            iconColor = 'text-emerald-600';
          } else if (toast.type === 'error') {
            bgColor = 'bg-red-50/90 backdrop-blur-md';
            borderColor = 'border-red-200';
            textColor = 'text-red-900';
            Icon = AlertCircle;
            iconColor = 'text-red-600';
          } else if (toast.type === 'warning') {
            bgColor = 'bg-amber-50/90 backdrop-blur-md';
            borderColor = 'border-amber-200';
            textColor = 'text-amber-900';
            Icon = AlertTriangle;
            iconColor = 'text-amber-600';
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95, x: 50 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 100, transition: { duration: 0.2 } }}
              layout
              className={`p-4 rounded-sm border shadow-lg flex items-start space-x-3 pointer-events-auto overflow-hidden relative ${bgColor} ${borderColor}`}
            >
              {/* Left Accent Color bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                toast.type === 'success' ? 'bg-emerald-600' :
                toast.type === 'error' ? 'bg-red-600' :
                toast.type === 'warning' ? 'bg-amber-600' : 'bg-blue-600'
              }`} />

              <Icon className={`w-5 h-5 shrink-0 ${iconColor}`} />
              <div className="flex-1">
                <p className={`text-xs font-black uppercase tracking-wider ${textColor}`}>
                  {toast.type || 'info'}
                </p>
                <p className="text-xs text-primary/60 font-bold mt-0.5 leading-snug">
                  {toast.message}
                </p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;

