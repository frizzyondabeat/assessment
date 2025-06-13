'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export type MicrophoneStatus = 'checking' | 'granted' | 'denied' | 'error';

interface MicrophoneOptions {
  monitorDuration?: number; // How long to monitor audio in ms (0 for continuous)
  fftSize?: number; // FFT size for frequency analysis (power of 2)
  smoothingTimeConstant?: number; // Smoothing factor for audio analysis (0-1)
}

export function useMicrophoneCheck(options: MicrophoneOptions = {}) {
  const [status, setStatus] = useState<MicrophoneStatus>('checking');
  const [audioLevel, setAudioLevel] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Refs to store audio processing objects
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Default options
  const {
    monitorDuration = 0, // 0 means continuous monitoring
    fftSize = 256,
    smoothingTimeConstant = 0.8,
  } = options;

  // Function to stop monitoring and clean up resources
  const stopMonitoring = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (audioContextRef.current) {
      if (audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      audioContextRef.current = null;
    }

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    microphoneRef.current = null;
    analyserRef.current = null;
  }, [stream]);

  // Function to start monitoring audio levels
  const startMonitoring = useCallback(
    (mediaStream: MediaStream) => {
      try {
        // Create audio context and nodes
        const AudioContext =
          window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        microphoneRef.current =
          audioContextRef.current.createMediaStreamSource(mediaStream);

        // Configure analyser
        analyserRef.current.fftSize = fftSize;
        analyserRef.current.smoothingTimeConstant = smoothingTimeConstant;

        // Connect nodes
        microphoneRef.current.connect(analyserRef.current);

        // Create data array for frequency analysis
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

        // Function to update audio level
        const updateAudioLevel = () => {
          if (!analyserRef.current) return;

          analyserRef.current.getByteFrequencyData(dataArray);
          const average =
            dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          setAudioLevel(average);

          // Continue monitoring
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
        };

        // Start monitoring
        updateAudioLevel();

        // Set timeout to stop monitoring if duration is specified
        if (monitorDuration > 0) {
          timeoutRef.current = setTimeout(() => {
            stopMonitoring();
          }, monitorDuration);
        }
      } catch (error) {
        console.error('Audio monitoring error:', error);
        stopMonitoring();
      }
    },
    [fftSize, smoothingTimeConstant, monitorDuration, stopMonitoring]
  );

  const checkMicrophoneAccess = useCallback(async () => {
    try {
      // Clean up any existing resources
      stopMonitoring();

      setStatus('checking');

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setStatus('error');
        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      setStream(mediaStream);
      setStatus('granted');

      // Start monitoring audio levels
      startMonitoring(mediaStream);
    } catch (error) {
      console.error('Microphone access error:', error);
      if (error instanceof Error) {
        if (
          error.name === 'NotAllowedError' ||
          error.name === 'PermissionDeniedError'
        ) {
          setStatus('denied');
        } else {
          setStatus('error');
        }
      } else {
        setStatus('error');
      }
    }
  }, [stopMonitoring, startMonitoring]);


  useEffect(() => {
    const initMicrophone = () => {
      checkMicrophoneAccess();
    };

    const cleanup = () => {
      if (audioContextRef.current) {
        if (audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close();
        }
        audioContextRef.current = null;
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };

    initMicrophone();

    // Clean up on unmount
    return cleanup;
  }, []);

  // Create a stable retryCheck function that doesn't depend on checkMicrophoneAccess
  const retryCheck = useCallback(() => {
    // Clean up existing resources first
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (audioContextRef.current) {
      if (audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      audioContextRef.current = null;
    }

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    // Reset state and check microphone access
    setStatus('checking');

    const checkAccess = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setStatus('error');
          return;
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });

        setStream(mediaStream);
        setStatus('granted');

        // Start monitoring audio levels
        try {
          // Create audio context and nodes
          const AudioContext =
            window.AudioContext || (window as any).webkitAudioContext;
          audioContextRef.current = new AudioContext();
          analyserRef.current = audioContextRef.current.createAnalyser();
          microphoneRef.current =
            audioContextRef.current.createMediaStreamSource(mediaStream);

          // Configure analyser
          if (analyserRef.current) {
            analyserRef.current.fftSize = fftSize;
            analyserRef.current.smoothingTimeConstant = smoothingTimeConstant;

            // Connect nodes
            microphoneRef.current.connect(analyserRef.current);

            // Create data array for frequency analysis
            const dataArray = new Uint8Array(
              analyserRef.current.frequencyBinCount
            );

            // Function to update audio level
            const updateAudioLevel = () => {
              if (!analyserRef.current) return;

              analyserRef.current.getByteFrequencyData(dataArray);
              const average =
                dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
              setAudioLevel(average);

              // Continue monitoring
              animationFrameRef.current =
                requestAnimationFrame(updateAudioLevel);
            };

            // Start monitoring
            updateAudioLevel();

            // Set timeout to stop monitoring if duration is specified
            if (monitorDuration > 0) {
              timeoutRef.current = setTimeout(() => {
                if (animationFrameRef.current) {
                  cancelAnimationFrame(animationFrameRef.current);
                  animationFrameRef.current = null;
                }
              }, monitorDuration);
            }
          }
        } catch (error) {
          console.error('Audio monitoring error:', error);
          setStatus('error');
        }
      } catch (error) {
        console.error('Microphone access error:', error);
        if (error instanceof Error) {
          if (
            error.name === 'NotAllowedError' ||
            error.name === 'PermissionDeniedError'
          ) {
            setStatus('denied');
          } else {
            setStatus('error');
          }
        } else {
          setStatus('error');
        }
      }
    };

    checkAccess();
  }, [stream, fftSize, smoothingTimeConstant, monitorDuration]);

  return {
    status,
    audioLevel,
    stream,
    retryCheck,
    stopMonitoring,
  };
}
