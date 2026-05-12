Rattoolkits-APIMock

一个极简的 API Mock 可视化服务，通过图形界面快速创建、管理和测试模拟接口，无需编写后端代码。

---

功能特性

- 可视化管理— 直观的图形界面，所有 Mock 端点一目了然
- 多方法支持— GET、POST、PUT、DELETE、PATCH 全覆盖
- 自定义响应— 自定义状态码、响应延迟和 JSON 数据
- 端点开关— 单独启用或禁用每个端点
- 实时日志— 所有请求记录实时推送、即时查看
- 数据持久化— 配置自动保存，重启不丢失
- 一键复制— 快速复制 Mock URL 到剪贴板

技术栈

| 层级 | 技术 |
|------|------|
| 后端 | Node.js + HTTP 核心模块 |
| 前端 | Vue 3 + HTML + CSS |
| 存储 | JSON 文件持久化 |

快速开始

环境要求

- Node.js >= 14.x

启动服务

```bash
cd api-mock
npm run dev
```

服务启动后访问 [http://localhost:8899](http://localhost:8899)

停止服务

```
Ctrl + C
```

使用指南

创建 Mock 端点

1. 在表单中选择 HTTP 方法
2. 输入路径（如 `/api/users`）
3. 设置响应状态码（默认 200）
4. 设置响应延迟（默认 0ms）
5. 输入响应 JSON 内容
6. 点击「创建端点」

编辑端点

1. 点击端点卡片上的编辑图标
2. 修改表单内容
3. 点击「保存更改」

删除端点

1. 点击端点卡片上的删除图标
2. 在确认对话框中点击确定

启用 / 禁用端点

- 使用端点卡片右下角的滑动开关切换状态
- 禁用后的端点将不再响应请求

复制 URL

- 点击端点卡片上的复制图标，URL 自动复制到剪贴板

查看请求日志

在「请求日志」区域实时查看所有到达的请求记录，包括请求方法、路径、时间和状态码。

API 端点

管理接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/endpoints` | 获取所有端点列表 |
| POST | `/api/endpoints` | 创建新端点 |
| PUT | `/api/endpoints/:id` | 更新指定端点 |
| DELETE | `/api/endpoints/:id` | 删除指定端点 |
| PATCH | `/api/endpoints/:id` | 切换端点启用状态 |
| GET | `/api/logs` | 获取请求日志 |
| GET | `/api/server/status` | 获取服务器状态 |
| POST | `/api/server/start` | 启动服务器 |
| POST | `/api/server/stop` | 停止服务器 |

Mock 端点格式

```json
{
  "id": "uuid",
  "method": "GET",
  "path": "/api/users",
  "statusCode": 200,
  "delay": 0,
  "response": { "users": [] },
  "enabled": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

示例

不需要编写代码，可视化操作即可，只需填写要响应的 JSON。

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

文件结构

```
api-mock/
├── server.js            Mock 服务器
├── endpoints.json       端点数据（自动生成）
├── logs.json            请求日志（自动生成）
├── package.json         项目配置
├── README.md            使用手册
├── SPEC.md              项目规格说明
└── frontend/
    ├── index.html        Vue 3 前端页面
    ├── app.js            Vue 3 应用逻辑
    └── style.css         样式文件
```

---

开源许可

本项目基于 CC BY-NC-SA 4.0协议开源。

- 可自由学习、查看、修改与二次开发
- 禁止任何形式的商业用途与盈利使用
- 二次修改与衍生作品须保留原作者版权声明
- 衍生项目须沿用相同开源协议分发

This project is licensed under the CC BY-NC-SA 4.0license.

- You may freely study, view, modify, and develop derivative works
- Any form of commercial use or monetization is strictly prohibited
- Modified and derivative works must retain the original copyright notice
- Derivative projects must be distributed under the same license
