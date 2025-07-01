import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import FlowCanvas from './components/FlowCanvas';
import EndpointModal from './components/EndpointModal';
import VariableModal from './components/VariableModal';
import ResponseModal from './components/ResponseModal';
import CurlImportModal from './components/CurlImportModal';
import ExtractorModal from './components/ExtractorModal';
import CorsInfoModal from './components/CorsInfoModal';
import RetryNotification from './components/RetryNotification';
import RequestDebugger from './components/RequestDebugger';
import { v4 as uuidv4 } from 'uuid';
import { extractVariablesFromResponse, applyExtractedVariables, commonExtractors } from './utils/variableExtractor';
import { corsConfig } from './utils/corsConfig';

function App() {
  // Estado global de la aplicación
  const [endpoints, setEndpoints] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);
  const [showEndpointModal, setShowEndpointModal] = useState(false);
  const [showVariableModal, setShowVariableModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showCurlImportModal, setShowCurlImportModal] = useState(false);
  const [showExtractorModal, setShowExtractorModal] = useState(false);
  const [showCorsInfoModal, setShowCorsInfoModal] = useState(false);
  const [corsInfoUrl, setCorsInfoUrl] = useState('');
  const [corsSuggestions, setCorsSuggestions] = useState([]);
  const [lastFailedEndpoint, setLastFailedEndpoint] = useState(null);
  const [showRetryNotification, setShowRetryNotification] = useState(false);
  const [retryMessage, setRetryMessage] = useState('');
  const [showRequestDebugger, setShowRequestDebugger] = useState(false);
  const [requestDebugInfo, setRequestDebugInfo] = useState({});
  const [editingEndpoint, setEditingEndpoint] = useState(null);
  const [editingVariable, setEditingVariable] = useState(null);
  const [viewingResponse, setViewingResponse] = useState(null);
  const [variableType, setVariableType] = useState('global');
  const [extractors, setExtractors] = useState({});
  
  // Variables de diferentes niveles
  const [globalVariables, setGlobalVariables] = useState([
    { id: uuidv4(), name: 'BASE_URL', value: 'https://api.example.com' },
    { id: uuidv4(), name: 'API_KEY', value: 'your-api-key-here' }
  ]);
  const [flowVariables, setFlowVariables] = useState([
    { id: uuidv4(), name: 'USER_ID', value: '12345' }
  ]);
  const [endpointVariables, setEndpointVariables] = useState({});

  // Función para procesar variables en texto
  const processVariables = (text, endpointId = null) => {
    if (!text) return text;
    
    let processedText = text;
    let replacements = [];
    
    // Procesar variables globales
    globalVariables.forEach(variable => {
      const regex = new RegExp(`\\{\\{${variable.name}\\}\\}`, 'g');
      if (regex.test(processedText)) {
      processedText = processedText.replace(regex, variable.value);
        replacements.push(`Global: {{${variable.name}}} → ${variable.value.substring(0, 20)}...`);
      }
    });
    
    // Procesar variables de flujo
    flowVariables.forEach(variable => {
      const regex = new RegExp(`\\{\\{${variable.name}\\}\\}`, 'g');
      if (regex.test(processedText)) {
      processedText = processedText.replace(regex, variable.value);
        replacements.push(`Flow: {{${variable.name}}} → ${variable.value.substring(0, 20)}...`);
      }
    });
    
    // Procesar variables de endpoint específico
    if (endpointId && endpointVariables[endpointId]) {
      endpointVariables[endpointId].forEach(variable => {
        const regex = new RegExp(`\\{\\{${variable.name}\\}\\}`, 'g');
        if (regex.test(processedText)) {
        processedText = processedText.replace(regex, variable.value);
          replacements.push(`Endpoint: {{${variable.name}}} → ${variable.value.substring(0, 20)}...`);
        }
      });
    }
    
    if (replacements.length > 0) {
      console.log('Variables procesadas:', replacements);
    }
    
    return processedText;
  };

  // Función para agregar un nuevo endpoint
  const addEndpoint = (endpointData) => {
    const newEndpoint = {
      id: uuidv4(),
      ...endpointData,
      position: { x: Math.random() * 400 + 50, y: Math.random() * 300 + 50 },
      response: null,
      status: 'idle'
    };
    
    setEndpoints(prev => [...prev, newEndpoint]);
    
    // Inicializar variables de endpoint si no existen
    if (!endpointVariables[newEndpoint.id]) {
      setEndpointVariables(prev => ({
        ...prev,
        [newEndpoint.id]: []
      }));
    }
  };

  // Función para actualizar un endpoint
  const updateEndpoint = (id, data) => {
    setEndpoints(prev => 
      prev.map(endpoint => 
        endpoint.id === id ? { ...endpoint, ...data } : endpoint
      )
    );
  };

  // Función para eliminar un endpoint
  const deleteEndpoint = (id) => {
    setEndpoints(prev => prev.filter(endpoint => endpoint.id !== id));
    setConnections(prev => prev.filter(conn => 
      conn.source !== id && conn.target !== id
    ));
    
    // Eliminar variables de endpoint
    const newEndpointVariables = { ...endpointVariables };
    delete newEndpointVariables[id];
    setEndpointVariables(newEndpointVariables);
  };

  // Función para agregar una variable
  const addVariable = (variableData) => {
    const newVariable = { id: uuidv4(), ...variableData };
    
    switch (variableType) {
      case 'global':
        setGlobalVariables(prev => [...prev, newVariable]);
        break;
      case 'flow':
        setFlowVariables(prev => [...prev, newVariable]);
        break;
      case 'endpoint':
        if (selectedEndpoint) {
          setEndpointVariables(prev => ({
            ...prev,
            [selectedEndpoint]: [...(prev[selectedEndpoint] || []), newVariable]
          }));
        }
        break;
      default:
        break;
    }
  };

  // Función para actualizar una variable
  const updateVariable = (id, data) => {
    switch (variableType) {
      case 'global':
        setGlobalVariables(prev => 
          prev.map(variable => 
            variable.id === id ? { ...variable, ...data } : variable
          )
        );
        break;
      case 'flow':
        setFlowVariables(prev => 
          prev.map(variable => 
            variable.id === id ? { ...variable, ...data } : variable
          )
        );
        break;
      case 'endpoint':
        if (selectedEndpoint) {
          setEndpointVariables(prev => ({
            ...prev,
            [selectedEndpoint]: prev[selectedEndpoint].map(variable =>
              variable.id === id ? { ...variable, ...data } : variable
            )
          }));
        }
        break;
      default:
        break;
    }
  };

  // Función para eliminar una variable
  const deleteVariable = (id) => {
    switch (variableType) {
      case 'global':
        setGlobalVariables(prev => prev.filter(variable => variable.id !== id));
        break;
      case 'flow':
        setFlowVariables(prev => prev.filter(variable => variable.id !== id));
        break;
      case 'endpoint':
        if (selectedEndpoint) {
          setEndpointVariables(prev => ({
            ...prev,
            [selectedEndpoint]: prev[selectedEndpoint].filter(variable => variable.id !== id)
          }));
        }
        break;
      default:
        break;
    }
  };

  // Función para agregar una conexión
  const addConnection = (sourceId, targetId) => {
    const newConnection = {
      id: uuidv4(),
      source: sourceId,
      target: targetId
    };
    setConnections(prev => [...prev, newConnection]);
  };

  // Función para eliminar una conexión
  const deleteConnection = (id) => {
    setConnections(prev => prev.filter(conn => conn.id !== id));
  };

  // Función para agregar un extractor a un endpoint
  const addExtractor = (endpointId, extractor) => {
    setExtractors(prev => ({
      ...prev,
      [endpointId]: [...(prev[endpointId] || []), extractor]
    }));
  };

  // Función para eliminar un extractor
  const deleteExtractor = (endpointId, extractorIndex) => {
    setExtractors(prev => ({
      ...prev,
      [endpointId]: prev[endpointId]?.filter((_, index) => index !== extractorIndex) || []
    }));
  };

  // Función para actualizar un extractor
  const updateExtractor = (endpointId, extractorIndex, extractor) => {
    setExtractors(prev => ({
      ...prev,
      [endpointId]: prev[endpointId]?.map((ext, index) => 
        index === extractorIndex ? extractor : ext
      ) || []
    }));
  };

  // Función para manejar extractores (agregar, actualizar, eliminar)
  const handleExtractorAction = (endpointId, index, extractor) => {
    if (extractor === null) {
      // Eliminar extractor
      deleteExtractor(endpointId, index);
    } else {
      // Agregar o actualizar extractor
      if (index < (extractors[endpointId] || []).length) {
        updateExtractor(endpointId, index, extractor);
      } else {
        addExtractor(endpointId, extractor);
      }
    }
  };

  // Función para exportar el flujo completo
  const exportFlow = () => {
    const flowData = {
      version: '1.0.0',
      name: 'Flujo HTTP',
      description: 'Flujo exportado desde Flows HTTP',
      createdAt: new Date().toISOString(),
      endpoints: endpoints.map(endpoint => ({
        ...endpoint,
        // Remover propiedades que no necesitamos exportar
        response: null,
        status: 'idle'
      })),
      connections,
      globalVariables,
      flowVariables,
      extractors
    };

    const jsonString = JSON.stringify(flowData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `flow-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Flujo exportado correctamente');
  };

  // Función para importar un flujo
  const importFlow = (file) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const flowData = JSON.parse(e.target.result);
        
        // Validar que sea un flujo válido
        if (!flowData.endpoints || !Array.isArray(flowData.endpoints)) {
          throw new Error('Formato de flujo inválido');
        }
        
        // Limpiar estado actual
        setEndpoints([]);
        setConnections([]);
        setGlobalVariables([]);
        setFlowVariables([]);
        setEndpointVariables({});
        setExtractors({});
        
        // Cargar datos del flujo
        if (flowData.endpoints) {
          setEndpoints(flowData.endpoints.map(endpoint => ({
            ...endpoint,
            response: null,
            status: 'idle'
          })));
        }
        
        if (flowData.connections) {
          setConnections(flowData.connections);
        }
        
        if (flowData.globalVariables) {
          setGlobalVariables(flowData.globalVariables);
        }
        
        if (flowData.flowVariables) {
          setFlowVariables(flowData.flowVariables);
        }
        
        if (flowData.extractors) {
          setExtractors(flowData.extractors);
        }
        
        alert('Flujo importado correctamente');
        
      } catch (error) {
        console.error('Error importando flujo:', error);
        alert(`Error importando flujo: ${error.message}`);
      }
    };
    
    reader.readAsText(file);
  };

  // Función para manejar la selección de archivo
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      importFlow(file);
    }
    // Limpiar el input para permitir cargar el mismo archivo
    event.target.value = '';
  };

  // Función de prueba para verificar el flujo
  const testFlow = async () => {
    console.log('🧪 Iniciando prueba de flujo...');
    
    if (endpoints.length === 0) {
      console.log('No hay endpoints para probar');
      return;
    }
    
    const executionOrder = getExecutionOrder();
    console.log('Orden de ejecución para prueba:', executionOrder);
    
    // Ejecutar solo el primer endpoint para probar
    if (executionOrder.length > 0) {
      const firstEndpointId = executionOrder[0];
      console.log(`Probando primer endpoint: ${firstEndpointId}`);
      
      await runEndpoint(firstEndpointId);
      
      // Verificar estado después de 2 segundos
      setTimeout(() => {
        const endpoint = endpoints.find(ep => ep.id === firstEndpointId);
        console.log('Estado del endpoint después de 2 segundos:', endpoint);
      }, 2000);
    }
  };

  // Función para ejecutar un endpoint
  const runEndpoint = async (endpointId) => {
    const endpoint = endpoints.find(ep => ep.id === endpointId);
    if (!endpoint) return;

    // Actualizar estado a ejecutando
    updateEndpoint(endpointId, { status: 'running' });

    // Procesar URL y headers con variables (fuera del try para que esté disponible en catch)
    const processedUrl = processVariables(endpoint.url, endpointId);
    let processedHeaders = {};
    let processedBody = null;

    try {
      // Procesar headers y body con variables
      processedHeaders = endpoint.headers ? 
        JSON.parse(processVariables(endpoint.headers, endpointId)) : {};
      processedBody = endpoint.body ? 
        processVariables(endpoint.body, endpointId) : null;

      console.log(`Realizando petición a: ${processedUrl}`);
      console.log(`Método: ${endpoint.method}`);
      console.log(`Headers:`, processedHeaders);

      // Realizar la petición HTTP con manejo automático de CORS
      const { response, usedProxy, proxyUrl } = await corsConfig.fetchWithAutoProxy(processedUrl, {
        method: endpoint.method,
        headers: processedHeaders,
        body: processedBody
      });

      // Mostrar información sobre el proxy si se usó
      if (usedProxy) {
        console.log(`✅ Petición exitosa usando proxy: ${proxyUrl}`);
      }

      // Capturar información de debug
      const debugInfo = {
        request: {
          url: processedUrl,
          method: endpoint.method,
          headers: processedHeaders,
          body: processedBody,
          usedProxy,
          proxyUrl
        },
        response: {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          contentType: response.headers.get('content-type')
        }
      };

      const responseData = await response.text();
      
      console.log(`Respuesta recibida: ${response.status} ${response.statusText}`);
      
      // Actualizar información de debug con los datos de respuesta
      debugInfo.response.data = responseData;
      debugInfo.response.size = responseData.length;
      
      // Verificar si la respuesta es HTML (error del proxy)
      if (responseData.includes('<!DOCTYPE html>') || responseData.includes('<title>Flows HTTP</title>')) {
        console.warn('⚠️ Respuesta HTML detectada - posible error del proxy');
        setRequestDebugInfo(debugInfo);
        setShowRequestDebugger(true);
      }
      
      // Actualizar endpoint con la respuesta
      updateEndpoint(endpointId, {
        response: {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
          headers: Object.fromEntries(response.headers.entries())
        },
        status: response.ok ? 'completed' : 'error'
      });

      // Extraer variables de la respuesta si hay extractores configurados
      if (response.ok && responseData) {
        const endpointExtractors = extractors[endpointId] || [];
        
        // Agregar extractores automáticos para tokens comunes
        const autoExtractors = [];
        if (responseData.includes('access_token')) {
          autoExtractors.push(commonExtractors.accessToken);
        }
        if (responseData.includes('refresh_token')) {
          autoExtractors.push(commonExtractors.refreshToken);
        }
        
        const allExtractors = [...endpointExtractors, ...autoExtractors];
        
        if (allExtractors.length > 0) {
          const extractedVariables = extractVariablesFromResponse(responseData, allExtractors);
          
          if (Object.keys(extractedVariables).length > 0) {
            applyExtractedVariables(
              extractedVariables,
              setGlobalVariables,
              setFlowVariables,
              setEndpointVariables,
              endpointId
            );
            
            console.log('Variables extraídas:', extractedVariables);
          }
        }
      }

    } catch (error) {
      console.error(`Error en endpoint ${endpointId}:`, error);
      
      // Verificar si es un error CORS y mostrar sugerencias automáticas
      if (corsConfig.isCorsError(error)) {
        const suggestions = corsConfig.suggestSolution(error, processedUrl);
        setCorsInfoUrl(processedUrl);
        setCorsSuggestions(suggestions || []);
        setLastFailedEndpoint(endpointId);
        setShowCorsInfoModal(true);
        
        // Si hay sugerencias automáticas, mostrarlas en la consola
        if (suggestions) {
          console.log('🔧 Sugerencias automáticas para resolver CORS:');
          suggestions.forEach((suggestion, index) => {
            console.log(`${index + 1}. ${suggestion.title}: ${suggestion.description}`);
          });
        }
      }
      
      updateEndpoint(endpointId, {
        response: {
          status: 0,
          statusText: 'Error',
          data: error.message,
          headers: {}
        },
        status: 'error'
      });
    }
  };

  // Función para ejecutar todo el flujo
  const runFlow = async () => {
    if (endpoints.length === 0) {
      alert('No hay endpoints para ejecutar');
      return;
    }

    // Ejecutar endpoints en orden de conexiones
    const executionOrder = getExecutionOrder();
    
    console.log('=== INICIANDO EJECUCIÓN DEL FLUJO ===');
    console.log('Orden de ejecución:', executionOrder);
    console.log('Total de endpoints a ejecutar:', executionOrder.length);
    console.log('Variables de flujo disponibles:', flowVariables.map(v => `${v.name}: ${v.value.substring(0, 20)}...`));
    
    let executedCount = 0;
    let failedEndpoint = null;
    
    for (let i = 0; i < executionOrder.length; i++) {
      const endpointId = executionOrder[i];
      const endpoint = endpoints.find(ep => ep.id === endpointId);
      
      if (!endpoint) {
        console.warn(`Endpoint ${endpointId} no encontrado, saltando...`);
        continue;
      }
      
      console.log(`\n--- Ejecutando endpoint ${i + 1}/${executionOrder.length}: ${endpoint.name || endpointId} ---`);
      console.log(`URL: ${endpoint.url}`);
      console.log(`Método: ${endpoint.method}`);
      
      try {
        console.log(`🚀 Iniciando ejecución de: ${endpoint.name || endpointId}`);
        
        // Ejecutar el endpoint
      await runEndpoint(endpointId);
        executedCount++;
        
        // Esperar un momento para que se actualice el estado
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Verificar el estado del endpoint después de la ejecución
        const updatedEndpoint = endpoints.find(ep => ep.id === endpointId);
        console.log(`📊 Estado del endpoint después de ejecución:`, {
          id: endpointId,
          name: updatedEndpoint?.name,
          status: updatedEndpoint?.status,
          hasResponse: !!updatedEndpoint?.response,
          responseStatus: updatedEndpoint?.response?.status
        });
        
        // Verificar si el endpoint falló
        if (updatedEndpoint?.status === 'error') {
          failedEndpoint = endpoint;
          console.error(`❌ Endpoint falló: ${endpoint.name || endpointId}`);
          console.error(`   Estado: ${updatedEndpoint?.status}`);
          console.error(`   Respuesta:`, updatedEndpoint?.response);
          break; // Detener en el primer fallo
        }
        
        console.log(`✅ Endpoint completado exitosamente: ${endpoint.name || endpointId}`);
        console.log(`   Status HTTP: ${updatedEndpoint?.response?.status}`);
        
        // Mostrar variables actualizadas después de la extracción
        const updatedFlowVariables = flowVariables.map(v => `${v.name}: ${v.value.substring(0, 20)}...`);
        console.log('📝 Variables de flujo actualizadas:', updatedFlowVariables);
        
        // Pequeña pausa entre requests para evitar sobrecarga
        if (i < executionOrder.length - 1) {
          console.log('⏳ Esperando 1 segundo antes del siguiente endpoint...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        console.error(`❌ Error ejecutando endpoint ${endpointId}:`, error);
        console.error(`   Stack trace:`, error.stack);
        failedEndpoint = endpoint;
        break; // Detener en el primer error
      }
    }
    
    console.log('\n=== RESUMEN DE EJECUCIÓN ===');
    if (failedEndpoint) {
      console.error('❌ Flujo detenido por fallo en:', failedEndpoint.name || failedEndpoint.id);
      alert(`Flujo detenido: Fallo en endpoint "${failedEndpoint.name || failedEndpoint.id}"`);
    } else {
      console.log('✅ Flujo completado exitosamente');
      console.log(`📊 Endpoints procesados: ${executedCount}/${executionOrder.length}`);
      alert(`Flujo ejecutado correctamente: ${executedCount} endpoints procesados`);
    }
  };

  // Función para aplicar solución CORS
  const applyCorsSolution = async (suggestion) => {
    if (!lastFailedEndpoint) return;

    const endpoint = endpoints.find(ep => ep.id === lastFailedEndpoint);
    if (!endpoint) return;

    console.log(`🔧 Aplicando solución CORS: ${suggestion.title}`);

    try {
      switch (suggestion.action) {
        case 'change_url':
          // Cambiar la URL del endpoint a la sugerida
          updateEndpoint(lastFailedEndpoint, {
            url: suggestion.newUrl
          });
          console.log(`✅ URL actualizada a: ${suggestion.newUrl}`);
          
          // Mostrar notificación de éxito
          alert(`✅ URL actualizada automáticamente a: ${suggestion.newUrl}`);
          break;

        case 'configure_server':
          // Marcar como configurado (el usuario debe configurar el servidor manualmente)
          console.log('⚠️ El usuario debe configurar el servidor con los headers mostrados');
          
          // Copiar headers al portapapeles si es posible
          const headersText = Object.entries(suggestion.headers)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
          
          try {
            await navigator.clipboard.writeText(headersText);
            alert('📋 Headers copiados al portapapeles. Configúralos en tu servidor y luego reintenta.');
          } catch (e) {
            alert('⚠️ Copia manualmente los headers mostrados y configúralos en tu servidor.');
          }
          break;

        case 'use_external_proxy':
          // Cambiar URL para usar proxy externo
          const proxyUrl = `https://cors-anywhere.herokuapp.com/${endpoint.url}`;
          updateEndpoint(lastFailedEndpoint, {
            url: proxyUrl
          });
          console.log(`✅ URL actualizada para usar proxy externo: ${proxyUrl}`);
          
          alert(`✅ URL actualizada para usar proxy externo: ${proxyUrl}`);
          break;

        default:
          console.warn('Tipo de solución no reconocido:', suggestion.action);
          alert('❌ Tipo de solución no reconocido');
      }
    } catch (error) {
      console.error('Error aplicando solución CORS:', error);
      alert('❌ Error aplicando la solución. Inténtalo manualmente.');
    }
  };

  // Función para reintentar el endpoint que falló
  const retryFailedEndpoint = async () => {
    if (!lastFailedEndpoint) return;

    const endpoint = endpoints.find(ep => ep.id === lastFailedEndpoint);
    if (!endpoint) return;

    console.log(`🔄 Reintentando endpoint: ${endpoint.name || lastFailedEndpoint}`);
    
    // Mostrar notificación de reintento
    setRetryMessage(`Reintentando: ${endpoint.name || lastFailedEndpoint}`);
    setShowRetryNotification(true);
    
    // Cerrar el modal
    setShowCorsInfoModal(false);
    setCorsInfoUrl('');
    setCorsSuggestions([]);
    
    // Esperar un momento para que se cierre el modal
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      // Reintentar el endpoint
      await runEndpoint(lastFailedEndpoint);
      
      // Mostrar resultado
      const updatedEndpoint = endpoints.find(ep => ep.id === lastFailedEndpoint);
      if (updatedEndpoint?.status === 'completed') {
        alert(`✅ Petición exitosa después de aplicar la solución CORS!`);
      } else {
        alert(`❌ La petición aún falla. Revisa la configuración.`);
      }
    } catch (error) {
      console.error('Error en reintento:', error);
      alert(`❌ Error durante el reintento: ${error.message}`);
    } finally {
      // Ocultar notificación
      setShowRetryNotification(false);
      setRetryMessage('');
      
      // Limpiar el endpoint fallido
      setLastFailedEndpoint(null);
    }
  };

  // Función para obtener el orden de ejecución basado en conexiones
  const getExecutionOrder = () => {
    console.log('🔍 Calculando orden de ejecución...');
    console.log('Endpoints disponibles:', endpoints.map(ep => `${ep.name} (${ep.id})`));
    console.log('Conexiones:', connections.map(conn => `${conn.source} → ${conn.target}`));
    
    // Crear un grafo de dependencias
    const graph = {};
    const inDegree = {};
    
    // Inicializar
    endpoints.forEach(endpoint => {
      graph[endpoint.id] = [];
      inDegree[endpoint.id] = 0;
    });
    
    // Construir el grafo
    connections.forEach(connection => {
      graph[connection.source].push(connection.target);
      inDegree[connection.target]++;
    });
    
    console.log('Grafo de dependencias:', graph);
    console.log('Grados de entrada:', inDegree);
    
    // Topological sort usando Kahn's algorithm
    const queue = [];
    const order = [];
    
    // Agregar nodos sin dependencias a la cola
    Object.keys(inDegree).forEach(nodeId => {
      if (inDegree[nodeId] === 0) {
        queue.push(nodeId);
      }
    });
    
    console.log('Nodos iniciales (sin dependencias):', queue);
    
    while (queue.length > 0) {
      const current = queue.shift();
      order.push(current);
      
      // Reducir el grado de entrada de los nodos dependientes
      graph[current].forEach(dependent => {
        inDegree[dependent]--;
        if (inDegree[dependent] === 0) {
          queue.push(dependent);
        }
      });
    }
    
    // Si hay nodos restantes, agregarlos al final
    const remainingNodes = Object.keys(inDegree).filter(nodeId => inDegree[nodeId] > 0);
    if (remainingNodes.length > 0) {
      console.log('⚠️ Nodos restantes (ciclos o nodos aislados):', remainingNodes);
      order.push(...remainingNodes);
    }
    
    console.log('📋 Orden de ejecución calculado:', order);
    return order;
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Flows HTTP - Constructor de Flujos de API</h1>
      </header>
      
      <main className="main-content">
        <Sidebar
          globalVariables={globalVariables}
          flowVariables={flowVariables}
          endpointVariables={endpointVariables}
          selectedEndpoint={selectedEndpoint}
          onAddVariable={() => {
            setVariableType('global');
            setEditingVariable(null);
            setShowVariableModal(true);
          }}
          onAddFlowVariable={() => {
            setVariableType('flow');
            setEditingVariable(null);
            setShowVariableModal(true);
          }}
          onAddEndpointVariable={() => {
            if (selectedEndpoint) {
              setVariableType('endpoint');
              setEditingVariable(null);
              setShowVariableModal(true);
            }
          }}
          onEditVariable={(variable, type) => {
            setVariableType(type);
            setEditingVariable(variable);
            setShowVariableModal(true);
          }}
          onDeleteVariable={deleteVariable}
          onUpdateVariable={updateVariable}
          onShowCorsInfo={() => {
            setCorsInfoUrl('https://wally-billetera.dev.wally.tech/walletuser/v1');
            setShowCorsInfoModal(true);
          }}
        />
        
        <FlowCanvas
          endpoints={endpoints}
          connections={connections}
          selectedEndpoint={selectedEndpoint}
          onSelectEndpoint={setSelectedEndpoint}
          onAddEndpoint={() => {
            setEditingEndpoint(null);
            setShowEndpointModal(true);
          }}
          onEditEndpoint={(endpoint) => {
            setEditingEndpoint(endpoint);
            setShowEndpointModal(true);
          }}
          onDeleteEndpoint={deleteEndpoint}
          onRunEndpoint={runEndpoint}
          onRunFlow={runFlow}
          onAddConnection={addConnection}
          onDeleteConnection={deleteConnection}
          onUpdateEndpointPosition={(id, position) => {
            updateEndpoint(id, { position });
          }}
          onViewResponse={(endpoint) => {
            setViewingResponse(endpoint);
            setShowResponseModal(true);
          }}
          onConfigureExtractors={(endpoint) => {
            setSelectedEndpoint(endpoint.id);
            setShowExtractorModal(true);
          }}
          onExportFlow={exportFlow}
          onImportFlow={handleFileSelect}
          onImportCurl={() => {
            setShowCurlImportModal(true);
          }}
          flowVariables={flowVariables}
          extractors={extractors}
          onTestFlow={testFlow}
        />
      </main>

      {showEndpointModal && (
        <EndpointModal
          endpoint={editingEndpoint}
          onSave={(data) => {
            if (editingEndpoint) {
              updateEndpoint(editingEndpoint.id, data);
            } else {
              addEndpoint(data);
            }
            setShowEndpointModal(false);
            setEditingEndpoint(null);
          }}
          onCancel={() => {
            setShowEndpointModal(false);
            setEditingEndpoint(null);
          }}
        />
      )}

      {showVariableModal && (
        <VariableModal
          variable={editingVariable}
          type={variableType}
          onSave={(data) => {
            if (editingVariable) {
              updateVariable(editingVariable.id, data);
            } else {
              addVariable(data);
            }
            setShowVariableModal(false);
            setEditingVariable(null);
          }}
          onCancel={() => {
            setShowVariableModal(false);
            setEditingVariable(null);
          }}
        />
      )}

      {showResponseModal && (
        <ResponseModal
          endpoint={viewingResponse}
          onClose={() => {
            setShowResponseModal(false);
            setViewingResponse(null);
          }}
        />
      )}

      {showCurlImportModal && (
        <CurlImportModal
          onImport={(data) => {
            addEndpoint(data);
            setShowCurlImportModal(false);
          }}
          onCancel={() => {
            setShowCurlImportModal(false);
          }}
        />
      )}

      {showExtractorModal && selectedEndpoint && (
        <ExtractorModal
          endpoint={endpoints.find(ep => ep.id === selectedEndpoint)}
          extractors={extractors[selectedEndpoint] || []}
          onSave={(index, extractor) => {
            handleExtractorAction(selectedEndpoint, index, extractor);
          }}
          onCancel={() => {
            setShowExtractorModal(false);
          }}
        />
      )}

      {showCorsInfoModal && (
        <CorsInfoModal
          isOpen={showCorsInfoModal}
          url={corsInfoUrl}
          suggestions={corsSuggestions}
          onApplySolution={applyCorsSolution}
          onRetry={retryFailedEndpoint}
          onClose={() => {
            setShowCorsInfoModal(false);
            setCorsInfoUrl('');
            setCorsSuggestions([]);
            setLastFailedEndpoint(null);
          }}
        />
      )}

      <RetryNotification
        isVisible={showRetryNotification}
        message={retryMessage}
        onComplete={() => {
          setShowRetryNotification(false);
          setRetryMessage('');
        }}
      />

      <RequestDebugger
        isOpen={showRequestDebugger}
        requestInfo={requestDebugInfo.request}
        responseInfo={requestDebugInfo.response}
        onClose={() => {
          setShowRequestDebugger(false);
          setRequestDebugInfo({});
        }}
      />
    </div>
  );
}

export default App; 