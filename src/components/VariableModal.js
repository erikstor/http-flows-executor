import React, { useState, useEffect } from 'react';

const VariableModal = ({ variable, type, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    value: ''
  });

  // Inicializar formulario con datos de la variable si existe
  useEffect(() => {
    if (variable) {
      setFormData({
        name: variable.name || '',
        value: variable.value || ''
      });
    }
  }, [variable]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar que el nombre no esté vacío
    if (!formData.name.trim()) {
      alert('El nombre de la variable es obligatorio');
      return;
    }

    onSave(formData);
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'global': return 'Global';
      case 'flow': return 'Flujo';
      case 'endpoint': return 'Endpoint';
      default: return 'Variable';
    }
  };

  const getTypeDescription = () => {
    switch (type) {
      case 'global': return 'Variable de entorno disponible en todo el flujo';
      case 'flow': return 'Variable que puede actualizarse durante la ejecución';
      case 'endpoint': return 'Variable específica del endpoint seleccionado';
      default: return '';
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{variable ? 'Editar Variable' : 'Nueva Variable'} {getTypeLabel()}</h2>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>

        <div style={{ marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
            {getTypeDescription()}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nombre de la Variable</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ej: API_KEY, USER_ID, BASE_URL"
              required
            />
            <small style={{ color: '#666', fontSize: '0.8rem' }}>
              Usa este nombre con {'{{NOMBRE_VARIABLE}}'} en tus endpoints
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="value">Valor</label>
            <textarea
              id="value"
              value={formData.value}
              onChange={(e) => handleInputChange('value', e.target.value)}
              placeholder="Valor de la variable"
              rows={3}
            />
            <small style={{ color: '#666', fontSize: '0.8rem' }}>
              Puede ser texto, números, URLs, tokens, etc.
            </small>
          </div>

          {/* Ejemplos de uso */}
          <div style={{ 
            marginBottom: '1rem', 
            padding: '1rem', 
            backgroundColor: '#e9ecef', 
            borderRadius: '4px',
            fontSize: '0.85rem'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Ejemplos de uso:</h4>
            <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
              <li><strong>URL:</strong> <code>https://api.example.com/users/&#123;&#123;USER_ID&#125;&#125;</code></li>
              <li><strong>Header:</strong> <code>&#123;"Authorization": "Bearer &#123;&#123;API_KEY&#125;&#125;"&#125;</code></li>
              <li><strong>Body:</strong> <code>&#123;"userId": "&#123;&#123;USER_ID&#125;&#125;"&#125;</code></li>
            </ul>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {variable ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VariableModal; 