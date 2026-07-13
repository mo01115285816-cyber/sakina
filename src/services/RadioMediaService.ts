import { MediaSession } from './MediaSessionBridge';

export class RadioMediaService {
  private static audioElement: HTMLAudioElement;

  static async init(
    audio: HTMLAudioElement, 
    stationName: string = 'إذاعة القرآن الكريم من القاهرة', 
    subtitle: string = 'البث المباشر', 
    logoUrl?: string,
    onPlay?: () => void,
    onPause?: () => void
  ) {
    this.audioElement = audio;

    const absoluteLogoUrl = logoUrl ? (window.location.origin + logoUrl) : '';

    // 1. إعداد بيانات البث
    await MediaSession.setMetadata({
      title: stationName,
      artist: subtitle,
      album: 'سَكِينَة',
      artwork: absoluteLogoUrl ? [
        { src: absoluteLogoUrl, sizes: '512x512', type: 'image/jpeg' },
        { src: absoluteLogoUrl, sizes: '256x256', type: 'image/jpeg' },
        { src: absoluteLogoUrl, sizes: '128x128', type: 'image/jpeg' }
      ] : []
    });

    // 2. تفعيل أزرار التحكم المسموح بها (إيقاف مؤقت + إيقاف فقط)
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

    await MediaSession.setActionHandler({ action: 'stop' }, async () => {
      if (onPause) {
        onPause();
      } else {
        this.audioElement.pause();
        try {
          this.audioElement.currentTime = 0;
        } catch (e) {}
      }
      this.updatePlaybackState('none');
    });
  }

  // 3. تحديث حالة التشغيل لتظهر في أندرويد
  static async updatePlaybackState(state: 'playing' | 'paused' | 'none') {
    await MediaSession.setPlaybackState({ playbackState: state });
  }
}
