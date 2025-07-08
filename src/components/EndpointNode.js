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
  onConfigureExtractors,
  connections = [],
  flowVariables = [],
  extractors = []
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

  // Obtener conexiones relacionadas con este endpoint
  const getEndpointConnections = () => {
    const outgoing = connections.filter(conn => conn.source === endpoint.id);
    const incoming = connections.filter(conn => conn.target === endpoint.id);
    return { outgoing, incoming };
  };

  // Obtener variables disponibles para este endpoint
  const getAvailableVariables = () => {
    const endpointVars = flowVariables.filter(v => v.sourceEndpointId === endpoint.id);
    const endpointExtractors = Array.isArray(extractors) ? [] : (extractors[endpoint.id] || []);
    return { variables: endpointVars, extractors: endpointExtractors };
  };

  const { outgoing, incoming } = getEndpointConnections();
  const { variables, extractors: endpointExtractors } = getAvailableVariables();

  return (
    <div className={`endpoint-node ${isSelected ? 'selected' : ''} ${endpoint.status === 'running' ? 'running' : ''} ${endpoint.status === 'error' ? 'error' : ''}`}>
      {/* Indicador de arrastre */}
      <div className="drag-handle" title="Arrastra para mover">
        ⋮⋮
      </div>
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
        marginBottom: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        {endpoint.status === 'running' && <div className="loading-spinner"></div>}
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
                fontSize: '0.75rem',
                transition: 'all 0.3s ease'
              }}
              onClick={onViewResponse}
              title="Ver respuesta completa"
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.1)';
                e.target.style.boxShadow = '0 2px 8px rgba(23, 162, 184, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = 'none';
              }}
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
                fontSize: '0.75rem',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
              onClick={onConfigureExtractors}
              title={`Configurar extractores de variables${endpointExtractors.length > 0 ? ` (${endpointExtractors.length} configurado${endpointExtractors.length > 1 ? 's' : ''})` : ''}`}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.1)';
                e.target.style.boxShadow = '0 2px 8px rgba(111, 66, 193, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = 'none';
              }}
            >
              🔧
              {endpointExtractors.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  background: '#28a745',
                  color: 'white',
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  fontSize: '0.6rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}>
                  {endpointExtractors.length}
                </span>
              )}
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

      {/* Información de conexiones */}
      {(outgoing.length > 0 || incoming.length > 0) && (
        <div className="connection-info">
          {outgoing.length > 0 && (
            <div className="connection-badge outgoing" title={`${outgoing.length} conexión(es) saliente(s)`}>
              ➤ {outgoing.length}
            </div>
          )}
          {incoming.length > 0 && (
            <div className="connection-badge incoming" title={`${incoming.length} conexión(es) entrante(s)`}>
              ➤ {incoming.length}
            </div>
          )}
        </div>
      )}

      {/* Información de variables disponibles */}
      {(variables.length > 0 || endpointExtractors.length > 0) && (
        <div className="variables-info">
          {variables.length > 0 && (
            <div className="variable-badge" title={`${variables.length} variable(s) disponible(s)`}>
              📊 {variables.length}
            </div>
          )}
          {endpointExtractors.length > 0 && (
            <div className="extractor-badge" title={`${endpointExtractors.length} extractor(es) configurado(s)`}>
              🔧 {endpointExtractors.length}
            </div>
          )}
        </div>
      )}

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