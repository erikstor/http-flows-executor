import React, { useState } from 'react';
import { commonExtractors } from '../utils/variableExtractor';
import { toast } from 'react-toastify';
import useEscapeKey from '../utils/useEscapeKey';

const ExtractorForm = ({ endpoint, extractors, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    path: '',
    variableName: '',
    type: 'flow'
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Hook para cerrar modal con Escape
  useEscapeKey(onCancel);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error de validación cuando el usuario empiece a escribir
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.path.trim()) {
      errors.path = 'El path JSON es obligatorio';
    } else if (!formData.path.startsWith('$.')) {
      errors.path = 'El path debe comenzar con "$."';
    }
    
    if (!formData.variableName.trim()) {
      errors.variableName = 'El nombre de variable es obligatorio';
    } else if (!/^[A-Z_][A-Z0-9_]*$/.test(formData.variableName)) {
      errors.variableName = 'El nombre debe estar en mayúsculas y usar solo letras, números y guiones bajos';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    if (editingIndex !== null) {
      onSave(editingIndex, formData);
      setEditingIndex(null);
      toast.success('Extractor actualizado correctamente');
    } else {
      onSave(extractors.length, formData);
      toast.success('Extractor agregado correctamente');
    }
    setFormData({ path: '', variableName: '', type: 'flow' });
  };

  const handleEdit = (index, extractor) => {
    setFormData(extractor);
    setEditingIndex(index);
  };

  const handleDelete = (index) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este extractor?')) {
      onSave(index, null);
      toast.success('Extractor eliminado correctamente');
    }
  };

  const addCommonExtractor = (key, extractor) => {
    setFormData(extractor);
    setEditingIndex(null);
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'global': return 'Global';
      case 'flow': return 'Flujo';
      case 'endpoint': return 'Endpoint';
      default: return type;
    }
  };

  return (
    <div className="extractor-form">
      <div className="form-header">
        <h3>🔧 Configurar Extractores de Variables</h3>
        <p className="form-description">
          Configura extractores para extraer valores de la respuesta y asignarlos a variables
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="path">JSONPath *</label>
          <input
            type="text"
            id="path"
            value={formData.path}
            onChange={(e) => handleInputChange('path', e.target.value)}
            placeholder="$.access_token"
            className={validationErrors.path ? 'error' : ''}
          />
          {validationErrors.path && (
            <span className="error-message">{validationErrors.path}</span>
          )}
          <small className="help-text">
            Ruta JSONPath para extraer el valor de la respuesta
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="variableName">Nombre de Variable *</label>
          <input
            type="text"
            id="variableName"
            value={formData.variableName}
            onChange={(e) => handleInputChange('variableName', e.target.value.toUpperCase())}
            placeholder="ACCESS_TOKEN"
            className={validationErrors.variableName ? 'error' : ''}
          />
          {validationErrors.variableName && (
            <span className="error-message">{validationErrors.variableName}</span>
          )}
          <small className="help-text">
            Nombre de la variable donde se guardará el valor extraído
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="type">Tipo de Variable</label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
          >
            <option value="flow">Flujo (se actualiza durante la ejecución)</option>
            <option value="global">Global (disponible en todo el flujo)</option>
            <option value="endpoint">Endpoint (específica del endpoint)</option>
          </select>
          <small className="help-text">
            {formData.type === 'flow' && 'La variable se puede actualizar durante la ejecución del flujo'}
            {formData.type === 'global' && 'La variable estará disponible en todos los endpoints'}
            {formData.type === 'endpoint' && 'La variable será específica de este endpoint'}
          </small>
        </div>

        {/* Extractores Comunes */}
        <div className="common-extractors">
          <h4>🚀 Extractores Comunes</h4>
          <p>Haz clic en un extractor común para usarlo como base:</p>
          <div className="extractor-buttons">
            {Object.entries(commonExtractors).map(([key, extractor]) => (
              <button
                key={key}
                type="button"
                className="common-extractor-btn"
                onClick={() => addCommonExtractor(key, extractor)}
                title={`${extractor.path} → ${extractor.variableName}`}
              >
                <span className="extractor-icon">🔑</span>
                <span className="extractor-name">{extractor.variableName}</span>
                <span className="extractor-path">{extractor.path}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Ejemplos de JSONPath */}
        <div className="examples-section">
          <h4>📚 Ejemplos de JSONPath</h4>
          <div className="examples-grid">
            <div className="example-item">
              <code>$.access_token</code>
              <span>Token de acceso</span>
            </div>
            <div className="example-item">
              <code>$.user.id</code>
              <span>ID del usuario</span>
            </div>
            <div className="example-item">
              <code>$.data[0].name</code>
              <span>Nombre del primer elemento</span>
            </div>
            <div className="example-item">
              <code>$.headers.authorization</code>
              <span>Header de autorización</span>
            </div>
            <div className="example-item">
              <code>$.items[*].id</code>
              <span>Todos los IDs de una lista</span>
            </div>
            <div className="example-item">
              <code>$.metadata.total_count</code>
              <span>Contador total</span>
            </div>
          </div>
        </div>

        <div className="form-actions">
          {onCancel && (
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancelar
            </button>
          )}
          <button type="submit" className="btn btn-primary">
            {editingIndex !== null ? 'Actualizar' : 'Agregar'} Extractor
          </button>
        </div>
      </form>

      {/* Lista de Extractores Existentes */}
      {extractors.length > 0 && (
        <div className="existing-extractors">
          <h4>📋 Extractores Configurados</h4>
          <div className="extractors-list">
            {extractors.map((extractor, index) => (
              <div key={index} className="extractor-item">
                <div className="extractor-info">
                  <div className="extractor-path">
                    <strong>Path:</strong> <code>{extractor.path}</code>
                  </div>
                  <div className="extractor-variable">
                    <strong>Variable:</strong> <code>{extractor.variableName}</code>
                    <span className="type-badge">{getTypeLabel(extractor.type)}</span>
                  </div>
                </div>
                <div className="extractor-actions">
                  <button
                    type="button"
                    className="btn-edit"
                    onClick={() => handleEdit(index, extractor)}
                    title="Editar extractor"
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    className="btn-delete"
                    onClick={() => handleDelete(index)}
                    title="Eliminar extractor"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExtractorForm; 