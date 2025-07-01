import { corsConfig, handleCorsError } from './corsConfig.js';

// Ejecutor de flujos HTTP para uso externo
export class FlowExecutor {
  constructor(flowData) {
    this.flowData = flowData;
    this.variables = {
      global: {},
      flow: {},
      endpoint: {}
    };
    this.results = [];
  }

  // Inicializar variables
  initializeVariables() {
    // Cargar variables globales
    if (this.flowData.globalVariables) {
      this.flowData.globalVariables.forEach(variable => {
        this.variables.global[variable.name] = variable.value;
      });
    }

    // Cargar variables de flujo
    if (this.flowData.flowVariables) {
      this.flowData.flowVariables.forEach(variable => {
        this.variables.flow[variable.name] = variable.value;
      });
    }

    // Cargar variables de endpoint
    if (this.flowData.endpointVariables) {
      Object.entries(this.flowData.endpointVariables).forEach(([endpointId, variables]) => {
        this.variables.endpoint[endpointId] = {};
        variables.forEach(variable => {
          this.variables.endpoint[endpointId][variable.name] = variable.value;
        });
      });
    }
  }

  // Procesar variables en texto
  processVariables(text, endpointId = null) {
    if (!text) return text;
    
    let processedText = text;
    
    // Procesar variables globales
    Object.entries(this.variables.global).forEach(([name, value]) => {
      const regex = new RegExp(`\\{\\{${name}\\}\\}`, 'g');
      processedText = processedText.replace(regex, value);
    });
    
    // Procesar variables de flujo
    Object.entries(this.variables.flow).forEach(([name, value]) => {
      const regex = new RegExp(`\\{\\{${name}\\}\\}`, 'g');
      processedText = processedText.replace(regex, value);
    });
    
    // Procesar variables de endpoint específico
    if (endpointId && this.variables.endpoint[endpointId]) {
      Object.entries(this.variables.endpoint[endpointId]).forEach(([name, value]) => {
        const regex = new RegExp(`\\{\\{${name}\\}\\}`, 'g');
        processedText = processedText.replace(regex, value);
      });
    }
    
    return processedText;
  }

  // Procesar URL para usar proxy en desarrollo
  processUrlForProxy(url) {
    if (corsConfig.needsProxy(url)) {
      return corsConfig.toProxyPath(url);
    }
    return url;
  }

  // Extraer variables de respuesta
  extractVariablesFromResponse(responseData, endpointId) {
    const endpointExtractors = this.flowData.extractors?.[endpointId] || [];
    
    if (endpointExtractors.length === 0) return;

    try {
      const jsonData = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
      
      endpointExtractors.forEach(extractor => {
        try {
          // Usar JSONPath para extraer el valor
          const values = this.queryJsonPath(jsonData, extractor.path);
          
          if (values.length > 0) {
            const value = values[0];
            
            // Asignar a la variable correspondiente
            switch (extractor.type) {
              case 'global':
                this.variables.global[extractor.variableName] = String(value);
                break;
              case 'flow':
                this.variables.flow[extractor.variableName] = String(value);
                break;
              case 'endpoint':
                if (!this.variables.endpoint[endpointId]) {
                  this.variables.endpoint[endpointId] = {};
                }
                this.variables.endpoint[endpointId][extractor.variableName] = String(value);
                break;
            }
          }
        } catch (error) {
          console.warn(`Error extrayendo variable ${extractor.variableName}:`, error);
        }
      });
    } catch (error) {
      console.warn('Error parseando respuesta como JSON:', error);
    }
  }

  // Implementación simple de JSONPath para uso externo
  queryJsonPath(obj, path) {
    try {
      // Implementación básica de JSONPath
      if (path === '$') return [obj];
      if (path.startsWith('$.')) {
        const keys = path.substring(2).split('.');
        let current = obj;
        
        for (const key of keys) {
          if (current && typeof current === 'object' && key in current) {
            current = current[key];
          } else {
            return [];
          }
        }
        
        return [current];
      }
      return [];
    } catch (error) {
      return [];
    }
  }

  // Obtener orden de ejecución
  getExecutionOrder() {
    const visited = new Set();
    const order = [];
    
    const dfs = (nodeId) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      // Encontrar conexiones donde este nodo es el target
      const incomingConnections = this.flowData.connections.filter(conn => conn.target === nodeId);
      for (const conn of incomingConnections) {
        dfs(conn.source);
      }
      
      order.push(nodeId);
    };
    
    // Encontrar nodos sin dependencias (fuentes)
    const allNodes = new Set(this.flowData.endpoints.map(ep => ep.id));
    const targetNodes = new Set(this.flowData.connections.map(conn => conn.target));
    const sourceNodes = [...allNodes].filter(node => !targetNodes.has(node));
    
    // Si no hay nodos fuente, usar todos los nodos
    const startNodes = sourceNodes.length > 0 ? sourceNodes : [...allNodes];
    
    for (const nodeId of startNodes) {
      dfs(nodeId);
    }
    
    return order;
  }

  // Ejecutar un endpoint
  async executeEndpoint(endpoint) {
    try {
      // Procesar URL y headers con variables
      let processedUrl = this.processVariables(endpoint.url, endpoint.id);
      let processedHeaders = endpoint.headers ? 
        JSON.parse(this.processVariables(endpoint.headers, endpoint.id)) : {};
      
      // Usar configuración de CORS
      processedHeaders = { ...processedHeaders };
      
      const processedBody = endpoint.body ? 
        this.processVariables(endpoint.body, endpoint.id) : null;

      console.log(`Ejecutando ${endpoint.method} a: ${processedUrl}`);
      console.log('Headers:', processedHeaders);
      if (processedBody) console.log('Body:', processedBody);

      // Realizar la petición HTTP con manejo automático de CORS
      const fetchOptions = corsConfig.createFetchOptions(
        endpoint.method, 
        processedHeaders, 
        processedBody
      );
      
      const { response, usedProxy, proxyUrl } = await corsConfig.fetchWithAutoProxy(processedUrl, fetchOptions);

      const responseData = await response.text();
      
      const result = {
        endpointId: endpoint.id,
        endpointName: endpoint.name,
        status: response.status,
        statusText: response.statusText,
        data: responseData,
        headers: Object.fromEntries(response.headers.entries()),
        success: response.ok,
        usedProxy: usedProxy,
        proxyUrl: proxyUrl
      };

      // Mostrar información sobre el proxy si se usó
      if (usedProxy) {
        console.log(`✅ Petición exitosa usando proxy: ${proxyUrl}`);
      }

      // Extraer variables si la respuesta fue exitosa
      if (response.ok && responseData) {
        this.extractVariablesFromResponse(responseData, endpoint.id);
      }

      this.results.push(result);
      return result;

    } catch (error) {
      console.error(`Error ejecutando endpoint ${endpoint.name}:`, error);
      
      // Manejo específico de errores CORS con sugerencias automáticas
      const originalUrl = this.processVariables(endpoint.url, endpoint.id);
      const errorMessage = handleCorsError(error, originalUrl);
      
      // Obtener sugerencias automáticas si es un error CORS
      const suggestions = corsConfig.suggestSolution(error, originalUrl);
      
      const result = {
        endpointId: endpoint.id,
        endpointName: endpoint.name,
        status: 0,
        statusText: 'Error',
        data: errorMessage,
        headers: {},
        success: false,
        error: error,
        suggestions: suggestions
      };

      this.results.push(result);
      return result;
    }
  }

  // Ejecutar todo el flujo
  async execute() {
    console.log('Iniciando ejecución del flujo...');
    
    this.initializeVariables();
    this.results = [];
    
    const executionOrder = this.getExecutionOrder();
    console.log('Orden de ejecución:', executionOrder);
    
    for (const endpointId of executionOrder) {
      const endpoint = this.flowData.endpoints.find(ep => ep.id === endpointId);
      if (!endpoint) continue;
      
      console.log(`Ejecutando endpoint: ${endpoint.name || endpointId}`);
      const result = await this.executeEndpoint(endpoint);
      
      console.log(`Resultado: ${result.success ? 'Éxito' : 'Error'} - ${result.status}`);
      
      // Pausa entre requests
      if (executionOrder.indexOf(endpointId) < executionOrder.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('Flujo completado');
    return {
      success: this.results.every(r => r.success),
      results: this.results,
      variables: this.variables
    };
  }

  // Obtener variables actuales
  getVariables() {
    return this.variables;
  }

  // Obtener resultados
  getResults() {
    return this.results;
  }
}

// Función de conveniencia para ejecutar un flujo desde un archivo JSON
export const executeFlowFromFile = async (flowData) => {
  const executor = new FlowExecutor(flowData);
  return await executor.execute();
}; 