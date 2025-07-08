import React, { useState, useEffect } from 'react';
import './ConnectionModal.css';
import { toast } from 'react-toastify';
import useEscapeKey from '../utils/useEscapeKey';

const ConnectionModal = ({ 
  isOpen, 
  onClose, 
  sourceEndpoint, 
  targetEndpoint, 
  onSaveConnection,
  flowVariables = [],
  extractors = [],
  connections = []
}) => {
  const [connectionConfig, setConnectionConfig] = useState({
    name: '',
    description: '',
    dataMapping: [],
    conditions: [],
    transformations: [],
    extractors: []
  });

  const [availableVariables, setAvailableVariables] = useState([]);
  const [availableExtractors, setAvailableExtractors] = useState([]);

  // Hook para cerrar modal con Escape
  useEscapeKey(onClose);

  useEffect(() => {
    if (isOpen && sourceEndpoint && targetEndpoint) {
      // Buscar si ya existe una configuración para esta conexión
      const existingConnection = connections?.find(conn => 
        conn.source === sourceEndpoint.id && conn.target === targetEndpoint.id
      );

      if (existingConnection && existingConnection.config) {
        // Usar configuración existente
        setConnectionConfig(existingConnection.config);
      } else {
        // Generar nombre automático para la conexión
        const autoName = `${sourceEndpoint.name} → ${targetEndpoint.name}`;
        setConnectionConfig(prev => ({
          ...prev,
          name: autoName
        }));
      }

      // Obtener variables disponibles del endpoint fuente
      const sourceVariables = flowVariables.filter(v => 
        v.sourceEndpointId === sourceEndpoint.id
      );
      setAvailableVariables(sourceVariables);

      // Obtener extractores disponibles del endpoint fuente
      const sourceExtractors = extractors[sourceEndpoint.id] || [];
      setAvailableExtractors(sourceExtractors);
    }
  }, [isOpen, sourceEndpoint, targetEndpoint, flowVariables, extractors, connections]);

  const handleAddDataMapping = () => {
    setConnectionConfig(prev => ({
      ...prev,
      dataMapping: [
        ...prev.dataMapping,
        {
          id: Date.now(),
          source: '',
          target: '',
          transformation: 'direct'
        }
      ]
    }));
  };

  const handleRemoveDataMapping = (index) => {
    setConnectionConfig(prev => ({
      ...prev,
      dataMapping: prev.dataMapping.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateDataMapping = (index, field, value) => {
    setConnectionConfig(prev => ({
      ...prev,
      dataMapping: prev.dataMapping.map((mapping, i) => 
        i === index ? { ...mapping, [field]: value } : mapping
      )
    }));
  };

  const handleAddCondition = () => {
    setConnectionConfig(prev => ({
      ...prev,
      conditions: [
        ...prev.conditions,
        {
          id: Date.now(),
          variable: '',
          operator: 'equals',
          value: '',
          action: 'continue'
        }
      ]
    }));
  };

  const handleRemoveCondition = (index) => {
    setConnectionConfig(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateCondition = (index, field, value) => {
    setConnectionConfig(prev => ({
      ...prev,
      conditions: prev.conditions.map((condition, i) => 
        i === index ? { ...condition, [field]: value } : condition
      )
    }));
  };

  // Funciones para manejar extractores
  const handleAddExtractor = () => {
    setConnectionConfig(prev => ({
      ...prev,
      extractors: [
        ...prev.extractors,
        {
          id: Date.now(),
          variableName: '',
          type: 'json',
          selector: ''
        }
      ]
    }));
  };

  const handleRemoveExtractor = (index) => {
    setConnectionConfig(prev => ({
      ...prev,
      extractors: prev.extractors.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateExtractor = (index, field, value) => {
    setConnectionConfig(prev => ({
      ...prev,
      extractors: prev.extractors.map((extractor, i) => 
        i === index ? { ...extractor, [field]: value } : extractor
      )
    }));
  };

  const handleSave = () => {
    if (!connectionConfig.name.trim()) {
      toast.warning('Por favor ingresa un nombre para la conexión');
      return;
    }

    onSaveConnection({
      source: sourceEndpoint.id,
      target: targetEndpoint.id,
      config: connectionConfig
    });
    onClose();
  };

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="connection-modal-overlay" onClick={handleOverlayClick}>
      <div className="connection-modal" onClick={handleModalClick}>
        <div className="connection-modal-header">
          <h2>Configurar Conexión</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="connection-modal-content">
          {/* Información de la conexión */}
          <div className="connection-info">
            <div className="endpoint-pair">
              <div className="source-endpoint">
                <span className="endpoint-label">Desde:</span>
                <span className="endpoint-name">{sourceEndpoint?.name}</span>
              </div>
              <div className="connection-arrow">→</div>
              <div className="target-endpoint">
                <span className="endpoint-label">Hacia:</span>
                <span className="endpoint-name">{targetEndpoint?.name}</span>
              </div>
            </div>
          </div>

          {/* Configuración básica */}
          <div className="config-section">
            <h3>Configuración Básica</h3>
            <div className="form-group">
              <label>Nombre de la conexión:</label>
              <input
                type="text"
                value={connectionConfig.name}
                onChange={(e) => setConnectionConfig(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre descriptivo de la conexión"
              />
            </div>
            <div className="form-group">
              <label>Descripción:</label>
              <textarea
                value={connectionConfig.description}
                onChange={(e) => setConnectionConfig(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe qué hace esta conexión"
                rows="3"
              />
            </div>
          </div>

          {/* Mapeo de datos */}
          <div className="config-section">
            <div className="section-header">
              <h3>Mapeo de Datos</h3>
              <button className="add-button" onClick={handleAddDataMapping}>
                + Agregar Mapeo
              </button>
            </div>
            <p className="section-description">
              Define cómo los datos del endpoint fuente se pasan al endpoint destino
            </p>
            
            {connectionConfig.dataMapping.length === 0 ? (
              <div className="empty-state">
                <p>No hay mapeos configurados. Haz clic en "Agregar Mapeo" para comenzar.</p>
              </div>
            ) : (
              <div className="mapping-list">
                {connectionConfig.dataMapping.map((mapping, index) => (
                  <div key={mapping.id} className="mapping-item">
                    <div className="mapping-inputs">
                      <div className="input-group">
                        <label>Origen:</label>
                        <select
                          value={mapping.source}
                          onChange={(e) => handleUpdateDataMapping(index, 'source', e.target.value)}
                        >
                          <option value="">Seleccionar variable/extractor</option>
                          {availableVariables.map(variable => (
                            <option key={variable.id} value={`var:${variable.name}`}>
                              Variable: {variable.name}
                            </option>
                          ))}
                          {availableExtractors.map(extractor => (
                            <option key={extractor.id} value={`ext:${extractor.name}`}>
                              Extractor: {extractor.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="mapping-arrow">→</div>
                      
                      <div className="input-group">
                        <label>Destino:</label>
                        <input
                          type="text"
                          value={mapping.target}
                          onChange={(e) => handleUpdateDataMapping(index, 'target', e.target.value)}
                          placeholder="Nombre del parámetro destino"
                        />
                      </div>
                      
                      <div className="input-group">
                        <label>Transformación:</label>
                        <select
                          value={mapping.transformation}
                          onChange={(e) => handleUpdateDataMapping(index, 'transformation', e.target.value)}
                        >
                          <option value="direct">Directo</option>
                          <option value="string">A String</option>
                          <option value="number">A Número</option>
                          <option value="boolean">A Boolean</option>
                          <option value="json">A JSON</option>
                        </select>
                      </div>
                    </div>
                    
                    <button 
                      className="remove-button"
                      onClick={() => handleRemoveDataMapping(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Condiciones */}
          <div className="config-section">
            <div className="section-header">
              <h3>Condiciones de Ejecución</h3>
              <button className="add-button" onClick={handleAddCondition}>
                + Agregar Condición
              </button>
            </div>
            <p className="section-description">
              Define condiciones que deben cumplirse para que se ejecute el endpoint destino
            </p>
            
            {connectionConfig.conditions.length === 0 ? (
              <div className="empty-state">
                <p>No hay condiciones configuradas. El endpoint destino se ejecutará siempre.</p>
              </div>
            ) : (
              <div className="condition-list">
                {connectionConfig.conditions.map((condition, index) => (
                  <div key={condition.id} className="condition-item">
                    <div className="condition-inputs">
                      <div className="input-group">
                        <label>Variable:</label>
                        <select
                          value={condition.variable}
                          onChange={(e) => handleUpdateCondition(index, 'variable', e.target.value)}
                        >
                          <option value="">Seleccionar variable</option>
                          {availableVariables.map(variable => (
                            <option key={variable.id} value={variable.name}>
                              {variable.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="input-group">
                        <label>Operador:</label>
                        <select
                          value={condition.operator}
                          onChange={(e) => handleUpdateCondition(index, 'operator', e.target.value)}
                        >
                          <option value="equals">Igual a</option>
                          <option value="not_equals">No igual a</option>
                          <option value="contains">Contiene</option>
                          <option value="greater_than">Mayor que</option>
                          <option value="less_than">Menor que</option>
                          <option value="exists">Existe</option>
                          <option value="not_exists">No existe</option>
                        </select>
                      </div>
                      
                      <div className="input-group">
                        <label>Valor:</label>
                        <input
                          type="text"
                          value={condition.value}
                          onChange={(e) => handleUpdateCondition(index, 'value', e.target.value)}
                          placeholder="Valor a comparar"
                        />
                      </div>
                      
                      <div className="input-group">
                        <label>Acción:</label>
                        <select
                          value={condition.action}
                          onChange={(e) => handleUpdateCondition(index, 'action', e.target.value)}
                        >
                          <option value="continue">Continuar</option>
                          <option value="skip">Saltar endpoint</option>
                          <option value="stop">Detener flujo</option>
                        </select>
                      </div>
                    </div>
                    
                    <button 
                      className="remove-button"
                      onClick={() => handleRemoveCondition(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Extractores */}
          <div className="config-section">
            <div className="section-header">
              <h3>Extractores de Variables</h3>
              <button className="add-button" onClick={handleAddExtractor}>
                + Agregar Extractor
              </button>
            </div>
            <p className="section-description">
              Configura extractores para extraer valores de la respuesta del endpoint fuente y asignarlos a variables
            </p>
            
            {connectionConfig.extractors.length === 0 ? (
              <div className="empty-state">
                <p>No hay extractores configurados. Haz clic en "Agregar Extractor" para comenzar.</p>
              </div>
            ) : (
              <div className="extractor-list">
                {connectionConfig.extractors.map((extractor, index) => (
                  <div key={extractor.id} className="extractor-item">
                    <div className="extractor-inputs">
                      <div className="input-group">
                        <label>Nombre de la variable:</label>
                        <input
                          type="text"
                          value={extractor.variableName}
                          onChange={(e) => handleUpdateExtractor(index, 'variableName', e.target.value)}
                          placeholder="ej: userId, token, etc."
                        />
                      </div>
                      
                      <div className="input-group">
                        <label>Tipo de extracción:</label>
                        <select
                          value={extractor.type}
                          onChange={(e) => handleUpdateExtractor(index, 'type', e.target.value)}
                        >
                          <option value="json">JSON</option>
                          <option value="header">Header</option>
                          <option value="status">Status Code</option>
                        </select>
                      </div>
                      
                      <div className="input-group">
                        <label>Selector:</label>
                        <input
                          type="text"
                          value={extractor.selector}
                          onChange={(e) => handleUpdateExtractor(index, 'selector', e.target.value)}
                          placeholder={extractor.type === 'json' ? 'ej: data.user.id' : 'ej: Authorization'}
                        />
                      </div>
                    </div>
                    
                    <button 
                      className="remove-button"
                      onClick={() => handleRemoveExtractor(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="connection-modal-footer">
          <button className="cancel-button" onClick={onClose}>
            Cancelar
          </button>
          <button className="save-button" onClick={handleSave}>
            Guardar Conexión
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionModal; 