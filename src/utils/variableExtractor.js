import jsonpath from 'jsonpath';

// Función para extraer variables de una respuesta JSON
export const extractVariablesFromResponse = (responseData, extractors) => {
  const extractedVariables = {};
  
  try {
    // Intentar parsear como JSON
    const jsonData = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
    
    extractors.forEach(extractor => {
      try {
        const { path, variableName, type = 'flow' } = extractor;
        
        // Usar JSONPath para extraer el valor
        const values = jsonpath.query(jsonData, path);
        
        if (values.length > 0) {
          const value = values[0];
          extractedVariables[variableName] = {
            value: value,
            type: type,
            source: path
          };
        }
      } catch (error) {
        console.warn(`Error extrayendo variable ${extractor.variableName}:`, error);
      }
    });
    
  } catch (error) {
    console.warn('Error parseando respuesta como JSON:', error);
  }
  
  return extractedVariables;
};

// Función para aplicar las variables extraídas
export const applyExtractedVariables = (extractedVariables, setGlobalVariables, setFlowVariables, setEndpointVariables, endpointId) => {
  Object.entries(extractedVariables).forEach(([variableName, variableData]) => {
    const { value, type } = variableData;
    
    const newVariable = {
      id: crypto.randomUUID(),
      name: variableName,
      value: String(value)
    };
    
    switch (type) {
      case 'global':
        setGlobalVariables(prev => {
          // Actualizar si ya existe, agregar si no
          const existingIndex = prev.findIndex(v => v.name === variableName);
          if (existingIndex >= 0) {
            return prev.map((v, index) => index === existingIndex ? newVariable : v);
          }
          return [...prev, newVariable];
        });
        break;
        
      case 'flow':
        setFlowVariables(prev => {
          const existingIndex = prev.findIndex(v => v.name === variableName);
          if (existingIndex >= 0) {
            return prev.map((v, index) => index === existingIndex ? newVariable : v);
          }
          return [...prev, newVariable];
        });
        break;
        
      case 'endpoint':
        if (endpointId) {
          setEndpointVariables(prev => ({
            ...prev,
            [endpointId]: [
              ...(prev[endpointId] || []),
              newVariable
            ]
          }));
        }
        break;
        
      default:
        break;
    }
  });
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
  }
};

// Función para crear extractores personalizados
export const createExtractor = (path, variableName, type = 'flow') => ({
  path,
  variableName,
  type
}); 