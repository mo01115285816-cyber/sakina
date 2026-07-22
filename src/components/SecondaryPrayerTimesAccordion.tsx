import React, { useState, useMemo, useEffect } from "react";
import { ChevronDown, Bell, BellOff } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SecondaryPrayerTimesAccordionProps {
  fajrDate?: Date;
  sunriseDate?: Date;
  maghribDate?: Date;
}

export const SecondaryPrayerTimesAccordion = React.memo(
  function SecondaryPrayerTimesAccordion({
    fajrDate,
    sunriseDate,
    maghribDate,
  }: SecondaryPrayerTimesAccordionProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [reminders, setReminders] = useState({
      duha: false,
      midnight: false,
      tahajjud: false,
    });

    // Load saved reminder states
    useEffect(() => {
      try {
        const duha =
          localStorage.getItem("app_isDuhaReminderEnabled") === "true";
        const midnight =
          localStorage.getItem("app_isMidnightReminderEnabled") === "true";
        const tahajjud =
          localStorage.getItem("app_isTahajjudReminderEnabled") === "true";
        setReminders({ duha, midnight, tahajjud });
      } catch (e) {
        console.warn("Failed to load spiritual reminders:", e);
      }
    }, []);

    const handleToggleReminder = (key: "duha" | "midnight" | "tahajjud") => {
      const newVal = !reminders[key];
      setReminders((prev) => ({ ...prev, [key]: newVal }));
      try {
        localStorage.setItem(
          `app_is${key.charAt(0).toUpperCase() + key.slice(1)}ReminderEnabled`,
          newVal.toString(),
        );
      } catch (e) {
        console.warn("Failed to save spiritual reminder:", e);
      }
    };

    // Calculate times
    const calculatedTimes = useMemo(() => {
      // Standard fallbacks if inputs are missing
      const defaultFajr = fajrDate ? new Date(fajrDate) : new Date();
      if (!fajrDate) defaultFajr.setHours(4, 30, 0, 0);

      const defaultSunrise = sunriseDate ? new Date(sunriseDate) : new Date();
      if (!sunriseDate) defaultSunrise.setHours(6, 5, 0, 0);

      const defaultMaghrib = maghribDate ? new Date(maghribDate) : new Date();
      if (!maghribDate) defaultMaghrib.setHours(18, 50, 0, 0);

      // 1. Duha: 15 minutes after Sunrise
      const duhaTime = new Date(defaultSunrise.getTime() + 15 * 60 * 1000);

      // 2. Midnight: Halfway between Maghrib and Fajr (of next day)
      const nextFajr = new Date(defaultFajr.getTime() + 24 * 60 * 60 * 1000);
      const nightDurationMs = nextFajr.getTime() - defaultMaghrib.getTime();

      const midnightTime = new Date(
        defaultMaghrib.getTime() + nightDurationMs / 2,
      );

      // 3. Last third of the night: Qiyam/Tahajjud start
      const lastThirdTime = new Date(nextFajr.getTime() - nightDurationMs / 3);

      const formatToLocalTimeAr = (date: Date): string => {
        const formatted = new Intl.DateTimeFormat("ar-EG", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }).format(date);
        // Clean up spacing and AM/PM symbols
        return formatted.replace("ص", "ص").replace("م", "م");
      };

      return {
        duha: formatToLocalTimeAr(duhaTime),
        midnight: formatToLocalTimeAr(midnightTime),
        tahajjud: formatToLocalTimeAr(lastThirdTime),
      };
    }, [fajrDate, sunriseDate, maghribDate]);

    return (
      <div className="w-full bg-white/50 backdrop-blur-md rounded-[24px] border border-white/60 shadow-sm overflow-hidden transition-all duration-300">
        {/* Header Button */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full h-13 px-5 flex items-center justify-between text-[#2b1a10] font-bold text-[14.5px] cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <span>أوقات أخرى</span>
          </span>
          <ChevronDown
            size={16}
            className={`transition-transform duration-300 text-[#7f6a55] ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Accordion Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="overflow-hidden border-t border-[#e6dccf]/30 bg-[#f7f2ea]/20"
            >
              <div className="p-4 space-y-3.5">
                {/* Row 1: Duha */}
                <div
                  onClick={() => handleToggleReminder("duha")}
                  className="flex items-center justify-between p-3 bg-[#fdfcfb] border border-[#e6dccf]/30 rounded-[18px] hover:border-[#b88a4f]/50 transition-all cursor-pointer shadow-[0_2px_8px_rgba(43,26,16,0.01)]"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        reminders.duha
                          ? "bg-[#b88a4f]/10 text-[#b88a4f]"
                          : "bg-[#f7f2ea] text-[#7f6a55]/60"
                      }`}
                    >
                      {reminders.duha ? (
                        <Bell size={13} />
                      ) : (
                        <BellOff size={13} />
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-[13.5px] font-bold text-[#2b1a10]">
                        صلاة الضحى
                      </p>
                      <p className="text-[10px] font-semibold text-[#7f6a55] leading-none mt-0.5">
                        بعد شروق الشمس بـ ١٥ دقيقة
                      </p>
                    </div>
                  </div>
                  <span className="text-[14px] font-bold text-[#b88a4f] tabular-nums pr-2">
                    {calculatedTimes.duha}
                  </span>
                </div>

                {/* Row 2: Midnight */}
                <div
                  onClick={() => handleToggleReminder("midnight")}
                  className="flex items-center justify-between p-3 bg-[#fdfcfb] border border-[#e6dccf]/30 rounded-[18px] hover:border-[#b88a4f]/50 transition-all cursor-pointer shadow-[0_2px_8px_rgba(43,26,16,0.01)]"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        reminders.midnight
                          ? "bg-[#b88a4f]/10 text-[#b88a4f]"
                          : "bg-[#f7f2ea] text-[#7f6a55]/60"
                      }`}
                    >
                      {reminders.midnight ? (
                        <Bell size={13} />
                      ) : (
                        <BellOff size={13} />
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-[13.5px] font-bold text-[#2b1a10]">
                        منتصف الليل الإسلامي
                      </p>
                      <p className="text-[10px] font-semibold text-[#7f6a55] leading-none mt-0.5">
                        منتصف المسافة بين المغرب والفجر
                      </p>
                    </div>
                  </div>
                  <span className="text-[14px] font-bold text-[#b88a4f] tabular-nums pr-2">
                    {calculatedTimes.midnight}
                  </span>
                </div>

                {/* Row 3: Last third */}
                <div
                  onClick={() => handleToggleReminder("tahajjud")}
                  className="flex items-center justify-between p-3 bg-[#fdfcfb] border border-[#e6dccf]/30 rounded-[18px] hover:border-[#b88a4f]/50 transition-all cursor-pointer shadow-[0_2px_8px_rgba(43,26,16,0.01)]"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        reminders.tahajjud
                          ? "bg-[#b88a4f]/10 text-[#b88a4f]"
                          : "bg-[#f7f2ea] text-[#7f6a55]/60"
                      }`}
                    >
                      {reminders.tahajjud ? (
                        <Bell size={13} />
                      ) : (
                        <BellOff size={13} />
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-[13.5px] font-bold text-[#2b1a10]">
                        الثلث الأخير من الليل
                      </p>
                      <p className="text-[10px] font-semibold text-[#7f6a55] leading-none mt-0.5">
                        أفضل وقت لقيام الليل والاستغفار
                      </p>
                    </div>
                  </div>
                  <span className="text-[14px] font-bold text-[#b88a4f] tabular-nums pr-2">
                    {calculatedTimes.tahajjud}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
);
