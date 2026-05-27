'use client';

import { ConnectionStatus as ConnStatus } from '@/types/game';

interface ConnectionStatusProps {
  status: ConnStatus;
  iceConnectionState?: RTCIceConnectionState;
}

export default function ConnectionStatus({ status, iceConnectionState }: ConnectionStatusProps) {
  const getStatusColor = () => {
    if (status === 'connected' && iceConnectionState === 'connected') {
      return 'bg-green-500';
    }
    if (status === 'waiting') {
      return 'bg-blue-500';
    }
    if (status === 'connecting') {
      return 'bg-yellow-500';
    }
    if (status === 'failed' || iceConnectionState === 'failed') {
      return 'bg-red-500';
    }
    return 'bg-gray-500';
  };

  const getStatusText = () => {
    if (status === 'connected' && iceConnectionState === 'connected') {
      return 'Connected';
    }
    if (status === 'waiting') {
      return 'Waiting for Opponent...';
    }
    if (status === 'connecting') {
      return 'Connecting...';
    }
    if (status === 'failed' || iceConnectionState === 'failed') {
      return 'Connection Error';
    }
    return 'Disconnected';
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`} />
      <span className="text-sm text-gray-600">{getStatusText()}</span>
    </div>
  );
}

