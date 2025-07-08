import React, { useState, useEffect } from 'react';
import { loadLastExecution } from '../utils/localStorage';

const ExecutionHistory = ({ onLoadExecution }) => {
  const [history, setHistory] = useState([]);
  const [selectedExecution, setSelectedExecution] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const lastExecution = loadLastExecution();
    if (lastExecution) {
      setHistory([lastExecution]);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'partial': return '⚠️';
      default: return '⏳';
    }
  };

  const handleLoadExecution = (execution) => {
    setSelectedExecution(execution);
    if (onLoadExecution) {
      onLoadExecution(execution);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    setSelectedExecution(null);
    localStorage.removeItem('http_flows_last_execution');
  };

  if (history.length === 0) {
    return (
      <div className="execution-history">
        <div className="history-header">
          <h3>📋 Historial de Ejecuciones</h3>
        </div>
        <div className="history-empty">
          <p>No hay ejecuciones recientes</p>
          <small>Las ejecuciones se guardarán automáticamente aquí</small>
        </div>
      </div>
    );
  }

  return (
    <div className="execution-history">
      <div className="history-header">
        <h3>📋 Historial de Ejecuciones</h3>
        <button 
          className="clear-history-btn"
          onClick={clearHistory}
          title="Limpiar historial"
        >
          🗑️
        </button>
      </div>
      
      <div className="history-list">
        {history.map((execution, index) => (
          <div 
            key={index}
            className={`history-item ${selectedExecution === execution ? 'selected' : ''}`}
            onClick={() => handleLoadExecution(execution)}
          >
            <div className="history-item-header">
              <span className="status-icon">
                {getStatusIcon(execution.status)}
              </span>
              <span className="execution-time">
                {formatTimestamp(execution.timestamp)}
              </span>
            </div>
            
            <div className="execution-summary">
              <div className="summary-stats">
                <span className="stat">
                  <strong>{execution.totalEndpoints || 0}</strong> endpoints
                </span>
                <span className="stat">
                  <strong>{execution.successfulEndpoints || 0}</strong> exitosos
                </span>
                <span className="stat">
                  <strong>{execution.failedEndpoints || 0}</strong> fallidos
                </span>
              </div>
              
              {execution.duration && (
                <div className="execution-duration">
                  ⏱️ {execution.duration}ms
                </div>
              )}
            </div>

            {execution.endpoints && (
              <div className="endpoint-results">
                {execution.endpoints.slice(0, 3).map((endpoint, epIndex) => (
                  <div key={epIndex} className="endpoint-result">
                    <span className={`method-badge method-${endpoint.method?.toLowerCase()}`}>
                      {endpoint.method}
                    </span>
                    <span className="endpoint-name">{endpoint.name}</span>
                    <span className={`endpoint-status ${endpoint.status}`}>
                      {endpoint.status === 'completed' ? '✅' : '❌'}
                    </span>
                  </div>
                ))}
                {execution.endpoints.length > 3 && (
                  <div className="more-endpoints">
                    +{execution.endpoints.length - 3} más...
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExecutionHistory; 