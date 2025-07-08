import jsonpath from 'jsonpath';

// Función para extraer variables de una respuesta JSON usando JSONPath
export const extractVariablesFromResponse = (responseData, extractors) => {
  const extractedVariables = {};
  
  if (!responseData || !extractors || extractors.length === 0) {
    return extractedVariables;
  }

  let jsonData;
  try {
    jsonData = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
  } catch (error) {
    console.warn('No se pudo parsear la respuesta como JSON:', error);
    return extractedVariables;
  }

  extractors.forEach(extractor => {
    try {
      if (!extractor.path || !extractor.variableName) {
        console.warn('Extractor inválido:', extractor);
        return;
      }

      const value = jsonpath.query(jsonData, extractor.path);
      
      if (value && value.length > 0) {
        const extractedValue = String(value[0]);
        
        // Validar que el valor no esté vacío
        if (extractedValue && extractedValue.trim() !== '') {
          extractedVariables[extractor.variableName] = {
            value: extractedValue,
            type: extractor.type || 'flow',
            path: extractor.path,
            extractedAt: new Date().toISOString()
          };
          
          console.log(`✅ Variable extraída: ${extractor.variableName} = ${extractedValue.substring(0, 50)}${extractedValue.length > 50 ? '...' : ''}`);
        } else {
          console.warn(`⚠️ Valor vacío para ${extractor.variableName} en path ${extractor.path}`);
        }
      } else {
        console.warn(`⚠️ No se encontró valor para ${extractor.variableName} en path ${extractor.path}`);
      }
    } catch (error) {
      console.error(`❌ Error extrayendo variable ${extractor.variableName}:`, error);
    }
  });

  return extractedVariables;
};

// Función para aplicar las variables extraídas
export const applyExtractedVariables = (
  extractedVariables,
  setGlobalVariables,
  setFlowVariables,
  setEndpointVariables,
  endpointId
) => {
  const globalUpdates = [];
  const flowUpdates = [];
  const endpointUpdates = [];

  Object.entries(extractedVariables).forEach(([variableName, variableData]) => {
    const newVariable = {
      id: generateId(),
      name: variableName,
      value: variableData.value,
      source: 'extracted',
      extractedAt: variableData.extractedAt,
      path: variableData.path
    };

    switch (variableData.type) {
      case 'global':
        globalUpdates.push(newVariable);
        break;
      case 'flow':
        flowUpdates.push(newVariable);
        break;
      case 'endpoint':
        if (endpointId) {
          endpointUpdates.push(newVariable);
        }
        break;
      default:
        flowUpdates.push(newVariable);
    }
  });

  // Aplicar actualizaciones
  if (globalUpdates.length > 0) {
    setGlobalVariables(prev => {
      const updated = [...prev];
      globalUpdates.forEach(update => {
        const existingIndex = updated.findIndex(v => v.name === update.name);
        if (existingIndex >= 0) {
          updated[existingIndex] = { ...updated[existingIndex], ...update };
        } else {
          updated.push(update);
        }
      });
      return updated;
    });
  }

  if (flowUpdates.length > 0) {
    setFlowVariables(prev => {
      const updated = [...prev];
      flowUpdates.forEach(update => {
        const existingIndex = updated.findIndex(v => v.name === update.name);
        if (existingIndex >= 0) {
          updated[existingIndex] = { ...updated[existingIndex], ...update };
        } else {
          updated.push(update);
        }
      });
      return updated;
    });
  }

  if (endpointUpdates.length > 0 && endpointId) {
    setEndpointVariables(prev => {
      const currentEndpointVars = prev[endpointId] || [];
      const updated = [...currentEndpointVars];
      endpointUpdates.forEach(update => {
        const existingIndex = updated.findIndex(v => v.name === update.name);
        if (existingIndex >= 0) {
          updated[existingIndex] = { ...updated[existingIndex], ...update };
        } else {
          updated.push(update);
        }
      });
      return { ...prev, [endpointId]: updated };
    });
  }

  // Mostrar resumen
  const totalExtracted = globalUpdates.length + flowUpdates.length + endpointUpdates.length;
  if (totalExtracted > 0) {
    console.log(`🎉 Se extrajeron ${totalExtracted} variables:`, {
      global: globalUpdates.length,
      flow: flowUpdates.length,
      endpoint: endpointUpdates.length
    });
  }
};

// Ejemplos de extractores comunes
export const commonExtractors = {
  accessToken: {
    path: '$.access_token',
    variableName: 'ACCESS_TOKEN',
    type: 'flow'
  },
  refreshToken: {
    path: '$.refresh_token',
    variableName: 'REFRESH_TOKEN',
    type: 'flow'
  },
  userId: {
    path: '$.user_id',
    variableName: 'USER_ID',
    type: 'flow'
  },
  sessionId: {
    path: '$.session_id',
    variableName: 'SESSION_ID',
    type: 'flow'
  },
  // Nuevos extractores comunes
  token: {
    path: '$.token',
    variableName: 'TOKEN',
    type: 'flow'
  },
  bearerToken: {
    path: '$.bearer_token',
    variableName: 'BEARER_TOKEN',
    type: 'flow'
  },
  apiKey: {
    path: '$.api_key',
    variableName: 'API_KEY',
    type: 'global'
  },
  userEmail: {
    path: '$.user.email',
    variableName: 'USER_EMAIL',
    type: 'flow'
  },
  userName: {
    path: '$.user.name',
    variableName: 'USER_NAME',
    type: 'flow'
  },
  organizationId: {
    path: '$.organization.id',
    variableName: 'ORG_ID',
    type: 'flow'
  },
  projectId: {
    path: '$.project.id',
    variableName: 'PROJECT_ID',
    type: 'flow'
  },
  totalCount: {
    path: '$.total_count',
    variableName: 'TOTAL_COUNT',
    type: 'flow'
  },
  pageNumber: {
    path: '$.page',
    variableName: 'PAGE_NUMBER',
    type: 'flow'
  },
  statusCode: {
    path: '$.status',
    variableName: 'STATUS_CODE',
    type: 'flow'
  },
  message: {
    path: '$.message',
    variableName: 'MESSAGE',
    type: 'flow'
  },
  errorCode: {
    path: '$.error.code',
    variableName: 'ERROR_CODE',
    type: 'flow'
  },
  requestId: {
    path: '$.request_id',
    variableName: 'REQUEST_ID',
    type: 'flow'
  },
  correlationId: {
    path: '$.correlation_id',
    variableName: 'CORRELATION_ID',
    type: 'flow'
  }
};

// Función para crear extractores personalizados
export const createExtractor = (path, variableName, type = 'flow') => ({
  path,
  variableName,
  type
});

// Función para generar ID único
const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
}; 