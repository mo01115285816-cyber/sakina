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

interface Reflection {
  text: string;
  source: string;
  isQuran: boolean;
  qcf?: {
    verseKey: string;
    pageNumber: number;
    wordStart: number;
    wordEnd: number;
  };
}

export const prayerReflections: Record<PrayerKey, Reflection> = {
  fajr: {
    text: "وَقُرْآنَ الْفَجْرِ ۖ إِنَّ قُرْآنَ الْفَجْرِ كَانَ مَشْهُودًا",
    source: "سورة الإسراء 78",
    isQuran: true,
    qcf: { verseKey: "17:78", pageNumber: 290, wordStart: 8, wordEnd: 14 },
  },
  sunrise: {
    text: "مَن صَلَّى الصُّبْحَ فَهُوَ فِي ذِمَّةِ اللَّهِ",
    source: "رواه مسلم",
    isQuran: false,
  },
  dhuhr: {
    text: "الصَّلَاةُ نُورٌ",
    source: "رواه مسلم",
    isQuran: false,
  },
  asr: {
    text: "حَافِظُوا عَلَى الصَّلَوَاتِ وَالصَّلَاةِ الْوُسْطَىٰ",
    source: "سورة البقرة 238",
    isQuran: true,
    qcf: { verseKey: "2:238", pageNumber: 39, wordStart: 1, wordEnd: 5 },
  },
  maghrib: {
    text: "أَقِمِ الصَّلَاةَ لِدُلُوكِ الشَّمْسِ إِلَىٰ غَسَقِ اللَّيْلِ",
    source: "سورة الإسراء 78",
    isQuran: true,
    qcf: { verseKey: "17:78", pageNumber: 290, wordStart: 1, wordEnd: 7 },
  },
  isha: {
    text: "وَمِنَ اللَّيْلِ فَسَبِّحْهُ وَأَدْبَارَ السُّجُودِ",
    source: "سورة ق 40",
    isQuran: true,
    qcf: { verseKey: "50:40", pageNumber: 520, wordStart: 1, wordEnd: 5 },
  },
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
