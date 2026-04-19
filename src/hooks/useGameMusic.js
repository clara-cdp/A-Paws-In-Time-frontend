import { useEffect, useRef, useState } from 'react';

const AUDIO_TRACKS = [
  '/assets/audio/track_1.mp3',
  '/assets/audio/track_2.mp3',
  '/assets/audio/track_3.mp3',
  '/assets/audio/track_5.mp3',
];

export default function useGameMusic() {
  const [musicEnabled, setMusicEnabled] = useState(true);
  const audioRef = useRef(null);
  const trackIndexRef = useRef(0);
  const musicEnabledRef = useRef(true);

  useEffect(() => {
    musicEnabledRef.current = musicEnabled;
  }, [musicEnabled]);

  useEffect(() => {
    const audio = new Audio(AUDIO_TRACKS[0]);
    audio.preload = 'auto';
    audio.loop = false;
    audio.volume = 0.38;

    const handleTrackEnd = () => {
      trackIndexRef.current = (trackIndexRef.current + 1) % AUDIO_TRACKS.length;
      audio.src = AUDIO_TRACKS[trackIndexRef.current];
      audio.load();

      if (musicEnabledRef.current) {
        audio.play().catch(() => {});
      }
    };

    audio.addEventListener('ended', handleTrackEnd);
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.removeEventListener('ended', handleTrackEnd);
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return undefined;
    }

    if (!musicEnabled) {
      audio.pause();
      return undefined;
    }

    audio.play().catch(() => {});
    return undefined;
  }, [musicEnabled]);

  useEffect(() => {
    const handleFirstInteraction = () => {
      const audio = audioRef.current;
      if (!audio || !musicEnabledRef.current) {
        return;
      }

      audio.play().catch(() => {});
    };

    window.addEventListener('pointerdown', handleFirstInteraction, { passive: true });
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  return {
    musicEnabled,
    toggleMusic: () => setMusicEnabled((current) => !current),
  };
}
