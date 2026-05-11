# Rattoolkits-APIMock 极简可视化服务

## 1. Concept & Vision

一个轻量级的 Rattoolkits-APIMock 工具，无需后端，可直接在浏览器中运行。界面简洁直观，让用户通过图形界面快速创建、编辑和管理模拟接口。整体风格现代简约，强调效率和使用体验。

## 2. Design Language

- **Aesthetic direction**: 极简主义，采用清晰的卡片式布局，大量留白
- **Color palette**:
  - Primary: `#4F46E5` (靛蓝色)
  - Secondary: `#10B981` (翠绿色)
  - Accent: `#F59E0B` (琥珀色)
  - Background: `#F9FAFB`
  - Card Background: `#FFFFFF`
  - Text Primary: `#111827`
  - Text Secondary: `#6B7280`
  - Border: `#E5E7EB`
  - Success: `#10B981`
  - Error: `#EF4444`
- **Typography**: Inter (Google Font), fallback: system-ui, sans-serif
- **Spatial system**: 8px 基础单位，间距递增 (8, 16, 24, 32, 48)
- **Motion**: 轻柔的过渡动画 (200-300ms ease-out)
- **Icons**: Lucide Icons (轻量级图标库)

## 3. Layout & Structure

```
┌─────────────────────────────────────────────────────┐
│  Header: Logo + 标题 + 状态指示                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  创建新区输入框: Method | URL | + 添加按钮    │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  Mock 端点卡片 (可折叠)                      │   │
│  │  - 方法标签 (GET/POST/PUT/DELETE)            │   │
│  │  - 路径显示                                  │   │
│  │  - 响应状态码                                │   │
│  │  - 响应延迟                                  │   │
│  │  - 展开: 响应 JSON 编辑器                    │   │
│  │  - 操作按钮: 编辑/删除/复制 URL              │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
├─────────────────────────────────────────────────────┤
│  Footer: 服务器状态 + 端口信息 + 请求计数            │
└─────────────────────────────────────────────────────┘
```

## 4. Features & Interactions

### 核心功能

1. **添加 Mock 端点**
   - 选择 HTTP 方法 (GET, POST, PUT, DELETE, PATCH)
   - 输入路径 (自动补全 `/` 前缀)
   - 设置响应状态码 (默认 200)
   - 设置响应延迟 (默认 0ms)
   - 输入响应 JSON 数据
   - 点击"创建"按钮添加

2. **编辑 Mock 端点**
   - 点击编辑按钮进入编辑模式
   - 表单预填充现有数据
   - 保存或取消编辑

3. **删除 Mock 端点**
   - 点击删除按钮
   - 确认对话框
   - 端点从列表移除

4. **复制 Mock URL**
   - 点击复制按钮
   - 完整 URL 复制到剪贴板
   - 显示"已复制"提示 (2秒后消失)

5. **请求日志**
   - 实时显示收到的请求
   - 显示请求方法、路径、时间
   - 点击查看详情

6. **启动/停止服务**
   - 一键启动 Mock 服务器
   - 显示运行状态
   - 可切换端口

### 交互细节

- **端点卡片悬停**: 轻微阴影提升 (box-shadow transition)
- **删除按钮悬停**: 变为红色 (#EF4444)
- **编辑模式**: 卡片展开显示表单
- **Toast 通知**: 右下角弹出，3秒后自动消失
- **空状态**: 显示友好提示"还没有创建任何 Mock 端点"

## 5. Component Inventory

### Header
- Logo (图标 + 文字)
- 服务器状态指示灯 (绿色运行中/灰色已停止)

### Input Group
- Method 下拉选择器 (5种方法，彩色标签)
- URL 输入框 (带 placeholder)
- 状态码输入 (数字，100-599)
- 延迟输入 (数字，毫秒)
- JSON 编辑器 (Textarea，带语法高亮提示)
- 创建/更新按钮

### Endpoint Card
- 方法标签 (圆角胶囊形状)
- 路径显示
- 状态码徽章
- 延迟徽章
- 响应预览 (可折叠的 JSON 区域)
- 操作按钮组

### Request Log Panel
- 实时请求列表
- 时间戳
- 请求详情弹窗

### Toast Notification
- 成功/错误/信息三种类型
- 图标 + 文字
- 自动消失

## 6. Technical Approach

### 架构选择

由于是极简方案，采用 **纯前端 + 后端 Mock Server** 混合方案：

- **前端**: 单 HTML 文件，使用原生 JavaScript，无框架依赖
- **后端**: 使用 Node.js 的 `http` 模块创建简单的 Mock 服务器
- **数据存储**: localStorage 持久化端点配置

### 文件结构

```
api-mock/
├── SPEC.md
├── server.js          # Node.js Mock 服务器
├── index.html         # 前端界面
└── README.md         # 使用说明 (可选)
```

### 关键实现

1. **server.js**:
   - 读取端点配置
   - 根据请求方法+路径匹配
   - 返回配置的响应
   - 支持 CORS
   - 记录请求日志

2. **index.html**:
   - 响应式布局
   - 端点 CRUD 操作
   - localStorage 持久化
   - 与 server.js 通信获取日志
   - SSE (Server-Sent Events) 实时更新请求日志

### API 设计

**服务器端点 (Node.js 管理接口)**:

```
GET  /api/endpoints     # 获取所有端点
POST /api/endpoints     # 创建端点
PUT  /api/endpoints/:id # 更新端点
DELETE /api/endpoints/:id # 删除端点
GET  /api/logs          # 获取请求日志
GET  /api/logs/stream   # SSE 流式更新
POST /api/server/start  # 启动服务器
POST /api/server/stop   # 停止服务器
GET  /api/server/status # 获取服务器状态
```

**Mock 端点响应格式**:

```json
{
  "id": "uuid",
  "method": "GET",
  "path": "/api/users",
  "statusCode": 200,
  "delay": 0,
  "response": { "users": [] },
  "createdAt": "ISO date"
}
```
