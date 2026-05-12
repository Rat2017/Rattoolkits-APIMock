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
//写入端点数据到文件
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
//p匹配请求的HTTP方法，请求路径和端点列表中的端点对象，并返回匹配的端点对象
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
  // API endpoints
  if (pathname === '/api/endpoints') {
    //获取端点列表
    if (req.method === 'GET') {
      sendJSON(res, 200, endpoints);
    } else if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        const data = JSON.parse(body);
        //创建新的端点对象并添加到端点列表中
        const endpoint = {
          id: generateId(),
          method: data.method || 'GET',
          path: data.path || '/',
          statusCode: data.statusCode || 200,
          delay: data.delay || 0,
          response: data.response || {},
          label: data.label || '',
          enabled: true,
          createdAt: new Date().toISOString()
        };
        endpoints.push(endpoint);
        saveEndpoints();//将新的端点数据写入文件
        sendJSON(res, 201, endpoint);
      });
    } else {
      //不支持的HTTP方法
      sendJSON(res, 405, { error: 'Method not allowed' });
    }
  } else if (pathname.startsWith('/api/endpoints/') && req.method === 'PUT') {
    //更新指定ID的端点数据
    const id = pathname.split('/')[3];
    let body = '';
    //接收请求体数据并解析为JSON对象
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      //解析请求体数据并更新端点对象
      const data = JSON.parse(body);
      const index = endpoints.findIndex(ep => ep.id === id);
      if (index !== -1) {
        //更新端点数据
        endpoints[index] = { ...endpoints[index], ...data };
        saveEndpoints();
        sendJSON(res, 200, endpoints[index]);
      } else {
        sendJSON(res, 404, { error: 'Endpoint not found' });
      }
    });
  } else if (pathname.startsWith('/api/endpoints/') && req.method === 'DELETE') {
    //删除指定ID的端点数据
    const id = pathname.split('/')[3];
    const index = endpoints.findIndex(ep => ep.id === id);
    if (index !== -1) {
      //从端点列表中删除指定ID的端点对象
      endpoints.splice(index, 1);
      saveEndpoints();
      sendJSON(res, 200, { success: true });
    } else {
      sendJSON(res, 404, { error: 'Endpoint not found' });
    }
  } 
  //启用或禁用指定ID的端点
  else if (pathname.startsWith('/api/endpoints/') && req.method === 'PATCH') {
    const id = pathname.split('/')[3];
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        //解析请求体数据并更新端点的启用状态
        const data = JSON.parse(body);
        const index = endpoints.findIndex(ep => ep.id === id);
        //如果找到指定ID的端点对象，则更新其启用状态并保存到文件中
        if (index !== -1) {
          //如果请求体中包含enabled字段，则更新端点的启用状态并保存到文件中
          if (typeof data.enabled !== 'undefined') {
            endpoints[index].enabled = data.enabled;
            saveEndpoints();
            sendJSON(res, 200, { success: true, enabled: endpoints[index].enabled });
          } else {
            //如果请求体中不包含enabled字段，则返回400错误提示缺少enabled字段
            sendJSON(res, 400, { error: 'Missing enabled field' });
          }
        } else {
          //如果未找到指定ID的端点对象，则返回404错误提示端点未找到
          sendJSON(res, 404, { error: 'Endpoint not found' });
        }
      } catch (e) {
        //如果请求体数据无法解析为JSON对象，则返回400错误提示请求体无效
        sendJSON(res, 400, { error: 'Invalid request body' });
      }
    });
  } else if (pathname === '/api/logs') {
    //获取请求日志列表
    sendJSON(res, 200, requestLogs);
  } else if (pathname === '/api/logs/stream') {
    //使用Server-Sent Events（SSE）技术实现日志的实时推送功能
    sendSSE(res, { type: 'init', logs: requestLogs });
  } else if (pathname === '/api/server/start') {
    if (!serverRunning) {
      //如果服务器未运行，则调用startServer函数启动服务器并返回服务器状态和端口号
      startServerWithCallback((err) => {
        if (err) {
          sendJSON(res, 500, { running: false, error: err.message });
        } else {
          sendJSON(res, 200, { running: true, port: PORT });
        }
      });
    } else {
      //如果服务器已运行，则直接返回服务器状态和端口号
      sendJSON(res, 200, { running: true, port: PORT });
    }
  } else if (pathname === '/api/server/stop') {
    if (serverRunning) {
      //先更新状态，发送响应，然后停止服务器
      serverRunning = false;
      sendJSON(res, 200, { running: false });
      stopServer();
    } else {
      //如果服务器未运行，则直接返回服务器状态
      sendJSON(res, 200, { running: false });
    }
  } else if (pathname === '/api/server/status') {
    //返回服务器当前的运行状态和端口号
    sendJSON(res, 200, { running: serverRunning, port: PORT });
  } else {
    //处理模拟请求
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
    server = null;
    serverRunning = false;
    console.error('Server error:', err);
  });
}

function startServerWithCallback(callback) {
  if (server) {
    callback(null);
    return;
  }

  server = http.createServer((req, res) => {
    handleRequest(req, res);
  });

  server.listen(PORT, () => {
    serverRunning = true;
    console.log(`Mock Server running on http://localhost:${PORT}`);
    callback(null);
  });

  server.on('error', (err) => {
    server = null;
    serverRunning = false;
    console.error('Server error:', err);
    callback(err);
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
