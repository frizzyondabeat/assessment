'use client';

import { cn } from '@/lib/utils';
import { LampCharge, MonitorRecorder, TickCircle, Wifi } from 'iconsax-react';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export type SystemCheckStatus =
  | 'checking'
  | 'good'
  | 'poor'
  | 'granted'
  | 'denied'
  | 'error';

interface SystemStatusItemProps {
  label: string;
  status: SystemCheckStatus;
  onRetry?: () => void;
  details?: string;
  showAudioLevel?: boolean;
  audioLevel?: number;
}

export function SystemStatusItem({
  label,
  status,
  onRetry,
  details,
  showAudioLevel = false,
  audioLevel = 0,
}: SystemStatusItemProps) {
  const [iconToCorner, setIconToCorner] = useState(false);

  useEffect(() => {
    if (status === 'granted') {
      setTimeout(() => setIconToCorner(true), 100); // delay for smooth transition
    } else {
      setIconToCorner(false);
    }
  }, [status]);

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <Loader2 className="h-10 w-10 animate-spin text-[#755ae2]" />;
      case 'good':
      case 'granted':
        return (
          <CheckCircle className="h-12 w-12 rounded-full bg-white p-2 text-[#755ae2] shadow-md transition-all duration-300" />
        );
      case 'poor':
      case 'denied':
      case 'error':
        return (
          <AlertTriangle className="h-12 w-12 rounded-full bg-white p-2 text-[#ff5f56] shadow-md transition-all duration-300" />
        );
      default:
        return (
          <AlertTriangle className="h-12 w-12 rounded-full bg-white p-2 text-gray-400 shadow-md transition-all duration-300" />
        );
    }
  };

  const getLabelIcon = () => {
    switch (label) {
      case 'Webcam':
        return (
          <MonitorRecorder
            size="28"
            variant="Outline"
            className="fill-[#755AE2]"
          />
        );
      case 'Microphone':
        return (
          <MonitorRecorder
            size="28"
            variant="Outline"
            className="fill-[#755AE2]"
          />
        );
      case 'Network':
        return <Wifi size="28" variant="Outline" className="fill-[#755AE2]" />;
      case 'Lighting':
        return (
          <LampCharge size="28" variant="Outline" className="fill-[#755AE2]" />
        );
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'checking':
        return 'bg-[#f6f3ff]';
      case 'good':
      case 'granted':
        return 'bg-[#f6f3ff]';
      case 'poor':
      case 'denied':
      case 'error':
        return 'bg-[#f6f3ff]';
      default:
        return 'bg-[#f6f3ff]';
    }
  };

  const getCornerCircleColor = () => {
    switch (status) {
      case 'checking':
        return 'bg-[#755ae2]';
      case 'good':
      case 'granted':
        return 'bg-[#755ae2]';
      case 'poor':
      case 'denied':
      case 'error':
        return 'bg-[#ff5f56]';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'checking':
        return 'Checking...';
      case 'good':
        return 'Good';
      case 'granted':
        return 'Granted';
      case 'poor':
        return 'Poor';
      case 'denied':
        return 'Denied';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  return (
    <div
      className={`relative flex aspect-square flex-col items-center rounded-2xl p-3 transition-all duration-300 ${getStatusColor()}`}
    >
      {/* Top-right icon (animated) */}
      <div
        className={`absolute top-1 right-1 z-10 scale-100 opacity-100 transition-all duration-500`}
        style={{ pointerEvents: 'none' }}
      >
        <div
          className={`flex size-7 items-center justify-center rounded-full [&_svg]:size-4 [&_svg]:fill-white ${getCornerCircleColor()}`}
        >
          {getLabelIcon()}
        </div>
      </div>

      {status !== 'checking' && !iconToCorner && (
        <div
          className={cn(
            `absolute top-1/2 left-1/2 z-20 aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full p-2 transition-all duration-500`,
            {
              'bg-[#E6E0FF]': status === 'granted',
              'bg-[#FF5F56]/10 [&_svg]:fill-[#ff5f56]': status === 'error',
            }
          )}
        >
          {getLabelIcon()}
        </div>
      )}

      {status === 'granted' && (
        <div className="absolute top-1/2 left-1/2 z-20 aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E6E0FF] p-2 transition-all duration-500">
          <TickCircle size="32" className="fill-[#755AE2]" variant="Bold" />
        </div>
      )}

      <div className="flex h-full w-full flex-col items-center justify-end pt-8">
        <span className="mt-auto mb-1 block text-center text-sm font-normal">
          {label}
        </span>
      </div>
    </div>
  );
}
