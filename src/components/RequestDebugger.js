import React, { useState } from 'react';

const RequestDebugger = ({ isOpen, onClose, requestInfo, responseInfo }) => {
  const [activeTab, setActiveTab] = useState('request');

  if (!isOpen) return null;

  const tabs = [
    { id: 'request', label: 'Petición' },
    { id: 'response', label: 'Respuesta' },
    { id: 'headers', label: 'Headers' },
    { id: 'debug', label: 'Debug' }
  ];

  const formatHeaders = (headers) => {
    if (!headers) return 'No headers';
    if (typeof headers === 'object') {
      return Object.entries(headers)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
    }
    return headers;
  };

  const isHtmlResponse = (contentType, data) => {
    return contentType?.includes('text/html') || 
           (typeof data === 'string' && data.includes('<!DOCTYPE html>'));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Debug de Petición</h2>
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
        {activeTab === 'request' && (
          <div className="space-y-4">
            <div className="border p-4 rounded">
              <h3 className="font-semibold text-blue-600">Información de la Petición</h3>
              <div className="mt-2 space-y-2">
                <p><strong>URL:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{requestInfo?.url}</code></p>
                <p><strong>Método:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{requestInfo?.method}</code></p>
                <p><strong>Usó Proxy:</strong> <span className={requestInfo?.usedProxy ? 'text-green-600' : 'text-red-600'}>
                  {requestInfo?.usedProxy ? '✅ Sí' : '❌ No'}
                </span></p>
                {requestInfo?.proxyUrl && (
                  <p><strong>URL del Proxy:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{requestInfo.proxyUrl}</code></p>
                )}
              </div>
            </div>

            {requestInfo?.body && (
              <div className="border p-4 rounded">
                <h3 className="font-semibold text-blue-600">Body de la Petición</h3>
                <pre className="bg-gray-100 p-2 rounded mt-2 text-sm overflow-x-auto">
                  {typeof requestInfo.body === 'string' ? requestInfo.body : JSON.stringify(requestInfo.body, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {activeTab === 'response' && (
          <div className="space-y-4">
            <div className="border p-4 rounded">
              <h3 className="font-semibold text-green-600">Información de la Respuesta</h3>
              <div className="mt-2 space-y-2">
                <p><strong>Status:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{responseInfo?.status} {responseInfo?.statusText}</code></p>
                <p><strong>Content-Type:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{responseInfo?.contentType}</code></p>
                <p><strong>Tamaño:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{responseInfo?.size} bytes</code></p>
              </div>
            </div>

            {isHtmlResponse(responseInfo?.contentType, responseInfo?.data) && (
              <div className="border border-red-200 bg-red-50 p-4 rounded">
                <h3 className="font-semibold text-red-800">⚠️ Respuesta HTML Detectada</h3>
                <p className="text-red-700 mt-2">
                  La respuesta es HTML en lugar de datos de la API. Esto indica que el proxy no está funcionando correctamente.
                </p>
                <p className="text-red-700 mt-1">
                  <strong>Posibles causas:</strong>
                </p>
                <ul className="list-disc list-inside mt-1 text-red-700 text-sm">
                  <li>La ruta del proxy no coincide con la configuración</li>
                  <li>El servidor de desarrollo está devolviendo la página principal</li>
                  <li>La URL del proxy no está bien formada</li>
                </ul>
              </div>
            )}

            <div className="border p-4 rounded">
              <h3 className="font-semibold text-green-600">Datos de la Respuesta</h3>
              <pre className="bg-gray-100 p-2 rounded mt-2 text-sm overflow-x-auto max-h-96">
                {typeof responseInfo?.data === 'string' ? responseInfo.data : JSON.stringify(responseInfo?.data, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'headers' && (
          <div className="space-y-4">
            <div className="border p-4 rounded">
              <h3 className="font-semibold text-purple-600">Headers de la Petición</h3>
              <pre className="bg-gray-100 p-2 rounded mt-2 text-sm overflow-x-auto">
                {formatHeaders(requestInfo?.headers)}
              </pre>
            </div>

            <div className="border p-4 rounded">
              <h3 className="font-semibold text-purple-600">Headers de la Respuesta</h3>
              <pre className="bg-gray-100 p-2 rounded mt-2 text-sm overflow-x-auto">
                {formatHeaders(responseInfo?.headers)}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'debug' && (
          <div className="space-y-4">
            <div className="border p-4 rounded">
              <h3 className="font-semibold text-orange-600">Información de Debug</h3>
              <div className="mt-2 space-y-2">
                <p><strong>User Agent:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-xs">{navigator.userAgent}</code></p>
                <p><strong>Origen Actual:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{window.location.origin}</code></p>
                <p><strong>Modo de Desarrollo:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{process.env.NODE_ENV}</code></p>
                <p><strong>Proxy Configurado:</strong> <code className="bg-gray-100 px-2 py-1 rounded">Sí</code></p>
              </div>
            </div>

            <div className="border p-4 rounded">
              <h3 className="font-semibold text-orange-600">Sugerencias de Debug</h3>
              <div className="mt-2 space-y-2 text-sm">
                <p>1. <strong>Verifica la consola del navegador</strong> para logs detallados</p>
                <p>2. <strong>Revisa la pestaña Network</strong> en las herramientas de desarrollador</p>
                <p>3. <strong>Confirma que el proxy esté funcionando</strong> revisando los logs del servidor</p>
                <p>4. <strong>Verifica la URL del proxy</strong> en la configuración</p>
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

export default RequestDebugger; 