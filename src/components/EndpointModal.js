import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import ExtractorForm from './ExtractorModal';
import useEscapeKey from '../utils/useEscapeKey';

const EndpointModal = ({ endpoint, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    method: 'GET',
    url: '',
    headers: '{}',
    body: ''
  });
  const [step, setStep] = useState(0);
  const [extractors, setExtractors] = useState([]);

  // Hook para cerrar modal con Escape
  useEscapeKey(onCancel);

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
      setExtractors(endpoint.extractors || []);
    }
  }, [endpoint]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => setStep(s => Math.min(s + 1, 2));
  const handleBack = () => setStep(s => Math.max(s - 1, 0));

  const handleExtractorSave = (index, extractorData) => {
    setExtractors(prev => {
      if (extractorData === null) {
        // Eliminar extractor
        return prev.filter((_, i) => i !== index);
      } else if (index < prev.length) {
        // Editar extractor
        return prev.map((ex, i) => (i === index ? extractorData : ex));
      } else {
        // Agregar extractor
        return [...prev, extractorData];
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar que la URL no esté vacía
    if (!formData.url.trim()) {
      toast.warning('La URL es obligatoria');
      return;
    }

    // Validar que los headers sean JSON válido
    try {
      if (formData.headers.trim()) {
        JSON.parse(formData.headers);
      }
    } catch (error) {
      toast.error('Los headers deben ser un JSON válido');
      return;
    }

    onSave({ ...formData, extractors });
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
      <div className="modal-content" style={{ overflow: 'auto', minWidth: 400, maxWidth: 600, maxHeight: '90vh' }}>
        <div className="modal-header">
          <h2>{endpoint ? 'Editar Endpoint' : 'Nuevo Endpoint'}</h2>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>
        {/* Barra de progreso */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ flex: 1, height: 4, background: '#eee', borderRadius: 2, marginRight: 8 }}>
            <div style={{ width: `${((step+1)/3)*100}%`, height: '100%', background: '#007bff', borderRadius: 2, transition: 'width 0.3s' }} />
          </div>
          <span style={{ fontSize: 12 }}>Paso {step+1} de 3</span>
        </div>
        {/* Animación de steps */}
        <TransitionGroup component={null}>
          <CSSTransition key={step} classNames="slide-step" timeout={300}>
            <div style={{ minHeight: 320 }}>
              {step === 0 && (
                <form onSubmit={e => { e.preventDefault(); handleNext(); }}>
                  {/* Datos básicos */}
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
                      Siguiente
                    </button>
                  </div>
                </form>
              )}
              {step === 1 && (
                <div>
                  <ExtractorForm
                    endpoint={{ ...formData, id: endpoint?.id }}
                    extractors={extractors}
                    onSave={handleExtractorSave}
                  />
                  <div className="form-actions" style={{ marginTop: 16 }}>
                    <button type="button" className="btn btn-secondary" onClick={handleBack}>
                      Atrás
                    </button>
                    <button type="button" className="btn btn-primary" onClick={handleNext}>
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
              {step === 2 && (
                <form onSubmit={handleSubmit}>
                  <h3>Confirmar configuración</h3>
                  <div style={{ marginBottom: 16 }}>
                    <strong>Nombre:</strong> {formData.name}<br />
                    <strong>Método:</strong> {formData.method}<br />
                    <strong>URL:</strong> {formData.url}<br />
                    <strong>Headers:</strong> <pre style={{ display: 'inline', fontSize: 12 }}>{formData.headers}</pre><br />
                    {formData.body && <><strong>Body:</strong> <pre style={{ display: 'inline', fontSize: 12 }}>{formData.body}</pre><br /></>}
                    <strong>Extractores:</strong> {extractors.length}
                  </div>
                  <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={handleBack}>
                      Atrás
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {endpoint ? 'Actualizar' : 'Crear'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </CSSTransition>
        </TransitionGroup>
      </div>
    </div>
  );
};

export default EndpointModal; 