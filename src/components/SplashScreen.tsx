import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import logoImage from "@/assets/images/sakeenah_logo_kufi_1784151206504.jpg";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Dismiss automatically after 3.0 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          id="splash-screen-container"
          onClick={() => setIsVisible(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#FAFAF7] px-6 select-none cursor-pointer"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Subtle warm ambient light glow */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[#D4AF37] opacity-[0.03] blur-[120px]" />
          </div>

          {/* Central Typography and Verse */}
          <div className="relative z-10 flex flex-col items-center w-full text-center px-4">
            {/* Logo Image */}
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-64 h-64 sm:w-80 sm:h-80 mb-6 mix-blend-multiply"
            >
              <img
                src={logoImage}
                alt="شعار سكينة"
                className="w-full h-full object-contain"
              />
            </motion.div>

            {/* The Quranic Verse */}
            <motion.p
              id="splash-verse"
              className="text-[16px] min-[360px]:text-[18px] sm:text-xl font-normal leading-relaxed text-[#1a1a2e] drop-shadow-sm font-quran whitespace-nowrap"
              style={{ direction: "rtl" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 1.2,
                delay: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              ﴿ إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا
              مَّوْقُوتًا ﴾
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
