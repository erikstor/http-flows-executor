import React, { useState, useEffect } from 'react';
import { commonExtractors } from '../utils/variableExtractor';

const ExtractorModal = ({ endpoint, extractors = [], onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    path: '',
    variableName: '',
    type: 'flow'
  });

  const [editingIndex, setEditingIndex] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.path.trim() || !formData.variableName.trim()) {
      alert('El path y nombre de variable son obligatorios');
      return;
    }

    if (editingIndex !== null) {
      onSave(editingIndex, formData);
      setEditingIndex(null);
    } else {
      onSave(extractors.length, formData);
    }
    
    setFormData({
      path: '',
      variableName: '',
      type: 'flow'
    });
  };

  const handleEdit = (index, extractor) => {
    setFormData(extractor);
    setEditingIndex(index);
  };

  const handleDelete = (index) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este extractor?')) {
      onSave(index, null); // null indica eliminación
    }
  };

  const addCommonExtractor = (key, extractor) => {
    setFormData(extractor);
  };

  return (
    <div className="modal">
      <div className="modal-content" style={{ maxWidth: '800px', width: '90%' }}>
        <div className="modal-header">
          <h2>Configurar Extractores - {endpoint?.name || 'Endpoint'}</h2>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>
            Configura extractores para extraer automáticamente valores de las respuestas JSON y asignarlos a variables.
          </p>
        </div>

        {/* Extractores existentes */}
        {extractors.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4>Extractores configurados:</h4>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {extractors.map((extractor, index) => (
                <div key={index} style={{
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  marginBottom: '0.5rem',
                  backgroundColor: '#f8f9fa'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{extractor.variableName}</strong> ({extractor.type})
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>
                        Path: <code>{extractor.path}</code>
                      </div>
                    </div>
                    <div>
                      <button 
                        onClick={() => handleEdit(index, extractor)}
                        style={{ marginRight: '0.5rem', fontSize: '0.8rem' }}
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDelete(index)}
                        style={{ fontSize: '0.8rem' }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Extractores comunes */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4>Extractores comunes:</h4>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {Object.entries(commonExtractors).map(([key, extractor]) => (
              <button
                key={key}
                onClick={() => addCommonExtractor(key, extractor)}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #007bff',
                  borderRadius: '4px',
                  backgroundColor: '#f8f9ff',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                {extractor.variableName}
              </button>
            ))}
          </div>
        </div>

        {/* Formulario para nuevo extractor */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="variableName">Nombre de la Variable</label>
            <input
              type="text"
              id="variableName"
              value={formData.variableName}
              onChange={(e) => handleInputChange('variableName', e.target.value)}
              placeholder="Ej: ACCESS_TOKEN, USER_ID"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="path">JSONPath</label>
            <input
              type="text"
              id="path"
              value={formData.path}
              onChange={(e) => handleInputChange('path', e.target.value)}
              placeholder="Ej: $.access_token, $.user.id"
              required
            />
            <small style={{ color: '#666', fontSize: '0.8rem' }}>
              Usa JSONPath para acceder a valores en la respuesta JSON
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="type">Tipo de Variable</label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
            >
              <option value="flow">Variable de Flujo</option>
              <option value="global">Variable Global</option>
              <option value="endpoint">Variable de Endpoint</option>
            </select>
          </div>

          {/* Ejemplos de JSONPath */}
          <div style={{
            marginBottom: '1rem',
            padding: '1rem',
            backgroundColor: '#e9ecef',
            borderRadius: '4px',
            fontSize: '0.85rem'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Ejemplos de JSONPath:</h4>
            <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
              <li><code>$.access_token</code> - Token de acceso</li>
              <li><code>$.user.id</code> - ID del usuario</li>
              <li><code>$.data[0].name</code> - Nombre del primer elemento</li>
              <li><code>$.headers.authorization</code> - Header de autorización</li>
            </ul>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editingIndex !== null ? 'Actualizar' : 'Agregar'} Extractor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExtractorModal; 