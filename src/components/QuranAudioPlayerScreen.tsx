import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronRight,
  Bookmark,
  Gauge,
  Clock,
  Repeat,
  Sliders,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Volume1,
  Volume2,
  X,
  Check,
} from "lucide-react";
import type { Reciter, Moshaf } from "@/types/quran";

interface Props {
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  reciter: Reciter;
  moshaf: Moshaf;
  surahId: number;
  onClose: () => void;

  isPlaying: boolean;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  volume: number;
  onVolumeChange: (volume: number) => void;

  playbackRate: number;
  onPlaybackRateChange: (rate: number) => void;

  timerMinutesRemaining: number | null;
  onSetTimer: (minutes: number | null) => void;

  repeatMode: "none" | "one" | "all";
  onSetRepeatMode: (mode: "none" | "one" | "all") => void;
  onOpenReader?: () => void;
}

const quranicSurahNames: Record<number, string> = {
  1: "سُورَةُ الْفَاتِحَةِ",
  2: "سُورَةُ الْبَقَرَةِ",
  3: "سُورَةُ آلِ عِمْرَانَ",
  4: "سُورَةُ النِّسَاءِ",
  5: "سُورَةُ الْمَائِدَةِ",
  6: "سُورَةُ الْأَنْعَامِ",
  7: "سُورَةُ الْأَعْرَافِ",
  8: "سُورَةُ الْأَنْفَالِ",
  9: "سُورَةُ التَّوْبَةِ",
  10: "سُورَةُ يُونُسَ",
  11: "سُورَةُ هُودٍ",
  12: "سُورَةُ يُوسُفَ",
  13: "سُورَةُ الرَّعْدِ",
  14: "سُورَةُ إِبْرَاهِيمَ",
  15: "سُورَةُ الْحِجْرِ",
  16: "سُورَةُ النَّحْلِ",
  17: "سُورَةُ الْإِسْرَاءِ",
  18: "سُورَةُ الْكَهْفِ",
  19: "سُورَةُ مَرْيَمَ",
  20: "سُورَةُ طه",
  21: "سُورَةُ الْأَنْبِيَاءِ",
  22: "سُورَةُ الْحَجِّ",
  23: "سُورَةُ الْمُؤْمِنُونَ",
  24: "سُورَةُ النُّورِ",
  25: "سُورَةُ الْفُرْقَانِ",
  26: "سُورَةُ الشُّعَرَاءِ",
  27: "سُورَةُ النَّمْلِ",
  28: "سُورَةُ الْقَصَصِ",
  29: "سُورَةُ الْعَنْكَبُوتِ",
  30: "سُورَةُ الرُّومِ",
  31: "سُورَةُ لُقْمَانَ",
  32: "سُورَةُ السَّجْدَةِ",
  33: "سُورَةُ الْأَحْزَابِ",
  34: "سُورَةُ سَبَإٍ",
  35: "سُورَةُ فَاطِرٍ",
  36: "سُورَةُ يس",
  37: "سُورَةُ الصَّافَّاتِ",
  38: "سُورَةُ ص",
  39: "سُورَةُ الزُّمَرِ",
  40: "سُورَةُ غَافِرٍ",
  41: "سُورَةُ فُصِّلَتْ",
  42: "سُورَةُ الشُّورَى",
  43: "سُورَةُ الزُّخْرُفِ",
  44: "سُورَةُ الدُّخَانِ",
  45: "سُورَةُ الْجَاثِيَةِ",
  46: "سُورَةُ الْأَحْقَافِ",
  47: "سُورَةُ مُحَمَّدٍ",
  48: "سُورَةُ الْفَتْحِ",
  49: "سُورَةُ الْحُجُرَاتِ",
  50: "سُورَةُ ق",
  51: "سُورَةُ الذَّارِيَاتِ",
  52: "سُورَةُ الطُّورِ",
  53: "سُورَةُ النَّجْمِ",
  54: "سُورَةُ الْقَمَرِ",
  55: "سُورَةُ الرَّحْمَنِ",
  56: "سُورَةُ الْوَاقِعَةِ",
  57: "سُورَةُ الْحَدِيدِ",
  58: "سُورَةُ الْمُجَادَلَةِ",
  59: "سُورَةُ الْحَشْرِ",
  60: "سُورَةُ الْمُمْتَحَنَةِ",
  61: "سُورَةُ الصَّفِّ",
  62: "سُورَةُ الْجُمُعَةِ",
  63: "سُورَةُ الْمُنَافِقُونَ",
  64: "سُورَةُ التَّغَابُنِ",
  65: "سُورَةُ الطَّلَاقِ",
  66: "سُورَةُ التَّحْرِيمِ",
  67: "سُورَةُ الْمُلْكِ",
  68: "سُورَةُ الْقَلَمِ",
  69: "سُورَةُ الْحَاقَّةِ",
  70: "سُورَةُ الْمَعَارِجِ",
  71: "سُورَةُ نُوحٍ",
  72: "سُورَةُ الْجِنِّ",
  73: "سُورَةُ الْمُزَّمِّلِ",
  74: "سُورَةُ الْمُدَّثِّرِ",
  75: "سُورَةُ الْقِيَامَةِ",
  76: "سُورَةُ الْإِنْسَانِ",
  77: "سُورَةُ الْمُرْسَلَاتِ",
  78: "سُورَةُ النَّبَإِ",
  79: "سُورَةُ النَّازِعَاتِ",
  80: "سُورَةُ عَبَسَ",
  81: "سُورَةُ التَّكْوِيرِ",
  82: "سُورَةُ الْإِنْفِطَارِ",
  83: "سُورَةُ الْمُطَفِّفِينَ",
  84: "سُورَةُ الْإِنْشِقَاقِ",
  85: "سُورَةُ الْبُرُوجِ",
  86: "سُورَةُ الطَّارِقِ",
  87: "سُورَةُ الْأَعْلَى",
  88: "سُورَةُ الْغَاشِيَةِ",
  89: "سُورَةُ الْفَجْرِ",
  90: "سُورَةُ الْبَلَدِ",
  91: "سُورَةُ الشَّمْسِ",
  92: "سُورَةُ اللَّيْلِ",
  93: "سُورَةُ الضُّحَى",
  94: "سُورَةُ الشَّرْحِ",
  95: "سُورَةُ التِّينِ",
  96: "سُورَةُ الْعَلَقِ",
  97: "سُورَةُ الْقَدْرِ",
  98: "سُورَةُ الْبَيِّنَةِ",
  99: "سُورَةُ الزَّلْزَلَةِ",
  100: "سُورَةُ الْعَادِيَاتِ",
  101: "سُورَةُ الْقَارِعَةِ",
  102: "سُورَةُ التَّكَاثُرِ",
  103: "سُورَةُ الْعَصْرِ",
  104: "سُورَةُ الْهُمَزَةِ",
  105: "سُورَةُ الْفِيلِ",
  106: "سُورَةُ قُرَيْشٍ",
  107: "سُورَةُ الْمَاعُونِ",
  108: "سُورَةُ الْكَوْثَرِ",
  109: "سُورَةُ الْكَافِرُونَ",
  110: "سُورَةُ النَّصْرِ",
  111: "سُورَةُ الْمَسَدِ",
  112: "سُورَةُ الْإِخْلَاصِ",
  113: "سُورَةُ الْفَلَقِ",
  114: "سُورَةُ النَّاسِ",
};

export default function QuranAudioPlayerScreen({
  audioRef,
  reciter,
  moshaf,
  surahId,
  onClose,
  isPlaying,
  onTogglePlay,
  onPrev,
  onNext,
  currentTime,
  duration,
  onSeek,
  volume,
  onVolumeChange,
  playbackRate,
  onPlaybackRateChange,
  timerMinutesRemaining,
  onSetTimer,
  repeatMode,
  onSetRepeatMode,
  onOpenReader,
}: Props) {
  const [activeSheet, setActiveSheet] = useState<
    "speed" | "timer" | "repeat" | null
  >(null);

  // Local state for Butter-Smooth Dragging (Fixing the lag/stutter issue)
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [localProgress, setLocalProgress] = useState(0);

  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const [localVolume, setLocalVolume] = useState(volume);

  // Sync with actual time only when NOT dragging
  useEffect(() => {
    if (!isDraggingProgress) {
      setLocalProgress(currentTime);
    }
  }, [currentTime, isDraggingProgress]);

  useEffect(() => {
    if (!isDraggingVolume) {
      setLocalVolume(volume);
    }
  }, [volume, isDraggingVolume]);

  const formatTime = useCallback((time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // Instant Drag Handlers (Bypassing React re-render lag via direct Ref manipulation)
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setLocalProgress(val);
    if (audioRef?.current) {
      audioRef.current.currentTime = val;
    }
  };
  const handleProgressCommit = () => {
    setIsDraggingProgress(false);
    onSeek(localProgress);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setLocalVolume(val);
    if (audioRef?.current) {
      audioRef.current.volume = val;
    }
  };
  const handleVolumeCommit = () => {
    setIsDraggingVolume(false);
    onVolumeChange(localVolume);
  };

  const speedOptions = useMemo(
    () => [
      { value: 0.5, label: "0.5x (بطيء جداً)" },
      { value: 0.75, label: "0.75x (بطيء)" },
      { value: 1.0, label: "1.0x (طبيعي)" },
      { value: 1.25, label: "1.25x (سريع)" },
      { value: 1.5, label: "1.5x (سريع جداً)" },
      { value: 2.0, label: "2.0x (ضعف السرعة)" },
    ],
    [],
  );

  const timerOptions = useMemo(
    () => [
      { value: null, label: "إيقاف المؤقت" },
      { value: 5, label: "٥ دقائق" },
      { value: 10, label: "١٠ دقائق" },
      { value: 15, label: "١٥ دقيقة" },
      { value: 30, label: "٣٠ دقيقة" },
      { value: 45, label: "٤٥ دقيقة" },
      { value: 60, label: "ساعة كاملة" },
    ],
    [],
  );

  const repeatOptions = useMemo(
    () => [
      { value: "none", label: "بدون تكرار" },
      { value: "one", label: "تكرار السورة الحالية" },
      { value: "all", label: "تكرار كل السور بالقائمة" },
    ],
    [],
  );

  const formattedSurahName = quranicSurahNames[surahId] || `سُورَةُ ${surahId}`;

  return (
    <div
      className="h-full w-full bg-[#ece7de] text-[#2b1a10] flex flex-col font-sans relative overflow-hidden"
      dir="rtl"
    >
      {/* Background Soft Gradients */}
      <div className="absolute top-[-10%] left-[-20%] w-[350px] h-[350px] bg-[#b88a4f]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-[#deab65]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="px-6 pt-5 pb-1 flex items-center justify-between sticky top-0 z-20 shrink-0">
        <button className="w-10 h-10 cut-crystal-capsule rounded-full flex items-center justify-center shadow-md text-[#7f6a55] active:scale-95 transition-transform cursor-pointer">
          <Bookmark size={18} />
        </button>

        <button
          onClick={onClose}
          className="w-10 h-10 cut-crystal-capsule rounded-full flex items-center justify-center shadow-md text-[#2b1a10] active:scale-95 transition-transform cursor-pointer"
        >
          <ChevronRight size={20} />
        </button>
      </header>

      {/* Main Content Area: Flex Container */}
      <div className="flex-1 flex flex-col justify-between pt-2 pb-8 px-6 w-full max-w-[420px] mx-auto min-h-0">
        {/* Surah & Reciter Header Section (Perfectly fitted, lightweight, premium) */}
        <div className="flex flex-col items-center justify-center my-4 shrink-0">
          {/* Compact Surah Card - Perfectly proportioned and centered around the text */}
          <div className="w-fit min-w-[200px] max-w-[280px] px-8 py-3.5 cut-crystal-panel rounded-[24px] shadow-md flex items-center justify-center relative overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-radial-gradient from-white/10 to-transparent pointer-events-none" />
            <span className="text-[34px] sm:text-[38px] font-normal text-[#b88a4f] font-quran text-center drop-shadow-sm leading-none whitespace-nowrap">
              {formattedSurahName}
            </span>
          </div>

          {/* Reciter's Name - Positioned beautifully under the card */}
          <span className="text-[15px] text-[#7f6a55] font-bold mt-3 tracking-wide">
            {reciter.name}
          </span>
        </div>
        {/* Audio Utilities Pills Grid */}
        <div className="max-w-[340px] mx-auto w-full grid grid-cols-2 gap-2 my-2 shrink-0">
          {/* Speed controller */}
          <button
            onClick={() => setActiveSheet("speed")}
            className="cut-crystal-capsule py-2.5 px-3 rounded-full flex items-center justify-center gap-2 text-[12px] font-bold text-[#2b1a10] transition-all active:scale-[0.98] shadow-sm cursor-pointer"
          >
            <Gauge size={14} className="text-[#b88a4f]" />
            <span>السرعة ({playbackRate}x)</span>
          </button>

          {/* Timer Controller */}
          <button
            onClick={() => setActiveSheet("timer")}
            className={`py-2.5 px-3 rounded-full flex items-center justify-center gap-2 text-[12px] font-bold transition-all active:scale-[0.98] shadow-sm cursor-pointer ${
              timerMinutesRemaining !== null
                ? "bg-gradient-to-r from-[#deab65] to-[#b88a4f] text-white border-transparent"
                : "cut-crystal-capsule text-[#2b1a10]"
            }`}
          >
            <Clock
              size={14}
              className={
                timerMinutesRemaining !== null
                  ? "text-white animate-pulse"
                  : "text-[#b88a4f]"
              }
            />
            <span className="truncate">
              {timerMinutesRemaining !== null
                ? `ينتهي خلال ${Math.ceil(timerMinutesRemaining)}د`
                : "المؤقت"}
            </span>
          </button>

          {/* Quick Loop toggle */}
          <button
            onClick={() => setActiveSheet("repeat")}
            className="cut-crystal-capsule py-2.5 px-3 rounded-full flex items-center justify-center gap-2 text-[12px] font-bold text-[#2b1a10] transition-all active:scale-[0.98] shadow-sm cursor-pointer"
          >
            <Repeat size={14} className="text-[#b88a4f]" />
            <span>تكرار التشغيل</span>
          </button>

          {/* Custom Settings button */}
          <button className="cut-crystal-capsule py-2.5 px-3 rounded-full flex items-center justify-center gap-2 text-[12px] font-bold text-[#2b1a10] transition-all active:scale-[0.98] shadow-sm cursor-pointer">
            <Sliders size={14} className="text-[#b88a4f]" />
            <span>إعدادات متقدمة</span>
          </button>
        </div>
        <div className="flex-1" /> {/* Spacer */}
        {/* Progress Slider Bar (Rebuilt for immediate 60fps interaction) */}
        <div className="max-w-[340px] mx-auto w-full mb-5 shrink-0" dir="ltr">
          <div className="relative w-full h-8 flex items-center group touch-none">
            {/* Track Background */}
            <div className="absolute left-0 right-0 h-1.5 bg-[#e6dccf] rounded-full overflow-hidden">
              <div
                className="absolute left-0 h-full bg-gradient-to-r from-[#deab65] to-[#b88a4f] rounded-full"
                style={{
                  width: `${duration ? (localProgress / duration) * 100 : 0}%`,
                }}
              />
            </div>

            {/* Selector Thumb */}
            <div
              className={`absolute w-5 h-5 bg-[#b88a4f] rounded-full shadow-[0_4px_12px_rgba(184,138,79,0.3)] transition-transform ${isDraggingProgress ? "scale-125" : "group-hover:scale-110"} border-2 border-white`}
              style={{
                left: `calc(${duration ? (localProgress / duration) * 100 : 0}% - 10px)`,
              }}
            />

            {/* Native invisible input overlay */}
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={localProgress}
              onChange={handleProgressChange}
              onMouseDown={() => setIsDraggingProgress(true)}
              onTouchStart={() => setIsDraggingProgress(true)}
              onMouseUp={handleProgressCommit}
              onTouchEnd={handleProgressCommit}
              onPointerCancel={handleProgressCommit}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 touch-none"
            />
          </div>
          <div className="flex justify-between items-center text-[12px] font-bold text-[#7f6a55] font-mono mt-0.5 px-1">
            <span>{formatTime(localProgress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        {/* Media Control Row */}
        <div
          className="max-w-[300px] mx-auto w-full flex items-center justify-between mb-5 shrink-0"
          dir="ltr"
        >
          <button
            onClick={onPrev}
            className="w-14 h-14 flex items-center justify-center text-[#2b1a10] hover:text-[#b88a4f] hover:bg-[#e6dccf]/30 rounded-full active:scale-90 transition-all"
          >
            <SkipBack size={32} fill="currentColor" />
          </button>

          <button
            onClick={onTogglePlay}
            className="w-[72px] h-[72px] bg-gradient-to-r from-[#deab65] to-[#b88a4f] hover:opacity-95 text-white rounded-full flex items-center justify-center shadow-[0_12px_32px_rgba(184,138,79,0.35)] active:scale-95 transition-transform shrink-0 border-[4px] border-[#fdfcfb]"
          >
            {isPlaying ? (
              <Pause size={28} fill="currentColor" />
            ) : (
              <Play
                size={28}
                className="translate-x-[2px]"
                fill="currentColor"
              />
            )}
          </button>

          <button
            onClick={onNext}
            className="w-14 h-14 flex items-center justify-center text-[#2b1a10] hover:text-[#b88a4f] hover:bg-[#e6dccf]/30 rounded-full active:scale-90 transition-all"
          >
            <SkipForward size={32} fill="currentColor" />
          </button>
        </div>
        {/* Volume Slider Bar (Rebuilt for immediate interaction) */}
        <div
          className="max-w-[300px] mx-auto w-full flex items-center gap-4 mb-4 shrink-0"
          dir="ltr"
        >
          <Volume1 size={18} className="text-[#7f6a55]" />
          <div className="relative flex-1 h-8 flex items-center group touch-none">
            {/* Track Background */}
            <div className="absolute left-0 right-0 h-1.5 bg-[#e6dccf] rounded-full overflow-hidden">
              <div
                className="absolute left-0 h-full bg-[#b88a4f] rounded-full"
                style={{ width: `${localVolume * 100}%` }}
              />
            </div>

            {/* Selector Thumb */}
            <div
              className={`absolute w-4 h-4 bg-[#b88a4f] rounded-full shadow-[0_2px_8px_rgba(184,138,79,0.25)] transition-transform ${isDraggingVolume ? "scale-125" : "group-hover:scale-110"}`}
              style={{ left: `calc(${localVolume * 100}% - 8px)` }}
            />

            {/* Native invisible input overlay */}
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={localVolume}
              onChange={handleVolumeChange}
              onMouseDown={() => setIsDraggingVolume(true)}
              onTouchStart={() => setIsDraggingVolume(true)}
              onMouseUp={handleVolumeCommit}
              onTouchEnd={handleVolumeCommit}
              onPointerCancel={handleVolumeCommit}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 touch-none"
            />
          </div>
          <Volume2 size={18} className="text-[#b88a4f]" />
        </div>
        {/* Tracking helper pill at the bottom */}
        <div className="text-center mt-2 mb-4 shrink-0">
          <button
            onClick={onOpenReader}
            className="cut-crystal-capsule py-3 px-8 rounded-full text-[13px] font-bold text-[#2b1a10] shadow-md active:scale-[0.98] transition-all cursor-pointer"
          >
            تتبع الآيات أثناء التلاوة
          </button>
        </div>
      </div>

      {/* Speed Selector Sheet */}
      <AnimatePresence>
        {activeSheet === "speed" && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveSheet(null)}
              className="fixed inset-0 bg-[#2b1a10]/50 backdrop-blur-[3px] z-50"
            />
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed bottom-6 inset-x-5 z-50 max-w-[350px] mx-auto cut-crystal-panel rounded-[28px] shadow-2xl p-5 flex flex-col max-h-[75vh]"
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-[#e6dccf]/60 mb-2">
                <h3 className="text-[16px] font-bold text-[#2b1a10]">
                  سرعة التشغيل
                </h3>
                <button
                  onClick={() => setActiveSheet(null)}
                  className="w-8 h-8 flex items-center justify-center cut-crystal-capsule rounded-full text-[#7f6a55] active:scale-95 transition-transform cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>
              <div
                className="flex-1 overflow-y-auto divide-y divide-[#e6dccf]/50"
                dir="rtl"
              >
                {speedOptions.map((opt) => {
                  const isCurrent = playbackRate === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => {
                        onPlaybackRateChange(opt.value);
                        setActiveSheet(null);
                      }}
                      className="w-full py-3.5 flex items-center justify-between gap-4 transition-colors duration-150 text-right group"
                    >
                      <span
                        className={`text-[15px] font-bold transition-colors ${isCurrent ? "text-[#b88a4f] font-bold" : "text-[#2b1a10]"}`}
                      >
                        {opt.label}
                      </span>
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 shadow-inner ${
                          isCurrent
                            ? "bg-[#b88a4f] text-[#fdfcfb]"
                            : "bg-[#e8dfd4] text-[#7f6a55]"
                        }`}
                      >
                        {isCurrent ? (
                          <Check size={14} strokeWidth={3} />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#ddd2c4]"></div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Timer Selector Sheet */}
      <AnimatePresence>
        {activeSheet === "timer" && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveSheet(null)}
              className="fixed inset-0 bg-[#2b1a10]/50 backdrop-blur-[3px] z-50"
            />
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed bottom-6 inset-x-5 z-50 max-w-[350px] mx-auto cut-crystal-panel rounded-[28px] shadow-2xl p-5 flex flex-col max-h-[75vh]"
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-[#e6dccf]/60 mb-2">
                <h3 className="text-[16px] font-bold text-[#2b1a10]">
                  مؤقت النوم
                </h3>
                <button
                  onClick={() => setActiveSheet(null)}
                  className="w-8 h-8 flex items-center justify-center cut-crystal-capsule rounded-full text-[#7f6a55] active:scale-95 transition-transform cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>
              <div
                className="flex-1 overflow-y-auto divide-y divide-[#e6dccf]/50"
                dir="rtl"
              >
                {timerOptions.map((opt) => {
                  const isCurrent =
                    opt.value === null
                      ? timerMinutesRemaining === null
                      : timerMinutesRemaining !== null &&
                        Math.abs(timerMinutesRemaining - opt.value) < 0.5;

                  return (
                    <button
                      key={opt.value ?? "null"}
                      onClick={() => {
                        onSetTimer(opt.value);
                        setActiveSheet(null);
                      }}
                      className="w-full py-3.5 flex items-center justify-between gap-4 transition-colors duration-150 text-right group"
                    >
                      <span
                        className={`text-[15px] font-bold transition-colors ${isCurrent ? "text-[#b88a4f] font-bold" : "text-[#2b1a10]"}`}
                      >
                        {opt.label}
                      </span>
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 shadow-inner ${
                          isCurrent
                            ? "bg-[#b88a4f] text-[#fdfcfb]"
                            : "bg-[#e8dfd4] text-[#7f6a55]"
                        }`}
                      >
                        {isCurrent ? (
                          <Check size={14} strokeWidth={3} />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#ddd2c4]"></div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Repeat Selector Sheet */}
      <AnimatePresence>
        {activeSheet === "repeat" && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveSheet(null)}
              className="fixed inset-0 bg-[#2b1a10]/50 backdrop-blur-[3px] z-50"
            />
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed bottom-6 inset-x-5 z-50 max-w-[350px] mx-auto cut-crystal-panel rounded-[28px] shadow-2xl p-5 flex flex-col max-h-[75vh]"
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-[#e6dccf]/60 mb-2">
                <h3 className="text-[16px] font-bold text-[#2b1a10]">
                  تكرار التشغيل
                </h3>
                <button
                  onClick={() => setActiveSheet(null)}
                  className="w-8 h-8 flex items-center justify-center cut-crystal-capsule rounded-full text-[#7f6a55] active:scale-95 transition-transform cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>
              <div
                className="flex-1 overflow-y-auto divide-y divide-[#e6dccf]/50"
                dir="rtl"
              >
                {repeatOptions.map((opt) => {
                  const isCurrent = repeatMode === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => {
                        onSetRepeatMode(opt.value as "none" | "one" | "all");
                        setActiveSheet(null);
                      }}
                      className="w-full py-3.5 flex items-center justify-between gap-4 transition-colors duration-150 text-right group"
                    >
                      <span
                        className={`text-[15px] font-bold transition-colors ${isCurrent ? "text-[#b88a4f] font-bold" : "text-[#2b1a10]"}`}
                      >
                        {opt.label}
                      </span>
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 shadow-inner ${
                          isCurrent
                            ? "bg-[#b88a4f] text-[#fdfcfb]"
                            : "bg-[#e8dfd4] text-[#7f6a55]"
                        }`}
                      >
                        {isCurrent ? (
                          <Check size={14} strokeWidth={3} />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#ddd2c4]"></div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
