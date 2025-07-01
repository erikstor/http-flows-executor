// Parser para convertir comandos cURL en objetos de petición HTTP
export const parseCurl = (curlCommand) => {
  try {
    // Limpiar el comando cURL
    let cleanCommand = curlCommand.trim();
    
    // Remover 'curl' del inicio si existe
    if (cleanCommand.startsWith('curl ')) {
      cleanCommand = cleanCommand.substring(5);
    }
    
    // Unir líneas que terminan en '\' (multilínea)
    cleanCommand = cleanCommand.replace(/\\\n/g, ' ');
    cleanCommand = cleanCommand.replace(/\\\r\n/g, ' ');
    
    // Ignorar opciones que no afectan la petición
    const ignoreOptions = ['--location', '-L'];
    
    // Variables para almacenar la información parseada
    let method = 'GET';
    let url = '';
    let headers = {};
    let body = '';
    
    // Expresión regular para dividir por espacios pero respetando comillas
    const regex = /(["'])(?:(?=(\\?))\2.)*?\1|[^\s]+/g;
    const parts = cleanCommand.match(regex) || [];
    let i = 0;
    let inDataRaw = false;
    let dataRawValue = '';
    
    while (i < parts.length) {
      let part = parts[i].trim();
      
      // Ignorar opciones como --location
      if (ignoreOptions.includes(part)) {
        i++;
        continue;
      }
      
      // Detectar método HTTP
      if (part === '-X' || part === '--request') {
        if (i + 1 < parts.length) {
          method = parts[i + 1].replace(/['"]/g, '').toUpperCase();
          i += 2;
          continue;
        }
      }
      
      // Detectar headers
      if (part === '-H' || part === '--header') {
        if (i + 1 < parts.length) {
          const headerValue = parts[i + 1].replace(/^['"]|['"]$/g, '');
          const colonIndex = headerValue.indexOf(':');
          if (colonIndex > 0) {
            const key = headerValue.substring(0, colonIndex).trim();
            const value = headerValue.substring(colonIndex + 1).trim();
            headers[key] = value;
          }
          i += 2;
          continue;
        }
      }
      
      // Detectar body (soporte multilínea)
      if (part === '-d' || part === '--data' || part === '--data-raw') {
        if (i + 1 < parts.length) {
          inDataRaw = true;
          dataRawValue = parts[i + 1];
          i += 2;
          // Si el valor empieza con comilla simple o doble y no termina igual, unir líneas
          let quote = dataRawValue[0];
          if ((quote === '"' || quote === "'") && !dataRawValue.endsWith(quote)) {
            while (i < parts.length && !parts[i].endsWith(quote)) {
              dataRawValue += '\n' + parts[i];
              i++;
            }
            if (i < parts.length) {
              dataRawValue += '\n' + parts[i];
              i++;
            }
          }
          // Quitar comillas externas
          dataRawValue = dataRawValue.replace(/^['"]|['"]$/g, '');
          body = dataRawValue;
          inDataRaw = false;
          continue;
        }
      }
      
      // Detectar body con archivo
      if (part === '--data-binary' || part === '--data-urlencode') {
        if (i + 1 < parts.length) {
          body = parts[i + 1].replace(/^['"]|['"]$/g, '');
          i += 2;
          continue;
        }
      }
      
      // Detectar URL (si no es una opción, es la URL)
      if (!part.startsWith('-') && !url) {
        url = part.replace(/^['"]|['"]$/g, '');
        i++;
        continue;
      }
      
      i++;
    }
    
    // Validar que tenemos una URL
    if (!url) {
      throw new Error('No se encontró una URL válida en el comando cURL');
    }
    
    // Si es POST/PUT/PATCH y no hay Content-Type, agregar uno por defecto
    if ((method === 'POST' || method === 'PUT' || method === 'PATCH') && 
        body && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    
    // Si hay body y el método es GET, cambiar a POST (comportamiento estándar de cURL)
    if (body && method === 'GET') {
      method = 'POST';
    }
    
    return {
      method,
      url,
      headers: Object.keys(headers).length > 0 ? JSON.stringify(headers, null, 2) : '{}',
      body: body || ''
    };
    
  } catch (error) {
    throw new Error(`Error al parsear el comando cURL: ${error.message}`);
  }
};

// Función para detectar si un texto es un comando cURL
export const isCurlCommand = (text) => {
  const trimmed = text.trim();
  return trimmed.startsWith('curl') || 
         (trimmed.includes('http') && (trimmed.includes('-H') || trimmed.includes('--header') || trimmed.includes('-X') || trimmed.includes('--request')));
};

// Función para generar un nombre sugerido basado en la URL
export const generateEndpointName = (url) => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(part => part);
    if (pathParts.length > 0) {
      return pathParts[pathParts.length - 1].charAt(0).toUpperCase() + 
             pathParts[pathParts.length - 1].slice(1);
    }
    return 'Nuevo Endpoint';
  } catch {
    return 'Nuevo Endpoint';
  }
}; 