import React, { useState } from 'react';

const DraggableEndpoint = ({ onDragStart }) => {
  // eslint-disable-next-line no-unused-vars
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    
    // Crear un elemento fantasma para el arrastre
    const ghostElement = document.createElement('div');
    ghostElement.innerHTML = `
      <div style="
        background: #007bff;
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        pointer-events: none;
        position: fixed;
        z-index: 10000;
        opacity: 0.8;
      ">
        🔗 Nuevo Endpoint
      </div>
    `;
    ghostElement.style.position = 'fixed';
    ghostElement.style.top = '-1000px';
    ghostElement.style.left = '-1000px';
    ghostElement.style.pointerEvents = 'none';
    ghostElement.style.zIndex = '10000';
    document.body.appendChild(ghostElement);

    // Configurar el evento de arrastre
    const handleMouseMove = (e) => {
      if (ghostElement) {
        ghostElement.style.left = e.clientX + 10 + 'px';
        ghostElement.style.top = e.clientY + 10 + 'px';
      }
    };

    const handleMouseUp = (e) => {
      setIsDragging(false);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = '';
      
      // Remover el elemento fantasma
      if (ghostElement && ghostElement.parentNode) {
        ghostElement.parentNode.removeChild(ghostElement);
      }
      
      // Remover event listeners
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Llamar al callback con la posición donde se soltó
      if (onDragStart) {
        console.log('DraggableEndpoint: calling onDragStart', e);
        onDragStart(e);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Cambiar el cursor
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  };

  return (
    <div 
      className="draggable-endpoint"
      onMouseDown={handleMouseDown}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '60px',
        height: '60px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        cursor: 'grab',
        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
        transition: 'all 0.2s ease',
        border: '2px solid transparent',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
      }}
      title="Arrastra para crear un nuevo endpoint"
    >
      <div style={{
        fontSize: '24px',
        color: 'white',
        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
      }}>
        🔗
      </div>
      
      {/* Efecto de brillo */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
        transform: 'rotate(45deg)',
        transition: 'transform 0.3s ease',
        pointerEvents: 'none'
      }} />
      
      {/* Tooltip */}
      <div style={{
        position: 'absolute',
        bottom: '-40px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#333',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '10px',
        whiteSpace: 'nowrap',
        opacity: 0,
        transition: 'opacity 0.2s ease',
        pointerEvents: 'none',
        zIndex: 1000
      }}>
        Arrastra para crear
      </div>
    </div>
  );
};

export default DraggableEndpoint; 