const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8899;
const DATA_FILE = path.join(__dirname, 'endpoints.json');
const LOG_FILE = path.join(__dirname, 'logs.json');

let server = null;
let endpoints = [];
let requestLogs = [];
let serverRunning = false;

function loadEndpoints() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      endpoints = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    }
  } catch (e) {
    endpoints = [];
  }
}

function saveEndpoints() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(endpoints, null, 2));
}

function loadLogs() {
  try {
    if (fs.existsSync(LOG_FILE)) {
      requestLogs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'));
    }
  } catch (e) {
    requestLogs = [];
  }
}

function saveLogs() {
  fs.writeFileSync(LOG_FILE, JSON.stringify(requestLogs, null, 2));
}

function sendJSON(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

function sendSSE(res, data) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Access-Control-Allow-Origin': '*',
    'Connection': 'keep-alive'
  });
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function matchEndpoint(reqPath, method) {
  return endpoints.find(ep => {
    if (!ep.enabled) return false;
    const epParts = ep.path.split('/').filter(Boolean);
    const reqParts = reqPath.split('/').filter(Boolean);

    if (epParts.length !== reqParts.length) return false;
    if (ep.method !== method) return false;

    return epParts.every((part, i) =>
      part.startsWith(':') || part === reqParts[i]
    );
  });
}

function handleMockRequest(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const reqPath = parsedUrl.pathname;
  const method = req.method.toUpperCase();

  const endpoint = matchEndpoint(reqPath, method);

  if (endpoint) {
    const logEntry = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      method,
      path: reqPath,
      statusCode: endpoint.statusCode
    };
    requestLogs.unshift(logEntry);
    if (requestLogs.length > 100) requestLogs.pop();
    saveLogs();

    const delay = endpoint.delay || 0;
    setTimeout(() => {
      let responseData = endpoint.response;
      if (typeof responseData === 'string') {
        try {
          responseData = JSON.parse(responseData);
        } catch (e) {}
      }
      sendJSON(res, endpoint.statusCode, responseData);
    }, delay);
  } else {
    sendJSON(res, 404, { error: 'Endpoint not found', path: reqPath, method });
  }
}

function sendFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

function handleRequest(req, res) {
  const parsedUrl = url.parse(req.url);
  const pathname = parsedUrl.pathname;

  if (req.method === 'OPTIONS') {
    sendJSON(res, 200, {});
    return;
  }

  if (pathname === '/' || pathname === '/index.html') {
    sendFile(res, path.join(__dirname, 'frontend', 'index.html'), 'text/html');
    return;
  }
  
  if (pathname === '/style.css') {
    sendFile(res, path.join(__dirname, 'frontend', 'style.css'), 'text/css');
    return;
  }
  
  if (pathname === '/app.js') {
    sendFile(res, path.join(__dirname, 'frontend', 'app.js'), 'application/javascript');
    return;
  }

  if (pathname === '/api/endpoints') {
    if (req.method === 'GET') {
      sendJSON(res, 200, endpoints);
    } else if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        const data = JSON.parse(body);
        const endpoint = {
          id: generateId(),
          method: data.method || 'GET',
          path: data.path || '/',
          statusCode: data.statusCode || 200,
          delay: data.delay || 0,
          response: data.response || {},
          enabled: true,
          createdAt: new Date().toISOString()
        };
        endpoints.push(endpoint);
        saveEndpoints();
        sendJSON(res, 201, endpoint);
      });
    } else {
      sendJSON(res, 405, { error: 'Method not allowed' });
    }
  } else if (pathname.startsWith('/api/endpoints/') && req.method === 'PUT') {
    const id = pathname.split('/')[3];
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      const index = endpoints.findIndex(ep => ep.id === id);
      if (index !== -1) {
        endpoints[index] = { ...endpoints[index], ...data };
        saveEndpoints();
        sendJSON(res, 200, endpoints[index]);
      } else {
        sendJSON(res, 404, { error: 'Endpoint not found' });
      }
    });
  } else if (pathname.startsWith('/api/endpoints/') && req.method === 'DELETE') {
    const id = pathname.split('/')[3];
    const index = endpoints.findIndex(ep => ep.id === id);
    if (index !== -1) {
      endpoints.splice(index, 1);
      saveEndpoints();
      sendJSON(res, 200, { success: true });
    } else {
      sendJSON(res, 404, { error: 'Endpoint not found' });
    }
  } else if (pathname.startsWith('/api/endpoints/') && req.method === 'PATCH') {
    const id = pathname.split('/')[3];
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const index = endpoints.findIndex(ep => ep.id === id);
        if (index !== -1) {
          if (typeof data.enabled !== 'undefined') {
            endpoints[index].enabled = data.enabled;
            saveEndpoints();
            sendJSON(res, 200, { success: true, enabled: endpoints[index].enabled });
          } else {
            sendJSON(res, 400, { error: 'Missing enabled field' });
          }
        } else {
          sendJSON(res, 404, { error: 'Endpoint not found' });
        }
      } catch (e) {
        sendJSON(res, 400, { error: 'Invalid request body' });
      }
    });
  } else if (pathname === '/api/logs') {
    sendJSON(res, 200, requestLogs);
  } else if (pathname === '/api/logs/stream') {
    sendSSE(res, { type: 'init', logs: requestLogs });
  } else if (pathname === '/api/server/start') {
    if (!serverRunning) {
      startServer();
      sendJSON(res, 200, { running: true, port: PORT });
    } else {
      sendJSON(res, 200, { running: true, port: PORT });
    }
  } else if (pathname === '/api/server/stop') {
    if (serverRunning) {
      stopServer();
      sendJSON(res, 200, { running: false });
    } else {
      sendJSON(res, 200, { running: false });
    }
  } else if (pathname === '/api/server/status') {
    sendJSON(res, 200, { running: serverRunning, port: PORT });
  } else {
    handleMockRequest(req, res);
  }
}

function startServer() {
  if (server) return;

  server = http.createServer((req, res) => {
    handleRequest(req, res);
  });

  server.listen(PORT, () => {
    serverRunning = true;
    console.log(`Mock Server running on http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    serverRunning = false;
    console.error('Server error:', err);
  });
}

function stopServer(callback) {
  if (server) {
    server.close((err) => {
      server = null;
      serverRunning = false;
      console.log('Mock Server stopped');
      if (callback) callback(err);
    });
  } else {
    if (callback) callback(null);
  }
}

loadEndpoints();
loadLogs();
startServer();

process.on('SIGINT', () => {
  stopServer();
  process.exit();
});
