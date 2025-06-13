'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';

export type WebcamStatus = 'checking' | 'granted' | 'denied' | 'error';


export function useWebcamCheck() {
  const [status, setStatus] = useState<WebcamStatus>('checking');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleUserMedia = useCallback((mediaStream: MediaStream) => {
    setStream(mediaStream);
    setStatus('granted');

    if (videoRef.current) {
      videoRef.current.srcObject = mediaStream;
    }
  }, []);

  const handleUserMediaError = useCallback((error: string | DOMException) => {
    console.error('Webcam access error:', error);

    if (error instanceof DOMException) {
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
  }, []);

  useEffect(() => {
    // Initial check
    setStatus('checking');

    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setStatus('error');
      return;
    }

    // Explicitly request camera access to ensure permissions are granted
    // This helps in some browsers where permissions might not be properly requested
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((mediaStream) => {
        console.log('Initial webcam access granted:', mediaStream);
        // We don't set the stream here as the Webcam component will handle it
        // Just update the status to indicate permissions are granted
        setStatus('granted');

        // We'll stop this initial stream as the Webcam component will create its own
        mediaStream.getTracks().forEach((track) => track.stop());
      })
      .catch((error) => {
        console.error('Initial webcam access error:', error);
        handleUserMediaError(error);
      });

    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [handleUserMedia, handleUserMediaError]);

  const retryCheck = useCallback(() => {
    setStatus('checking');

    // Clean up any existing stream
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    // If we're using react-webcam, we need to force it to retry
    // by temporarily unmounting and remounting it
    // This is handled in the UI by the status change

    // For compatibility with direct API usage
    if (!webcamRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then(handleUserMedia)
        .catch(handleUserMediaError);
    }
  }, [handleUserMedia, handleUserMediaError, stream]);

  return {
    status,
    stream,
    videoRef,
    webcamRef,
    retryCheck,
    onUserMedia: handleUserMedia,
    onUserMediaError: handleUserMediaError,
  };
}
