'use client';

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { getStationById } from './radio-stations';

export interface SecureAudioPlayerHandle {
  play: () => void;
  pause: () => void;
}

interface SecureAudioPlayerProps {
  stationId: string;
  isActive: boolean;
  isPoweredOn: boolean;
  onPlay?: () => void;
  onError?: (error: string) => void;
  onAudioData?: (dataArray: Uint8Array) => void;
  directStream?: boolean; // Skip proxy and stream directly
}

const SecureAudioPlayer = forwardRef<SecureAudioPlayerHandle, SecureAudioPlayerProps>(
  ({ stationId, isActive, isPoweredOn, onPlay, onError, onAudioData, directStream = false }, ref) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const maxRetries = 3;

    // Expose play/pause methods via ref
    useImperativeHandle(ref, () => ({
      play: () => {
        if (audioRef.current) {
          // Resume AudioContext if it exists and is suspended
          if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
          }

          audioRef.current.play().catch(() => {
            onError?.('Failed to play audio');
          });
        }
      },
      pause: () => {
        if (audioRef.current) {
          audioRef.current.pause();
        }
      }
    }));

    // Initialize Web Audio API for visualization - ONCE only
    useEffect(() => {
      if (!onAudioData || !audioRef.current || sourceRef.current) return;

      try {
        const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const audioContext = new AudioContextClass();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;

        const source = audioContext.createMediaElementSource(audioRef.current);
        source.connect(analyser);
        analyser.connect(audioContext.destination);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        sourceRef.current = source;

        // Animation loop — smoothed at ~30fps to avoid thrashing React state
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const smoothed = new Float32Array(analyser.frequencyBinCount);
        const out = new Uint8Array(analyser.frequencyBinCount);
        let frameCount = 0;
        const updateAudioData = () => {
          if (analyserRef.current) {
            analyserRef.current.getByteFrequencyData(dataArray);
            // Exponential moving average for smooth rise/fall
            for (let i = 0; i < dataArray.length; i++) {
              smoothed[i] = smoothed[i] * 0.65 + dataArray[i] * 0.35;
              out[i] = smoothed[i];
            }
            // Only push to React state every other frame (~30fps)
            if (frameCount % 2 === 0) onAudioData(out);
            frameCount++;
          }
          animationFrameRef.current = requestAnimationFrame(updateAudioData);
        };
        updateAudioData();

      } catch {
        // Silently handle Web Audio API errors
      }

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        // Only close if context exists and isn't already closed
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close();
        }
      };
    }, [onAudioData]);

    // Handle play/pause based on isPoweredOn
    useEffect(() => {
      if (!audioRef.current || !isActive) return;

      if (isPoweredOn) {
        // Resume AudioContext if it exists and is suspended
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }

        const playPromise = audioRef.current.play();

        if (playPromise !== undefined) {
          playPromise.catch(() => {
            onError?.('Playback failed');
          });
        }
      } else {
        audioRef.current.pause();
      }
    }, [isPoweredOn, isActive, onError, stationId]);

    // Handle errors and retry logic
    const handleError = () => {
      if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          if (audioRef.current) {
            audioRef.current.load();
            if (isPoweredOn) {
              audioRef.current.play().catch(() => {
                // Silent retry
              });
            }
          }
        }, delay);
      } else {
        onError?.('Maximum retry attempts reached');
      }
    };

    // Determine stream URL - use direct stream or proxy
    const station = getStationById(stationId);
    const streamUrl = directStream && station
      ? station.url
      : `/api/stream/${stationId}`;


    return (
      <audio
        ref={audioRef}
        src={streamUrl}
        onPlay={onPlay}
        onError={handleError}
        onCanPlay={() => {
          // Force play when stream is ready
          if (audioRef.current && isPoweredOn) {
            audioRef.current.play().catch(() => {
              // Silent error
            });
          }
        }}
        preload="auto"
        crossOrigin="anonymous"
        style={{ display: 'none' }}
      />
    );
  }
);

SecureAudioPlayer.displayName = 'SecureAudioPlayer';

export default SecureAudioPlayer;
