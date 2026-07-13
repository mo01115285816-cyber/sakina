import { useEffect, useState } from 'react';
import { QcfFontStorage } from '@/services/QcfFontStorage';

const loadedFonts = new Map<string, string>();

function fontId(pageNumber: number): string {
  return `QCF_P${String(pageNumber).padStart(3, '0')}`;
}

async function loadFont(pageNumber: number): Promise<void> {
  const fontFamily = fontId(pageNumber);
  if (loadedFonts.has(fontFamily)) return;

  const url = await QcfFontStorage.readFontAsBlobUrl(pageNumber);

  const fontFace = new FontFace(fontFamily, `url(${url}) format('woff2')`, {
    display: 'block',
  });

  const loaded = await fontFace.load();
  document.fonts.add(loaded);
  loadedFonts.set(fontFamily, url);
}

export function useQcfFont(pageNumber: number): boolean {
  const fontFamily = pageNumber >= 1 && pageNumber <= 604 ? fontId(pageNumber) : null;
  const [isLoaded, setIsLoaded] = useState<boolean>(
    () => (fontFamily ? loadedFonts.has(fontFamily) : false)
  );

  useEffect(() => {
    if (!fontFamily) return;

    if (loadedFonts.has(fontFamily)) {
      setIsLoaded(true);
      return;
    }

    let cancelled = false;
    setIsLoaded(false);

    loadFont(pageNumber)
      .then(() => {
        if (!cancelled) setIsLoaded(true);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error(`Failed to load QCF font for page ${pageNumber}:`, err);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fontFamily, pageNumber]);

  return isLoaded;
}

export function prefetchQcfFont(pageNumber: number): void {
  if (!pageNumber || pageNumber < 1 || pageNumber > 604) return;
  const fontFamily = fontId(pageNumber);
  if (loadedFonts.has(fontFamily)) return;

  loadFont(pageNumber).catch((err) => {
    console.error(`Prefetch failed for QCF page ${pageNumber}:`, err);
  });
}

export function isQcfFontLoaded(pageNumber: number): boolean {
  if (!pageNumber || pageNumber < 1 || pageNumber > 604) return false;
  return loadedFonts.has(fontId(pageNumber));
}

export function areFontsExtracted(): Promise<boolean> {
  return QcfFontStorage.isExtracted();
}
