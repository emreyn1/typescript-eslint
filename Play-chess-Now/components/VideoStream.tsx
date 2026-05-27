'use client';

import { useEffect, useRef } from 'react';

interface VideoStreamProps {
  stream: MediaStream | null;
  muted?: boolean;
  label?: string;
  className?: string;
}

export default function VideoStream({ stream, muted = false, label, className = '' }: VideoStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      console.log('Setting video srcObject:', stream.id, 'tracks:', stream.getTracks().length);
      videoRef.current.srcObject = stream;
      
      // Force play
      videoRef.current.play().catch(err => {
        console.error('Video play error:', err);
      });
    } else if (videoRef.current && !stream) {
      // Clear video when stream is removed
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  if (!stream) {
    return (
      <div className={`bg-gray-900 rounded-lg flex items-center justify-center aspect-video ${className}`}>
        <div className="text-center text-gray-400">
          <svg
            className="w-12 h-12 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm">{label || 'Video yok'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-lg overflow-hidden bg-gray-900 ${className}`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className="w-full h-full object-cover"
      />
      {label && (
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          {label}
        </div>
      )}
    </div>
  );
}

