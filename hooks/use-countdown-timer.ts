'use client';

import { useRef } from 'react';
import { useTimer } from 'react-timer-hook';

export function useCountdownTimer(initialMinutes: number, initialSeconds = 0) {
  // Calculate expiry time (current time + initial time) only once
  const timeRef = useRef<Date>(null);

  if (!timeRef.current) {
    timeRef.current = new Date();
    timeRef.current.setSeconds(
      timeRef.current.getSeconds() + initialMinutes * 60 + initialSeconds
    );
  }

  const { seconds, minutes, isRunning, pause, resume, restart } = useTimer({
    expiryTimestamp: timeRef.current,
    onExpire: () => console.log('Timer expired'),
    autoStart: true,
  });

  // Format time as MM:SS
  const formatTime = () => {
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
  };

  // Calculate if timer is expired
  const isExpired = minutes === 0 && seconds === 0;

  // Provide timeLeft in the same format as the original hook for compatibility
  const timeLeft = {
    minutes,
    seconds,
  };

  // Reset function that matches the original API
  const reset = (newMinutes: number, newSeconds = 0) => {
    const newTime = new Date();
    newTime.setSeconds(newTime.getSeconds() + newMinutes * 60 + newSeconds);
    timeRef.current = newTime;
    restart(newTime);
  };

  return {
    timeLeft,
    isActive: isRunning,
    isExpired,
    formatTime,
    pause,
    resume,
    reset,
  };
}
