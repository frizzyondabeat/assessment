'use client';

import { SystemStatusItem } from '@/components/system-status';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AssessmentStartModal from '@/components/modals/assessment-start-modal';
import { useInternetSpeedCheck } from '@/hooks/use-internet-speed-check';
import { useLightingCheck } from '@/hooks/use-lighting-check';
import { useMicrophoneCheck } from '@/hooks/use-microphone-check';
import { useWebcamCheck } from '@/hooks/use-webcam-check';
import { Camera } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useRef, useState, FC } from 'react';
import Webcam from 'react-webcam';

// Fallback message component that appears after a delay if the webcam feed might not be visible
const WebcamFallbackMessage: FC<{
  webcamRef: React.RefObject<Webcam | null>;
}> = ({ webcamRef }) => {
  const [showFallback, setShowFallback] = useState(false);
  const [videoStatus, setVideoStatus] = useState<string>('Checking...');

  // Show fallback message after 3 seconds (reduced from 5)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Check if webcam video element exists and has proper dimensions
      const videoEl = webcamRef.current?.video;
      let statusMessage = 'Unknown';

      if (!videoEl) {
        statusMessage = 'No video element found';
      } else if (videoEl.readyState !== 4) {
        statusMessage = `Video not ready (readyState: ${videoEl.readyState})`;
      } else if (videoEl.videoWidth === 0 || videoEl.videoHeight === 0) {
        statusMessage = `Invalid video dimensions (${videoEl.videoWidth}x${videoEl.videoHeight})`;
      } else {
        statusMessage = `Video appears ready (${videoEl.videoWidth}x${videoEl.videoHeight})`;
      }

      setVideoStatus(statusMessage);

      const isVideoPlaying =
        videoEl &&
        videoEl.readyState === 4 &&
        videoEl.videoWidth > 0 &&
        videoEl.videoHeight > 0;

      // Only show fallback if video isn't properly playing
      if (!isVideoPlaying) {
        setShowFallback(true);
        console.log(
          'Webcam feed may not be visible, showing fallback message. Status:',
          statusMessage
        );
      }
    }, 3000); // Reduced timeout

    return () => clearTimeout(timer);
  }, [webcamRef]);

  if (!showFallback) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
      <div className="bg-opacity-90 max-w-md rounded-lg bg-black p-4 text-center text-white">
        <p className="font-bold">Webcam Feed Not Visible</p>
        <p className="mt-1 text-sm text-yellow-300">Status: {videoStatus}</p>
        <p className="mt-3">Please try these troubleshooting steps:</p>
        <ul className="mt-2 space-y-1 text-left text-sm">
          <li>• Refreshing the page</li>
          <li>• Checking if your camera is blocked by another application</li>
          <li>• Clicking the &quot;Retry&quot; button in the Webcam status section</li>
          <li>• Checking browser permissions for camera access</li>
          <li>• Trying a different browser (Chrome recommended)</li>
        </ul>
        <div className="mt-4 flex justify-center space-x-3">
          <button
            className="pointer-events-auto rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
            onClick={() => setShowFallback(false)}
          >
            Dismiss
          </button>
          <button
            className="pointer-events-auto rounded bg-green-500 px-3 py-1 text-sm text-white hover:bg-green-600"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
};

const Body = () => {
  const webcamCheck = useWebcamCheck();
  const microphoneCheck = useMicrophoneCheck();
  const internetCheck = useInternetSpeedCheck();
  const lightingCheck = useLightingCheck(webcamCheck.stream);

  // States for recording functionality
  const [recordingStatus, setRecordingStatus] = useState<
    'idle' | 'countdown' | 'recording'
  >('idle');
  const [countdownValue, setCountdownValue] = useState(3);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // State for image capture
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Add webcam ready state
  const [webcamReady, setWebcamReady] = useState(false);

  // Modal state
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);

  // Handle countdown and image capture
  const startCountdown = () => {
    if (recordingStatus !== 'idle' || !webcamCheck.stream || !webcamReady)
      return;

    setRecordingStatus('countdown');
    setCountdownValue(3);

    // Start countdown
    countdownTimerRef.current = setInterval(() => {
      setCountdownValue((prev) => {
        if (prev <= 1) {
          // Countdown finished, capture image
          clearInterval(countdownTimerRef.current as NodeJS.Timeout);
          captureImage();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const captureImage = () => {
    if (!webcamCheck.stream || !webcamCheck.webcamRef.current || !webcamReady)
      return;

    try {
      // Capture image using getScreenshot method
      const screenshot = webcamCheck.webcamRef.current.getScreenshot();
      if (screenshot) {
        setCapturedImage(screenshot);
      } else {
        console.error('Failed to capture screenshot');
      }
    } catch (error) {
      console.error('Error capturing image:', error);
    }

    // Set status back to idle after capturing
    setRecordingStatus('idle');
  };

  const downloadImage = () => {
    if (!capturedImage) return;

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = capturedImage;
    link.download = `webcam-capture-${new Date().toISOString()}.jpg`;
    document.body.appendChild(link);

    // Trigger download
    link.click();

    // Clean up
    document.body.removeChild(link);
  };

  const startRecording = () => {
    if (!webcamCheck.stream) return;

    setRecordingStatus('recording');
    setRecordedChunks([]);

    // Create media recorder
    const options = { mimeType: 'video/webm' };
    const recorder = new MediaRecorder(webcamCheck.stream, options);

    recorder.addEventListener('dataavailable', ({ data }) => {
      if (data.size > 0) {
        setRecordedChunks((prev) => [...prev, data]);
      }
    });

    recorder.start();
    mediaRecorderRef.current = recorder;

    // Stop recording after 5 seconds
    recordingTimerRef.current = setTimeout(() => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== 'inactive'
      ) {
        mediaRecorderRef.current.stop();
        setRecordingStatus('idle');
      }
    }, 5000);
  };

  // Handle webcam user media success
  const handleUserMedia = (stream: MediaStream) => {
    console.log('Webcam stream obtained:', stream);
    setWebcamReady(true);
    webcamCheck.onUserMedia(stream);
  };

  // Handle webcam user media error
  const handleUserMediaError = (error: any) => {
    console.error('Webcam error:', error);
    setWebcamReady(false);
    webcamCheck.onUserMediaError(error);
  };

  // Enhanced webcam element debugging
  useEffect(() => {
    if (webcamCheck.status === 'granted' && webcamCheck.webcamRef.current) {
      const checkVideoElement = () => {
        const videoEl = webcamCheck.webcamRef.current?.video;
        console.log('=== Webcam Debug Info ===');
        console.log('Webcam ref exists:', !!webcamCheck.webcamRef.current);
        console.log('Video element:', videoEl);

        if (videoEl) {
          console.log('Video element properties:', {
            readyState: videoEl.readyState,
            videoWidth: videoEl.videoWidth,
            videoHeight: videoEl.videoHeight,
            currentTime: videoEl.currentTime,
            duration: videoEl.duration,
            paused: videoEl.paused,
            ended: videoEl.ended,
            muted: videoEl.muted,
            volume: videoEl.volume,
            src: videoEl.src,
            srcObject: videoEl.srcObject,
          });

          const computedStyle = window.getComputedStyle(videoEl);
          console.log('Video element computed styles:', {
            display: computedStyle.display,
            visibility: computedStyle.visibility,
            opacity: computedStyle.opacity,
            width: computedStyle.width,
            height: computedStyle.height,
            transform: computedStyle.transform,
          });

          // Try to play the video if it's paused
          if (videoEl.paused && videoEl.srcObject) {
            videoEl.play().catch(console.error);
          }
        }
        console.log('Webcam ready state:', webcamReady);
        console.log('Stream:', webcamCheck.stream);
        console.log('========================');
      };

      // Check immediately and after delays
      checkVideoElement();
      const timer1 = setTimeout(checkVideoElement, 1000);
      const timer2 = setTimeout(checkVideoElement, 3000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [
    webcamCheck.status,
    webcamCheck.webcamRef,
    webcamReady,
    webcamCheck.stream,
  ]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== 'inactive'
      ) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-2 sm:px-4 md:px-6">
      {/* Assessment Start Modal */}
      <AssessmentStartModal
        open={showAssessmentModal}
        onOpenChange={setShowAssessmentModal}
      />
      <div className="grid gap-4 rounded-xl bg-white p-2 sm:gap-6 sm:p-6 lg:grid-cols-2">
        <div className="lg:col-span-full">
          <h2 className="mb-4 text-lg font-medium text-[#0e0e2c] sm:mb-6 sm:text-xl">
            System check
          </h2>

          <p className="mb-6 text-xs leading-relaxed font-normal text-[#4a4a68] sm:mb-8 sm:text-sm">
            We utilize your camera image to ensure fairness for all
            participants, and we also employ both your camera and microphone for
            a video questions where you will be prompted to record a response
            using your camera or webcam, so it&apos;s essential to verify that your
            camera and microphone are functioning correctly and that you have a
            stable internet connection. To do this, please position yourself in
            front of your camera, ensuring that your entire face is clearly
            visible on the screen. This includes your forehead, eyes, ears,
            nose, and lips. You can initiate a 5-second recording of yourself by
            clicking the button below.
          </p>
        </div>

        {/* Video Preview */}
        <Card className="w-full min-w-0 border-[#755ae2] p-0 shadow-none sm:min-w-[320px] lg:col-span-1">
          <div className="relative flex aspect-video h-full min-h-[200px] items-center justify-center overflow-hidden rounded-lg bg-gray-900 sm:min-h-[300px]">
            {capturedImage ? (
              // Show captured image
              <div className="relative h-full w-full">
                <Image
                  src={capturedImage}
                  alt="Captured"
                  fill
                  priority
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-2 right-2 flex space-x-2 sm:top-4 sm:right-4">
                  <button
                    className="rounded-lg bg-green-500 px-2 py-1 text-xs text-white hover:bg-green-600 sm:px-3 sm:text-sm"
                    onClick={downloadImage}
                  >
                    Download
                  </button>
                  <button
                    className="rounded-lg bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600 sm:px-3 sm:text-sm"
                    onClick={() => setCapturedImage(null)}
                  >
                    Retake
                  </button>
                </div>
              </div>
            ) : webcamCheck.status === 'granted' ? (
              <>
                <Webcam
                  ref={webcamCheck.webcamRef}
                  audio={false}
                  videoConstraints={{
                    facingMode: 'user',
                    width: { min: 320, ideal: 640, max: 1280 },
                    height: { min: 180, ideal: 360, max: 720 },
                    frameRate: { ideal: 30 },
                  }}
                  onUserMedia={handleUserMedia}
                  onUserMediaError={handleUserMediaError}
                  className="h-full w-full object-cover"
                  mirrored={true}
                  screenshotFormat="image/jpeg"
                  screenshotQuality={0.8}
                  forceScreenshotSourceSize={true}
                  style={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />

                {/* Loading indicator when webcam is not ready */}
                {!webcamReady && (
                  <div className="bg-opacity-75 absolute inset-0 flex items-center justify-center bg-gray-900">
                    <div className="text-center text-white">
                      <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent sm:h-12 sm:w-12"></div>
                      <p className="text-xs sm:text-base">Loading webcam...</p>
                    </div>
                  </div>
                )}

                {/* Fallback message if webcam feed isn't visible after a delay */}
                <WebcamFallbackMessage webcamRef={webcamCheck.webcamRef} />

                {/* Countdown Overlay */}
                {recordingStatus === 'countdown' && (
                  <div className="bg-opacity-50 absolute inset-0 z-20 flex items-center justify-center bg-black">
                    <div className="text-center text-white">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 sm:h-24 sm:w-24">
                        <span className="text-3xl font-bold sm:text-5xl">
                          {countdownValue}
                        </span>
                      </div>
                      <p className="text-lg sm:text-xl">Get ready...</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-white">
                <div className="text-center">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 sm:mb-4 sm:h-16 sm:w-16">
                    <Camera className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <p className="text-xs sm:text-base">
                    Camera preview will appear here
                  </p>
                  {webcamCheck.status === 'denied' && (
                    <p className="mt-1 text-xs text-red-300 sm:mt-2 sm:text-sm">
                      Please allow camera access
                    </p>
                  )}
                  {webcamCheck.status === 'checking' && (
                    <p className="mt-1 text-xs text-yellow-300 sm:mt-2 sm:text-sm">
                      Requesting camera access...
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* System Status */}
        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:h-1/2 lg:w-1/2">
          <SystemStatusItem
            label="Webcam"
            status={
              webcamCheck.status === 'granted'
                ? 'granted'
                : webcamCheck.status === 'denied'
                  ? 'denied'
                  : webcamCheck.status
            }
            onRetry={webcamCheck.retryCheck}
          />

          <SystemStatusItem
            label="Network"
            status={
              internetCheck.status === 'good'
                ? 'good'
                : internetCheck.status === 'poor'
                  ? 'poor'
                  : internetCheck.status
            }
            onRetry={internetCheck.retryCheck}
            details={
              internetCheck.status !== 'checking'
                ? `Down: ${internetCheck.downloadSpeed} Mbps | Up: ${internetCheck.uploadSpeed} Mbps | Latency: ${internetCheck.latency}ms`
                : undefined
            }
          />

          <SystemStatusItem
            label="Microphone"
            status={
              microphoneCheck.status === 'granted'
                ? 'granted'
                : microphoneCheck.status === 'denied'
                  ? 'denied'
                  : microphoneCheck.status
            }
            onRetry={microphoneCheck.retryCheck}
            showAudioLevel={microphoneCheck.status === 'granted'}
            audioLevel={microphoneCheck.audioLevel}
          />

          <SystemStatusItem
            label="Lighting"
            status={lightingCheck.status}
            onRetry={lightingCheck.retryCheck}
            details={
              lightingCheck.status !== 'checking'
                ? `Brightness: ${lightingCheck.brightness}`
                : undefined
            }
          />
        </div>

        <Button
          className="mt-2 w-full rounded-lg bg-[#755ae2] px-6 py-3 font-medium text-white hover:bg-[#3c1356] sm:w-auto"
          disabled={
            webcamCheck.status !== 'granted' ||
            !webcamReady ||
            recordingStatus !== 'idle'
          }
          onClick={
            capturedImage ? () => setShowAssessmentModal(true) : startCountdown
          }
        >
          {capturedImage
            ? 'Start assessment'
            : recordingStatus === 'idle'
              ? webcamReady
                ? 'Take picture and continue'
                : 'Waiting for webcam...'
              : 'Capturing...'}
        </Button>
      </div>
    </div>
  );
};

export default Body;
