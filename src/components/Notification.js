import React, { useEffect, useState } from 'react';

const Notification = ({ 
  type = 'info', 
  message, 
  duration = 5000, 
  onClose, 
  isVisible = false 
}) => {
  const [isShowing, setIsShowing] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setIsShowing(true);
      
      if (duration > 0) {
        const timer = setTimeout(() => {
          setIsShowing(false);
          setTimeout(() => {
            if (onClose) onClose();
          }, 300); // Tiempo para la animación de salida
        }, duration);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return 'ℹ️';
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'success': return 'Éxito';
      case 'error': return 'Error';
      case 'warning': return 'Advertencia';
      case 'info': return 'Información';
      default: return 'Notificación';
    }
  };

  if (!isShowing) return null;

  return (
    <div className={`notification notification-${type} ${isShowing ? 'show' : 'hide'}`}>
      <div className="notification-content">
        <div className="notification-icon">
          {getIcon()}
        </div>
        <div className="notification-text">
          <div className="notification-title">{getTitle()}</div>
          <div className="notification-message">{message}</div>
        </div>
        <button 
          className="notification-close"
          onClick={() => {
            setIsShowing(false);
            setTimeout(() => {
              if (onClose) onClose();
            }, 300);
          }}
        >
          ✕
        </button>
      </div>
      {duration > 0 && (
        <div className="notification-progress">
          <div 
            className="notification-progress-bar"
            style={{
              animationDuration: `${duration}ms`
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Notification; 