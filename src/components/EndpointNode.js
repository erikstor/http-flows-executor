import React from 'react';

const EndpointNode = ({
  endpoint,
  isSelected,
  isConnectionSource,
  onEdit,
  onDelete,
  onRun,
  onConnectionStart,
  onViewResponse,
  onConfigureExtractors
}) => {
  const getMethodColor = (method) => {
    switch (method.toLowerCase()) {
      case 'get': return 'method-get';
      case 'post': return 'method-post';
      case 'put': return 'method-put';
      case 'delete': return 'method-delete';
      default: return 'method-get';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return '#ffc107';
      case 'completed': return '#28a745';
      case 'error': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'running': return 'Ejecutando...';
      case 'completed': return 'Completado';
      case 'error': return 'Error';
      default: return 'Pendiente';
    }
  };

  return (
    <div className={`endpoint-node ${isSelected ? 'selected' : ''}`}>
      <div className="endpoint-header">
        <span className={`method-badge ${getMethodColor(endpoint.method)}`}>
          {endpoint.method}
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
            {endpoint.name || 'Sin nombre'}
          </div>
          <div className="endpoint-url">
            {endpoint.url || 'Sin URL'}
          </div>
        </div>
      </div>

      {/* Estado del endpoint */}
      <div style={{
        fontSize: '0.75rem',
        color: getStatusColor(endpoint.status),
        fontWeight: 'bold',
        marginBottom: '0.5rem'
      }}>
        {getStatusText(endpoint.status)}
      </div>

      {/* Respuesta del endpoint */}
      {endpoint.response && (
        <div className="response-panel">
          <div className={`response-status ${endpoint.response.status >= 200 && endpoint.response.status < 300 ? 'success' : 'error'}`}>
            {endpoint.response.status} {endpoint.response.statusText}
          </div>
          {endpoint.response.data && (
            <div className="response-body">
              {endpoint.response.data.length > 100 
                ? endpoint.response.data.substring(0, 100) + '...'
                : endpoint.response.data
              }
            </div>
          )}
        </div>
      )}

      {/* Acciones del endpoint */}
      <div className="endpoint-actions">
        <button 
          className="run-btn"
          onClick={onRun}
          disabled={endpoint.status === 'running'}
        >
          {endpoint.status === 'running' ? '⏳' : '▶️'}
        </button>
        {endpoint.response && (
                  <>
          <button 
            style={{
              background: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '0.25rem 0.5rem',
              cursor: 'pointer',
              fontSize: '0.75rem'
            }}
            onClick={onViewResponse}
            title="Ver respuesta completa"
          >
            👁️
          </button>
          <button 
            style={{
              background: '#6f42c1',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '0.25rem 0.5rem',
              cursor: 'pointer',
              fontSize: '0.75rem'
            }}
            onClick={onConfigureExtractors}
            title="Configurar extractores de variables"
          >
            🔧
          </button>
        </>
        )}
        <button 
          className="edit-btn"
          onClick={onEdit}
        >
          ✏️
        </button>
        <button 
          className="delete-btn"
          onClick={onDelete}
        >
          🗑️
        </button>
        <button 
          style={{
            background: isConnectionSource ? '#28a745' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '0.25rem 0.5rem',
            cursor: 'pointer',
            fontSize: '0.75rem'
          }}
          onClick={onConnectionStart}
          title="Conectar con otro endpoint"
        >
          🔗
        </button>
      </div>

      {/* Indicador de conexión */}
      {isConnectionSource && (
        <div style={{
          position: 'absolute',
          top: '-10px',
          right: '-10px',
          width: '20px',
          height: '20px',
          backgroundColor: '#28a745',
          borderRadius: '50%',
          border: '2px solid white',
          animation: 'pulse 1s infinite'
        }} />
      )}
    </div>
  );
};

export default EndpointNode; 