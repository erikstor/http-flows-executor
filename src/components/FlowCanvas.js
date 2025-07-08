import React, { useState, useRef, useEffect, useCallback } from 'react';
import EndpointNode from './EndpointNode';
import ConnectionModal from './ConnectionModal';
import ExtractorModal from './ExtractorModal';
import DraggableEndpoint from './DraggableEndpoint';
import { toast } from 'react-toastify';

const FlowCanvas = ({
  endpoints,
  connections,
  selectedEndpoint,
  onSelectEndpoint,
  onAddEndpoint,
  onEditEndpoint,
  onDeleteEndpoint,
  onClearAllEndpoints,
  onRunEndpoint,
  onRunFlow,
  onAddConnection,
  onDeleteConnection,
  onUpdateEndpointPosition,
  onViewResponse,
  onImportCurl,
  onConfigureExtractors,
  onExportFlow,
  onImportFlow,
  onTestFlow,
  flowVariables,
  extractors
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [connectionStart, setConnectionStart] = useState(null);
  const [draggedEndpoint, setDraggedEndpoint] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isCreatingEndpoint, setIsCreatingEndpoint] = useState(false);
  const [createEndpointData, setCreateEndpointData] = useState(null);
  const [connectionModalOpen, setConnectionModalOpen] = useState(false);
  const [pendingConnection, setPendingConnection] = useState(null);
  const [extractorModalOpen, setExtractorModalOpen] = useState(false);
  const [extractorConnection, setExtractorConnection] = useState(null);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const nodeRefs = useRef({});

  // Función para manejar el inicio del arrastre
  const handleMouseDown = (e, endpointId) => {
    if (e.target.closest('.endpoint-actions')) return;
    
    const endpoint = endpoints.find(ep => ep.id === endpointId);
    if (!endpoint) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setIsDragging(true);
    setDraggedEndpoint(endpointId);
    setDragOffset({ x: offsetX, y: offsetY });
    setDragStart({
      x: e.clientX,
      y: e.clientY
    });
    
    onSelectEndpoint(endpointId);
    
    // Cambiar el cursor del documento
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  };

  // Función para manejar el movimiento del mouse durante el arrastre
  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !draggedEndpoint) return;
    const nodeEl = nodeRefs.current[draggedEndpoint];
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect || !nodeEl) return;
    const nodeRect = nodeEl.getBoundingClientRect();
    // Usar el offset relativo al nodo
    const offsetX = dragOffset.x;
    const offsetY = dragOffset.y;
    const newX = e.clientX - containerRect.left - offsetX;
    const newY = e.clientY - containerRect.top - offsetY;
    // Limitar el movimiento dentro del contenedor
    const maxX = containerRect.width - nodeRect.width;
    const maxY = containerRect.height - nodeRect.height;
    const clampedX = Math.max(0, Math.min(newX, maxX));
    const clampedY = Math.max(0, Math.min(newY, maxY));
    onUpdateEndpointPosition(draggedEndpoint, {
      x: clampedX,
      y: clampedY
    });
  }, [isDragging, draggedEndpoint, dragOffset, onUpdateEndpointPosition]);

  // Función para manejar el fin del arrastre
  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setDraggedEndpoint(null);
    }
  }, [isDragging]);

  // Función para iniciar una conexión
  const handleConnectionStart = (endpointId) => {
    setConnectionStart(endpointId);
  };

  // Función para completar una conexión
  const handleConnectionEnd = (endpointId) => {
    if (connectionStart && connectionStart !== endpointId) {
      const sourceEndpoint = endpoints.find(ep => ep.id === connectionStart);
      const targetEndpoint = endpoints.find(ep => ep.id === endpointId);
      
      if (sourceEndpoint && targetEndpoint) {
        setPendingConnection({
          source: sourceEndpoint,
          target: targetEndpoint
        });
        setConnectionModalOpen(true);
      }
    }
    setConnectionStart(null);
  };

  // Función para guardar la configuración de conexión
  const handleSaveConnection = (connectionData) => {
    onAddConnection(connectionData.source, connectionData.target, connectionData.config);
    setPendingConnection(null);
    setConnectionModalOpen(false);
  };

  // Función para cerrar el modal de conexión
  const handleCloseConnectionModal = () => {
    setConnectionModalOpen(false);
    setPendingConnection(null);
  };

  // Función para manejar el inicio de creación de endpoint por drag
  const handleCreateEndpointStart = (e) => {
    if (connectionModalOpen || !containerRef.current) return;
    
    // Verificar si el clic fue en un elemento interactivo
    const target = e.target;
    const isInteractiveElement = target.closest('button') || 
                                target.closest('input') || 
                                target.closest('select') || 
                                target.closest('textarea') || 
                                target.closest('label') ||
                                target.closest('.flow-controls') ||
                                target.closest('.endpoint-node') ||
                                target.closest('.connection-line') ||
                                target.closest('.extractor-button') ||
                                target.closest('.extractor-button-text');
    
    if (isInteractiveElement) {
      return; // No crear endpoint si se hizo clic en un elemento interactivo
    }
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCreateEndpointData({
      name: 'Nuevo Endpoint',
      method: 'GET',
      url: 'https://api.example.com',
      headers: '{}',
      body: '',
      position: { x, y }
    });
    setIsCreatingEndpoint(true);
  };

  // Función para manejar el movimiento durante la creación
  const handleCreateEndpointMove = useCallback((e) => {
    if (!isCreatingEndpoint || !createEndpointData || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCreateEndpointData(prev => ({
      ...prev,
      position: { x, y }
    }));
  }, [isCreatingEndpoint, createEndpointData]);

  // Función para completar la creación de endpoint
  const handleCreateEndpointEnd = useCallback(() => {
    if (isCreatingEndpoint && createEndpointData) {
      // En lugar de crear el endpoint directamente, abrir el modal
      onAddEndpoint();
      setIsCreatingEndpoint(false);
      setCreateEndpointData(null);
    }
  }, [isCreatingEndpoint, createEndpointData, onAddEndpoint]);

  // Función específica para manejar el drag and drop del componente DraggableEndpoint
  const handleDraggableEndpointDrop = useCallback((e) => {
    console.log('DraggableEndpoint dropped!', e);
    // Abrir el modal directamente cuando se suelta el componente arrastrable
    onAddEndpoint();
  }, [onAddEndpoint]);

  // Función para calcular los puntos de conexión de un endpoint
  const getEndpointConnectionPoints = (endpoint) => {
    const nodeEl = nodeRefs.current[endpoint.id];
    let nodeWidth = 200, nodeHeight = 120;
    if (nodeEl) {
      const rect = nodeEl.getBoundingClientRect();
      nodeWidth = rect.width;
      nodeHeight = rect.height;
    }
    return {
      right: {
        x: endpoint.position.x + nodeWidth,
        y: endpoint.position.y + nodeHeight / 2
      },
      left: {
        x: endpoint.position.x,
        y: endpoint.position.y + nodeHeight / 2
      },
      top: {
        x: endpoint.position.x + nodeWidth / 2,
        y: endpoint.position.y
      },
      bottom: {
        x: endpoint.position.x + nodeWidth / 2,
        y: endpoint.position.y + nodeHeight
      }
    };
  };

  // Función para encontrar el mejor punto de conexión
  const findBestConnectionPoints = (source, target) => {
    const sourcePoints = getEndpointConnectionPoints(source);
    const targetPoints = getEndpointConnectionPoints(target);
    // Siempre conectar right de source con left de target
    return { start: sourcePoints.right, end: targetPoints.left };
  };

  // Función para manejar clic en conexión
  const handleConnectionClick = (connection) => {
    if (onConfigureExtractors) {
      onConfigureExtractors(connection);
    } else {
      toast.info(`Configurando extractores para conexión: ${connection.source} → ${connection.target}`);
    }
  };

  // Función para manejar clic en botón de extractores
  const handleExtractorButtonClick = (e, connection) => {
    e.stopPropagation();
    setExtractorConnection(connection);
    setExtractorModalOpen(true);
  };

  // Función para cerrar el modal de extractor
  const handleCloseExtractorModal = () => {
    setExtractorModalOpen(false);
    setExtractorConnection(null);
  };

  // Función para guardar el extractor
  const handleSaveExtractor = (index, extractorData) => {
    // Aquí deberías guardar el extractor para la conexión (implementar lógica según tu modelo de datos)
    // Por ahora solo cerramos el modal
    setExtractorModalOpen(false);
    setExtractorConnection(null);
  };

  // Renderizar conexiones como SVG
  const renderConnections = () => {
    return connections.map(connection => {
      const sourceEndpoint = endpoints.find(ep => ep.id === connection.source);
      const targetEndpoint = endpoints.find(ep => ep.id === connection.target);
      if (!sourceEndpoint || !targetEndpoint) return null;
      const { start, end } = findBestConnectionPoints(sourceEndpoint, targetEndpoint);
      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      const arrowLength = 12;
      const arrowAngle = Math.PI / 6;
      const arrowOffset = 15;
      const arrowX = end.x - arrowOffset * Math.cos(angle);
      const arrowY = end.y - arrowOffset * Math.sin(angle);
      const arrowPoint1 = {
        x: arrowX - arrowLength * Math.cos(angle - arrowAngle),
        y: arrowY - arrowLength * Math.sin(angle - arrowAngle)
      };
      const arrowPoint2 = {
        x: arrowX - arrowLength * Math.cos(angle + arrowAngle),
        y: arrowY - arrowLength * Math.sin(angle + arrowAngle)
      };
      // Calcular posición del botón (punto medio de la línea)
      const midX = (start.x + end.x) / 2;
      const midY = (start.y + end.y) / 2;
      
      return (
        <g key={connection.id || `${connection.source}-${connection.target}` } className="connection-group">
          <line
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            stroke="#007bff"
            strokeWidth="3"
            cursor="pointer"
            onClick={() => handleConnectionClick(connection)}
            className="connection-line"
            style={{ pointerEvents: 'auto' }}
          />
          <line
            x1={arrowX}
            y1={arrowY}
            x2={arrowPoint1.x}
            y2={arrowPoint1.y}
            stroke="#007bff"
            strokeWidth="3"
          />
          <line
            x1={arrowX}
            y1={arrowY}
            x2={arrowPoint2.x}
            y2={arrowPoint2.y}
            stroke="#007bff"
            strokeWidth="3"
          />
          <circle
            cx={start.x}
            cy={start.y}
            r="4"
            fill="#007bff"
          />
          
          {/* Botón de extractores */}
          <circle
            cx={midX}
            cy={midY}
            r="12"
            fill="#ff6b6b"
            stroke="#fff"
            strokeWidth="2"
            cursor="pointer"
            onClick={(e) => handleExtractorButtonClick(e, connection)}
            style={{ pointerEvents: 'auto' }}
            className="extractor-button"
          />
          <text
            x={midX}
            y={midY + 4}
            textAnchor="middle"
            fontSize="12"
            fill="#fff"
            fontWeight="bold"
            cursor="pointer"
            onClick={(e) => handleExtractorButtonClick(e, connection)}
            style={{ pointerEvents: 'auto' }}
            className="extractor-button-text"
          >
            E
          </text>
          
          <line
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            stroke="transparent"
            strokeWidth="15"
            cursor="pointer"
            onClick={() => handleConnectionClick(connection)}
            className="connection-hitbox"
            style={{ pointerEvents: 'auto' }}
          />
        </g>
      );
    });
  };

  // Renderizar conexión en progreso
  const renderConnectionInProgress = () => {
    if (!connectionStart) return null;
    const sourceEndpoint = endpoints.find(ep => ep.id === connectionStart);
    if (!sourceEndpoint) return null;
    const sourcePoints = getEndpointConnectionPoints(sourceEndpoint);
    const start = sourcePoints.right;
    const end = {
      x: dragStart.x - (containerRef.current?.offsetLeft || 0),
      y: dragStart.y - (containerRef.current?.offsetTop || 0)
    };
    return (
      <g className="connection-in-progress">
        <line
          x1={start.x}
          y1={start.y}
          x2={end.x}
          y2={end.y}
          stroke="#28a745"
          strokeWidth="3"
          strokeDasharray="8,8"
        />
        <circle
          cx={start.x}
          cy={start.y}
          r="4"
          fill="#28a745"
        />
      </g>
    );
  };

  // Efecto para actualizar el tamaño del canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const updateCanvasSize = () => {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  // Efecto para manejar eventos globales del mouse
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (isDragging) {
        handleMouseMove(e);
      }
      if (isCreatingEndpoint) {
        handleCreateEndpointMove(e);
      }
    };

    const handleGlobalMouseUp = () => {
      handleMouseUp();
      handleCreateEndpointEnd();
    };

    if (isDragging || isCreatingEndpoint) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, isCreatingEndpoint, handleMouseMove, handleCreateEndpointMove, handleMouseUp, handleCreateEndpointEnd]);

  return (
    <div 
      className="flow-canvas" 
      ref={containerRef}
      style={{ cursor: isCreatingEndpoint ? 'crosshair' : 'default', position: 'relative' }}
    >
      {/* Área de drag and drop para crear endpoints */}
      <div 
        className="canvas-drop-area"
        onMouseDown={connectionModalOpen ? undefined : handleCreateEndpointStart}
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          zIndex: 0,
          pointerEvents: isCreatingEndpoint ? 'auto' : 'auto'
        }}
      />

      {/* SVG para conexiones */}
      <svg
        width={containerRef.current?.offsetWidth || 800}
        height={containerRef.current?.offsetHeight || 600}
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 1, pointerEvents: 'none' }}
      >
        {renderConnections()}
        {renderConnectionInProgress()}
      </svg>
      
      {/* Controles del flujo */}
      <div className="flow-controls">
        {/* Sección: Creación de Endpoints */}
        <div className="control-section">
          <h4 className="section-title">➕ Crear Endpoints</h4>
          <div className="control-buttons">
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              marginBottom: '8px'
            }}>
              <DraggableEndpoint onDragStart={handleDraggableEndpointDrop} />
              <div style={{ fontSize: '12px', color: '#666', maxWidth: '120px' }}>
                Arrastra el icono al canvas para crear un endpoint
              </div>
            </div>
            <button className="control-btn secondary-btn" onClick={onImportCurl}>
              <span className="btn-icon">📋</span>
              <span className="btn-text">Importar cURL</span>
            </button>
          </div>
        </div>

        {/* Sección: Ejecución */}
        <div className="control-section">
          <h4 className="section-title">▶️ Ejecución</h4>
          <div className="control-buttons">
            <button className="control-btn success-btn" onClick={onRunFlow}>
              <span className="btn-icon">▶️</span>
              <span className="btn-text">Ejecutar Flujo</span>
            </button>
            <button className="control-btn warning-btn" onClick={onTestFlow}>
              <span className="btn-icon">🧪</span>
              <span className="btn-text">Test Flow</span>
            </button>
          </div>
        </div>

        {/* Sección: Importar/Exportar */}
        <div className="control-section">
          <h4 className="section-title">💾 Gestión</h4>
          <div className="control-buttons">
            <button className="control-btn info-btn" onClick={onExportFlow}>
              <span className="btn-icon">💾</span>
              <span className="btn-text">Exportar</span>
            </button>
            <label className="control-btn info-btn file-input-label">
              <span className="btn-icon">📁</span>
              <span className="btn-text">Importar</span>
              <input
                type="file"
                accept=".json"
                onChange={onImportFlow}
                style={{ display: 'none' }}
              />
            </label>
            <button 
              className="control-btn danger-btn" 
              onClick={onClearAllEndpoints}
              title="Eliminar todos los endpoints manteniendo las variables"
            >
              <span className="btn-icon">🗑️</span>
              <span className="btn-text">Limpiar Endpoints</span>
            </button>
          </div>
        </div>

        {/* Sección: Debug */}
        <div className="control-section">
          <h4 className="section-title">🐛 Debug</h4>
          <div className="control-buttons">
            <button 
              className="control-btn debug-btn" 
              onClick={() => {
                console.log('=== DEBUG INFO ===');
                console.log('Endpoints:', endpoints);
                console.log('Connections:', connections);
                console.log('Flow Variables:', flowVariables);
                console.log('Extractors:', extractors);
              }}
            >
              <span className="btn-icon">🐛</span>
              <span className="btn-text">Debug Info</span>
            </button>
          </div>
        </div>
      </div>

      {/* Endpoints */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {(endpoints || []).map(endpoint => {
          // Verificar que el endpoint tenga posición válida
          if (!endpoint || !endpoint.position || typeof endpoint.position.x === 'undefined' || typeof endpoint.position.y === 'undefined') {
            console.warn('Endpoint sin posición válida:', endpoint);
            return null;
          }
          
          return (
            <div
              key={endpoint.id}
              ref={el => nodeRefs.current[endpoint.id] = el}
              style={{
                position: 'absolute',
                left: endpoint.position.x,
                top: endpoint.position.y,
                cursor: isDragging && draggedEndpoint === endpoint.id ? 'grabbing' : 'grab',
                transition: isDragging && draggedEndpoint === endpoint.id ? 'none' : 'all 0.1s ease',
                zIndex: isDragging && draggedEndpoint === endpoint.id ? 1000 : 2,
                transform: isDragging && draggedEndpoint === endpoint.id ? 'scale(1.02)' : 'scale(1)',
                filter: isDragging && draggedEndpoint === endpoint.id ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.2))' : 'none'
              }}
              onMouseDown={(e) => handleMouseDown(e, endpoint.id)}
              onMouseUp={() => handleConnectionEnd(endpoint.id)}
            >
              <EndpointNode
                endpoint={endpoint}
                isSelected={selectedEndpoint === endpoint.id}
                isConnectionSource={connectionStart === endpoint.id}
                onEdit={() => onEditEndpoint(endpoint)}
                onDelete={() => onDeleteEndpoint(endpoint.id)}
                onRun={() => onRunEndpoint(endpoint.id)}
                onConnectionStart={() => handleConnectionStart(endpoint.id)}
                onViewResponse={() => onViewResponse(endpoint)}
                onConfigureExtractors={() => onConfigureExtractors(endpoint)}
                connections={connections}
                flowVariables={flowVariables}
                extractors={extractors}
              />
            </div>
          );
        })}
      </div>

      {/* Endpoint en creación */}
      {isCreatingEndpoint && createEndpointData && createEndpointData.position && (
        <div
          style={{
            position: 'absolute',
            left: createEndpointData.position.x || 0,
            top: createEndpointData.position.y || 0,
            zIndex: 1001,
            opacity: 0.7
          }}
        >
          <div className="endpoint-node creating">
            <div className="endpoint-header">
              <span className="method-badge method-get">
                {createEndpointData.method}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                  {createEndpointData.name}
                </div>
                <div className="endpoint-url">
                  {createEndpointData.url}
                </div>
              </div>
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#007bff',
              fontWeight: 'bold',
              marginBottom: '0.5rem'
            }}>
              Soltando para crear...
            </div>
          </div>
        </div>
      )}

      {/* Instrucciones */}
      {endpoints.length === 0 && !isCreatingEndpoint && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: '#666',
          zIndex: 10
        }}>
          <h3>¡Bienvenido a Flows HTTP!</h3>
          <p>Arrastra el icono 🔗 desde la barra de herramientas al canvas</p>
          <p>O haz clic y arrastra en el canvas para crear un endpoint</p>
          <p>Arrastra los endpoints para conectarlos entre sí</p>
        </div>
      )}

      {/* Indicador de creación */}
      {isCreatingEndpoint && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#007bff',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          fontSize: '0.875rem',
          fontWeight: '500',
          zIndex: 1002,
          animation: 'fadeIn 0.3s ease-out'
        }}>
          🎯 Arrastra para posicionar el nuevo endpoint
        </div>
      )}

      {/* Modal de configuración de conexión */}
      <ConnectionModal
        isOpen={connectionModalOpen}
        onClose={handleCloseConnectionModal}
        sourceEndpoint={pendingConnection?.source}
        targetEndpoint={pendingConnection?.target}
        onSaveConnection={handleSaveConnection}
        flowVariables={flowVariables}
        extractors={extractors}
      />

      {/* Modal de extractor para conexión */}
      {extractorModalOpen && (
        <ExtractorModal
          endpoint={extractorConnection ? endpoints.find(ep => ep.id === extractorConnection.source) : null}
          extractors={extractorConnection && extractorConnection.extractors ? extractorConnection.extractors : []}
          onSave={handleSaveExtractor}
          onCancel={handleCloseExtractorModal}
        />
      )}
    </div>
  );
};

export default FlowCanvas; 