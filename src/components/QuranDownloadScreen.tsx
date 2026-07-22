import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Download } from "lucide-react";

interface Props {
  onClose: () => void;
  onDownloaded: () => void;
}

export default function QuranDownloadScreen({ onClose, onDownloaded }: Props) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");

  const startDownload = async () => {
    setIsDownloading(true);
    setStatusText("جاري التحميل...");
    try {
      // MOCK DOWNLOAD for UI Template
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((r) => setTimeout(r, 200));
        setProgress(i);
      }
      setTimeout(() => {
        onDownloaded();
      }, 500);
    } catch (err) {
      console.error("Failed to download Quran", err);
      setIsDownloading(false);
      setStatusText("حدث خطأ أثناء التحميل. يرجى المحاولة مرة أخرى.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center font-sans bg-[#ece7de] text-[#2b1a10]"
      dir="rtl"
    >
      {/* Close Button at top left */}
      <button
        onClick={onClose}
        className="absolute top-6 left-6 w-10 h-10 rounded-full flex items-center justify-center cut-crystal-capsule text-[#7f6a55] transition-transform hover:scale-105 active:scale-95 z-10 hover:text-[#b88a4f]"
      >
        <X size={20} strokeWidth={2} />
      </button>

      <div className="flex-1 w-full flex flex-col items-center justify-center p-6 pb-20">
        {/* Central Emblema / Circle with Progress Ring */}
        <div className="relative w-[280px] h-[280px] mb-8 flex items-center justify-center">
          {/* Progress Ring */}
          {isDownloading && (
            <svg
              className="absolute inset-0 w-full h-full -rotate-90 z-0 overflow-visible"
              viewBox="0 0 280 280"
            >
              {/* Active Progress Ring */}
              <circle
                cx="140"
                cy="140"
                r="134"
                fill="none"
                stroke="#b88a4f"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="841.94"
                strokeDashoffset={841.94 - (841.94 * progress) / 100}
                className="transition-all duration-500 ease-out"
              />
            </svg>
          )}

          {/* White inner circle base matching reference */}
          {/* We make it slightly smaller to create the gap between it and the progress ring */}
          <div className="absolute inset-4 rounded-full cut-crystal-satin shadow-2xl flex items-center justify-center overflow-hidden z-10">
            {/* Using the original King Fahd Quran Calligraphy */}
            <img
              src="/images/quran-calligraphy.svg"
              alt="القرآن الكريم"
              className="w-[75%] h-[75%] object-contain"
            />
          </div>
        </div>

        {/* Text Details */}
        <div className="flex flex-col items-center text-center">
          <h2 className="text-[26px] font-semibold text-[#2b1a10] mb-1">
            تنزيل المصحف
          </h2>

          <div className="h-8">
            <AnimatePresence mode="wait">
              {isDownloading ? (
                <motion.div
                  key="downloading"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex items-center gap-1.5 text-[18px] text-[#7f6a55]"
                >
                  <span className="tabular-nums font-medium" dir="ltr">
                    {progress}%
                  </span>
                  <span className="font-medium">مكتمل</span>
                </motion.div>
              ) : (
                <motion.p
                  key="waiting"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-[16px] text-[#7f6a55]"
                >
                  يرجى البقاء في التطبيق حتى يكتمل التحميل.
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Fixed Download Button (Only shows if not downloading) */}
      <AnimatePresence>
        {!isDownloading && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="absolute bottom-12 left-0 right-0 px-6 flex justify-center z-20"
          >
            <button
              onClick={startDownload}
              className="w-full max-w-[320px] flex items-center justify-center gap-3 py-3.5 rounded-full bg-gradient-to-br from-[#deab65] to-[#b88a4f] gem-rim-glow text-white font-bold text-[18px] shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>تنزيل المصحف</span>
              <Download size={20} className="opacity-90" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
