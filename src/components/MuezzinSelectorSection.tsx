/**
 * MuezzinSelectorSection — Expandable muezzin selection with search, preview, download
 * قسم اختيار المؤذن مع البحث والاستماع والتحميل
 * 
 * Reference: IMG_٢٠٢٦٠٧١٦_١٨٣٦٠٩.jpg
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import type { MuezzinTrack } from '@/types/prayer-settings';
import { MUEZZIN_LIST } from '@/types/prayer-settings';

interface MuezzinSelectorSectionProps {
  selectedMuezzinId?: string;
  onSelect: (muezzin: MuezzinTrack) => void;
}

/** Check if a muezzin audio is cached (Web: Cache API, Native: Filesystem) */
async function isMuezzinCached(fileName: string): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    try {
      await Filesystem.stat({ path: `muezzins/${fileName}`, directory: Directory.Data });
      return true;
    } catch {
      return false;
    }
  }
  // Web: check Cache API
  try {
    const cache = await caches.open('sakeenah-azan-cache-v1');
    const response = await cache.match(`muezzin://${fileName}`);
    return !!response;
  } catch {
    return false;
  }
}

/** Download muezzin audio */
async function downloadMuezzinAudio(track: MuezzinTrack): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    // Ensure directory exists
    try {
      await Filesystem.mkdir({ path: 'muezzins', directory: Directory.Data, recursive: true });
    } catch { /* exists */ }
    
    await Filesystem.downloadFile({
      url: track.url,
      path: `muezzins/${track.fileName}`,
      directory: Directory.Data,
    });
  } else {
    // Web: Cache API
    const cache = await caches.open('sakeenah-azan-cache-v1');
    const response = await fetch(track.url);
    await cache.put(`muezzin://${track.fileName}`, response);
  }
}

export const MuezzinSelectorSection = React.memo(function MuezzinSelectorSection({
  selectedMuezzinId,
  onSelect,
}: MuezzinSelectorSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Check cached status on mount
  useEffect(() => {
    async function checkCache() {
      const cached = new Set<string>();
      for (const track of MUEZZIN_LIST) {
        if (await isMuezzinCached(track.fileName)) {
          cached.add(track.id);
        }
      }
      setDownloadedIds(cached);
    }
    checkCache();
  }, []);

  // Filter muezzins by search
  const filteredMuezzins = MUEZZIN_LIST.filter((m) =>
    m.name.includes(searchQuery.trim())
  );

  // Preview playback
  const handlePlay = useCallback(async (track: MuezzinTrack) => {
    // Stop current if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (playingId === track.id) {
      setPlayingId(null);
      return;
    }

    try {
      let audioUrl = track.url;

      // If cached locally, use local file
      if (downloadedIds.has(track.id)) {
        if (Capacitor.isNativePlatform()) {
          const result = await Filesystem.getUri({
            path: `muezzins/${track.fileName}`,
            directory: Directory.Data,
          });
          audioUrl = result.uri;
        } else {
          const cache = await caches.open('sakeenah-azan-cache-v1');
          const response = await cache.match(`muezzin://${track.fileName}`);
          if (response) {
            const blob = await response.blob();
            audioUrl = URL.createObjectURL(blob);
          }
        }
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => setPlayingId(null);
      audio.onerror = () => setPlayingId(null);
      
      await audio.play();
      setPlayingId(track.id);
    } catch (e) {
      console.warn('Audio playback failed:', e);
      setPlayingId(null);
    }
  }, [playingId, downloadedIds]);

  // Download handler
  const handleDownload = useCallback(async (track: MuezzinTrack) => {
    if (downloadedIds.has(track.id)) return;
    
    setDownloadingId(track.id);
    try {
      await downloadMuezzinAudio(track);
      setDownloadedIds((prev) => new Set(prev).add(track.id));
    } catch (e) {
      console.warn('Download failed:', e);
    } finally {
      setDownloadingId(null);
    }
  }, [downloadedIds]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="overflow-hidden"
      dir="rtl"
    >
      <div className="mt-4 rounded-[20px] bg-[#fdfcfb] border border-[#e6dccf]/50 p-4">
        {/* Section Title */}
        <h4 className="text-[15px] font-black text-[#2b1a10] mb-3">صوت المؤذن</h4>

        {/* Search Input */}
        <div className="relative mb-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث 🔍"
            className="w-full rounded-full bg-[#f7f2ea] border border-[#e6dccf] px-4 py-2.5 text-[13px] text-[#2b1a10] placeholder:text-[#7f6a55]/50 focus:outline-none focus:border-[#b88a4f] focus:ring-1 focus:ring-[#b88a4f]/30 transition-all"
          />
        </div>

        {/* Muezzins List */}
        <div className="max-h-72 overflow-y-auto custom-scrollbar space-y-0.5">
          {filteredMuezzins.map((track) => {
            const isSelected = selectedMuezzinId === track.id;
            const isDownloaded = downloadedIds.has(track.id);
            const isDownloading = downloadingId === track.id;
            const isPlaying = playingId === track.id;

            return (
              <div
                key={track.id}
                onClick={() => onSelect(track)}
                className={`flex items-center justify-between rounded-[14px] px-3 py-2.5 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'bg-[#b88a4f]/10 border border-[#b88a4f]/30'
                    : 'hover:bg-[#f7f2ea] border border-transparent'
                }`}
              >
                {/* Right: Muezzin name + selection check */}
                <div className="flex items-center gap-2.5">
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#b88a4f] flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                  {!isSelected && (
                    <div className="w-5 h-5 rounded-full border-2 border-[#e6dccf]" />
                  )}
                  <span className={`text-[13px] font-bold ${isSelected ? 'text-[#2b1a10]' : 'text-[#7f6a55]'}`}>
                    {track.name}
                  </span>
                </div>

                {/* Left: Action buttons */}
                <div className="flex items-center gap-2">
                  {/* Play/Preview */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlay(track);
                    }}
                    className="w-8 h-8 rounded-full bg-[#f7f2ea] flex items-center justify-center transition-all hover:bg-[#e6dccf] active:scale-90"
                    aria-label={isPlaying ? 'إيقاف' : 'استماع'}
                  >
                    {isPlaying ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#b88a4f">
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#b88a4f">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    )}
                  </button>

                  {/* Download */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isDownloaded) handleDownload(track);
                    }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                      isDownloaded
                        ? 'bg-[#b88a4f]/10'
                        : 'bg-[#f7f2ea] hover:bg-[#e6dccf]'
                    }`}
                    disabled={isDownloading}
                    aria-label={isDownloaded ? 'تم التحميل' : 'تحميل'}
                  >
                    {isDownloading ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b88a4f" strokeWidth="2" className="animate-spin">
                        <path d="M12 2a10 10 0 0 1 10 10" />
                      </svg>
                    ) : isDownloaded ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b88a4f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7f6a55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            );
          })}

          {filteredMuezzins.length === 0 && (
            <p className="text-center text-[13px] text-[#7f6a55] py-4">لا توجد نتائج</p>
          )}
        </div>
      </div>
    </motion.div>
  );
});
