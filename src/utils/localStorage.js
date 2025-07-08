// Utilidades para persistencia local
const STORAGE_KEYS = {
  ENDPOINTS: 'http_flows_endpoints',
  CONNECTIONS: 'http_flows_connections',
  GLOBAL_VARIABLES: 'http_flows_global_variables',
  FLOW_VARIABLES: 'http_flows_flow_variables',
  ENDPOINT_VARIABLES: 'http_flows_endpoint_variables',
  EXTRACTORS: 'http_flows_extractors',
  LAST_EXECUTION: 'http_flows_last_execution',
  SETTINGS: 'http_flows_settings'
};

// Función para guardar datos en localStorage
export const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error al guardar en localStorage:', error);
    return false;
  }
};

// Función para cargar datos de localStorage
export const loadFromLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error al cargar de localStorage:', error);
    return defaultValue;
  }
};

// Función para guardar endpoints con sus respuestas
export const saveEndpoints = (endpoints) => {
  return saveToLocalStorage(STORAGE_KEYS.ENDPOINTS, endpoints);
};

// Función para cargar endpoints
export const loadEndpoints = () => {
  return loadFromLocalStorage(STORAGE_KEYS.ENDPOINTS, []);
};

// Función para guardar conexiones
export const saveConnections = (connections) => {
  return saveToLocalStorage(STORAGE_KEYS.CONNECTIONS, connections);
};

// Función para cargar conexiones
export const loadConnections = () => {
  return loadFromLocalStorage(STORAGE_KEYS.CONNECTIONS, []);
};

// Función para guardar variables globales
export const saveGlobalVariables = (variables) => {
  return saveToLocalStorage(STORAGE_KEYS.GLOBAL_VARIABLES, variables);
};

// Función para cargar variables globales
export const loadGlobalVariables = () => {
  return loadFromLocalStorage(STORAGE_KEYS.GLOBAL_VARIABLES, []);
};

// Función para guardar variables de flujo
export const saveFlowVariables = (variables) => {
  return saveToLocalStorage(STORAGE_KEYS.FLOW_VARIABLES, variables);
};

// Función para cargar variables de flujo
export const loadFlowVariables = () => {
  return loadFromLocalStorage(STORAGE_KEYS.FLOW_VARIABLES, []);
};

// Función para guardar variables de endpoint
export const saveEndpointVariables = (variables) => {
  return saveToLocalStorage(STORAGE_KEYS.ENDPOINT_VARIABLES, variables);
};

// Función para cargar variables de endpoint
export const loadEndpointVariables = () => {
  return loadFromLocalStorage(STORAGE_KEYS.ENDPOINT_VARIABLES, {});
};

// Función para guardar extractores
export const saveExtractors = (extractors) => {
  return saveToLocalStorage(STORAGE_KEYS.EXTRACTORS, extractors);
};

// Función para cargar extractores
export const loadExtractors = () => {
  return loadFromLocalStorage(STORAGE_KEYS.EXTRACTORS, {});
};

// Función para guardar información de la última ejecución
export const saveLastExecution = (executionInfo) => {
  return saveToLocalStorage(STORAGE_KEYS.LAST_EXECUTION, {
    ...executionInfo,
    timestamp: new Date().toISOString()
  });
};

// Función para cargar información de la última ejecución
export const loadLastExecution = () => {
  return loadFromLocalStorage(STORAGE_KEYS.LAST_EXECUTION, null);
};

// Función para guardar configuración
export const saveSettings = (settings) => {
  return saveToLocalStorage(STORAGE_KEYS.SETTINGS, settings);
};

// Función para cargar configuración
export const loadSettings = () => {
  return loadFromLocalStorage(STORAGE_KEYS.SETTINGS, {
    autoSave: true,
    showAnimations: true,
    theme: 'light'
  });
};

// Función para limpiar todos los datos
export const clearAllData = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};

// Función para exportar todos los datos
export const exportAllData = () => {
  const data = {};
  Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
    data[key] = loadFromLocalStorage(storageKey);
  });
  return data;
};

// Función para importar todos los datos
export const importAllData = (data) => {
  Object.entries(data).forEach(([key, value]) => {
    if (STORAGE_KEYS[key]) {
      saveToLocalStorage(STORAGE_KEYS[key], value);
    }
  });
}; 