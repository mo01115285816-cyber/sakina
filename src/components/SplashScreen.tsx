import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

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
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#ece7de] px-6 select-none cursor-pointer"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Subtle warm ambient light glow */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[#b88a4f] opacity-[0.03] blur-[120px]" />
          </div>

          {/* Central Typographic Verse Only */}
          <div className="relative z-10 flex flex-col items-center max-w-2xl w-full text-center px-4">
            {/* The Quranic Verse */}
            <motion.p
              id="splash-verse"
              className="text-[18px] min-[360px]:text-[20px] min-[400px]:text-[22px] sm:text-2xl md:text-3xl lg:text-4xl font-normal leading-relaxed text-[#2b1a10] drop-shadow-sm font-quran whitespace-nowrap"
              style={{ direction: "rtl" }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              ﴿ إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا ﴾
            </motion.p>

            {/* Premium Verse Source */}
            <motion.span
              id="splash-verse-source"
              className="mt-5 text-sm font-medium text-[#b88a4f]/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              سورة النساء • الآية ١٠٣
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
