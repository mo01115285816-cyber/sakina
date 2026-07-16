import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

export class PrayerNotificationsService {
  static isSupported(): boolean {
    return Capacitor.isPluginAvailable('LocalNotifications');
  }

  // 1. طلب الإذن (يُستدعى عند بدء التطبيق)
  static async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      console.log('Local Notifications are not supported on this platform.');
      return false;
    }
    try {
      const result = await LocalNotifications.requestPermissions();
      return result.display === 'granted';
    } catch (e) {
      console.warn('Failed to request notification permissions:', e);
      return false;
    }
  }

  // 2. إلغاء جميع الإشعارات المجدولة لتفادي التكرار
  static async clearAllScheduled() {
    if (!this.isSupported()) return;
    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
      }
    } catch (e) {
      console.warn("Error clearing scheduled notifications:", e);
    }
  }

  // 3. جدولة تذكير قبل الصلاة (10 دقائق)
  static async schedulePrePrayerReminder(prayerName: string, prayerTime: Date, verseText: string) {
    if (!this.isSupported()) return;

    const reminderTime = new Date(prayerTime.getTime() - 10 * 60 * 1000);
    // Only schedule if the reminder time is in the future
    if (reminderTime.getTime() <= Date.now()) return;

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.floor(Math.random() * 1000000),
            title: `تذكير: اقتربت صلاة ${prayerName}`,
            body: `متبقي ١٠ دقائق على صلاة ${prayerName}. ${verseText}`,
            schedule: { at: reminderTime },
            sound: 'beep.wav',
            channelId: 'beep_channel',
            actionTypeId: 'PRAYER_REMINDER',
          }
        ]
      });
    } catch (e) {
      console.warn(`Failed to schedule pre-prayer reminder for ${prayerName}:`, e);
    }
  }

  // 4. إشعار عند موعد الصلاة
  static async schedulePrayerTime(prayerName: string, prayerTime: Date, verseText: string) {
    if (!this.isSupported()) return;

    // Only schedule if the prayer time is in the future
    if (prayerTime.getTime() <= Date.now()) return;

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.floor(Math.random() * 1000000),
            title: `حان الآن موعد صلاة ${prayerName}`,
            body: verseText,
            schedule: { at: prayerTime },
            sound: 'azan.wav',
            channelId: 'azan_channel',
            actionTypeId: 'PRAYER_TIME',
          }
        ]
      });
    } catch (e) {
      console.warn(`Failed to schedule prayer time notification for ${prayerName}:`, e);
    }
  }

  // 5. إشعار تجريبي فوري لتسهيل التحقق والتحكم
  static async scheduleTestNotification(): Promise<boolean> {
    if (!this.isSupported()) {
      // Browser Web Fallback
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("سَكِينَة - إشعار تجريبي", {
            body: "تم تفعيل الإشعارات بنجاح في تطبيق سَكِينَة. تقبل الله طاعاتكم.",
          });
          return true;
        } else if (Notification.permission !== "denied") {
          const result = await Notification.requestPermission();
          if (result === "granted") {
            new Notification("سَكِينَة - إشعار تجريبي", {
              body: "تم تفعيل الإشعارات بنجاح في تطبيق سَكِينَة. تقبل الله طاعاتكم.",
            });
            return true;
          }
        }
      }
      return false;
    }
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 999999,
            title: "سَكِينَة - إشعار تجريبي",
            body: "تم تفعيل الإشعارات بنجاح في تطبيق سَكِينَة. تقبل الله طاعاتكم.",
            schedule: { at: new Date(Date.now() + 1000) },
            sound: "azan.wav",
            channelId: "azan_channel",
            actionTypeId: "TEST_NOTIFICATION",
          }
        ]
      });
      return true;
    } catch (e) {
      console.warn("Failed to schedule test notification:", e);
      return false;
    }
  }

  // Helper to calculate the next occurrence of a HH:MM string
  private static calculateNextOccurrence(timeStr: string): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const now = new Date();
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);
    
    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 1);
    }
    return target;
  }

  // 6. جدولة تذكير سورة الملك
  static async scheduleMulkReminder(targetTimeStr: string) {
    if (!this.isSupported()) return;
    const targetDate = this.calculateNextOccurrence(targetTimeStr);
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 888881,
            title: "تذكير سورة الملك",
            body: "حان الآن وقت قراءة سورة الملك المنجية من عذاب القبر.",
            schedule: { at: targetDate },
            sound: 'beep.wav',
            channelId: 'beep_channel',
            actionTypeId: 'MULK_REMINDER',
          }
        ]
      });
    } catch (e) {
      console.warn("Failed to schedule Surah Al-Mulk reminder:", e);
    }
  }

  // 7. جدولة تذكير سورة البقرة
  static async scheduleBaqarahReminder(targetTimeStr: string) {
    if (!this.isSupported()) return;
    const targetDate = this.calculateNextOccurrence(targetTimeStr);
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 888882,
            title: "تذكير سورة البقرة",
            body: "حان الآن وقت قراءة سورة البقرة المباركة.",
            schedule: { at: targetDate },
            sound: 'beep.wav',
            channelId: 'beep_channel',
            actionTypeId: 'BAQARAH_REMINDER',
          }
        ]
      });
    } catch (e) {
      console.warn("Failed to schedule Surah Al-Baqarah reminder:", e);
    }
  }
}
