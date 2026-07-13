import { PrayerKey } from "@/types/app.types";
import type { CalculationMethod, AsrSchool } from "@/utils/locationDetection";

export const backgrounds: Record<PrayerKey, string> = {
  fajr: "./images/prayers/fajr.jpg",
  sunrise: "./images/prayers/sunrise.jpg",
  dhuhr: "./images/prayers/dhuhr.jpg",
  asr: "./images/prayers/asr.jpg",
  maghrib: "./images/prayers/maghrib.jpg",
  isha: "./images/prayers/isha.jpg",
};

export const prayerReflections: Record<PrayerKey, { text: string; source: string; isQuran: boolean }> = {
  fajr: { text: "وَقُرْآنَ الْفَجْرِ ۖ إِنَّ قُرْآنَ الْفَجْرِ كَانَ مَشْهُودًا", source: "سورة الإسراء 78", isQuran: true },
  sunrise: { text: "مَن صَلَّى الصُّبْحَ فَهُوَ فِي ذِمَّةِ اللَّهِ", source: "رواه مسلم", isQuran: false },
  dhuhr: { text: "الصَّلَاةُ نُورٌ", source: "رواه مسلم", isQuran: false },
  asr: { text: "حَافِظُوا عَلَى الصَّلَوَاتِ وَالصَّلَاةِ الْوُسْطَىٰ", source: "سورة البقرة 238", isQuran: true },
  maghrib: { text: "أَقِمِ الصَّلَاةَ لِدُلُوكِ الشَّمْسِ إِلَىٰ غَسَقِ اللَّيْلِ", source: "سورة الإسراء 78", isQuran: true },
  isha: { text: "وَمِنَ اللَّيْلِ فَسَبِّحْهُ وَأَدْبَارَ السُّجُودِ", source: "سورة ق 40", isQuran: true },
};

export const calcMethodLabels: Record<CalculationMethod, string> = {
  EGYPTIAN: "الهيئة المصرية العامة",
  UMM_AL_QURA: "أم القرى",
  ISNA: "ISNA",
  KARACHI: "كاراتشي",
  MWL: "رابطة العالم الإسلامي",
};

export const asrSchoolLabels: Record<AsrSchool, string> = {
  STANDARD: "الجمهور (الشافعي، المالكي، الحنبلي)",
  HANAFI: "حنفي",
};
