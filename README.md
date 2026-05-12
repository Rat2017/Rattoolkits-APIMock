Rattoolkits-APIMock
<<<<<<< HEAD

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
=======
>>>>>>> 7edee93 (修改readme)

一个极简的APIMock可视化服务，支持通过图形界面快速创建、管理和测试模拟接口。
一、功能特性
1.可视化创建和管理Mock端点
2.支持GET/POST/PUT/DELETE/PATCH方法
3.自定义响应状态码和延迟
4.JSON响应内容编辑
实时请求日志监控
数据持久化存储
一键复制MockURL
二、快速开始
安装依赖
确保已安装Node.js(v14+)
```bash
 进入项目目录
cd api-mock

 启动服务
npm run dev
```
<<<<<<< HEAD

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
=======
启动服务
```bash
npm run dev
```
服务启动后访问`http://localhost:3000`
三、使用指南
创建Mock端点
1.在表单中选择HTTP方法
2.输入路径（如`/api/users`）
3.设置响应状态码（默认200）
4.设置响应延迟（默认0ms）
5.输入响应JSON内容
6.点击「创建端点」按钮
编辑端点
1.点击端点卡片上的编辑图标
2.修改表单内容
3.点击「保存更改」按钮
删除端点
1.点击端点卡片上的删除图标
2.在确认对话框中点击确定
复制URL
1.点击端点卡片上的复制图标
2.URL将被复制到剪贴板
查看请求日志
在「请求日志」区域实时查看所有到达的请求记录，包括请求方法、路径、时间和状态码。
API端点
管理接口
| 方法 | 路径 | 描述 |
>>>>>>> 7edee93 (修改readme)
|------|------|------|
| GET | `/api/endpoints` | 获取所有端点列表 |
| POST | `/api/endpoints` | 创建新端点 |
| PUT | `/api/endpoints/:id` | 更新端点 |
| DELETE | `/api/endpoints/:id` | 删除端点 |
| PATCH | `/api/endpoints/:id` | 切换端点启用/禁用状态 |
| GET | `/api/logs` | 获取请求日志 |
<<<<<<< HEAD
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
=======
| GET | `/api/server/status` | 获取服务器状态 |
| POST | `/api/server/start` | 启动服务器 |
| POST | `/api/server/stop` | 停止服务器 |
Mock端点格式
```json
{
  "id": "uuid",
  "method": "GET",
  "path": "/api/users",
  "statusCode": 200,
  "delay": 0,
  "response": { "users": [] },
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

示例

创建用户列表端点

```
方法: GET
路径: /api/users
状态码: 200
响应:
{
  "code": 0,
  "message": "success",
  "data": [
    {"id": 1, "name": "张三"},
    {"id": 2, "name": "李四"}
  ]
}
```
创建延迟响应端点
```
方法: POST
路径: /api/login
状态码: 200
延迟: 1000
响应:
{
  "code": 0,
  "message": "登录成功",
  "token": "xxx"
}
```
技术栈
- Node.js
- HTTP Module
- Vanilla JavaScript
- CSS3
文件结构
```
api-mock/
├── server.js          # Mock 服务器
├── index.html         # 前端界面
├── SPEC.md            # 项目规格说明
├── endpoints.json     # 端点配置（自动生成）
└── logs.json          # 请求日志（自动生成）
```
运行命令
```bash
启动服务
node server.js
停止服务
Ctrl + C
```
>>>>>>> 7edee93 (修改readme)
