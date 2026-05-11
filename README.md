Rattoolkits-APIMock

一个极简的 API Mock 可视化服务，提供直观的图形界面来创建、管理和测试 Mock 端点。

 ✨ 功能特性

- 🎨 可视化界面 - 直观的图形界面，无需编写代码即可创建 Mock 端点
- ⚡ 快速创建 - 支持 GET/POST/PUT/DELETE/PATCH 多种 HTTP 方法
- 🔧 自定义响应 - 支持自定义状态码、延迟时间和 JSON 响应内容
- 🎚️ 启用/禁用 - 每个端点都有独立的开关，可随时启用或禁用
- 📝 实时日志 - 实时查看所有请求记录
- 💾 数据持久化 - 端点配置自动保存到本地文件
- 📋 一键复制 - 一键复制完整的 Mock URL

 🚀 快速开始

 安装与启动

```bash
 进入项目目录
cd api-mock

 启动服务
npm run dev
```

 访问服务

启动后在浏览器中访问：`http://localhost:8899`

 📖 使用说明

 创建端点

1. 在表单中选择 HTTP 方法（GET/POST/PUT/DELETE/PATCH）
2. 输入端点路径（如 `/api/users`）
3. 设置响应状态码（默认 200）
4. 可选：设置响应延迟（毫秒）
5. 输入 JSON 响应内容
6. 点击「创建端点」按钮

 管理端点

- 编辑 - 点击编辑按钮修改端点配置
- 复制 URL - 点击复制按钮获取完整的 Mock URL
- 启用/禁用 - 使用滑动开关控制端点状态
- 删除 - 点击删除按钮移除端点

 测试端点

创建端点后，可以使用以下方式测试：

```bash
 使用 curl 测试
curl http://localhost:8899/api/users

 使用浏览器访问
http://localhost:8899/api/users
```

 🔧 技术栈

- 后端: Node.js (原生 HTTP 模块)
- 前端: Vue 3 + HTML + CSS
- 数据存储: JSON 文件持久化

 📁 项目结构

```
api-mock/
├── frontend/           前端目录
│   ├── index.html      Vue 3 HTML 模板
│   ├── style.css       样式文件
│   └── app.js          Vue 3 应用逻辑
├── server.js           Node.js Mock 服务器
├── endpoints.json      端点配置（自动生成）
├── logs.json           请求日志（自动生成）
├── package.json        项目配置
└── README.md           使用说明
```

 🌐 API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/endpoints` | 获取所有端点列表 |
| POST | `/api/endpoints` | 创建新端点 |
| PUT | `/api/endpoints/:id` | 更新端点 |
| DELETE | `/api/endpoints/:id` | 删除端点 |
| PATCH | `/api/endpoints/:id` | 切换端点启用/禁用状态 |
| GET | `/api/logs` | 获取请求日志 |
| POST | `/api/server/start` | 启动 Mock 服务 |
| POST | `/api/server/stop` | 停止 Mock 服务 |
| GET | `/api/server/status` | 获取服务状态 |

 📄 端点配置格式

```json
{
  "id": "端点唯一标识",
  "method": "GET",
  "path": "/api/users",
  "statusCode": 200,
  "delay": 0,
  "response": "{\"data\": []}",
  "enabled": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

 📝 许可证

MIT License

---
