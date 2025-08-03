'use client';

import { useState, useEffect } from 'react';

interface VideoPlayerProps {
  libraryId: string;
  videoId: string;
  title: string;
  className?: string;
}

export default function VideoPlayer({ libraryId, videoId, title, className = '' }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Reset states when props change
    setIsLoading(true);
    setHasError(false);
  }, [libraryId, videoId]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (hasError) {
    return (
      <div className={`bg-gray-100 rounded-lg p-8 text-center ${className}`}>
        <div className="text-red-500 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">Video no disponible</h3>
        <p className="text-gray-600 mb-4">
          El video &quot;{title}&quot; no está disponible en este momento.
        </p>
        <div className="text-sm text-gray-500">
          <p>Library ID: {libraryId}</p>
          <p>Video ID: {videoId}</p>
        </div>
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            💡 <strong>Posibles causas:</strong>
          </p>
          <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside">
            <li>El video no existe en la biblioteca de Bunny.net</li>
            <li>El Library ID o Video ID son incorrectos</li>
            <li>El video aún está procesándose</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando video...</p>
          </div>
        </div>
      )}
      
      <iframe
        src={`https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}`}
        title={title}
        className="w-full h-full rounded-lg"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
} 