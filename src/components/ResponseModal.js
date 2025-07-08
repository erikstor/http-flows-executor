import React from 'react';
import { toast } from 'react-toastify';
import useEscapeKey from '../utils/useEscapeKey';

const ResponseModal = ({ endpoint, onClose }) => {
  // Hook para cerrar modal con Escape
  useEscapeKey(onClose);

  if (!endpoint || !endpoint.response) {
    return null;
  }

  const { response } = endpoint;
  const isSuccess = response.status >= 200 && response.status < 300;

  const formatHeaders = (headers) => {
    return Object.entries(headers).map(([key, value]) => (
      <div key={key} style={{ marginBottom: '0.5rem' }}>
        <strong>{key}:</strong> {value}
      </div>
    ));
  };

  const formatBody = (body) => {
    try {
      // Intentar parsear como JSON para formatearlo
      const parsed = JSON.parse(body);
      return <pre>{JSON.stringify(parsed, null, 2)}</pre>;
    } catch (e) {
      // Si no es JSON, mostrar como texto
      return <pre>{body}</pre>;
    }
  };

  return (
    <div className="modal">
      <div className="modal-content" style={{ maxWidth: '900px', width: '90%' }}>
        <div className="modal-header">
          <h2>Respuesta de: {endpoint.name || endpoint.url}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{
            padding: '0.5rem',
            backgroundColor: isSuccess ? '#d4edda' : '#f8d7da',
            border: `1px solid ${isSuccess ? '#c3e6cb' : '#f5c6cb'}`,
            borderRadius: '4px',
            color: isSuccess ? '#155724' : '#721c24'
          }}>
            <strong>Status:</strong> {response.status} {response.statusText}
          </div>
        </div>

        {/* Headers */}
        <div className="form-group">
          <label>Headers de Respuesta:</label>
          <div style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '1rem',
            maxHeight: '200px',
            overflowY: 'auto',
            fontFamily: 'monospace',
            fontSize: '0.875rem'
          }}>
            {formatHeaders(response.headers)}
          </div>
        </div>

        {/* Body */}
        <div className="form-group">
          <label>Body de Respuesta:</label>
          <div style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '1rem',
            maxHeight: '400px',
            overflowY: 'auto',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {formatBody(response.data)}
          </div>
        </div>

        {/* Información adicional */}
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: '#e9ecef',
          borderRadius: '4px',
          fontSize: '0.875rem'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0' }}>Información del Endpoint:</h4>
          <div><strong>Método:</strong> {endpoint.method}</div>
          <div><strong>URL:</strong> {endpoint.url}</div>
          <div><strong>Estado:</strong> {endpoint.status}</div>
        </div>

        <div className="form-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => {
              navigator.clipboard.writeText(response.data);
              toast.success('Respuesta copiada al portapapeles');
            }}
          >
            📋 Copiar Respuesta
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResponseModal; 