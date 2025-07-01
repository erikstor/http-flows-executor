// Configuración para manejo de CORS
export const corsConfig = {
  // Headers por defecto para peticiones
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/plain, */*',
    'X-Requested-With': 'XMLHttpRequest'
  },

  // Configuración de fetch por defecto
  fetchOptions: {
    mode: 'cors',
    credentials: 'omit',
    cache: 'no-cache'
  },

  // Dominios que requieren proxy en desarrollo
  proxyDomains: [
    'wally-billetera.dev.wally.tech'
  ],

  // Función para verificar si una URL necesita proxy
  needsProxy(url) {
    if (process.env.NODE_ENV !== 'development') return false;
    return this.proxyDomains.some(domain => url.includes(domain));
  },

  // Función para convertir URL a ruta relativa para proxy
  toProxyPath(url) {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname + urlObj.search + urlObj.hash;
      
      // Asegurar que la ruta comience con /walletuser si es necesario
      if (path.includes('/walletuser') && !path.startsWith('/walletuser')) {
        const walletUserIndex = path.indexOf('/walletuser');
        return path.substring(walletUserIndex);
      }
      
      return path;
    } catch (error) {
      console.warn('Error procesando URL para proxy:', error);
      return url;
    }
  },

  // Función para crear opciones de fetch con CORS
  createFetchOptions(method, headers = {}, body = null) {
    const finalHeaders = { ...this.defaultHeaders, ...headers };
    
    // Remover headers de CORS del cliente (deben venir del servidor)
    delete finalHeaders['Access-Control-Allow-Origin'];
    delete finalHeaders['Access-Control-Allow-Methods'];
    delete finalHeaders['Access-Control-Allow-Headers'];

    return {
      method,
      headers: finalHeaders,
      body,
      ...this.fetchOptions
    };
  },

  // Función para detectar si un error es de CORS
  isCorsError(error) {
    return error.message.includes('CORS') || 
           error.message.includes('Access-Control-Allow-Origin') ||
           error.message.includes('Failed to fetch') ||
           error.message.includes('NetworkError');
  },

  // Función para intentar petición con proxy automáticamente
  async fetchWithAutoProxy(url, options) {
    const originalUrl = url;
    let lastError = null;

    // Primer intento: URL original
    try {
      console.log('🌐 Intentando petición directa a:', url);
      const response = await fetch(url, options);
      console.log('✅ Petición directa exitosa:', response.status, response.statusText);
      return { response, usedProxy: false, originalUrl };
    } catch (error) {
      lastError = error;
      console.warn('❌ Petición directa falló:', error.message);
    }

    // Segundo intento: con proxy si es necesario
    if (this.isCorsError(lastError) && this.needsProxy(url)) {
      const proxyUrl = this.toProxyPath(url);
      try {
        console.log('🔄 Reintentando con proxy:', proxyUrl);
        console.log('📋 Opciones de fetch:', options);
        
        const response = await fetch(proxyUrl, options);
        console.log('✅ Petición con proxy exitosa:', response.status, response.statusText);
        console.log('📋 Headers de respuesta:', Object.fromEntries(response.headers.entries()));
        
        // Verificar si la respuesta es HTML (error del proxy)
        if (!this.isValidResponse(response)) {
          console.warn('⚠️ Respuesta HTML detectada - posible error del proxy');
          throw new Error('Proxy returned HTML instead of API response');
        }
        
        return { response, usedProxy: true, originalUrl, proxyUrl };
      } catch (proxyError) {
        console.error('❌ Petición con proxy también falló:', proxyError.message);
        lastError = proxyError;
      }
    }

    // Si llegamos aquí, ambos intentos fallaron
    throw {
      originalError: lastError,
      originalUrl,
      attemptedProxy: this.needsProxy(url),
      message: `Error CORS: No se pudo completar la petición a ${originalUrl}. ${lastError.message}`
    };
  },

  // Función para verificar si una respuesta es válida (no HTML de la app)
  isValidResponse(response) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      // Verificar si es el HTML de nuestra aplicación
      return false;
    }
    return true;
  },

  // Función para sugerir solución automática
  suggestSolution(error, url) {
    if (!this.isCorsError(error)) return null;

    const suggestions = [];

    if (this.needsProxy(url)) {
      suggestions.push({
        type: 'proxy',
        title: 'Usar Proxy de Desarrollo',
        description: 'Cambia la URL a ruta relativa para usar el proxy automático',
        action: 'change_url',
        newUrl: this.toProxyPath(url)
      });
    }

    suggestions.push({
      type: 'server',
      title: 'Configurar Servidor',
      description: 'Agregar headers CORS al servidor',
      action: 'configure_server',
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
      }
    });

    suggestions.push({
      type: 'external',
      title: 'Usar Proxy Externo',
      description: 'Usar un servicio de proxy CORS',
      action: 'use_external_proxy',
      services: ['cors-anywhere', 'allorigins.win', 'api.codetabs.com']
    });

    return suggestions;
  }
};

// Función para manejar errores CORS específicamente
export const handleCorsError = (error, url) => {
  let errorMessage = error.message;
  
  if (corsConfig.isCorsError(error)) {
    errorMessage = `Error CORS detectado para ${url}. `;
    errorMessage += `Posibles soluciones:\n`;
    errorMessage += `1. Verifica que el servidor permita peticiones desde tu origen\n`;
    errorMessage += `2. En desarrollo, usa rutas relativas (el proxy está configurado)\n`;
    errorMessage += `3. Verifica que el servidor responda con headers CORS apropiados\n`;
    errorMessage += `4. Si es una API externa, considera usar un proxy CORS`;
  }
  
  return errorMessage;
}; 