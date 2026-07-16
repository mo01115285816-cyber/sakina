/**
 * UnsavedChangesModal — Interceptor when user tries to leave with dirty state
 * نافذة التحذير من التغييرات غير المحفوظة
 * 
 * Reference: IMG_20260716_172711_963.jpg
 */
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

export const UnsavedChangesModal = React.memo(function UnsavedChangesModal({
  isOpen,
  onSave,
  onDiscard,
}: UnsavedChangesModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Gray overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/45"
            onClick={onDiscard}
          />

          {/* Modal card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="fixed inset-x-0 z-[101] top-1/2 -translate-y-1/2 mx-auto w-full max-w-[340px] px-6"
            dir="rtl"
          >
            <div className="rounded-[24px] bg-[#fdfcfb] p-6 shadow-[0_16px_48px_rgba(43,26,16,0.2)] border border-[#e6dccf]/50">
              {/* Warning Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-[#fff3e0] flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e67e22" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-center text-[18px] font-black text-[#2b1a10] mb-2">
                التغييرات غير محفوظة
              </h3>

              {/* Subtitle */}
              <p className="text-center text-[14px] text-[#7f6a55] leading-relaxed mb-6">
                تغييراتك غير محفوظة. هل أنت متأكد من مغادرة هذه الصفحة؟
              </p>

              {/* Buttons */}
              <div className="space-y-3">
                {/* Primary: Save Changes */}
                <button
                  onClick={onSave}
                  className="w-full rounded-full bg-[#2b1a10] text-white text-[15px] font-bold py-3.5 px-6 transition-all duration-200 hover:bg-[#3a2517] active:scale-[0.98] shadow-md cursor-pointer"
                >
                  احفظ التغييرات
                </button>

                {/* Secondary: Discard */}
                <button
                  onClick={onDiscard}
                  className="w-full text-center text-[14px] font-bold text-[#7f6a55] py-2 transition-colors hover:text-[#2b1a10] underline underline-offset-4 cursor-pointer"
                >
                  امسح التغييرات
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
