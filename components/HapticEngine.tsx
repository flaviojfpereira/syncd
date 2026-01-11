import { useCallback } from 'react';

export const useHaptics = () => {
  const triggerJolt = useCallback(() => {
    if (navigator.vibrate) {
      // Aggressive pattern for "The Jolt"
      // 100ms on, 50ms off, 100ms on (Heavy impact simulation)
      navigator.vibrate([100, 50, 100, 50, 200]);
    } else {
      console.log("Haptics not supported on this device/browser.");
    }
  }, []);

  const triggerHum = useCallback(() => {
    if (navigator.vibrate) {
      // Low frequency pulse for "The Current"
      // Short, subtle pulse
      navigator.vibrate([30]);
    }
  }, []);

  const triggerSuccess = useCallback(() => {
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50]);
    }
  }, []);

  return { triggerJolt, triggerHum, triggerSuccess };
};