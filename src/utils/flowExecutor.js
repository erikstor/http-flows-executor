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

  // Extraer variables de conexión
  extractConnectionVariables(responseData, sourceEndpointId, targetEndpointId) {
    const connection = this.flowData.connections.find(conn => 
      conn.source === sourceEndpointId && conn.target === targetEndpointId
    );

    if (!connection || !connection.config || !connection.config.extractors) {
      return;
    }

    try {
      let data = responseData;
      
      // Parsear JSON si es string
      if (typeof responseData === 'string') {
        try {
          data = JSON.parse(responseData);
        } catch (error) {
          console.warn('Error parseando respuesta como JSON para extractores de conexión:', error);
          return;
        }
      }

      connection.config.extractors.forEach(extractor => {
        try {
          let value = null;

          switch (extractor.type) {
            case 'json':
              if (extractor.selector) {
                const values = this.queryJsonPath(data, extractor.selector);
                value = values.length > 0 ? values[0] : null;
              }
              break;
            case 'header':
              // Para headers necesitaríamos acceso a la respuesta HTTP completa
              // Por ahora, asumimos que los headers están en data.headers
              if (data.headers && extractor.selector) {
                value = data.headers[extractor.selector];
              }
              break;
            case 'status':
              // Para status code necesitaríamos acceso a la respuesta HTTP completa
              // Por ahora, asumimos que está en data.status
              if (data.status) {
                value = data.status;
              }
              break;
          }

          if (value !== null && value !== undefined) {
            // Asignar a variables de flujo por defecto
            this.variables.flow[extractor.variableName] = String(value);
            console.log(`Extractor de conexión: ${extractor.variableName} = ${value}`);
          }
        } catch (error) {
          console.warn(`Error en extractor de conexión ${extractor.variableName}:`, error);
        }
      });
    } catch (error) {
      console.warn('Error procesando extractores de conexión:', error);
    }
  }

  // Aplicar transformaciones de datos según la configuración de conexión
  applyConnectionTransformations(sourceEndpointId, targetEndpointId, endpointData) {
    const connection = this.flowData.connections.find(conn => 
      conn.source === sourceEndpointId && conn.target === targetEndpointId
    );

    if (!connection || !connection.config || !connection.config.dataMapping) {
      return endpointData;
    }

    const transformedData = { ...endpointData };
    
    connection.config.dataMapping.forEach(mapping => {
      if (!mapping.source || !mapping.target) return;

      let sourceValue = null;

      // Obtener el valor fuente
      if (mapping.source.startsWith('var:')) {
        const varName = mapping.source.substring(4);
        sourceValue = this.variables.flow[varName] || this.variables.global[varName];
      } else if (mapping.source.startsWith('ext:')) {
        const extName = mapping.source.substring(4);
        // Buscar en variables extraídas del endpoint fuente
        sourceValue = this.variables.endpoint[sourceEndpointId]?.[extName];
      }

      if (sourceValue !== null && sourceValue !== undefined) {
        // Aplicar transformación
        let transformedValue = sourceValue;
        
        switch (mapping.transformation) {
          case 'string':
            transformedValue = String(sourceValue);
            break;
          case 'number':
            transformedValue = Number(sourceValue);
            break;
          case 'boolean':
            transformedValue = Boolean(sourceValue);
            break;
          case 'json':
            try {
              transformedValue = JSON.parse(sourceValue);
            } catch {
              transformedValue = sourceValue;
            }
            break;
          default:
            transformedValue = sourceValue;
        }

        // Aplicar al endpoint destino
        if (mapping.target.includes('.')) {
          // Mapeo anidado (ej: headers.Authorization)
          const keys = mapping.target.split('.');
          let current = transformedData;
          
          for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
              current[keys[i]] = {};
            }
            current = current[keys[i]];
          }
          
          current[keys[keys.length - 1]] = transformedValue;
        } else {
          // Mapeo directo
          transformedData[mapping.target] = transformedValue;
        }
      }
    });

    return transformedData;
  }

  // Verificar condiciones de conexión
  checkConnectionConditions(sourceEndpointId, targetEndpointId) {
    const connection = this.flowData.connections.find(conn => 
      conn.source === sourceEndpointId && conn.target === targetEndpointId
    );

    if (!connection || !connection.config || !connection.config.conditions) {
      return { shouldExecute: true, action: 'continue' };
    }

    for (const condition of connection.config.conditions) {
      if (!condition.variable || !condition.operator) continue;

      const variableValue = this.variables.flow[condition.variable] || 
                           this.variables.global[condition.variable] ||
                           this.variables.endpoint[sourceEndpointId]?.[condition.variable];

      let conditionMet = false;

      switch (condition.operator) {
        case 'equals':
          conditionMet = variableValue === condition.value;
          break;
        case 'not_equals':
          conditionMet = variableValue !== condition.value;
          break;
        case 'contains':
          conditionMet = String(variableValue).includes(condition.value);
          break;
        case 'greater_than':
          conditionMet = Number(variableValue) > Number(condition.value);
          break;
        case 'less_than':
          conditionMet = Number(variableValue) < Number(condition.value);
          break;
        case 'exists':
          conditionMet = variableValue !== null && variableValue !== undefined;
          break;
        case 'not_exists':
          conditionMet = variableValue === null || variableValue === undefined;
          break;
      }

      if (!conditionMet) {
        return { shouldExecute: false, action: condition.action || 'skip' };
      }
    }

    return { shouldExecute: true, action: 'continue' };
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
  async executeEndpoint(endpoint, sourceEndpointId = null) {
    try {
      // Verificar condiciones de conexión si hay un endpoint fuente
      if (sourceEndpointId) {
        const conditionCheck = this.checkConnectionConditions(sourceEndpointId, endpoint.id);
        if (!conditionCheck.shouldExecute) {
          console.log(`⏭️ Saltando endpoint ${endpoint.name} debido a condiciones no cumplidas`);
          if (conditionCheck.action === 'stop') {
            console.log('🛑 Deteniendo ejecución del flujo');
            return { skipped: true, action: 'stop' };
          }
          return { skipped: true, action: 'skip' };
        }
      }

      // Procesar URL y headers con variables
      let processedUrl = this.processVariables(endpoint.url, endpoint.id);
      let processedHeaders = endpoint.headers ? 
        JSON.parse(this.processVariables(endpoint.headers, endpoint.id)) : {};
      
      // Usar configuración de CORS
      processedHeaders = { ...processedHeaders };
      
      let processedBody = endpoint.body ? 
        this.processVariables(endpoint.body, endpoint.id) : null;

      // Aplicar transformaciones de conexión si hay un endpoint fuente
      if (sourceEndpointId) {
        const transformedData = this.applyConnectionTransformations(sourceEndpointId, endpoint.id, {
          url: processedUrl,
          headers: processedHeaders,
          body: processedBody
        });
        
        processedUrl = transformedData.url;
        processedHeaders = transformedData.headers;
        processedBody = transformedData.body;
        
        console.log(`🔄 Aplicadas transformaciones de conexión desde ${sourceEndpointId} a ${endpoint.id}`);
      }

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
        
        // Procesar extractores de conexión si hay un endpoint fuente
        if (sourceEndpointId) {
          this.extractConnectionVariables(responseData, sourceEndpointId, endpoint.id);
        }
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
    
    for (let i = 0; i < executionOrder.length; i++) {
      const endpointId = executionOrder[i];
      const endpoint = this.flowData.endpoints.find(ep => ep.id === endpointId);
      if (!endpoint) continue;
      
      // Encontrar el endpoint fuente si existe
      const incomingConnection = this.flowData.connections.find(conn => conn.target === endpointId);
      const sourceEndpointId = incomingConnection ? incomingConnection.source : null;
      
      console.log(`Ejecutando endpoint: ${endpoint.name || endpointId}`);
      if (sourceEndpointId) {
        const sourceEndpoint = this.flowData.endpoints.find(ep => ep.id === sourceEndpointId);
        console.log(`📤 Conectado desde: ${sourceEndpoint?.name || sourceEndpointId}`);
      }
      
      const result = await this.executeEndpoint(endpoint, sourceEndpointId);
      
      // Verificar si el endpoint fue saltado o si se debe detener el flujo
      if (result.skipped) {
        if (result.action === 'stop') {
          console.log('🛑 Deteniendo ejecución del flujo');
          break;
        }
        console.log(`⏭️ Endpoint ${endpoint.name} saltado`);
        continue;
      }
      
      console.log(`Resultado: ${result.success ? 'Éxito' : 'Error'} - ${result.status}`);
      
      // Pausa entre requests
      if (i < executionOrder.length - 1) {
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