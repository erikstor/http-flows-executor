import React, { useState, useEffect } from 'react';

const EndpointModal = ({ endpoint, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    method: 'GET',
    url: '',
    headers: '{}',
    body: ''
  });

  // Inicializar formulario con datos del endpoint si existe
  useEffect(() => {
    if (endpoint) {
      setFormData({
        name: endpoint.name || '',
        method: endpoint.method || 'GET',
        url: endpoint.url || '',
        headers: endpoint.headers || '{}',
        body: endpoint.body || ''
      });
    }
  }, [endpoint]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar que la URL no esté vacía
    if (!formData.url.trim()) {
      alert('La URL es obligatoria');
      return;
    }

    // Validar que los headers sean JSON válido
    try {
      if (formData.headers.trim()) {
        JSON.parse(formData.headers);
      }
    } catch (error) {
      alert('Los headers deben ser un JSON válido');
      return;
    }

    onSave(formData);
  };

  const validateJson = (jsonString) => {
    try {
      if (jsonString.trim()) {
        JSON.parse(jsonString);
        return true;
      }
      return true;
    } catch (error) {
      return false;
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{endpoint ? 'Editar Endpoint' : 'Nuevo Endpoint'}</h2>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nombre del Endpoint</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ej: Obtener usuarios"
            />
          </div>

          <div className="form-group">
            <label htmlFor="method">Método HTTP</label>
            <select
              id="method"
              value={formData.method}
              onChange={(e) => handleInputChange('method', e.target.value)}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="url">URL</label>
            <input
              type="text"
              id="url"
              value={formData.url}
              onChange={(e) => handleInputChange('url', e.target.value)}
              placeholder="https://api.example.com/users"
              required
            />
            <small style={{ color: '#666', fontSize: '0.8rem' }}>
              Puedes usar variables con {'{{NOMBRE_VARIABLE}}'}
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="headers">Headers (JSON)</label>
            <textarea
              id="headers"
              value={formData.headers}
              onChange={(e) => handleInputChange('headers', e.target.value)}
              placeholder='{"Content-Type": "application/json", "Authorization": "Bearer {{API_KEY}}"}'
              style={{
                fontFamily: 'monospace',
                fontSize: '0.8rem'
              }}
            />
            <small style={{ 
              color: validateJson(formData.headers) ? '#28a745' : '#dc3545',
              fontSize: '0.8rem'
            }}>
              {validateJson(formData.headers) ? 'JSON válido' : 'JSON inválido'}
            </small>
          </div>

          {(formData.method === 'POST' || formData.method === 'PUT' || formData.method === 'PATCH') && (
            <div className="form-group">
              <label htmlFor="body">Body</label>
              <textarea
                id="body"
                value={formData.body}
                onChange={(e) => handleInputChange('body', e.target.value)}
                placeholder='{"name": "John Doe", "email": "john@example.com"}'
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.8rem'
                }}
              />
              <small style={{ color: '#666', fontSize: '0.8rem' }}>
                Puedes usar variables con {'{{NOMBRE_VARIABLE}}'}
              </small>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {endpoint ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EndpointModal; 