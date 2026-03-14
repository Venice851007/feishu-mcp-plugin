# Feishu MCP Plugin

一个基于 Model Context Protocol (MCP) 的飞书集成插件，允许 AI 助手通过 MCP 协议与飞书服务进行交互。

[![GitHub stars](https://img.shields.io/github/stars/Venice851007/feishu-mcp-plugin.svg)](https://github.com/Venice851007/feishu-mcp-plugin)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

## 项目简介

本项目是一个 MCP 服务器插件，提供了与飞书（Feishu）服务集成的能力。通过该插件，AI 助手可以：

- ✅ 创建和管理飞书文档
- ✅ 发送飞书消息到群聊
- ✅ 管理飞书日历事件
- ✅ 搜索飞书文档

## 系统架构

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   AI 助手       │─────>│  MCP 客户端      │─────>│  Feishu 插件    │
│  (Claude/Cursor)│      │  (SSH/HTTP)      │      │  (Docker)       │
└─────────────────┘      └──────────────────┘      └────────┬────────┘
                                                           │
                                                           ▼
                                                    ┌─────────────────┐
                                                    │  飞书 API       │
                                                    └─────────────────┘
```

## 功能特性

| 功能 | 描述 | 状态 |
|------|------|------|
| 文档管理 | 创建飞书文档 | ✅ 已实现 |
| 消息发送 | 发送消息到飞书群聊 | ✅ 已实现 |
| 日历管理 | 创建日历事件 | ✅ 已实现 |
| 文档搜索 | 搜索飞书文档 | ✅ 已实现 |

## 快速开始

### 1. 获取飞书应用凭证

1. 访问 [飞书开放平台](https://open.feishu.cn/)
2. 创建企业自建应用
3. 获取 `App ID` 和 `App Secret`
4. 申请相关权限（文档、消息、日历等）

### 2. 配置环境变量

创建 `.env` 文件：

```bash
FEISHU_APP_ID=your_app_id
FEISHU_APP_SECRET=your_app_secret
API_KEY=your_api_key  # 用于认证的 API 密钥
```

### 3. 本地运行

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 运行服务器
npm start
```

### 4. Docker 部署

```bash
# 构建镜像
docker build -t feishu-mcp-plugin .

# 运行容器
docker run -d \
  --name feishu-mcp-plugin \
  --restart always \
  --env-file .env \
  -p 8080:8080 \
  feishu-mcp-plugin
```

## OpenCode 集成

### 配置 OpenCode MCP 服务器

编辑 `~/.config/opencode/config.json`：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "feishu-mcp": {
      "type": "local",
      "command": ["node", "/path/to/feishu-mcp-plugin/dist/index-http.js"],
      "enabled": true,
      "environment": {
        "FEISHU_APP_ID": "your_app_id",
        "FEISHU_APP_SECRET": "your_app_secret",
        "API_KEY": "your_api_key"
      }
    }
  }
}
```

### 使用示例

在 OpenCode 中直接使用：

```
帮我创建一个飞书文档，标题是"项目计划"
```

## API 端点

### 1. MCP 端点 (`/mcp`)

MCP 协议通信端点，支持 JSON-RPC 请求。

**请求示例：**

```bash
curl -X POST http://localhost:8080/mcp \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{
    "jsonrpc": "2.0",
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {
        "name": "test-client",
        "version": "1.0.0"
      }
    },
    "id": 1
  }'
```

### 2. 健康检查端点 (`/health`)

检查服务器状态。

```bash
curl -H "X-API-Key: your_api_key" http://localhost:8080/health
```

## 可用工具

### 1. 创建文档 (`create_document`)

创建新的飞书文档。

**参数：**
- `title` (必需): 文档标题
- `content` (可选): 初始内容
- `folderToken` (可选): 父文件夹令牌

### 2. 发送消息 (`send_message`)

发送消息到飞书群聊。

**参数：**
- `chat_id` (必需): 群聊 ID
- `content` (必需): 消息内容
- `msg_type` (可选): 消息类型，默认为 "text"

### 3. 创建日历事件 (`create_calendar_event`)

创建飞书日历事件。

**参数：**
- `summary` (必需): 事件标题
- `start_time` (必需): 开始时间 (RFC3339 格式)
- `end_time` (必需): 结束时间 (RFC3339 格式)
- `description` (可选): 事件描述
- `calendar_id` (可选): 日历 ID，默认为 "primary"

### 4. 搜索文档 (`search_documents`)

搜索飞书文档。

**参数：**
- `query` (必需): 搜索关键词
- `search_scope` (可选): 搜索范围：doc, sheet, all，默认为 "all"

## 安全配置

### API 密钥认证

服务器支持 API 密钥认证，需要在请求头中添加 `X-API-Key`。

**生成 API 密钥：**

```bash
openssl rand -hex 32
```

**配置环境变量：**

```bash
API_KEY=your_generated_api_key
```

## 开发指南

### 项目结构

```
feishu-mcp-plugin/
├── src/
│   ├── index-http.ts      # HTTP 服务器入口
│   ├── index.ts           # STDIO 服务器入口
│   └── auth.ts            # 飞书认证模块
├── dist/                  # 编译输出
├── .env                   # 环境变量
├── Dockerfile             # Docker 配置
├── package.json           # 项目配置
└── README.md              # 本文档
```

### 开发命令

```bash
# 安装依赖
npm install

# 开发模式（构建并运行）
npm run dev

# 构建项目
npm run build

# 运行服务器
npm start
```

## 故障排除

### 常见问题

**1. 服务器无法从公网访问**

如果使用云服务器（如联通云），需要配置 NAT 网关将公网 IP 映射到内网 IP。

**2. 认证失败**

确认 API 密钥是否正确设置在环境变量中。

**3. 飞书 API 错误**

检查飞书应用权限是否已正确配置。

### 日志查看

```bash
# 查看容器日志
docker logs feishu-mcp-plugin

# 实时查看日志
docker logs -f feishu-mcp-plugin
```

## 部署信息

- **GitHub 仓库**: https://github.com/Venice851007/feishu-mcp-plugin
- **服务器地址**: 180.130.116.88 (需配置 NAT 网关)
- **端口**: 8080
- **容器名称**: feishu-mcp-plugin

## 许可证

ISC

## 贡献

欢迎提交 Issue 和 Pull Request！

## 更新日志

### v1.0.0 (2026-03-14)

- 初始版本
- 实现文档管理功能
- 实现消息发送功能
- 实现日历管理功能
- 实现文档搜索功能
- 添加 API 密钥认证
- Docker 部署支持
- OpenCode 集成配置
