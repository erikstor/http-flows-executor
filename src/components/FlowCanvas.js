import React, { useState, useRef, useEffect, useCallback } from 'react';
import EndpointNode from './EndpointNode';

const FlowCanvas = ({
  endpoints,
  connections,
  selectedEndpoint,
  onSelectEndpoint,
  onAddEndpoint,
  onEditEndpoint,
  onDeleteEndpoint,
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
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // Función para manejar el inicio del arrastre
  const handleMouseDown = (e, endpointId) => {
    if (e.target.closest('.endpoint-actions')) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY
    });
    
    onSelectEndpoint(endpointId);
  };

  // Función para manejar el movimiento del mouse durante el arrastre
  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !selectedEndpoint) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    const endpoint = endpoints.find(ep => ep.id === selectedEndpoint);
    if (endpoint) {
      onUpdateEndpointPosition(selectedEndpoint, {
        x: endpoint.position.x + deltaX,
        y: endpoint.position.y + deltaY
      });
    }

    setDragStart({
      x: e.clientX,
      y: e.clientY
    });
  }, [isDragging, selectedEndpoint, dragStart, endpoints, onUpdateEndpointPosition]);

  // Función para manejar el fin del arrastre
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Función para iniciar una conexión
  const handleConnectionStart = (endpointId) => {
    setConnectionStart(endpointId);
  };

  // Función para completar una conexión
  const handleConnectionEnd = (endpointId) => {
    if (connectionStart && connectionStart !== endpointId) {
      onAddConnection(connectionStart, endpointId);
    }
    setConnectionStart(null);
  };

  // Función para dibujar las conexiones
  const drawConnections = useCallback((ctx) => {
    connections.forEach(connection => {
      const sourceEndpoint = endpoints.find(ep => ep.id === connection.source);
      const targetEndpoint = endpoints.find(ep => ep.id === connection.target);
      
      if (sourceEndpoint && targetEndpoint) {
        const startX = sourceEndpoint.position.x + 200; // Ancho del nodo
        const startY = sourceEndpoint.position.y + 50;  // Centro del nodo
        const endX = targetEndpoint.position.x;
        const endY = targetEndpoint.position.y + 50;
        
        // Dibujar línea
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = '#007bff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Dibujar flecha
        const angle = Math.atan2(endY - startY, endX - startX);
        const arrowLength = 10;
        const arrowAngle = Math.PI / 6;
        
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - arrowLength * Math.cos(angle - arrowAngle),
          endY - arrowLength * Math.sin(angle - arrowAngle)
        );
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - arrowLength * Math.cos(angle + arrowAngle),
          endY - arrowLength * Math.sin(angle + arrowAngle)
        );
        ctx.strokeStyle = '#007bff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
    
    // Dibujar conexión en progreso
    if (connectionStart) {
      const sourceEndpoint = endpoints.find(ep => ep.id === connectionStart);
      if (sourceEndpoint) {
        const startX = sourceEndpoint.position.x + 200;
        const startY = sourceEndpoint.position.y + 50;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(dragStart.x - containerRef.current.offsetLeft, dragStart.y - containerRef.current.offsetTop);
        ctx.strokeStyle = '#28a745';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }, [connections, connectionStart, dragStart, endpoints]);

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

  // Efecto para dibujar las conexiones cuando cambian
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawConnections(ctx);
  }, [drawConnections]);

  // Efecto para manejar eventos globales del mouse
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (isDragging) {
        handleMouseMove(e);
      }
    };

    const handleGlobalMouseUp = () => {
      handleMouseUp();
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, handleMouseMove]);

  return (
    <div className="flow-canvas" ref={containerRef}>
      <canvas
        ref={canvasRef}
        width={containerRef.current?.offsetWidth || 800}
        height={containerRef.current?.offsetHeight || 600}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 1
        }}
      />
      
      {/* Controles del flujo */}
      <div className="flow-controls">
        <button onClick={onAddEndpoint}>
          + Agregar Endpoint
        </button>
        <button onClick={onImportCurl}>
          📋 Importar cURL
        </button>
        <button onClick={onRunFlow}>
          ▶️ Ejecutar Flujo
        </button>
        <button onClick={onExportFlow}>
          💾 Exportar Flujo
        </button>
        <button onClick={() => {
          console.log('=== DEBUG INFO ===');
          console.log('Endpoints:', endpoints);
          console.log('Connections:', connections);
          console.log('Flow Variables:', flowVariables);
          console.log('Extractors:', extractors);
        }}>
          🐛 Debug
        </button>
        <button onClick={onTestFlow}>
          🧪 Test Flow
        </button>
        <label style={{
          display: 'inline-block',
          padding: '0.5rem 1rem',
          backgroundColor: '#17a2b8',
          color: 'white',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '0.875rem',
          margin: '0 0.25rem'
        }}>
          📁 Importar Flujo
          <input
            type="file"
            accept=".json"
            onChange={onImportFlow}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {/* Endpoints */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {endpoints.map(endpoint => (
          <div
            key={endpoint.id}
            style={{
              position: 'absolute',
              left: endpoint.position.x,
              top: endpoint.position.y,
              cursor: isDragging && selectedEndpoint === endpoint.id ? 'grabbing' : 'grab'
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
            />
          </div>
        ))}
      </div>

      {/* Instrucciones */}
      {endpoints.length === 0 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: '#666'
        }}>
          <h3>¡Bienvenido a Flows HTTP!</h3>
          <p>Haz clic en "Agregar Endpoint" para comenzar a crear tu flujo</p>
          <p>Arrastra los endpoints para conectarlos entre sí</p>
        </div>
      )}
    </div>
  );
};

export default FlowCanvas; 