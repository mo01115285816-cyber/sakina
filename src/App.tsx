import React, { useEffect, useMemo, useRef, useState, useCallback, startTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { dailyHadithData } from "@/data/dailyHadithData";
import { detectCalcMethodByLocation, detectAsrSchoolByLocation } from "@/utils/locationDetection";
import type { CalculationMethod, AsrSchool } from "@/utils/locationDetection";
import { calculatePrayerTimes, getLocalTimeMinutes, getLocalNowForCountdown } from "@/utils/prayerTimes";
import type { PrayerItem } from "@/utils/prayerTimes";
import ManualLocationDialog from "@/components/ManualLocationDialog";
import AzkarTabScreen from "@/components/AzkarTabScreen";
import AzkarCounterScreen from "@/components/AzkarCounterScreen";
import SplashScreen from "@/components/SplashScreen";
import QcfVerse from "@/components/QcfVerse";
import QuranTabScreen from "@/components/QuranTabScreen";
import AsmaAlHusnaScreen from "@/components/AsmaAlHusnaScreen";
import { SettingsScreen } from "@/components/SettingsScreen";
import { WeatherDisplay } from "@/components/WeatherDisplay";
import { HadithCard } from "@/components/HadithCard";
import { PrayerNotificationsService } from "@/services/PrayerNotificationsService";
import { BookOpenText } from "lucide-react";
import { PrayerKey, TabType, AzkarCounterType, WeatherData } from "@/types/app.types";
import { backgrounds, prayerReflections, calcMethodLabels, asrSchoolLabels } from "@/constants/prayerContent";
import { ringRadius, ringLength, TOTAL_SLIDES, SWIPE_THRESHOLD_PX, SWIPE_VELOCITY_PX, DIRECTION_LOCK_PX, EDGE_RESISTANCE } from "@/constants/uiConstants";
import { getDayOfYear, getCurrentPrayerIndex, getCountdownSeconds, formatCountdown } from "@/utils/timeHelpers";
import { SettingsIcon, HomeIcon, AdhkarIcon, PrayerIcon, ClockTiny, PlayTiny, LocationPin, ArrowLeftIcon } from "@/components/icons/AppIcons";

/* ════════════════════════════════════════════════════════════════════════
   STATIC DATA
   ════════════════════════════════════════════════════════════════════════ */

/* prayerSchedule is now computed dynamically — see useMemo below */


/* ════════════════════════════════════════════════════════════════════════
   CONSTANTS
   ════════════════════════════════════════════════════════════════════════ */


/* ════════════════════════════════════════════════════════════════════════
   HELPERS
   ════════════════════════════════════════════════════════════════════════ */

/* ════════════════════════════════════════════════════════════════════════
   MAIN APP
   ════════════════════════════════════════════════════════════════════════ */

export default function App() {
  /* ── Existing state ── */
  const [now, setNow] = useState(() => new Date());
  const [currentSlide, setCurrentSlide] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ── NEW state ── */
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("main");
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [showAzkarCounter, setShowAzkarCounter] = useState(false);
  const [showAsmaAlHusna, setShowAsmaAlHusna] = useState(false);
  const [azkarCounterType, setAzkarCounterType] = useState<AzkarCounterType>("morning");
  const [hisnCategory, setHisnCategory] = useState<string>("");

  // Track whether to hide bottom floating navigation based on Quran sub-screens (Sheikh profile, Audio player)
  const [quranHideNav, setQuranHideNav] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const [isAutoLocation, setIsAutoLocation] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("app_isAutoLocation");
      return saved !== null ? saved === "true" : true;
    } catch {
      return true;
    }
  });
  
  const [cityName, setCityName] = useState<string>(() => {
    try {
      return localStorage.getItem("app_cityName") || "القاهرة، مصر";
    } catch {
      return "القاهرة، مصر";
    }
  });
  
  const [cityLat, setCityLat] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("app_cityLat");
      return saved ? parseFloat(saved) : 30.0444;
    } catch {
      return 30.0444;
    }
  });
  
  const [cityLon, setCityLon] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("app_cityLon");
      return saved ? parseFloat(saved) : 31.2357;
    } catch {
      return 31.2357;
    }
  });
  const [calcMethod, setCalcMethod] = useState<CalculationMethod>(() => {
    try {
      const saved = localStorage.getItem("app_calcMethod") as CalculationMethod;
      return saved || "EGYPTIAN";
    } catch {
      return "EGYPTIAN";
    }
  });
  
  const [asrSchool, setAsrSchool] = useState<AsrSchool>(() => {
    try {
      const saved = localStorage.getItem("app_asrSchool") as AsrSchool;
      return saved || "STANDARD";
    } catch {
      return "STANDARD";
    }
  });

  const [isAutoCalcMethod, setIsAutoCalcMethod] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("app_isAutoCalcMethod");
      return saved !== null ? saved === "true" : true;
    } catch {
      return true;
    }
  });

  const [isAutoAsrSchool, setIsAutoAsrSchool] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("app_isAutoAsrSchool");
      return saved !== null ? saved === "true" : true;
    } catch {
      return true;
    }
  });

  const [isPrayerReminderEnabled, setIsPrayerReminderEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("app_isPrayerReminderEnabled");
      return saved !== null ? saved === "true" : true;
    } catch {
      return true;
    }
  });

  const [isPrePrayerReminderEnabled, setIsPrePrayerReminderEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("app_isPrePrayerReminderEnabled");
      return saved !== null ? saved === "true" : true;
    } catch {
      return true;
    }
  });

  const [isMulkReminderEnabled, setIsMulkReminderEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("app_isMulkReminderEnabled");
      return saved !== null ? saved === "true" : false;
    } catch {
      return false;
    }
  });

  const [mulkReminderTime, setMulkReminderTime] = useState<string>(() => {
    try {
      return localStorage.getItem("app_mulkReminderTime") || "21:00";
    } catch {
      return "21:00";
    }
  });

  const [isBaqarahReminderEnabled, setIsBaqarahReminderEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("app_isBaqarahReminderEnabled");
      return saved !== null ? saved === "true" : false;
    } catch {
      return false;
    }
  });

  const [baqarahReminderTime, setBaqarahReminderTime] = useState<string>(() => {
    try {
      return localStorage.getItem("app_baqarahReminderTime") || "20:30";
    } catch {
      return "20:30";
    }
  });

  const [weather, setWeather] = useState<WeatherData | null>(null);

  /* ── Effects ── */
  useEffect(() => {
    let isMounted = true;
    async function fetchWeather() {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${cityLat}&longitude=${cityLon}&current_weather=true`);
        const data = await res.json();
        if (isMounted && data.current_weather) {
          setWeather({
            temp: Math.round(data.current_weather.temperature),
            conditionCode: data.current_weather.weathercode,
            isDay: data.current_weather.is_day === 1,
          });
        }
      } catch (e) {
        console.warn("Failed to fetch weather", e);
      }
    }
    fetchWeather();
    return () => { isMounted = false; };
  }, [cityLat, cityLon]);

  /* ── Dynamic prayer schedule (recomputes when location/date changes) ── */
  const prayerSchedule = useMemo<PrayerItem[]>(
    () => calculatePrayerTimes(now, cityLat, cityLon, calcMethod, asrSchool),
    [now.getDate(), now.getMonth(), now.getFullYear(), cityLat, cityLon, calcMethod, asrSchool]
  );

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeTab]);

  useEffect(() => {
    let isMounted = true;
    async function initNotifications() {
      try {
        const granted = await PrayerNotificationsService.requestPermission();
        if (!isMounted) return;
        
        // Always clear old scheduled notifications first
        await PrayerNotificationsService.clearAllScheduled();

        if (granted) {
          // Schedule notifications for each prayer except sunrise
          for (const prayer of prayerSchedule) {
            if (prayer.key === "sunrise" || !prayer.date) continue;

            const reflection = prayerReflections[prayer.key];
            const verseText = reflection 
              ? (reflection.isQuran ? `﴿ ${reflection.text} ﴾ - ${reflection.source}` : `« ${reflection.text} » - ${reflection.source}`)
              : "";

            // Schedule pre-prayer reminder if enabled
            if (isPrePrayerReminderEnabled) {
              await PrayerNotificationsService.schedulePrePrayerReminder(prayer.name, prayer.date, verseText);
            }
            
            // Schedule prayer time adhan if enabled
            if (isPrayerReminderEnabled) {
              await PrayerNotificationsService.schedulePrayerTime(prayer.name, prayer.date, verseText);
            }
          }

          // Schedule Surah Al-Mulk reminder if enabled
          if (isMulkReminderEnabled) {
            await PrayerNotificationsService.scheduleMulkReminder(mulkReminderTime);
          }

          // Schedule Surah Al-Baqarah reminder if enabled
          if (isBaqarahReminderEnabled) {
            await PrayerNotificationsService.scheduleBaqarahReminder(baqarahReminderTime);
          }
        }
      } catch (error) {
        console.warn("Notification scheduling failed:", error);
      }
    }
    initNotifications();
    return () => {
      isMounted = false;
    };
  }, [
    prayerSchedule,
    isPrayerReminderEnabled,
    isPrePrayerReminderEnabled,
    isMulkReminderEnabled,
    mulkReminderTime,
    isBaqarahReminderEnabled,
    baqarahReminderTime
  ]);

  const dateStrings = useMemo(() => {
    const hijriDate = new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(now);
    const gregorianDate = new Intl.DateTimeFormat("ar-EG", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(now);
    return { hijriDate, gregorianDate };
  }, [now.getDate(), now.getMonth(), now.getFullYear()]);

  /* ── Computed state ── */
  const state = useMemo(() => {
    const nowMinutes = getLocalTimeMinutes(now, cityLat, cityLon);
    const localNow = getLocalNowForCountdown(now, cityLat, cityLon);

    // 1. Core Logic: Exclude Sunrise from current/next state machine
    const mandatorySchedule = prayerSchedule.filter((p) => p.key !== "sunrise");
    const fajrMinutes = mandatorySchedule[0].minutes;

    // 2. Dynamic State Machine: Find current mandatory prayer
    let currentIndex = mandatorySchedule.length - 1; // Default to Isha
    for (let i = mandatorySchedule.length - 1; i >= 0; i--) {
      if (nowMinutes >= mandatorySchedule[i].minutes) {
        currentIndex = i;
        break;
      }
    }

    const nextIndex = (currentIndex + 1) % mandatorySchedule.length;
    const current = mandatorySchedule[currentIndex];
    const next = mandatorySchedule[nextIndex];

    // 3. Calculate Progress gracefully wrapping across midnight
    const currentStart = current.minutes;
    const nextStartRaw = next.minutes;
    const nextStart = nextStartRaw <= currentStart ? nextStartRaw + 24 * 60 : nextStartRaw;
    const nowPosition = nowMinutes < currentStart ? nowMinutes + 24 * 60 : nowMinutes;
    
    const periodDuration = nextStart - currentStart;
    const elapsed = Math.max(0, nowPosition - currentStart);
    const progress = Math.min(1, elapsed / periodDuration);

    const countdownSeconds = getCountdownSeconds(localNow, next.minutes);
    const countdownLabel = formatCountdown(countdownSeconds);

    // 4. Unified Data Flow: Augment original schedule with statuses
    const augmentedSchedule = prayerSchedule.map((prayer) => {
      const isCurrent = prayer.key === current.key;
      const isNext = prayer.key === next.key;
      let status = "";
      
      if (isCurrent) {
        status = "الآن";
      } else if (isNext) {
        status = "التالية";
      } else {
        if (nowMinutes < fajrMinutes) {
          status = "قادمة"; 
        } else {
          status = prayer.minutes <= nowMinutes ? "تمت" : "قادمة";
        }
      }
      return { ...prayer, isCurrent, isNext, status, isActive: isCurrent };
    });

    return {
      current,
      next,
      progress,
      countdownLabel,
      hijriDate: dateStrings.hijriDate,
      gregorianDate: dateStrings.gregorianDate,
      background: backgrounds[current.key],
      reflection: prayerReflections[current.key],
      heroPrayerName: current.name,
      nowMinutes,
      augmentedSchedule
    };
  }, [now, prayerSchedule, cityLat, cityLon, dateStrings]);

  const todayHadith = useMemo(() => dailyHadithData.getTodayHadith(), [now.getDate()]);
  const ringOffset = ringLength * (1 - state.progress);

  /* ── Handlers ── */
  const handleCitySelected = useCallback((name: string, lat: number, lon: number) => {
    setCityName(name);
    setCityLat(lat);
    setCityLon(lon);
    if (isAutoCalcMethod) {
      setCalcMethod(detectCalcMethodByLocation(lat, lon));
    }
    if (isAutoAsrSchool) {
      setAsrSchool(detectAsrSchoolByLocation(lat, lon));
    }
  }, [isAutoCalcMethod, isAutoAsrSchool]);

  const handleToggleAutoCalcMethod = useCallback((val: boolean) => {
    setIsAutoCalcMethod(val);
    if (val) {
      setCalcMethod(detectCalcMethodByLocation(cityLat, cityLon));
    }
  }, [cityLat, cityLon]);

  const handleToggleAutoAsrSchool = useCallback((val: boolean) => {
    setIsAutoAsrSchool(val);
    if (val) {
      setAsrSchool(detectAsrSchoolByLocation(cityLat, cityLon));
    }
  }, [cityLat, cityLon]);

  const handleRetryGPS = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          let placeName = "موقعك الحالي";
          try {
            const [osmRes, arcgisRes] = await Promise.allSettled([
              fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1&accept-language=ar`),
              fetch(`https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?f=json&location=${lon},${lat}&langCode=ar`)
            ]);

            let foundName = null;

            if (arcgisRes.status === 'fulfilled') {
              try {
                const data = await arcgisRes.value.json();
                if (data && data.address && data.address.Match_addr) {
                  foundName = data.address.Match_addr.split(',')[0];
                }
              } catch (e) {}
            }

            if (!foundName && osmRes.status === 'fulfilled') {
              try {
                const data = await osmRes.value.json();
                if (data && data.name) {
                  foundName = data.name;
                }
              } catch (e) {}
            }

            if (foundName) {
              placeName = foundName;
            }
          } catch (e) {
            console.warn("Reverse geocode error:", e);
          }
          
          handleCitySelected(placeName, lat, lon);
        },
        (error) => {
          console.warn("GPS Error:", error);
          setIsAutoLocation(false);
          // Optional: we can show a toast here to notify that auto location failed,
          // but we won't reset the location or forcefully show the dialog if they already have a location
          // unless they literally have 'جاري تحديد الموقع...'
          setCityName((prev) => prev === "جاري تحديد الموقع..." ? "القاهرة، مصر" : prev);
        },
        { timeout: 8000, enableHighAccuracy: false }
      );
    }
  }, [handleCitySelected]);

  // Try auto location on mount if enabled
  useEffect(() => {
    if (isAutoLocation) {
      handleRetryGPS();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("app_isAutoLocation", isAutoLocation.toString());
  }, [isAutoLocation]);

  useEffect(() => {
    localStorage.setItem("app_cityName", cityName);
    localStorage.setItem("app_cityLat", cityLat.toString());
    localStorage.setItem("app_cityLon", cityLon.toString());
  }, [cityName, cityLat, cityLon]);

  useEffect(() => {
    localStorage.setItem("app_calcMethod", calcMethod);
  }, [calcMethod]);

  useEffect(() => {
    localStorage.setItem("app_asrSchool", asrSchool);
  }, [asrSchool]);

  useEffect(() => {
    localStorage.setItem("app_isAutoCalcMethod", isAutoCalcMethod.toString());
  }, [isAutoCalcMethod]);

  useEffect(() => {
    localStorage.setItem("app_isAutoAsrSchool", isAutoAsrSchool.toString());
  }, [isAutoAsrSchool]);

  useEffect(() => {
    localStorage.setItem("app_isPrayerReminderEnabled", isPrayerReminderEnabled.toString());
  }, [isPrayerReminderEnabled]);

  useEffect(() => {
    localStorage.setItem("app_isPrePrayerReminderEnabled", isPrePrayerReminderEnabled.toString());
  }, [isPrePrayerReminderEnabled]);

  useEffect(() => {
    localStorage.setItem("app_isMulkReminderEnabled", isMulkReminderEnabled.toString());
  }, [isMulkReminderEnabled]);

  useEffect(() => {
    localStorage.setItem("app_mulkReminderTime", mulkReminderTime);
  }, [mulkReminderTime]);

  useEffect(() => {
    localStorage.setItem("app_isBaqarahReminderEnabled", isBaqarahReminderEnabled.toString());
  }, [isBaqarahReminderEnabled]);

  useEffect(() => {
    localStorage.setItem("app_baqarahReminderTime", baqarahReminderTime);
  }, [baqarahReminderTime]);

  const handleOpenAzkarCounter = useCallback((type: "morning" | "evening" | "sleep" | "post_prayer") => {
    setAzkarCounterType(type);
    setShowAzkarCounter(true);
  }, []);

  const handleOpenHisnCategory = useCallback((category: string) => {
    setHisnCategory(category);
    setAzkarCounterType("hisn");
    setShowAzkarCounter(true);
  }, []);

  const handleBackToMain = useCallback(() => {
    startTransition(() => {
      setActiveTab("main");
    });
  }, []);

  const handleOpenAsmaAlHusna = useCallback(() => {
    setShowAsmaAlHusna(true);
  }, []);

  const handleChangeLocation = useCallback(() => {
    setShowLocationDialog(true);
  }, []);

  /* ═══════════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════════ */
  return (
    <div dir="rtl" className="min-h-screen bg-[#ece7de] text-[#2b1a10]">
      {/* ── Splash Screen ── */}
      {showSplash && (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      )}

      {/* ── Azkar Counter Overlay (full screen) ── */}
      {showAzkarCounter && (
        <AzkarCounterScreen
          azkarType={azkarCounterType}
          hisnCategory={hisnCategory}
          onClose={() => setShowAzkarCounter(false)}
        />
      )}

      {/* ── Asma Al-Husna Overlay (full screen) ── */}
      {showAsmaAlHusna && (
        <AsmaAlHusnaScreen
          onClose={() => setShowAsmaAlHusna(false)}
        />
      )}

      {/* ── Location Dialog Overlay ── */}
      <ManualLocationDialog
        isOpen={showLocationDialog}
        onClose={() => setShowLocationDialog(false)}
        onCitySelected={handleCitySelected}
        onAutoLocationRequest={() => {
          setIsAutoLocation(true);
          handleRetryGPS();
        }}
        isAutoLocation={isAutoLocation}
        setIsAutoLocation={setIsAutoLocation}
        currentCityName={cityName}
        currentLat={cityLat}
        currentLon={cityLon}
      />

      {/* ═══════════════════════════════════════════════════════════════
          TAB: MAIN (Prayer Screen)
          ═══════════════════════════════════════════════════════════════ */}
      {/* ── Screens Container ── */}
      <div className="relative w-full min-h-screen">
        {/* TAB: MAIN (Prayer Screen) */}
        <div className={activeTab === "main" && !showAzkarCounter ? "block" : "hidden"}>
          <section className="relative isolate min-h-[72vh] overflow-hidden">
            <img src={state.background} alt={`خلفية ${state.current.name}`} className="hero-image absolute inset-0 h-full w-full object-cover pointer-events-none -z-10 will-change-transform [transform:translateZ(0)]" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#180d07]/65 via-[#2a170f]/30 to-[#ece7de] pointer-events-none -z-10 will-change-transform [transform:translateZ(0)]" />

            <div className="relative mx-auto w-full max-w-[390px] px-4 pb-7 pt-6">
              {/* ── Fixed Floating Glassmorphic Header ── */}
              <AnimatePresence>
                {isScrolled && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                    className="fixed top-4 left-0 right-0 z-50 mx-auto w-full max-w-[390px] px-4 flex items-center justify-between pointer-events-none"
                  >
                    {/* Settings button in glassmorphic capsule */}
                    <button
                      className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-[#fdfcfb]/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(43,26,16,0.1)] text-[#2b1a10] transition-all duration-300 hover:bg-[#fdfcfb]/85 active:scale-95 cursor-pointer"
                      aria-label="فتح الإعدادات"
                      onClick={() => setActiveTab("settings")}
                    >
                      <SettingsIcon />
                    </button>

                    {/* Sakinah text in glassmorphic capsule */}
                    <div className="pointer-events-auto bg-[#fdfcfb]/70 backdrop-blur-xl px-6 h-10 rounded-full border border-white/40 shadow-[0_8px_32px_rgba(43,26,16,0.1)] flex items-center justify-center text-[#2b1a10]">
                      <span className="text-[17px] font-black leading-none pt-[1px]">سَكِينَة</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <header 
                className="mb-8 flex items-center justify-between text-[#fff9f1] transition-all duration-300 ease-in-out"
                style={{ 
                  opacity: isScrolled ? 0 : 1, 
                  pointerEvents: isScrolled ? "none" : "auto", 
                  transform: isScrolled ? "translateY(-10px) scale(0.95)" : "translateY(0) scale(1)" 
                }}
              >
                <button
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-sm transition-colors hover:bg-white/20"
                  aria-label="فتح الإعدادات"
                  onClick={() => setActiveTab("settings")}
                >
                  <SettingsIcon />
                </button>
                <div className="text-left">
                  <p className="text-[10px] tracking-[0.24em] text-white/70">SAKINAH</p>
                  <h1 className="text-[29px] font-black leading-none">سَكِينَة</h1>
                </div>
              </header>

              <div className="flex flex-col text-[#fff9f1]">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col items-start gap-0.5">
                    <WeatherDisplay weather={weather} />
                    <button
                      onClick={() => setShowLocationDialog(true)}
                      className="flex items-center gap-1.5 text-xs font-bold text-white/90 hover:text-white transition-colors drop-shadow-sm"
                    >
                      <LocationPin />
                      <span>{cityName}</span>
                      <svg viewBox="0 0 24 24" className="h-3 w-3 opacity-70" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M6 9L12 15L18 9" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mt-14 mb-2 flex flex-col items-center justify-center text-center">
                  <div className="flex flex-col items-center max-w-[340px] space-y-3">
                    {state.reflection.isQuran && state.reflection.qcf ? (
                      <p
                        className="leading-relaxed drop-shadow-sm text-[20px] sm:text-[22px] text-[#f4ecd8] font-medium"
                        style={{ direction: 'rtl' }}
                      >
                        <QcfVerse
                          verseKey={state.reflection.qcf.verseKey}
                          pageNumber={state.reflection.qcf.pageNumber}
                          wordStart={state.reflection.qcf.wordStart}
                          wordEnd={state.reflection.qcf.wordEnd}
                        />
                      </p>
                    ) : (
                      <p
                        className="leading-relaxed drop-shadow-sm text-[15px] text-white/90 font-bold"
                        style={{ direction: 'rtl' }}
                      >
                        {`« ${state.reflection.text} »`}
                      </p>
                    )}
                    <p className="text-[10px] font-bold text-white/80 tracking-wide bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                      {state.reflection.source}
                    </p>
                  </div>
                </div>
              </div>

              {/* ===== SLIDER ===== */}
              <div
                ref={containerRef}
                className="mt-14 overflow-x-auto snap-x snap-mandatory flex hide-scrollbar pb-8 -mb-8 items-center"
                dir="rtl"
                onScroll={(e) => {
                  const container = e.currentTarget;
                  const scrollLeft = Math.abs(container.scrollLeft);
                  const width = container.clientWidth;
                  if (width > 0) {
                    setCurrentSlide(Math.round(scrollLeft / width));
                  }
                }}
              >
                {/* Slide 0: Prayer Card */}
                <div className="w-full flex-shrink-0 snap-center px-2 flex flex-col justify-start pt-2">
                  <div className="relative overflow-hidden rounded-[28px] border border-white/60 bg-white/60 backdrop-blur-2xl p-5 shadow-[0_8px_32px_rgba(43,26,16,0.06)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-bold text-[#7f6a55] mb-1">الصلاة الحالية</p>
                        <p className="text-[28px] font-black leading-none text-[#2b1a10] tracking-tight">{state.current.name}</p>
                        <p className="mt-1.5 text-[11px] font-bold text-[#b88a4f]">التالية: {state.next.name}</p>
                      </div>
                      <div className="relative h-20 w-20 shrink-0 drop-shadow-sm">
                        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100" role="img" aria-label="مؤشر مرور الوقت">
                          <circle cx="50" cy="50" r={ringRadius} stroke="#e8dfd4" strokeWidth="6" fill="none" />
                          <circle cx="50" cy="50" r={ringRadius} stroke="#2b1a10" strokeWidth="6" strokeLinecap="round" fill="none" strokeDasharray={ringLength} strokeDashoffset={ringOffset} className="ring-motion transition-all duration-1000 ease-in-out" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-[#2b1a10] mt-0.5">
                          <p className="text-[9px] font-bold text-[#7f6a55] mb-0.5">متبقي</p>
                          <p className="text-[11px] font-black tabular-nums tracking-tight">{state.countdownLabel}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 border-t border-[#e6dccf]/60 pt-3 flex items-center justify-between text-[11px]">
                      <p className="font-bold text-[#7f6a55]">{state.gregorianDate}</p>
                      <p className="font-black text-[#2b1a10]">{state.hijriDate}</p>
                    </div>
                  </div>
                </div>

                {/* Slide 1: Hadith of the Day */}
                <HadithCard todayHadith={todayHadith} />
              </div>

              {/* Pagination dots */}
              <div className="mt-3 flex items-center justify-center gap-2">
                <button
                  onClick={() => {
                    setCurrentSlide(0);
                    if (containerRef.current) {
                       const target = containerRef.current.children[0] as HTMLElement;
                       target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                    }
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === 0 ? "w-6 bg-[#2b1a10]" : "w-1.5 bg-[#c2b5a3] hover:bg-[#a89680]"}`} aria-label="البطاقة الأولى — الصلاة الحالية" />
                <button
                  onClick={() => {
                    setCurrentSlide(1);
                    if (containerRef.current) {
                       const target = containerRef.current.children[1] as HTMLElement;
                       target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                    }
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === 1 ? "w-6 bg-[#2b1a10]" : "w-1.5 bg-[#c2b5a3] hover:bg-[#a89680]"}`} aria-label="البطاقة الثانية — حديث اليوم" />
              </div>
            </div>
          </section>

          <section className="mx-auto w-full max-w-[390px] px-4 pb-24 pt-5">
            <div className="mb-4">
              <h3 className="text-[26px] font-black">مواقيت اليوم</h3>
            </div>

            <div className="space-y-3">
              {state.augmentedSchedule.map((prayer) => {
                return (
                  <article
                    key={prayer.key}
                    dir="rtl"
                    className={`flex items-center justify-between rounded-full px-4 py-2.5 border transition-all duration-300 ${
                      prayer.isActive 
                        ? "border-white/10 bg-gradient-to-r from-[#2b1a10] to-[#3a2517] text-white shadow-[0_8px_24px_rgba(43,26,16,0.3)] scale-[1.02]" 
                        : "border-white/60 bg-white/60 backdrop-blur-md text-[#2b1a10] hover:bg-white/80 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                       <div className={`flex h-10 w-10 items-center justify-center rounded-full shadow-sm ${prayer.isActive ? 'bg-white/10 text-[#b88a4f] border border-white/10' : 'bg-gradient-to-br from-[#fdfcfb] to-[#f7f2ea] text-[#b88a4f] border border-white'}`}>
                         <PrayerIcon prayerKey={prayer.key} active={prayer.isActive} />
                       </div>
                       <p className="text-[16px] font-black tracking-tight">{prayer.name}</p>
                    </div>
                    
                    <div className="flex items-center gap-2.5">
                      <p className="text-[16px] font-black tabular-nums tracking-tight" dir="rtl">
                        {prayer.time}
                        <span className={`mr-1 text-[11px] font-bold ${prayer.isActive ? 'opacity-90' : 'opacity-60'}`}>{prayer.meridiem}</span>
                      </p>
                      {prayer.isActive ? (
                        <span className="flex h-6 px-2.5 items-center rounded-full bg-[#b88a4f]/20 border border-[#b88a4f]/30 text-[10px] font-bold text-[#b88a4f] shadow-sm">
                          الآن
                        </span>
                      ) : (
                        <span className={`text-[11px] font-bold ${prayer.status === "قادمة" ? "text-[#b88a4f]" : "text-[#7f6a55]/60"}`}>
                          {prayer.status}
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>

        {/* TAB: AZKAR */}
        <div className={activeTab === "azkar" && !showAzkarCounter ? "block" : "hidden"}>
          <AzkarTabScreen
            onOpenAzkarCounter={handleOpenAzkarCounter}
            onOpenHisnCategory={handleOpenHisnCategory}
            onOpenAsmaAlHusna={handleOpenAsmaAlHusna}
          />
        </div>

        {/* TAB: QURAN */}
        <div className={activeTab === "quran" && !showAzkarCounter ? "block relative w-full h-full min-h-screen" : "hidden"}>
          <QuranTabScreen onBack={handleBackToMain} onHideNavChange={setQuranHideNav} />
        </div>

        {/* TAB: SETTINGS */}
        <div className={activeTab === "settings" && !showAzkarCounter ? "block" : "hidden"}>
          <SettingsScreen
            cityName={cityName}
            cityLat={cityLat}
            cityLon={cityLon}
            isAutoLocation={isAutoLocation}
            onToggleAutoLocation={setIsAutoLocation}
            calcMethod={calcMethod}
            asrSchool={asrSchool}
            isAutoCalcMethod={isAutoCalcMethod}
            isAutoAsrSchool={isAutoAsrSchool}
            onToggleAutoCalcMethod={handleToggleAutoCalcMethod}
            onToggleAutoAsrSchool={handleToggleAutoAsrSchool}
            onChangeCalcMethod={setCalcMethod}
            onChangeAsrSchool={setAsrSchool}
            isPrayerReminderEnabled={isPrayerReminderEnabled}
            onTogglePrayerReminder={setIsPrayerReminderEnabled}
            isPrePrayerReminderEnabled={isPrePrayerReminderEnabled}
            onTogglePrePrayerReminder={setIsPrePrayerReminderEnabled}
            onChangeLocation={handleChangeLocation}
            onBack={handleBackToMain}
            
            // New props
            isMulkReminderEnabled={isMulkReminderEnabled}
            onToggleMulkReminder={setIsMulkReminderEnabled}
            mulkReminderTime={mulkReminderTime}
            onChangeMulkReminderTime={setMulkReminderTime}
            isBaqarahReminderEnabled={isBaqarahReminderEnabled}
            onToggleBaqarahReminder={setIsBaqarahReminderEnabled}
            baqarahReminderTime={baqarahReminderTime}
            onChangeBaqarahReminderTime={setBaqarahReminderTime}
          />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          FLOATING BOTTOM NAVIGATION
          ═══════════════════════════════════════════════════════════════ */}
      {!showAzkarCounter && !quranHideNav && !showAsmaAlHusna && activeTab !== "settings" && (
        <nav className="fixed inset-x-0 bottom-6 z-40 flex justify-center pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-1 rounded-[32px] border border-white/20 bg-[#2b1a10]/85 px-1.5 py-1.5 shadow-[0_16px_40px_rgba(43,26,16,0.35)] backdrop-blur-xl">
            {[
              { id: "main", label: "الرئيسية", icon: <HomeIcon /> },
              { id: "quran", label: "القرآن", icon: <BookOpenText className="h-[17px] w-[17px] text-current" strokeWidth={2} /> },
              { id: "azkar", label: "الأذكار", icon: <AdhkarIcon /> },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    startTransition(() => {
                      setActiveTab(tab.id as TabType);
                    });
                  }}
                  className={`relative flex items-center gap-2 rounded-[24px] px-5 py-2 transition-colors duration-200 ${
                    isActive ? "text-white" : "text-white/50 hover:bg-white/5 hover:text-white/80"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 rounded-[24px] bg-white/15 shadow-sm"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center justify-center">
                    {tab.icon}
                  </span>
                  <AnimatePresence mode="popLayout">
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="relative z-10 overflow-hidden flex items-center"
                      >
                        <span className="text-[13px] font-bold whitespace-nowrap pl-1">{tab.label}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
