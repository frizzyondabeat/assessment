'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';

export type LightingStatus = 'checking' | 'good' | 'poor' | 'error';

interface LightingOptions {
  darkThreshold?: number; // Below this value is considered too dark
  brightThreshold?: number; // Above this value is considered too bright
  sampleInterval?: number; // How often to check lighting in ms
  stabilizationDelay?: number; // Time to wait for camera to stabilize
}

export function useLightingCheck(
  videoStream: MediaStream | null,
  options: LightingOptions = {}
) {
  const [status, setStatus] = useState<LightingStatus>('checking');
  const [brightness, setBrightness] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const webcamRef = useRef<Webcam | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Default options with sensible values
  const {
    darkThreshold = 50,
    brightThreshold = 200,
    sampleInterval = 1000,
    stabilizationDelay = 500,
  } = options;

  const analyzeBrightness = useCallback(
    (imageData: ImageData) => {
      const data = imageData.data;

      // Calculate average brightness
      let totalBrightness = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // Calculate perceived brightness using luminance formula
        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
        totalBrightness += brightness;
      }

      const averageBrightness = totalBrightness / (data.length / 4);
      const roundedBrightness = Math.round(averageBrightness);

      setBrightness(roundedBrightness);

      // Determine lighting quality
      if (roundedBrightness < darkThreshold) {
        setStatus('poor'); // Too dark
      } else if (roundedBrightness > brightThreshold) {
        setStatus('poor'); // Too bright/overexposed
      } else {
        setStatus('good'); // Good lighting
      }

      return roundedBrightness;
    },
    [darkThreshold, brightThreshold]
  );

  const checkLighting = useCallback(() => {
    try {
      setStatus('checking');

      // Create canvas if it doesn't exist
      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (!ctx) {
        setStatus('error');
        return;
      }

      // Get video source - either from webcamRef or from videoStream
      let videoSource: HTMLVideoElement | null = null;

      if (webcamRef.current && webcamRef.current.video) {
        videoSource = webcamRef.current.video;
      } else if (videoStream) {
        // Find video elements that might be using this stream
        const videos = document.querySelectorAll('video');
        for (const video of videos) {
          if (video.srcObject === videoStream) {
            videoSource = video;
            break;
          }
        }

        // If no video element is found, create one
        if (!videoSource) {
          videoSource = document.createElement('video');
          videoSource.srcObject = videoStream;
          videoSource.play();
        }
      }

      if (!videoSource) {
        setStatus('error');
        return;
      }

      // Wait for video to be ready
      const checkVideoReady = () => {
        if (videoSource && videoSource.readyState >= 2) {
          // Video is ready
          setTimeout(() => {
            if (!videoSource) return;

            canvas.width = videoSource.videoWidth;
            canvas.height = videoSource.videoHeight;

            ctx.drawImage(videoSource, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(
              0,
              0,
              canvas.width,
              canvas.height
            );

            analyzeBrightness(imageData);

            // Set up periodic checking if needed
            if (sampleInterval > 0 && !timeoutRef.current) {
              timeoutRef.current = setTimeout(() => {
                timeoutRef.current = null;
                checkLighting();
              }, sampleInterval);
            }
          }, stabilizationDelay);
        } else {
          // Check again in a moment
          setTimeout(checkVideoReady, 100);
        }
      };

      checkVideoReady();
    } catch (error) {
      console.error('Lighting check error:', error);
      setStatus('error');
    }
  }, [analyzeBrightness, sampleInterval, stabilizationDelay]);

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Only run checkLighting if we have a videoStream
    if (videoStream) {
      // Use a ref to track the current videoStream to avoid stale closures
      const currentVideoStream = videoStream;
      checkLighting();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [videoStream]);

  const retryCheck = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (videoStream) {
      checkLighting();
    }
  }, [videoStream]);

  return {
    status,
    brightness,
    retryCheck,
    webcamRef,
  };
}
