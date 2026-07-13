import { PrayerTimes, Coordinates, CalculationMethod, Madhab } from "adhan";
import type { CalculationMethod as CalcMethodType, AsrSchool } from "./locationDetection";

export type PrayerItem = {
  key: "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha";
  name: string;
  time: string;
  meridiem: string;
  minutes: number;
  date?: Date;
};

// Map custom UI/Location method strings to Adhan library Enum values
function getAdhanCalculationMethod(method: CalcMethodType) {
  switch (method) {
    case "EGYPTIAN":
      return CalculationMethod.Egyptian();
    case "UMM_AL_QURA":
      return CalculationMethod.UmmAlQura();
    case "ISNA":
      return CalculationMethod.NorthAmerica();
    case "KARACHI":
      return CalculationMethod.Karachi();
    case "MWL":
    default:
      return CalculationMethod.MuslimWorldLeague();
  }
}

// Map custom UI Asr school to Adhan Madhab
function getAdhanMadhab(school: AsrSchool) {
  return school === "HANAFI" ? Madhab.Hanafi : Madhab.Shafi;
}

// Helper: Converts a Date to total local minutes from midnight, using local timezone
export function getLocalTimeMinutes(date: Date, lat: number, lon: number): number {
  // Always use standard browser time for consistent client experiences
  return date.getHours() * 60 + date.getMinutes();
}

// Helper: Returns a copy of the Date but in the client's local timezone for matching
export function getLocalNowForCountdown(date: Date, lat: number, lon: number): Date {
  return new Date(date);
}

// Core function to calculate prayer times for any coordinate/date
export function calculatePrayerTimes(
  date: Date,
  lat: number,
  lon: number,
  method: CalcMethodType,
  school: AsrSchool
): PrayerItem[] {
  const coordinates = new Coordinates(lat, lon);
  const params = getAdhanCalculationMethod(method);
  params.madhab = getAdhanMadhab(school);

  const adhanTimes = new PrayerTimes(coordinates, date, params);

  const formatOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };

  const mapPrayer = (
    key: PrayerItem["key"],
    name: string,
    timeDate: Date
  ): PrayerItem => {
    // Format Arabic times correctly
    const formatted = new Intl.DateTimeFormat("ar-EG", formatOptions).format(timeDate);
    // Split to get meridiem suffix (م / ص)
    const parts = formatted.split(" ");
    const timeVal = parts[0] || "";
    const ampm = parts[1] || "";

    return {
      key,
      name,
      time: timeVal,
      meridiem: ampm,
      minutes: timeDate.getHours() * 60 + timeDate.getMinutes(),
      date: timeDate,
    };
  };

  return [
    mapPrayer("fajr", "الفجر", adhanTimes.fajr),
    mapPrayer("sunrise", "الشروق", adhanTimes.sunrise),
    mapPrayer("dhuhr", "الظهر", adhanTimes.dhuhr),
    mapPrayer("asr", "العصر", adhanTimes.asr),
    mapPrayer("maghrib", "المغرب", adhanTimes.maghrib),
    mapPrayer("isha", "العشاء", adhanTimes.isha),
  ];
}
