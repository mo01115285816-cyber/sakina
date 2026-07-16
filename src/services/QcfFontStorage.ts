import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

const FONTS_DIR_NAME = 'qcf-fonts';
const EXTRACTION_FLAG_KEY = 'qcf_fonts_extracted_v1';
const ZIP_SOURCE_URL = '/fonts/qcf-fonts.zip';

type Platform = 'web' | 'native';

function getPlatform(): Platform {
  try {
    return Capacitor.isNativePlatform() ? 'native' : 'web';
  } catch {
    return 'web';
  }
}

// Lazy-load the Zip plugin only on native platforms to avoid web import errors.
// The package exports `CapacitorZip` (not `Zip`), and its web implementation
// triggers browser downloads (not suitable for our use case), so we only
// invoke it on native platforms.
async function getZipPlugin(): Promise<any> {
  const moduleName = '@capgo/capacitor-zip';
  // Use indirect dynamic import to prevent Vite from pre-bundling this
  // native-only plugin into the web bundle.
  const mod = await (Function('m', 'return import(m)')(moduleName));
  return mod.CapacitorZip;
}

function fontFileName(pageNumber: number): string {
  return `p${String(pageNumber).padStart(3, '0')}.woff2`;
}

function fontId(pageNumber: number): string {
  return `QCF_P${String(pageNumber).padStart(3, '0')}`;
}

export const QcfFontStorage = {
  getPlatform,

  async isExtracted(): Promise<boolean> {
    if (getPlatform() !== 'native') return false;
    try {
      const flag = localStorage.getItem(EXTRACTION_FLAG_KEY);
      if (flag !== 'true') return false;

      // Double-check by verifying a sample font file exists
      const samplePath = `${FONTS_DIR_NAME}/${fontFileName(1)}`;
      try {
        await Filesystem.stat({
          path: samplePath,
          directory: Directory.Data,
        });
        return true;
      } catch {
        localStorage.removeItem(EXTRACTION_FLAG_KEY);
        return false;
      }
    } catch {
      return false;
    }
  },

  async extractFonts(
    onProgress?: (percent: number, status: string) => void
  ): Promise<void> {
    if (getPlatform() !== 'native') {
      // Web platform: no extraction needed, fonts read directly from assets
      return;
    }

    if (await this.isExtracted()) {
      onProgress?.(100, 'الخطوط جاهزة');
      return;
    }

    onProgress?.(5, 'تجهيز ملف الخطوط...');

    // Step 1: Ensure the qcf-fonts directory exists in Data directory
    const dataDirResult = await Filesystem.getUri({
      path: '',
      directory: Directory.Data,
    });
    const dataDir = dataDirResult.uri;
    const targetDir = `${dataDir}/${FONTS_DIR_NAME}`;

    try {
      await Filesystem.mkdir({
        path: FONTS_DIR_NAME,
        directory: Directory.Data,
        recursive: true,
      });
    } catch {
      // Directory may already exist, ignore
    }

    onProgress?.(15, 'نسخ ملف الخطوط...');

    // Step 2: Copy zip from assets to a temp location in Data directory
    const zipTempPath = 'qcf-fonts.zip';
    try {
      // Read the zip from public assets (Capacitor serves public/ at root)
      const response = await fetch(ZIP_SOURCE_URL);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} fetching zip`);
      }
      const zipBlob = await response.blob();
      const zipArrayBuffer = await zipBlob.arrayBuffer();
      const zipBase64 = arrayBufferToBase64(zipArrayBuffer);

      await Filesystem.writeFile({
        path: zipTempPath,
        data: zipBase64,
        directory: Directory.Data,
        recursive: true,
      });
    } catch (err) {
      throw new Error(`فشل نسخ ملف الخطوط: ${err instanceof Error ? err.message : String(err)}`);
    }

    onProgress?.(40, 'جاري فك الضغط...');

    // Step 3: Unzip using @capgo/capacitor-zip (native only, lazy-loaded)
    try {
      const Zip = await getZipPlugin();
      const zipFileUri = await Filesystem.getUri({
        path: zipTempPath,
        directory: Directory.Data,
      });

      await Zip.unzip({
        source: zipFileUri.uri,
        destination: targetDir,
      });
    } catch (err) {
      throw new Error(`فشل فك الضغط: ${err instanceof Error ? err.message : String(err)}`);
    }

    onProgress?.(85, 'التحقق من سلامة الخطوط...');

    // Step 4: Verify a sample font to ensure extraction succeeded
    try {
      const sampleStat = await Filesystem.stat({
        path: `${FONTS_DIR_NAME}/${fontFileName(1)}`,
        directory: Directory.Data,
      });
      if (sampleStat.size < 30000) {
        throw new Error(`ملف الخط المستخرج تالف: ${sampleStat.size} بايت`);
      }
    } catch (err) {
      throw new Error(`فشل التحقق من الخطوط المستخرجة: ${err instanceof Error ? err.message : String(err)}`);
    }

    onProgress?.(95, 'تنظيف الملفات المؤقتة...');

    // Step 5: Clean up the zip file
    try {
      await Filesystem.deleteFile({
        path: zipTempPath,
        directory: Directory.Data,
      });
    } catch {
      // Non-critical, ignore
    }

    // Step 6: Mark extraction as complete
    localStorage.setItem(EXTRACTION_FLAG_KEY, 'true');

    onProgress?.(100, 'اكتمل تجهيز الخطوط');
  },

  async clearExtractedFonts(): Promise<void> {
    if (getPlatform() !== 'native') return;
    try {
      await Filesystem.rmdir({
        path: FONTS_DIR_NAME,
        directory: Directory.Data,
        recursive: true,
      });
    } catch {
      // ignore
    }
    localStorage.removeItem(EXTRACTION_FLAG_KEY);
  },

  async readFontAsBlobUrl(pageNumber: number): Promise<string> {
    const platform = getPlatform();

    if (platform === 'native') {
      // Read from Filesystem
      const filePath = `${FONTS_DIR_NAME}/${fontFileName(pageNumber)}`;
      try {
        const result = await Filesystem.readFile({
          path: filePath,
          directory: Directory.Data,
        });

        // result.data is a base64 string on native
        const byteCharacters = atob(result.data as string);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'font/woff2' });
        return URL.createObjectURL(blob);
      } catch (err) {
        throw new Error(`فشل قراءة خط الصفحة ${pageNumber} من الذاكرة: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    // Web: fetch directly from assets (woff2 already optimized, browser caches it)
    const url = `/fonts/qcf/${fontFileName(pageNumber)}`;
    return url;
  },

  fontId,
  fontFileName,
};

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(chunk) as unknown as number[]);
  }
  return btoa(binary);
}
