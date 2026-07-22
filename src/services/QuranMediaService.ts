import { MediaSession } from './MediaSessionBridge';

export class QuranMediaService {
  private static audioElement: HTMLAudioElement;

  static async init(
    audio: HTMLAudioElement, 
    reciterName: string, 
    surahName: string,
    onPlay?: () => void,
    onPause?: () => void,
    onNext?: () => void,
    onPrev?: () => void
  ) {
    this.audioElement = audio;

    const artworkUrl = window.location.origin + "/images/quran_artwork.jpg";

    // 1. إعداد بيانات التشغيل
    await MediaSession.setMetadata({
      title: surahName,
      artist: reciterName,
      album: 'سَكِينَة',
      artwork: [
        { src: artworkUrl, sizes: "512x512", type: "image/jpeg" },
        { src: artworkUrl, sizes: "256x256", type: "image/jpeg" },
        { src: artworkUrl, sizes: "128x128", type: "image/jpeg" }
      ]
    });

    // 2. تفعيل أزرار التحكم (التالي + السابق + إيقاف + تشغيل + إيقاف مؤقت)
    await MediaSession.setActionHandler({ action: 'play' }, async () => {
      if (onPlay) {
        onPlay();
      } else {
        this.audioElement.play().catch(err => console.warn(err));
      }
      this.updatePlaybackState('playing');
    });

    await MediaSession.setActionHandler({ action: 'pause' }, async () => {
      if (onPause) {
        onPause();
      } else {
        this.audioElement.pause();
      }
      this.updatePlaybackState('paused');
    });

    // عند الضغط على "التالي" من شاشة القفل
    await MediaSession.setActionHandler({ action: 'nexttrack' }, async () => {
      if (onNext) {
        onNext();
      } else {
        window.dispatchEvent(new CustomEvent('play-next-surah'));
      }
    });

    // عند الضغط على "السابق" من شاشة القفل
    await MediaSession.setActionHandler({ action: 'previoustrack' }, async () => {
      if (onPrev) {
        onPrev();
      } else {
        window.dispatchEvent(new CustomEvent('play-prev-surah'));
      }
    });
  }

  static async updatePlaybackState(state: 'playing' | 'paused' | 'none') {
    await MediaSession.setPlaybackState({ playbackState: state });
  }
}
