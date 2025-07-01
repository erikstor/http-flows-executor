import React, { useState } from 'react';

const CorsInfoModal = ({ isOpen, onClose, url, suggestions = [], onApplySolution, onRetry }) => {
  const [activeTab, setActiveTab] = useState('auto');
  const [appliedSolution, setAppliedSolution] = useState(null);

  if (!isOpen) return null;

  const tabs = [
    { id: 'info', label: 'Información CORS' },
    { id: 'solutions', label: 'Soluciones' },
    { id: 'auto', label: 'Sugerencias Automáticas' },
    { id: 'debug', label: 'Debug' }
  ];

  const testCors = async () => {
    try {
      console.log('Probando CORS para:', url);
      
      // Test 1: Petición simple
      const response1 = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit'
      });
      
      console.log('Test 1 - GET simple:', response1.status, response1.statusText);
      console.log('Headers de respuesta:', Object.fromEntries(response1.headers.entries()));
      
      // Test 2: Petición con headers
      const response2 = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Test 2 - GET con headers:', response2.status, response2.statusText);
      
      // Test 3: OPTIONS preflight
      try {
        const response3 = await fetch(url, {
          method: 'OPTIONS',
          mode: 'cors',
          credentials: 'omit'
        });
        console.log('Test 3 - OPTIONS:', response3.status, response3.statusText);
      } catch (error) {
        console.log('Test 3 - OPTIONS falló:', error.message);
      }
      
    } catch (error) {
      console.error('Error en tests CORS:', error);
    }
  };

  const handleApplySolution = async (suggestion) => {
    setAppliedSolution(suggestion);
    
    if (onApplySolution) {
      await onApplySolution(suggestion);
    }
    
    // Mostrar mensaje de éxito
    alert(`Solución aplicada: ${suggestion.title}`);
  };

  const handleRetry = async () => {
    if (onRetry) {
      await onRetry();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Diagnóstico CORS</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenido de tabs */}
        {activeTab === 'info' && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded">
              <h3 className="font-semibold text-blue-800">¿Qué es CORS?</h3>
              <p className="text-blue-700 mt-2">
                CORS (Cross-Origin Resource Sharing) es un mecanismo de seguridad que permite 
                que un servidor web permita que su contenido sea accedido por un dominio diferente 
                al que sirve el contenido.
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded">
              <h3 className="font-semibold text-yellow-800">Tu problema</h3>
              <p className="text-yellow-700 mt-2">
                Estás intentando acceder a <code className="bg-yellow-100 px-1 rounded">{url}</code> 
                desde <code className="bg-yellow-100 px-1 rounded">http://localhost:3000</code>, 
                pero el servidor no está enviando los headers CORS apropiados.
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded">
              <h3 className="font-semibold text-green-800">Solución implementada</h3>
              <p className="text-green-700 mt-2">
                Hemos configurado un proxy de desarrollo que redirige las peticiones a través 
                del servidor de desarrollo de React, evitando problemas de CORS.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'solutions' && (
          <div className="space-y-4">
            <div className="border p-4 rounded">
              <h3 className="font-semibold">1. Usar el proxy de desarrollo (Recomendado)</h3>
              <p className="text-gray-600 mt-2">
                En lugar de usar la URL completa, usa solo la ruta:
              </p>
              <code className="block bg-gray-100 p-2 rounded mt-2">
                /walletuser/v1
              </code>
              <p className="text-sm text-gray-500 mt-2">
                El proxy está configurado en package.json y redirige automáticamente.
              </p>
            </div>

            <div className="border p-4 rounded">
              <h3 className="font-semibold">2. Configurar el servidor</h3>
              <p className="text-gray-600 mt-2">
                Si tienes control del servidor, agrega estos headers:
              </p>
              <pre className="bg-gray-100 p-2 rounded mt-2 text-sm overflow-x-auto">
{`Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With`}
              </pre>
            </div>

            <div className="border p-4 rounded">
              <h3 className="font-semibold">3. Usar un proxy CORS externo</h3>
              <p className="text-gray-600 mt-2">
                Puedes usar servicios como:
              </p>
              <ul className="list-disc list-inside mt-2 text-sm">
                <li>cors-anywhere</li>
                <li>allorigins.win</li>
                <li>api.codetabs.com</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'auto' && (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded">
              <h3 className="font-semibold text-green-800">Sugerencias Automáticas</h3>
              <p className="text-green-700 mt-2">
                El sistema ha detectado automáticamente posibles soluciones para tu problema de CORS.
                Selecciona una solución y haz clic en "Aplicar y Reintentar".
              </p>
            </div>

            {appliedSolution && (
              <div className="bg-blue-50 p-4 rounded border border-blue-200">
                <h3 className="font-semibold text-blue-800">✅ Solución Aplicada</h3>
                <p className="text-blue-700 mt-1">{appliedSolution.title}</p>
                <button
                  onClick={handleRetry}
                  className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  🔄 Reintentar Petición
                </button>
              </div>
            )}

            {suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <div key={index} className="border p-4 rounded">
                  <h3 className="font-semibold text-blue-600">{suggestion.title}</h3>
                  <p className="text-gray-600 mt-2">{suggestion.description}</p>
                  
                  {suggestion.action === 'change_url' && (
                    <div className="mt-3 p-3 bg-blue-50 rounded">
                      <p className="text-sm font-semibold text-blue-800">Nueva URL sugerida:</p>
                      <code className="block bg-white p-2 rounded mt-1 text-sm">
                        {suggestion.newUrl}
                      </code>
                      <button
                        onClick={() => handleApplySolution(suggestion)}
                        className="bg-blue-500 text-white px-4 py-2 rounded mt-2 hover:bg-blue-600"
                      >
                        ✅ Aplicar URL y Reintentar
                      </button>
                    </div>
                  )}

                  {suggestion.action === 'configure_server' && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded">
                      <p className="text-sm font-semibold text-yellow-800">Headers a agregar al servidor:</p>
                      <pre className="bg-white p-2 rounded mt-1 text-xs overflow-x-auto">
{Object.entries(suggestion.headers).map(([key, value]) => `${key}: ${value}`).join('\n')}
                      </pre>
                      <button
                        onClick={() => handleApplySolution(suggestion)}
                        className="bg-yellow-500 text-white px-4 py-2 rounded mt-2 hover:bg-yellow-600"
                      >
                        ✅ Marcar como Configurado y Reintentar
                      </button>
                    </div>
                  )}

                  {suggestion.action === 'use_external_proxy' && (
                    <div className="mt-3 p-3 bg-purple-50 rounded">
                      <p className="text-sm font-semibold text-purple-800">Servicios de proxy disponibles:</p>
                      <ul className="list-disc list-inside mt-1 text-sm">
                        {suggestion.services.map((service, i) => (
                          <li key={i} className="text-purple-700">{service}</li>
                        ))}
                      </ul>
                      <button
                        onClick={() => handleApplySolution(suggestion)}
                        className="bg-purple-500 text-white px-4 py-2 rounded mt-2 hover:bg-purple-600"
                      >
                        ✅ Aplicar Proxy Externo y Reintentar
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>No hay sugerencias automáticas disponibles para esta URL.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'debug' && (
          <div className="space-y-4">
            <div className="border p-4 rounded">
              <h3 className="font-semibold">Tests de diagnóstico</h3>
              <p className="text-gray-600 mt-2">
                Ejecuta estos tests para diagnosticar el problema:
              </p>
              <button
                onClick={testCors}
                className="bg-blue-500 text-white px-4 py-2 rounded mt-2 hover:bg-blue-600"
              >
                Ejecutar Tests CORS
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Revisa la consola del navegador para ver los resultados.
              </p>
            </div>

            <div className="border p-4 rounded">
              <h3 className="font-semibold">Información del navegador</h3>
              <div className="text-sm space-y-1">
                <p><strong>User Agent:</strong> {navigator.userAgent}</p>
                <p><strong>Origen actual:</strong> {window.location.origin}</p>
                <p><strong>URL objetivo:</strong> {url}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CorsInfoModal; 