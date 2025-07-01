import React, { useState, useEffect } from 'react';

const RetryNotification = ({ isVisible, message, onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isVisible) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            if (onComplete) onComplete();
            return 100;
          }
          return prev + 10;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white border border-blue-200 rounded-lg shadow-lg p-4 z-50 min-w-80">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 text-sm">🔄</span>
          </div>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-gray-900">
            Reintentando Petición
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {message}
          </p>
          
          {/* Barra de progreso */}
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <p className="text-xs text-gray-400 mt-1">
            {progress}% completado
          </p>
        </div>
      </div>
    </div>
  );
};

export default RetryNotification; 