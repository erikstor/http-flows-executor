import React, { useState } from 'react';
import { parseCurl, isCurlCommand, generateEndpointName } from '../utils/curlParser';

const CurlImportModal = ({ onImport, onCancel }) => {
  const [curlCommand, setCurlCommand] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState('');
  const [endpointName, setEndpointName] = useState('');

  const handleParseCurl = () => {
    try {
      setError('');
      
      if (!curlCommand.trim()) {
        setError('Por favor ingresa un comando cURL');
        return;
      }

      const parsed = parseCurl(curlCommand);
      setParsedData(parsed);
      
      // Generar nombre sugerido
      const suggestedName = generateEndpointName(parsed.url);
      setEndpointName(suggestedName);
      
    } catch (err) {
      setError(err.message);
      setParsedData(null);
    }
  };

  const handleImport = () => {
    if (!parsedData) {
      setError('Primero debes parsear un comando cURL válido');
      return;
    }

    if (!endpointName.trim()) {
      setError('Por favor ingresa un nombre para el endpoint');
      return;
    }

    onImport({
      name: endpointName,
      ...parsedData
    });
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setCurlCommand(text);
    } catch (err) {
      setError('No se pudo acceder al portapapeles');
    }
  };

  const isCurl = isCurlCommand(curlCommand);

  return (
    <div className="modal">
      <div className="modal-content" style={{ maxWidth: '800px', width: '90%' }}>
        <div className="modal-header">
          <h2>Importar desde cURL</h2>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>
            Pega un comando cURL y lo convertiremos automáticamente en un endpoint HTTP.
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="curl-command">Comando cURL:</label>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={handlePaste}
              style={{ fontSize: '0.8rem' }}
            >
              📋 Pegar del Portapapeles
            </button>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={handleParseCurl}
              style={{ fontSize: '0.8rem' }}
            >
              🔍 Parsear cURL
            </button>
          </div>
          <textarea
            id="curl-command"
            value={curlCommand}
            onChange={(e) => setCurlCommand(e.target.value)}
            placeholder='curl -X POST https://api.example.com/users -H "Content-Type: application/json" -d "{\"name\": \"John Doe\"}"'
            rows={6}
            style={{
              fontFamily: 'monospace',
              fontSize: '0.875rem'
            }}
          />
          {isCurl && (
            <small style={{ color: '#28a745', fontSize: '0.8rem' }}>
              ✅ Comando cURL detectado
            </small>
          )}
        </div>

        {error && (
          <div style={{
            padding: '0.75rem',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
            color: '#721c24',
            marginBottom: '1rem'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {parsedData && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '4px',
            marginBottom: '1rem'
          }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#155724' }}>✅ Comando parseado correctamente</h4>
            
            <div className="form-group">
              <label htmlFor="endpoint-name">Nombre del Endpoint:</label>
              <input
                type="text"
                id="endpoint-name"
                value={endpointName}
                onChange={(e) => setEndpointName(e.target.value)}
                placeholder="Nombre del endpoint"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <strong>Método:</strong> {parsedData.method}
              </div>
              <div>
                <strong>URL:</strong> 
                <div style={{ 
                  wordBreak: 'break-all', 
                  fontSize: '0.875rem',
                  backgroundColor: 'white',
                  padding: '0.25rem',
                  borderRadius: '2px',
                  marginTop: '0.25rem'
                }}>
                  {parsedData.url}
                </div>
              </div>
            </div>

            {parsedData.headers !== '{}' && (
              <div style={{ marginTop: '1rem' }}>
                <strong>Headers:</strong>
                <pre style={{
                  backgroundColor: 'white',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  marginTop: '0.25rem',
                  maxHeight: '150px',
                  overflowY: 'auto'
                }}>
                  {parsedData.headers}
                </pre>
              </div>
            )}

            {parsedData.body && (
              <div style={{ marginTop: '1rem' }}>
                <strong>Body:</strong>
                <pre style={{
                  backgroundColor: 'white',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  marginTop: '0.25rem',
                  maxHeight: '150px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {parsedData.body}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Ejemplos de cURL */}
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          fontSize: '0.85rem'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0' }}>📋 Ejemplos de comandos cURL:</h4>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <div>
              <strong>GET simple:</strong>
              <code style={{ display: 'block', marginTop: '0.25rem' }}>
                curl https://api.example.com/users
              </code>
            </div>
            <div>
              <strong>POST con JSON:</strong>
              <code style={{ display: 'block', marginTop: '0.25rem' }}>
                {'curl -X POST https://api.example.com/users -H "Content-Type: application/json" -d \'{"name": "John Doe"}\''}
              </code>
            </div>
            <div>
              <strong>Con Authorization:</strong>
              <code style={{ display: 'block', marginTop: '0.25rem' }}>
                curl -H "Authorization: Bearer token123" https://api.example.com/profile
              </code>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          {parsedData && (
            <button 
              type="button" 
              className="btn btn-success" 
              onClick={handleImport}
            >
              ✅ Importar Endpoint
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CurlImportModal; 