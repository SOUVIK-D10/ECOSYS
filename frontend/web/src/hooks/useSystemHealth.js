import { useState, useEffect } from 'react';

export function useSystemHealth(sseEndpoint) {
  const [healthData, setHealthData] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('CONNECTING');

  useEffect(() => {
    const eventSource = new EventSource(sseEndpoint);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setHealthData(data);
        setConnectionStatus('CONNECTED');
      } catch (err) {
        console.error("Failed to parse telemetry stream", err);
      }
    };

    eventSource.onerror = () => {
      setConnectionStatus('DISCONNECTED');
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [sseEndpoint]);

  return { healthData, connectionStatus };
}