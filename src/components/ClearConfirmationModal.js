import React from 'react';
import useEscapeKey from '../utils/useEscapeKey';

const ClearConfirmationModal = ({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  endpointsCount, 
  connectionsCount 
}) => {
  // Hook para cerrar modal con Escape
  useEscapeKey(onCancel);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '500px',
        width: '90%',
        margin: '0 16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#fef2f2',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '12px'
          }}>
            <span style={{ color: '#dc2626', fontSize: '20px' }}>⚠️</span>
          </div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#111827',
            margin: 0
          }}>
            Confirmar Limpieza
          </h2>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <p style={{
            color: '#374151',
            marginBottom: '12px',
            lineHeight: '1.5'
          }}>
            ¿Estás seguro de que quieres eliminar todos los endpoints?
          </p>
          
          <div style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <span style={{ color: '#d97706', marginRight: '8px' }}>📊</span>
              <span style={{
                fontWeight: '600',
                color: '#92400e'
              }}>
                Resumen de eliminación:
              </span>
            </div>
            <ul style={{
              fontSize: '14px',
              color: '#92400e',
              margin: 0,
              paddingLeft: '16px'
            }}>
              <li style={{ marginBottom: '4px' }}>• <strong>{endpointsCount}</strong> endpoint(s) eliminado(s)</li>
              <li style={{ marginBottom: '4px' }}>• <strong>{connectionsCount}</strong> conexión(es) eliminada(s)</li>
              <li style={{ marginBottom: '4px' }}>• Variables de endpoint eliminadas</li>
            </ul>
          </div>

          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <span style={{ color: '#16a34a', marginRight: '8px' }}>✅</span>
              <span style={{
                fontWeight: '600',
                color: '#166534'
              }}>
                Se mantendrán intactas:
              </span>
            </div>
            <ul style={{
              fontSize: '14px',
              color: '#166534',
              margin: 0,
              paddingLeft: '16px'
            }}>
              <li style={{ marginBottom: '4px' }}>• Variables globales</li>
              <li style={{ marginBottom: '4px' }}>• Variables de flujo</li>
              <li style={{ marginBottom: '4px' }}>• Configuración de la aplicación</li>
            </ul>
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              color: '#374151',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '14px',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#e5e7eb';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#f3f4f6';
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '8px 16px',
              color: 'white',
              backgroundColor: '#dc2626',
              border: '1px solid #dc2626',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '14px',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#b91c1c';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#dc2626';
            }}
          >
            Eliminar Todo
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClearConfirmationModal; 