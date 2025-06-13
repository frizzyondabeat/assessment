'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export type InternetSpeedStatus = 'checking' | 'good' | 'poor' | 'error';

export interface SpeedTestResult {
  downloadSpeed: number; // Mbps
  uploadSpeed: number; // Mbps
  latency: number; // ms
  jitter: number; // ms
  status: InternetSpeedStatus;
}

interface SpeedTestOptions {
  downloadSampleSize?: number; // Size in bytes for download test
  uploadSampleSize?: number; // Size in bytes for upload test
  downloadThreshold?: number; // Minimum Mbps for "good" status
  latencyThreshold?: number; // Maximum ms for "good" status
  pingEndpoints?: string[]; // Endpoints to ping for latency test
  testTimeout?: number; // Timeout for tests in ms
}

export function useInternetSpeedCheck(options: SpeedTestOptions = {}) {
  const [result, setResult] = useState<SpeedTestResult>({
    downloadSpeed: 0,
    uploadSpeed: 0,
    latency: 0,
    jitter: 0,
    status: 'checking',
  });
  const [isRunning, setIsRunning] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Default options
  const {
    downloadSampleSize = 1000000, // 1MB
    uploadSampleSize = 500000, // 500KB
    downloadThreshold = 2, // 2 Mbps
    latencyThreshold = 200, // 200ms
    pingEndpoints = [
      'https://httpbin.org/status/200',
      'https://www.google.com',
      'https://www.cloudflare.com',
    ],
    testTimeout = 10000, // 10 seconds
  } = options;

  // Generate random data for upload test
  const generateRandomData = useCallback((size: number): string => {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    // Generate a smaller chunk and repeat it to reach the desired size
    // This is more efficient than generating the entire string character by character
    const chunkSize = Math.min(size, 10000);
    for (let i = 0; i < chunkSize; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Repeat the chunk to reach the desired size
    const repeats = Math.ceil(size / chunkSize);
    return result.repeat(repeats).substring(0, size);
  }, []);

  // Test latency to multiple endpoints and take the average
  const testLatency = useCallback(
    async (
      abortController: AbortController
    ): Promise<{ latency: number; jitter: number }> => {
      const latencies: number[] = [];

      // Try each endpoint until we get a successful response
      for (const endpoint of pingEndpoints) {
        try {
          // Perform multiple pings to calculate jitter
          for (let i = 0; i < 3; i++) {
            const start = performance.now();
            await fetch(endpoint, {
              method: 'HEAD',
              cache: 'no-cache',
              signal: abortController.signal,
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
              },
            });
            const pingTime = performance.now() - start;
            latencies.push(pingTime);
          }

          // If we got successful pings, no need to try other endpoints
          break;
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') {
            throw error;
          }
          // Continue to next endpoint if this one failed
          console.warn(`Latency test failed for ${endpoint}`, error);
        }
      }

      // If all endpoints failed, throw an error
      if (latencies.length === 0) {
        throw new Error('All latency tests failed');
      }

      // Calculate average latency
      const avgLatency =
        latencies.reduce((sum, val) => sum + val, 0) / latencies.length;

      // Calculate jitter (variation in latency)
      let jitterSum = 0;
      for (let i = 1; i < latencies.length; i++) {
        jitterSum += Math.abs(latencies[i] - latencies[i - 1]);
      }
      const jitter =
        latencies.length > 1 ? jitterSum / (latencies.length - 1) : 0;

      return {
        latency: Math.round(avgLatency),
        jitter: Math.round(jitter),
      };
    },
    [pingEndpoints]
  );

  // Test download speed
  const testDownloadSpeed = useCallback(
    async (abortController: AbortController): Promise<number> => {
      try {
        // Use a timestamp to prevent caching
        const timestamp = new Date().getTime();
        const url = `/placeholder.svg?height=1000&width=1000&size=${downloadSampleSize}&t=${timestamp}`;

        const start = performance.now();
        const response = await fetch(url, {
          cache: 'no-cache',
          signal: abortController.signal,
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
        });

        // Read the response to ensure it's fully downloaded
        await response.arrayBuffer();

        const end = performance.now();
        const downloadTime = (end - start) / 1000; // seconds
        const downloadSpeed =
          (downloadSampleSize * 8) / (downloadTime * 1000000); // Mbps

        return Math.round(downloadSpeed * 100) / 100;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          throw error;
        }
        console.error('Download speed test error:', error);
        // Fallback to a conservative estimate
        return 1.0;
      }
    },
    [downloadSampleSize]
  );

  // Test upload speed
  const testUploadSpeed = useCallback(
    async (abortController: AbortController): Promise<number> => {
      try {
        const data = generateRandomData(uploadSampleSize);
        const blob = new Blob([data], { type: 'application/octet-stream' });

        const start = performance.now();

        // Use a POST request to simulate an upload
        await fetch('/api/upload-test', {
          method: 'POST',
          body: blob,
          signal: abortController.signal,
          headers: { 'Content-Type': 'application/octet-stream' },
        }).catch(async () => {
          // Fallback to httpbin if the API route doesn't exist
          await fetch('https://httpbin.org/post', {
            method: 'POST',
            body: blob,
            signal: abortController.signal,
            headers: { 'Content-Type': 'application/octet-stream' },
          });
        });

        const end = performance.now();
        const uploadTime = (end - start) / 1000; // seconds
        const uploadSpeed = (uploadSampleSize * 8) / (uploadTime * 1000000); // Mbps

        return Math.round(uploadSpeed * 100) / 100;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          throw error;
        }
        console.error('Upload speed test error:', error);
        // Fallback to a conservative estimate
        return 0.5;
      }
    },
    [generateRandomData, uploadSampleSize]
  );

  const checkInternetSpeed = useCallback(async () => {
    // If a test is already running, abort it
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create a new abort controller for this test
    abortControllerRef.current = new AbortController();

    try {
      setIsRunning(true);
      setResult((prev) => ({ ...prev, status: 'checking' }));

      // Set a timeout for the entire test
      const timeoutId = setTimeout(() => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      }, testTimeout);

      // Test latency first
      const { latency, jitter } = await testLatency(abortControllerRef.current);

      // Update with partial results
      setResult((prev) => ({
        ...prev,
        latency,
        jitter,
        status: 'checking',
      }));

      // Test download speed
      const downloadSpeed = await testDownloadSpeed(abortControllerRef.current);

      // Update with partial results
      setResult((prev) => ({
        ...prev,
        downloadSpeed,
        status: 'checking',
      }));

      // Test upload speed
      const uploadSpeed = await testUploadSpeed(abortControllerRef.current);

      // Clear the timeout
      clearTimeout(timeoutId);

      // Determine overall status
      const status: InternetSpeedStatus =
        downloadSpeed >= downloadThreshold && latency <= latencyThreshold
          ? 'good'
          : 'poor';

      // Update with final results
      setResult({
        downloadSpeed,
        uploadSpeed,
        latency,
        jitter,
        status,
      });
    } catch (error) {
      console.error('Internet speed check error:', error);
      setResult((prev) => ({ ...prev, status: 'error' }));
    } finally {
      setIsRunning(false);
      abortControllerRef.current = null;
    }
  }, [
    testLatency,
    testDownloadSpeed,
    testUploadSpeed,
    downloadThreshold,
    latencyThreshold,
    testTimeout,
  ]);

  // Run the test on mount
  useEffect(() => {
    // Store a reference to the current checkInternetSpeed function
    // to avoid dependency on the function itself
    const runSpeedTest = () => {
      checkInternetSpeed();
    };

    runSpeedTest();

    return () => {
      // Clean up on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Create a stable retryCheck function that doesn't depend on checkInternetSpeed
  const retryCheck = useCallback(() => {
    // Only run if not already running
    if (isRunning) {
      return;
    }

    // If a test is already running, abort it
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Create a new abort controller and run the test
    const runTest = async () => {
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        setIsRunning(true);
        setResult((prev) => ({ ...prev, status: 'checking' }));

        // Set a timeout for the entire test
        const timeoutId = setTimeout(() => {
          if (abortController && !abortController.signal.aborted) {
            abortController.abort();
          }
        }, testTimeout);

        // Run the tests
        const { latency, jitter } = await testLatency(abortController);
        setResult((prev) => ({ ...prev, latency, jitter, status: 'checking' }));

        const downloadSpeed = await testDownloadSpeed(abortController);
        setResult((prev) => ({ ...prev, downloadSpeed, status: 'checking' }));

        const uploadSpeed = await testUploadSpeed(abortController);

        // Clear the timeout
        clearTimeout(timeoutId);

        // Determine overall status
        const status =
          downloadSpeed >= downloadThreshold && latency <= latencyThreshold
            ? 'good'
            : 'poor';

        // Update with final results
        setResult({
          downloadSpeed,
          uploadSpeed,
          latency,
          jitter,
          status,
        });
      } catch (error) {
        console.error('Internet speed check error:', error);
        setResult((prev) => ({ ...prev, status: 'error' }));
      } finally {
        setIsRunning(false);
        abortControllerRef.current = null;
      }
    };

    runTest();
  }, [
    isRunning,
    testLatency,
    testDownloadSpeed,
    testUploadSpeed,
    downloadThreshold,
    latencyThreshold,
    testTimeout,
  ]);

  return {
    ...result,
    isRunning,
    retryCheck,
  };
}
