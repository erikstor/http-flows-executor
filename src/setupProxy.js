const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/walletuser',
    createProxyMiddleware({
      target: 'https://wally-billetera.dev.wally.tech',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      onProxyReq: (proxyReq, req, res) => {
        console.log('🔄 Proxy request:', req.method, req.url);
        console.log('🎯 Target:', proxyReq.path);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log('✅ Proxy response:', proxyRes.statusCode, req.url);
        console.log('📋 Response headers:', proxyRes.headers);
      },
      onError: (err, req, res) => {
        console.error('❌ Proxy error:', err.message);
        res.writeHead(500, {
          'Content-Type': 'application/json',
        });
        res.end(JSON.stringify({ error: 'Proxy error', message: err.message }));
      }
    })
  );
}; 