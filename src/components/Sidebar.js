import React from 'react';

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
  onShowCorsInfo
}) => {
  const getSelectedEndpointVariables = () => {
    if (!selectedEndpoint) return [];
    return endpointVariables[selectedEndpoint] || [];
  };

  const renderVariableItem = (variable, type) => (
    <div key={variable.id} className="variable-item">
      <input
        type="text"
        value={variable.name}
        onChange={(e) => onUpdateVariable(variable.id, { name: e.target.value })}
        placeholder="Nombre de variable"
      />
      <input
        type="text"
        value={variable.value}
        onChange={(e) => onUpdateVariable(variable.id, { value: e.target.value })}
        placeholder="Valor"
      />
      <button onClick={() => onEditVariable(variable, type)}>✏️</button>
      <button onClick={() => onDeleteVariable(variable.id)}>🗑️</button>
    </div>
  );

  return (
    <div className="sidebar">
      {/* Variables Globales */}
      <div className="variables-section">
        <h3>🌍 Variables Globales</h3>
        <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>
          Variables de entorno disponibles en todo el flujo
        </p>
        {globalVariables.map(variable => renderVariableItem(variable, 'global'))}
        <button className="add-variable-btn" onClick={onAddVariable}>
          + Agregar Variable Global
        </button>
      </div>

      {/* Variables de Flujo */}
      <div className="variables-section">
        <h3>🔄 Variables de Flujo</h3>
        <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>
          Variables que se pueden actualizar durante la ejecución del flujo
        </p>
        {flowVariables.map(variable => renderVariableItem(variable, 'flow'))}
        <button className="add-variable-btn" onClick={onAddFlowVariable}>
          + Agregar Variable de Flujo
        </button>
      </div>

      {/* Variables de Endpoint */}
      <div className="variables-section">
        <h3>🔗 Variables de Endpoint</h3>
        <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>
          Variables específicas del endpoint seleccionado
        </p>
        {selectedEndpoint ? (
          <>
            {getSelectedEndpointVariables().map(variable => renderVariableItem(variable, 'endpoint'))}
            <button className="add-variable-btn" onClick={onAddEndpointVariable}>
              + Agregar Variable de Endpoint
            </button>
          </>
        ) : (
          <p style={{ fontSize: '0.8rem', color: '#999', fontStyle: 'italic' }}>
            Selecciona un endpoint para ver sus variables
          </p>
        )}
      </div>

      {/* Información de uso */}
      <div className="variables-section">
        <h3>📖 Cómo usar variables</h3>
        <div style={{ fontSize: '0.8rem', color: '#666' }}>
          <p>Usa <code>{'{{NOMBRE_VARIABLE}}'}</code> en:</p>
          <ul style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
            <li>URLs de endpoints</li>
            <li>Headers (JSON)</li>
            <li>Body de requests</li>
          </ul>
          <p style={{ marginTop: '0.5rem' }}>
            <strong>Ejemplo:</strong><br/>
            <code>https://api.example.com/users/{'{{USER_ID}}'}</code>
          </p>
        </div>
      </div>

      {/* Ayuda CORS */}
      <div className="variables-section">
        <h3>🔧 Solución CORS</h3>
        <div style={{ fontSize: '0.8rem', color: '#666' }}>
          <p>¿Tienes problemas con CORS?</p>
          <button 
            className="add-variable-btn" 
            onClick={onShowCorsInfo}
            style={{ backgroundColor: '#f59e0b', color: 'white' }}
          >
            🔍 Diagnóstico CORS
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 