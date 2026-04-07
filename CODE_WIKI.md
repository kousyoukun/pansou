# PanSou 项目 Code Wiki

## 1. 项目概述

PanSou 是一个高性能的网盘资源搜索 API 服务，提供多源、并行搜索能力，支持 Telegram 频道和各种第三方插件的资源索引。

### 核心功能
- 多源并行搜索（Telegram 频道 + 插件系统）
- 智能结果合并与去重
- 多级缓存系统（内存 + 磁盘）
- 异步插件处理
- 完整的 RESTful API
- 容器化部署支持
- 认证与安全控制

## 2. 目录结构

```
├── api/             # API 层，处理 HTTP 请求
│   ├── auth_handler.go    # 认证相关处理
│   ├── filter.go          # 结果过滤器
│   ├── handler.go         # 搜索处理
│   ├── middleware.go      # 中间件
│   └── router.go          # 路由配置
├── config/          # 配置管理
│   └── config.go          # 配置结构和加载
├── docs/            # 项目文档
├── model/           # 数据模型
│   ├── plugin_result.go   # 插件搜索结果
│   ├── request.go         # 请求模型
│   └── response.go        # 响应模型
├── plugin/          # 插件系统
│   ├── plugin.go          # 插件接口定义
│   ├── [插件目录]...       # 各种搜索插件
├── service/         # 业务逻辑层
│   ├── cache_integration.go   # 缓存集成
│   └── search_service.go      # 搜索服务
├── typescript/      # TypeScript 部分（MCP 服务）
│   ├── src/              # 源码
│   ├── package.json      # 依赖配置
│   └── tsconfig.json     # TypeScript 配置
├── util/            # 工具函数
│   ├── cache/            # 缓存实现
│   ├── json/             # JSON 工具
│   ├── pool/             # 线程池
│   └── *.go              # 其他工具函数
├── main.go          # 应用入口
├── Dockerfile       # Docker 构建文件
├── docker-compose.yml # Docker Compose 配置
├── go.mod           # Go 依赖管理
└── package.json     # Node.js 依赖管理
```

## 3. 系统架构

### 3.1 架构图

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  HTTP API   │    │  搜索服务   │    │  插件系统   │
│  (api/)     │───▶│ (service/)  │───▶│  (plugin/)  │
└─────────────┘    └─────────────┘    └─────────────┘
         ▲                 ▲                 ▲
         │                 │                 │
         ▼                 ▼                 ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  配置管理   │    │  缓存系统   │    │  结果处理   │
│  (config/)  │    │  (util/cache/) │  (model/)    │
└─────────────┘    └─────────────┘    └─────────────┘
```

### 3.2 核心流程

1. **请求处理**：API 层接收搜索请求，解析参数
2. **搜索执行**：搜索服务并行处理 Telegram 频道和插件搜索
3. **结果合并**：智能合并去重，按时间和关键词排序
4. **缓存管理**：多级缓存提高性能
5. **响应返回**：返回结构化的搜索结果

## 4. 核心模块

### 4.1 主入口模块 (main.go)

主入口模块负责应用初始化和服务器启动，包括：
- 配置初始化
- HTTP 客户端初始化
- 缓存写入管理器初始化
- 插件系统初始化
- 服务器启动与优雅关闭

**关键函数**：
- `main()`：应用入口
- `initApp()`：初始化应用组件
- `startServer()`：启动 HTTP 服务器
- `printServiceInfo()`：打印服务信息

### 4.2 配置模块 (config/)

配置模块负责管理应用配置，支持从环境变量加载配置：
- 服务器配置
- 缓存配置
- 插件配置
- 认证配置
- 代理配置

**关键结构体**：
- `Config`：应用配置结构

**关键函数**：
- `Init()`：初始化配置
- `UpdateDefaultConcurrency()`：更新默认并发数

### 4.3 API 模块 (api/)

API 模块处理 HTTP 请求，提供 RESTful 接口：
- 搜索接口（支持 POST/GET）
- 认证接口
- 健康检查接口

**关键函数**：
- `SetupRouter()`：设置路由
- `SearchHandler()`：处理搜索请求
- `LoginHandler()`：处理登录请求

### 4.4 搜索服务模块 (service/)

搜索服务是核心业务逻辑模块，负责：
- 并行搜索 Telegram 频道
- 管理插件搜索
- 结果合并与排序
- 缓存管理

**关键结构体**：
- `SearchService`：搜索服务

**关键函数**：
- `NewSearchService()`：创建搜索服务实例
- `Search()`：执行搜索
- `searchTG()`：搜索 Telegram 频道
- `searchPlugins()`：搜索插件
- `mergeSearchResults()`：合并搜索结果

### 4.5 插件系统 (plugin/)

插件系统提供可扩展的搜索能力，支持多种数据源：
- 插件接口定义
- 插件管理器
- 异步搜索机制
- 缓存集成

**关键接口**：
- `AsyncSearchPlugin`：异步搜索插件接口
- `PluginWithWebHandler`：支持 Web 路由的插件接口
- `InitializablePlugin`：支持延迟初始化的插件接口

**关键结构体**：
- `PluginManager`：插件管理器
- `BaseAsyncPlugin`：基础插件实现

**关键函数**：
- `RegisterGlobalPlugin()`：注册插件
- `NewPluginManager()`：创建插件管理器
- `AsyncSearch()`：执行异步搜索

### 4.6 缓存系统 (util/cache/)

缓存系统提供多级缓存能力，提高搜索性能：
- 内存缓存
- 磁盘缓存
- 缓存写入管理器
- 序列化支持

**关键结构体**：
- `EnhancedTwoLevelCache`：增强版两级缓存
- `DelayedBatchWriteManager`：延迟批处理写入管理器

**关键函数**：
- `NewEnhancedTwoLevelCache()`：创建增强版缓存
- `SetBothLevels()`：同时设置内存和磁盘缓存
- `Get()`：获取缓存

## 5. 关键类与函数

### 5.1 主入口

| 函数名 | 说明 | 参数 | 返回值 | 位置 |
|-------|------|------|-------|------|
| `main()` | 应用入口点 | 无 | 无 | [main.go](file:///workspace/main.go#L111) |
| `initApp()` | 初始化应用组件 | 无 | 无 | [main.go](file:///workspace/main.go#L119) |
| `startServer()` | 启动HTTP服务器 | 无 | 无 | [main.go](file:///workspace/main.go#L154) |

### 5.2 配置管理

| 函数名 | 说明 | 参数 | 返回值 | 位置 |
|-------|------|------|-------|------|
| `Init()` | 初始化配置 | 无 | 无 | [config/config.go](file:///workspace/config/config.go#L62) |
| `UpdateDefaultConcurrency()` | 更新默认并发数 | pluginCount: int | 无 | [config/config.go](file:///workspace/config/config.go#L164) |

### 5.3 API 处理

| 函数名 | 说明 | 参数 | 返回值 | 位置 |
|-------|------|------|-------|------|
| `SetupRouter()` | 设置路由 | searchService: *service.SearchService | *gin.Engine | [api/router.go](file:///workspace/api/router.go#L12) |
| `SearchHandler()` | 处理搜索请求 | c: *gin.Context | 无 | [api/handler.go](file:///workspace/api/handler.go#L26) |

### 5.4 搜索服务

| 函数名 | 说明 | 参数 | 返回值 | 位置 |
|-------|------|------|-------|------|
| `NewSearchService()` | 创建搜索服务 | pluginManager: *plugin.PluginManager | *SearchService | [service/search_service.go](file:///workspace/service/search_service.go#L206) |
| `Search()` | 执行搜索 | keyword, channels, concurrency, forceRefresh, resultType, sourceType, plugins, cloudTypes, ext | model.SearchResponse, error | [service/search_service.go](file:///workspace/service/search_service.go#L353) |
| `searchTG()` | 搜索Telegram频道 | keyword, channels, forceRefresh | []model.SearchResult, error | [service/search_service.go](file:///workspace/service/search_service.go#L1209) |
| `searchPlugins()` | 搜索插件 | keyword, plugins, forceRefresh, concurrency, ext | []model.SearchResult, error | [service/search_service.go](file:///workspace/service/search_service.go#L1281) |

### 5.5 插件系统

| 函数名 | 说明 | 参数 | 返回值 | 位置 |
|-------|------|------|-------|------|
| `RegisterGlobalPlugin()` | 注册插件 | plugin: AsyncSearchPlugin | 无 | [plugin/plugin.go](file:///workspace/plugin/plugin.go#L128) |
| `NewPluginManager()` | 创建插件管理器 | 无 | *PluginManager | [plugin/plugin.go](file:///workspace/plugin/plugin.go#L172) |
| `AsyncSearch()` | 执行异步搜索 | keyword, searchFunc, mainCacheKey, ext | []model.SearchResult, error | [plugin/plugin.go](file:///workspace/plugin/plugin.go#L546) |

### 5.6 缓存系统

| 函数名 | 说明 | 参数 | 返回值 | 位置 |
|-------|------|------|-------|------|
| `NewEnhancedTwoLevelCache()` | 创建增强版缓存 | 无 | *EnhancedTwoLevelCache, error | [util/cache/enhanced_two_level_cache.go] |
| `SetBothLevels()` | 设置两级缓存 | key, data, ttl | error | [util/cache/enhanced_two_level_cache.go] |
| `Get()` | 获取缓存 | key | []byte, bool, error | [util/cache/enhanced_two_level_cache.go] |

## 6. 依赖关系

### 6.1 Go 依赖

| 依赖 | 版本 | 用途 | 位置 |
|------|------|------|------|
| `github.com/Advik-B/cloudscraper` | v0.0.0-20250623142001-d5e0e43555db | 云盘内容抓取 | [go.mod](file:///workspace/go.mod#L8) |
| `github.com/PuerkitoBio/goquery` | v1.8.1 | HTML 解析 | [go.mod](file:///workspace/go.mod#L9) |
| `github.com/bytedance/sonic` | v1.14.0 | JSON 处理 | [go.mod](file:///workspace/go.mod#L10) |
| `github.com/gin-gonic/gin` | v1.9.1 | Web 框架 | [go.mod](file:///workspace/go.mod#L11) |
| `github.com/golang-jwt/jwt/v5` | v5.2.0 | JWT 认证 | [go.mod](file:///workspace/go.mod#L12) |
| `golang.org/x/net` | v0.41.0 | 网络工具 | [go.mod](file:///workspace/go.mod#L13) |

### 6.2 TypeScript 依赖

| 依赖 | 版本 | 用途 | 位置 |
|------|------|------|------|
| `@modelcontextprotocol/sdk` | ^1.0.0 | MCP 协议 SDK | [typescript/package.json](file:///workspace/typescript/package.json#L32) |
| `axios` | ^1.6.0 | HTTP 客户端 | [typescript/package.json](file:///workspace/typescript/package.json#L33) |
| `zod` | ^3.22.0 | 数据验证 | [typescript/package.json](file:///workspace/typescript/package.json#L34) |

## 7. 运行方式

### 7.1 直接运行

```bash
# 安装依赖
go mod download

# 构建
go build -o pansou .

# 运行
./pansou
```

### 7.2 Docker 运行

```bash
# 构建镜像
docker build -t pansou .

# 运行容器
docker run -p 8888:8888 --name pansou -d pansou
```

### 7.3 Docker Compose 运行

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down
```

## 8. 配置说明

### 8.1 环境变量配置

| 环境变量 | 说明 | 默认值 | 示例 |
|---------|------|-------|------|
| `PORT` | 服务端口 | 8888 | 8888 |
| `CHANNELS` | Telegram 频道列表 | tgsearchers4 | tgsearchers6,Aliyun_4K_Movies |
| `ENABLED_PLUGINS` | 启用的插件列表 | 无 | labi,zhizhen,shandian |
| `CACHE_ENABLED` | 启用缓存 | true | true |
| `CACHE_PATH` | 缓存路径 | ./cache | /app/cache |
| `CACHE_MAX_SIZE` | 缓存最大大小(MB) | 100 | 200 |
| `CACHE_TTL` | 缓存有效期(分钟) | 60 | 120 |
| `ASYNC_PLUGIN_ENABLED` | 启用异步插件 | true | true |
| `ASYNC_RESPONSE_TIMEOUT` | 异步响应超时(秒) | 4 | 5 |
| `AUTH_ENABLED` | 启用认证 | false | true |
| `AUTH_USERS` | 认证用户列表 | 无 | admin:admin123,user:pass456 |
| `PROXY` | 代理地址 | 无 | socks5://proxy:7897 |

### 8.2 配置优先级

1. 环境变量
2. 默认值

## 9. API 接口

### 9.1 搜索接口

**POST /api/search** 或 **GET /api/search**

**参数**：
- `kw`：搜索关键词（必填）
- `channels`：Telegram 频道列表（可选）
- `conc`：并发数（可选）
- `refresh`：强制刷新（可选，true/false）
- `res`：结果类型（可选，merge/results/all）
- `src`：数据源类型（可选，all/tg/plugin）
- `plugins`：插件列表（可选）
- `cloud_types`：网盘类型（可选）
- `ext`：扩展参数（可选，JSON格式）
- `filter`：过滤器（可选，JSON格式）

**响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 100,
    "results": [
      {
        "title": "示例资源",
        "content": "资源描述",
        "channel": "tgsearchers6",
        "datetime": "2024-01-01T12:00:00Z",
        "links": [
          {
            "url": "https://pan.baidu.com/s/123456",
            "password": "1234",
            "type": "baidu"
          }
        ],
        "tags": ["电影", "4K"],
        "unique_id": "123456"
      }
    ],
    "merged_by_type": {
      "baidu": [
        {
          "url": "https://pan.baidu.com/s/123456",
          "password": "1234",
          "note": "示例资源",
          "datetime": "2024-01-01T12:00:00Z",
          "source": "tg:tgsearchers6"
        }
      ]
    }
  }
}
```

### 9.2 健康检查接口

**GET /api/health**

**响应**：
```json
{
  "status": "ok",
  "auth_enabled": false,
  "plugins_enabled": true,
  "channels": ["tgsearchers6"],
  "channels_count": 1,
  "plugin_count": 10,
  "plugins": ["labi", "zhizhen"]
}
```

### 9.3 认证接口

**POST /api/auth/login**

**参数**：
- `username`：用户名
- `password`：密码

**响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiry": "2024-01-02T12:00:00Z"
  }
}
```

## 10. 插件系统

### 10.1 插件接口

插件需要实现 `AsyncSearchPlugin` 接口：

```go
type AsyncSearchPlugin interface {
    Name() string
    Priority() int
    AsyncSearch(keyword string, searchFunc func(*http.Client, string, map[string]interface{}) ([]model.SearchResult, error), mainCacheKey string, ext map[string]interface{}) ([]model.SearchResult, error)
    SetMainCacheKey(key string)
    SetCurrentKeyword(keyword string)
    Search(keyword string, ext map[string]interface{}) ([]model.SearchResult, error)
    SkipServiceFilter() bool
}
```

### 10.2 插件开发

1. 创建插件目录（如 `plugin/myplugin`）
2. 实现 `AsyncSearchPlugin` 接口
3. 在 `main.go` 中添加空导入
4. 构建并运行

### 10.3 内置插件

项目包含多个内置插件，如：
- `labi`：拉比网盘搜索
- `zhizhen`：智真搜索
- `shandian`：闪电搜索
- `duoduo`：多多搜索
- `hunhepan`：混合盘搜索

## 11. 缓存机制

### 11.1 缓存层次

1. **内存缓存**：快速访问，适合热点数据
2. **磁盘缓存**：持久化存储，适合大量数据

### 11.2 缓存策略

- **TTL 机制**：缓存自动过期
- **批量写入**：减少磁盘 I/O
- **缓存预热**：后台刷新即将过期的缓存
- **智能合并**：合并新旧缓存数据

### 11.3 缓存键生成

- Telegram 搜索：`tg:{keyword}:{channels}`
- 插件搜索：`plugin:{keyword}:{plugins}`

## 12. 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Go | 1.24.1 | 后端服务 |
| TypeScript | 5.0.0+ | MCP 服务 |
| Gin | 1.9.1 | Web 框架 |
| Docker | - | 容器化部署 |
| Docker Compose | 3.8 | 服务编排 |

## 13. 最佳实践

### 13.1 性能优化

- 合理设置并发数（推荐：CPU核心数 × 5）
- 启用缓存（默认开启）
- 定期清理过期缓存
- 合理设置插件超时时间

### 13.2 安全建议

- 生产环境启用认证
- 使用强密码
- 定期更新 JWT 密钥
- 限制 API 访问频率

### 13.3 部署建议

- 使用 Docker Compose 管理服务
- 挂载缓存卷，避免数据丢失
- 配置健康检查
- 合理设置资源限制

## 14. 监控与维护

### 14.1 日志监控

- 服务启动信息
- 缓存状态
- 插件执行情况
- 错误信息

### 14.2 常见问题

| 问题 | 原因 | 解决方案 |
|------|------|---------|
| 搜索无结果 | 网络问题或插件配置错误 | 检查网络连接和插件配置 |
| 服务响应慢 | 并发数不足或缓存未命中 | 增加并发数，等待缓存预热 |
| 内存使用高 | 缓存过大或内存泄漏 | 调整缓存大小，检查代码 |

## 15. 总结

PanSou 是一个功能强大、架构清晰的网盘资源搜索服务，具有以下特点：

- **多源搜索**：支持 Telegram 频道和插件系统
- **高性能**：并行搜索和多级缓存
- **可扩展**：插件系统支持自定义数据源
- **易部署**：容器化支持
- **安全可靠**：认证和错误处理

通过合理的架构设计和优化，PanSou 能够高效地索引和搜索各种网盘资源，为用户提供快速、准确的搜索结果。

## 16. 版本信息

- **Go 版本**：1.24.1
- **Docker 版本**：支持多平台构建
- **API 版本**：v1

## 17. 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交代码
4. 运行测试
5. 提交 Pull Request

## 18. 许可证

MIT License

---

**更新时间**：2026-04-07
**文档版本**：v1.0.0