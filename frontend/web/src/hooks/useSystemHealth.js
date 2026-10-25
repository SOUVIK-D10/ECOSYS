import { useState, useEffect } from 'react';

export function useSystemHealth(sseEndpoint) {
  const [healthData, setHealthData] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('CONNECTING');

  useEffect(() => {
    if (!sseEndpoint) return;

    const eventSource = new EventSource(sseEndpoint);

    eventSource.onopen = () => {
      setConnectionStatus('CONNECTED');
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setHealthData(data);
      } catch (err) {
        console.error("Failed to parse telemetry stream", err);
      }
    };

    eventSource.onerror = (err) => {
      console.warn("SSE connection interrupted. Browser attempting auto-reconnect...", err);
      setConnectionStatus('DISCONNECTED');
      // REMOVED eventSource.close() so the browser automatically reconnects!
    };

    return () => {
      eventSource.close();
    };
  }, [sseEndpoint]);

  return { healthData, connectionStatus };
}