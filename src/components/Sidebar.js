import React from 'react';
import ExecutionHistory from './ExecutionHistory';

const Sidebar = ({
  globalVariables,
  flowVariables,
  endpointVariables,
  selectedEndpoint,
  onAddVariable,
  onAddFlowVariable,
  onAddEndpointVariable,
  onEditVariable,
  onDeleteVariable,
  onUpdateVariable,
  onShowCorsInfo,
  onLoadExecution,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const getSelectedEndpointVariables = () => {
    try {
      if (!selectedEndpoint) return [];
      return endpointVariables[selectedEndpoint] || [];
    } catch (error) {
      console.error('Error getting selected endpoint variables:', error);
      return [];
    }
  };

  const renderVariableItem = (variable, type) => {
    try {
      if (!variable || !variable.id) {
        console.warn('Variable inválida:', variable);
        return null;
      }
      
      return (
        <div key={variable.id} className="variable-item">
          <div className="variable-inputs">
            <input
              type="text"
              value={variable.name || ''}
              onChange={(e) => onUpdateVariable(variable.id, { name: e.target.value }, type)}
              placeholder="Nombre"
              className="variable-name-input"
            />
            <input
              type="text"
              value={variable.value || ''}
              onChange={(e) => onUpdateVariable(variable.id, { value: e.target.value }, type)}
              placeholder="Valor"
              className="variable-value-input"
            />
          </div>
          <div className="variable-actions">
            <button 
              className="variable-action-btn edit-btn"
              onClick={() => onEditVariable(variable, type)}
              title="Editar variable"
            >
              ✏️
            </button>
            <button 
              className="variable-action-btn delete-btn"
              onClick={() => onDeleteVariable(variable.id, type)}
              title="Eliminar variable"
            >
              🗑️
            </button>
          </div>
        </div>
      );
    } catch (error) {
      console.error('Error rendering variable item:', error);
      return null;
    }
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Header del sidebar con botón de toggle */}
      <div className="sidebar-header">
        <h2 className="sidebar-title">⚙️ Configuración</h2>
        <button 
          className="sidebar-toggle-btn"
          onClick={onToggleCollapse}
          title={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          {isCollapsed ? '▶️' : '◀️'}
        </button>
      </div>

      <div className="sidebar-content">
        {/* Variables Globales */}
        <div className="variables-section">
          <div className="section-header">
            <h3>🌍 Variables Globales</h3>
            <span className="variable-count">{(globalVariables || []).length}</span>
          </div>
          <p className="section-description">
            Variables de entorno disponibles en todo el flujo
          </p>
          <div className="variables-list">
            {(globalVariables || []).map(variable => renderVariableItem(variable, 'global'))}
          </div>
          <button className="add-variable-btn" onClick={onAddVariable}>
            <span className="btn-icon">+</span>
            <span className="btn-text">Agregar Variable Global</span>
          </button>
        </div>

        {/* Variables de Flujo */}
        <div className="variables-section">
          <div className="section-header">
            <h3>🔄 Variables de Flujo</h3>
            <span className="variable-count">{(flowVariables || []).length}</span>
          </div>
          <p className="section-description">
            Variables que se pueden actualizar durante la ejecución del flujo
          </p>
          <div className="variables-list">
            {(flowVariables || []).map(variable => renderVariableItem(variable, 'flow'))}
          </div>
          <button className="add-variable-btn" onClick={onAddFlowVariable}>
            <span className="btn-icon">+</span>
            <span className="btn-text">Agregar Variable de Flujo</span>
          </button>
        </div>

        {/* Variables de Endpoint */}
        <div className="variables-section">
          <div className="section-header">
            <h3>🔗 Variables de Endpoint</h3>
            <span className="variable-count">{getSelectedEndpointVariables().length}</span>
          </div>
          <p className="section-description">
            Variables específicas del endpoint seleccionado
          </p>
          {selectedEndpoint ? (
            <>
              <div className="variables-list">
                {getSelectedEndpointVariables().map(variable => renderVariableItem(variable, 'endpoint'))}
              </div>
              <button className="add-variable-btn" onClick={onAddEndpointVariable}>
                <span className="btn-icon">+</span>
                <span className="btn-text">Agregar Variable de Endpoint</span>
              </button>
            </>
          ) : (
            <div className="empty-state">
              <p className="empty-message">
                Selecciona un endpoint para ver sus variables
              </p>
            </div>
          )}
        </div>

        {/* Historial de Ejecuciones */}
        <ExecutionHistory onLoadExecution={onLoadExecution} />

        {/* Ayuda CORS */}
        <div className="variables-section">
          <div className="section-header">
            <h3>🔧 Solución CORS</h3>
          </div>
          <div className="cors-help">
            <p>¿Tienes problemas con CORS?</p>
            <button 
              className="cors-diagnostic-btn" 
              onClick={onShowCorsInfo}
            >
              <span className="btn-icon">🔍</span>
              <span className="btn-text">Diagnóstico CORS</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 