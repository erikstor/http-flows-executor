import React, { useState, useEffect } from 'react';

const AutoCorsNotification = ({ error, url, onApplySolution, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (error && url) {
      // Importar corsConfig dinámicamente para evitar problemas de importación
      import('../utils/corsConfig').then(({ corsConfig }) => {
        if (corsConfig.isCorsError(error)) {
          const autoSuggestions = corsConfig.suggestSolution(error, url);
          setSuggestions(autoSuggestions || []);
          setIsVisible(true);
        }
      });
    }
  }, [error, url]);

  const handleApplySolution = (suggestion) => {
    if (onApplySolution) {
      onApplySolution(suggestion);
    }
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!isVisible || suggestions.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 bg-white border border-red-200 rounded-lg shadow-lg p-4 max-w-md z-50">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-600 text-sm">⚠️</span>
          </div>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-gray-900">
            Error CORS Detectado
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Se detectó un problema de CORS con: {url}
          </p>
          
          <div className="mt-3 space-y-2">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="bg-gray-50 p-2 rounded">
                <p className="text-xs font-medium text-gray-700">
                  {suggestion.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {suggestion.description}
                </p>
                
                {suggestion.action === 'change_url' && (
                  <button
                    onClick={() => handleApplySolution(suggestion)}
                    className="mt-2 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                  >
                    Aplicar URL Sugerida
                  </button>
                )}
                
                {suggestion.action === 'configure_server' && (
                  <button
                    onClick={() => handleApplySolution(suggestion)}
                    className="mt-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600"
                  >
                    Ver Headers Necesarios
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-3 flex space-x-2">
            <button
              onClick={handleDismiss}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Ignorar
            </button>
            <button
              onClick={() => {
                // Abrir modal completo de CORS
                window.dispatchEvent(new CustomEvent('showCorsModal', { 
                  detail: { url, suggestions } 
                }));
              }}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Ver Más Opciones
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="ml-2 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default AutoCorsNotification; 