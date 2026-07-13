import localforage from 'localforage';
import { MushafLayoutService } from './MushafLayoutService';

const DB_VERSION_KEY = 'quran_db_version';
const DB_VERSION = 'v3_mushaf_layout';

export const QuranOfflineService = {
  tafsirStore: localforage.createInstance({
    name: 'quran_db',
    storeName: 'tafsirs',
    description: 'Offline Tafsir Pages',
  }),

  metaStore: localforage.createInstance({
    name: 'quran_db',
    storeName: 'meta',
    description: 'Quran DB metadata',
  }),

  async isDownloaded(): Promise<boolean> {
    const version = await this.metaStore.getItem<string>(DB_VERSION_KEY);
    if (version !== DB_VERSION) {
      await this.clearQuran();
      return false;
    }
    const mushafReady = await MushafLayoutService.isDownloaded();
    if (!mushafReady) return false;
    const tafsirsCount = await this.tafsirStore.length();
    return tafsirsCount >= 604;
  },

  async getPage(pageNumber: number): Promise<any[] | null> {
    const page = await MushafLayoutService.getPage(pageNumber);
    if (!page) return null;
    return [page];
  },

  async getTafsirPage(pageNumber: number): Promise<any[] | null> {
    return await this.tafsirStore.getItem<any[]>(`tafsir_${pageNumber}`);
  },

  async downloadQuran(onProgress: (percent: number, statusText: string) => void): Promise<void> {
    const totalPages = 604;
    let pagesDownloaded = 0;

    onProgress(0, 'جاري تجهيز بيانات المصحف...');

    await MushafLayoutService.downloadAll((layoutPercent, layoutStatus) => {
      const overallPercent = Math.floor(layoutPercent * 0.6);
      onProgress(overallPercent, layoutStatus);
    });

    pagesDownloaded = totalPages;

    const fetchTafsir = async (pageNumber: number, retries = 3): Promise<void> => {
      try {
        const tafsirRes = await fetch(`https://api.quran.com/api/v4/tafsirs/16/by_page/${pageNumber}`);
        if (!tafsirRes.ok) throw new Error(`HTTP Tafsir:${tafsirRes.status}`);
        const tafsirData = await tafsirRes.json();
        await this.tafsirStore.setItem(`tafsir_${pageNumber}`, tafsirData.tafsirs);
      } catch (err) {
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return fetchTafsir(pageNumber, retries - 1);
        }
        throw err;
      }
    };

    const chunkSize = 10;
    let tafsirDownloaded = 0;

    for (let i = 1; i <= totalPages; i += chunkSize) {
      const chunkPromises = [];
      for (let j = 0; j < chunkSize && i + j <= totalPages; j++) {
        const pageNumber = i + j;
        chunkPromises.push(fetchTafsir(pageNumber));
      }

      await Promise.all(chunkPromises);
      tafsirDownloaded += chunkPromises.length;

      const tafsirPercent = Math.floor((tafsirDownloaded / totalPages) * 100);
      const overallPercent = 60 + Math.floor(tafsirPercent * 0.4);
      let statusText = `تم حفظ تفسير ${tafsirDownloaded} صفحة...`;
      if (tafsirDownloaded < 50) statusText = 'جاري تحميل التفسير...';
      else if (tafsirDownloaded > 550) statusText = 'جاري الحفظ النهائي محلياً...';

      onProgress(overallPercent, statusText);
    }

    await this.metaStore.setItem(DB_VERSION_KEY, DB_VERSION);
  },

  async clearQuran(): Promise<void> {
    await Promise.all([
      this.tafsirStore.clear(),
      this.metaStore.clear(),
      MushafLayoutService.clearAll(),
    ]);
  }
};
