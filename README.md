# Travel-AI-Agent — 智能旅游规划助手 (前端代码仓库: travel-ai-front)

> **一个基于 DeepSeek 大语言模型的全栈旅游规划平台。支持智能行程生成、流式 AI 对话、结构化预算展示与用户会话管理。**  
> 面向旅行爱好者，提供一键生成个性化旅行方案的 AI 助手体验。

![Java](https://img.shields.io/badge/Java-17-%23ED8B00?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.4-%236DB33F?logo=springboot&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-%234479A1?logo=mysql&logoColor=white)
![Vue](https://img.shields.io/badge/Vue-3.4-%234FC08D?logo=vue.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.2-%23646CFF?logo=vite&logoColor=white)
![Vant](https://img.shields.io/badge/Vant-4.0-%23409EFF?logo=element&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)
![AI](https://img.shields.io/badge/AI-DeepSeek_V4-%235C4EE5?logo=openai&logoColor=white)

---

## 目录

- [项目简介](#项目简介)
- [项目背景与动机](#项目背景与动机)
- [核心功能](#核心功能)
- [AI 功能](#ai-功能)
- [技术栈与架构](#技术栈与架构)
- [挑战与解决方案](#挑战与解决方案)
- [快速开始](#快速开始)
- [AI 配置](#ai-配置)
- [使用示例](#使用示例)
- [项目结构](#项目结构)
- [未来改进](#未来改进)

---

## 项目简介

Travel-AI-Agent 是一个基于大语言模型（LLM）的旅游规划助手。用户只需输入目的地、预算和天数，系统即可通过 DeepSeek V4 模型自动生成包含每日行程、景点详解、交通建议及预算分配的完整旅游方案。项目采用前后端分离架构，实现了类似 ChatGPT 的流式（SSE）打字机交互体验。

## 项目背景与动机

旅游规划往往涉及大量的信息搜集（景点、交通、住宿、预算），对于普通用户来说耗时且繁琐。创建 Travel-AI-Agent 的目标是：

- 探索大语言模型在垂直领域（旅游）的结构化数据生成能力
- 完整实践全栈开发流程，从 Vue3 前端交互到 Spring Boot 3 后端服务
- 解决大模型在实际落地中的网络连通性（代理配置）与复杂 JSON 清洗问题
- 提供一个业务闭环完整、可直接演示的全栈 AI 项目，展示架构设计与接口封装能力

## 核心功能

### 用户端（前端 Web + 后端 Web API）

| 功能 | 描述 |
|------|------|
| **AI 智能规划** | 一键生成包含每日行程、景点介绍、交通、门票、餐食的结构化方案 |
| **流式对话** | 基于 SSE 的逐字输出，提供类 ChatGPT 的实时交互体验 |
| **行程详情页** | 折叠卡片式展示每日详细安排（上午/下午/晚上） |
| **预算明细表** | 自动拆解住宿、餐饮、交通、门票等具体花费 |
| **智能提示** | 生成出行建议与注意事项 |
| **暗黑模式** | 响应式主题切换（跟随系统偏好或手动切换） |

### 后端核心能力（Spring Boot 3）

| 功能 | 描述 |
|------|------|
| **大模型网关** | 基于 OkHttp 封装统一 HTTP 客户端，支持网络代理配置 |
| **流式输出** | 利用 SseEmitter 实现文本实时推送，前端逐字渲染 |
| **结构化解析** | 自动清洗大模型返回的嵌套/转义 JSON 数据，确保数据准确性 |
| **跨域处理** | 前后端分离部署下配置 CORS 策略及 Vite 代理转发 |
| **运行时配置** | 支持 Yaml 参数化注入（API Key、模型名称、超时时间等） |

## AI 功能

平台集成了 **DeepSeek V4** 大模型，提供两种核心 AI 能力：

### 1. AI 智能行程生成器

用户输入“目的地 + 预算 + 天数”后，系统调用 DeepSeek 生成 JSON 格式的完整行程方案。

**核心交互流程：**
用户提交表单 → 拼装 Prompt → 调用 DeepSeek API → 获取原始文本
↓
Regex/JSON 结构化提取 → 清洗 / 转义处理 → 返回结构化 JSON 给前端
↓
前端 Vant UI 卡片渲染 → 用户查看详细行程

**关键设计**：
- **故障隔离**：LLM 超时或返回异常数据时，统一返回 `error` 标识，避免前端页面崩溃
- **流式优先**：普通对话模式使用 SSE 流式输出，给用户“已开始处理”的直观反馈
- **零数据库依赖**：所有行程数据均为运行时生成，无需持久化存储，降低运维成本

### 2. AI 提示词工程 (Prompt Engineering)

为了引导大模型输出稳定、结构严谨的 JSON 数据，项目设计了精细的 System Prompt：

- **强制 JSON 输出**：通过 `"response_format":{"type":"json_object"}` 参数约束
- **字段约束**：明确要求 `dailyItinerary`、`budgetBreakdown`、`tips` 等结构
- **格式规范**：规避大模型产生额外的解释性文字或非标准的 Markdown 标记

**关键设计**：
- **独立接口**：`POST /api/travel/recommend` 接收前端参数
- **超时保护**：OkHttp 设置 `connectTimeout=60s` 避免长期阻塞
- **反序列化安全**：在 Java 端放弃复杂解析，将原始 JSON 字符串透传给前端，由前端执行 `JSON.parse` 兜底

## 技术栈与架构

### 系统架构图
┌─────────────────────────────────────────────────────────────┐
│ 浏览器 │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ travel-ai-front (Vue 3, port 5173) │ │
│ └───────────────────────────┬──────────────────────────┘ │
│ │ │
│ Vite Proxy /api/* │
│ ▼ │
┌─────────────────────────────────────────────────────────────┐
│ travel-assistant (Spring Boot 3, port 3200) │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ TravelController.java │ │
│ │ - /api/travel/recommend (非流式生成方案) │ │
│ │ - /api/travel/chat (SSE 流式对话) │ │
│ └───────────────────────────┬──────────────────────────┘ │
│ │ │
│ OkHttp Client │
│ │ │
│ ┌────────────────────┴────────────────────┐ │
│ │ DeepSeek V4 API │ │
│ │ (https://api.deepseek.com) │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
### 后端技术选型

| 技术 | 用途 | 选型理由 |
|------|------|----------|
| **Spring Boot 3.3.4** | 应用框架 | 成熟稳定，生态丰富，快速构建 RESTful API |
| **OkHttp 4.12.0** | HTTP 客户端 | 高效连接池，支持自定义网络代理配置，适合外部 API 调用 |
| **Jackson** | JSON 序列化 | Spring Boot 默认集成的高性能 JSON 解析工具 |
| **Lombok** | 代码简化 | 减少 POJO 样板代码，提高开发效率 |
| **HikariCP** | 数据库连接池 | Spring Boot 默认连接池，高性能、轻量级 |
| **DeepSeek V4** | AI 大模型 | 性价比极高，OpenAI 兼容 API，支持 JSON 结构化约束 |

### 前端技术选型

| 技术 | 用途 | 选型理由 |
|------|------|----------|
| **Vue 3 + Composition API** | UI 框架 | 响应式、组合式 API 提升代码复用性与可维护性 |
| **Vite** | 构建工具 | 极速热更新，原生 ESM 支持，构建效率远超 Webpack |
| **Vant 4** | UI 组件库 | 轻量级移动端组件库，开箱即用，适合移动 H5 开发 |
| **Vue Router** | 路由管理 | Vue 官方路由，支持路由 Query 参数传递复杂 JSON 数据 |
| **Axios** | HTTP 客户端 | 拦截器机制便于统一处理 Token 刷新和错误提示（预留） |

## 挑战与解决方案

### 1. 大模型 API 网络连通性

**挑战**：国内网络环境无法直连海外 OpenAI/DeepSeek 服务器，导致 `SocketTimeoutException` 或连接被重置。

**解决方案**：在 OkHttp 客户端构建时显式配置 HTTP 代理：
```java
.proxy(new Proxy(Proxy.Type.HTTP, new InetSocketAddress("127.0.0.1", 7890)))
```
结合用户本地运行的 Clash/v2ray 等代理工具，解决网络连通问题。
2. 大模型返回数据的结构化清洗
挑战：DeepSeek 返回的文本中带有大量转义字符（\n、\"、\）和额外的 Markdown 标记，直接使用 JSON.parse 极易报错。

解决方案：

Java 端降级：放弃在 Java 端进行复杂的实体类映射，改为将原始字符串封装在 rawJson 字段中透传给前端

前端强解析：前端使用正则表达式定位第一个 { 和最后一个 }，截取纯净的 JSON 字符串后执行 JSON.parse

历史教训：曾尝试使用 Java Jackson 解析，但因文本中存在转义字符导致反复失败，最终采用“前端清洗”策略，方案稳定且解耦

相关策略：TravelService.recommend() 中通过 result.setRawJson(response) 直接传递原始数据，绕开后端 JSON 解析瓶颈。

3. 流式交互（SSE）实现与前端衔接
挑战：让 AI 的回答像打字机一样逐字输出，而非等待完整生成后才一次性返回。

解决方案：

后端使用 Spring Boot 的 SseEmitter 构建异步响应流

前端使用 fetch + ReadableStream 读取数据流

逐行解析 data: 前缀的 SSE 数据，解析后拼接至响应式变量

配合 Vue3 响应式机制实现实时 UI 更新

4. Vue 路由与复杂 JSON 参数传递
挑战：详情页需要的行程数据结构（包含 5 天的行程、预算等）非常庞大，且包含中文，直接通过 URL Query 传递极易丢失或乱码。

解决方案：

使用 encodeURIComponent() 在跳转时对 JSON 字符串进行编码

进入详情页后使用 decodeURIComponent() 解码

配合 JSON.parse 还原为原本的对象结构

若前端解析失败，提供 aiData 判定与空状态回退

5. 前后端分离下的跨域问题
挑战：Vue 前端运行在 localhost:5173，Spring Boot 后端运行在 localhost:3200，存在 CORS 跨域。

解决方案：

Vite 侧配置 server.proxy 实现接口转发：/api 前缀自动代理到 http://127.0.0.1:3200

配合 changeOrigin: true 与 rewrite 路径重写，实现全链路本地联调无跨域

快速开始
前置依赖
工具	版本要求	用途
JDK	17+	后端运行环境
Maven	3.6+	后端构建
Node.js	18+	前端构建
代理工具	可选	国内调用 DeepSeek 需配置网络代理 (Clash/v2ray)
1. 克隆项目
```
# 后端
git clone https://github.com/1MomoAyasedot1/Travel-AI-Agent-Backend.git

# 前端（需另行拉取或在本地新建前端项目）
git clone https://github.com/1MomoAyasedot1/Travel-AI-Agent.git
```
2. 启动后端
```
bash
# 编辑 AI 配置（API Key 与模型名称）
# src/main/resources/application.yml

# 编译打包
mvn clean package -DskipTests
# 启动后端（端口 3200）
java -jar target/travelassistant-*.jar
```
3. 启动前端
```
bash
# 用户端前端（端口 5173，由 Vite 默认分配）
cd travel-ai-front
npm install
npm run dev
```
4. 访问
服务	地址	说明
用户端首页	http://localhost:5173	AI 旅游助手主界面
后端 API	http://localhost:3200	后端 REST 接口
AI 配置
在启动前需配置大模型 API 密钥 (application.yml)
```
yaml:
llm:
  base-url: https://api.deepseek.com
  model: deepseek-chat
  api-key: sk-xxxxxxxxxxxxxxxxxx
```
使用示例
用户端 API 示例
AI 生成旅游行程 (非流式)：
```
bash
curl -X POST http://localhost:3200/api/travel/recommend \
  -H "Content-Type: application/json" \
  -d '{"city":"北京","days":3,"budget":2000}'
```
返回示例：
```
json
{
  "code": 200,
  "message": "chenggong",
  "data": {
    "city": "北京",
    "days": 3,
    "totalBudget": 2000.0,
    "dailyItinerary": [...],
    "budgetBreakdown": { ... },
    "tips": ["..."],
    "warnings": ["..."]
  }
}
```
流式 AI 对话：
```
bash
curl -X POST http://localhost:3200/api/travel/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"推荐北京两天的行程"}'
```
响应将通过 SSE 流式返回，每段文本为 data: {...} 格式。

项目结构
```
Travel-AI-Agent-Backend/
├── src/main/java/com/lixinyang/travelassistant/
│   ├── TravelassistantApplication.java         # 启动类
│   ├── controller/                             # REST API 控制器
│   │   ├── TravelController.java               # /api/travel/recommend & /chat
│   │   └── (预留 UserController 等)
│   ├── service/                                # 业务逻辑层
│   │   ├── TravelService.java                  # 构建 Prompt、调用 LLM、数据解析
│   │   ├── LlmUtils.java                       # OkHttp 封装与 AI 对接
│   │   └── impl/
│   ├── vo/                                     # 视图对象
│   │   ├── TravelRecommend.java                # 行程响应体 (含 dailyItinerary)
│   │   ├── StreamChunk.java                    # 流式文本分片封装
│   │   ├── Result.java                         # 统一 API 响应封装 (code/data/message)
│   │   └── TravelRequest.java                  # 请求参数封装 (city/days/budget)
│   ├── utils/                                  # 工具类
│   │   └── (预留日期格式化、字符串工具等)
│   └── config/                                 # 配置文件（跨域配置等）
├── src/main/resources/
│   ├── application.yml                         # 全局配置（端口、LLM Key、代理）
│   └── static/                                 # 静态资源
├── pom.xml                                     # Maven 依赖管理
└── README.md
```
未来改进
用户账号与持久化：引入 MySQL + MyBatis，实现注册登录与行程历史存储

数据可视化仪表盘：增加热门目的地分析与消费趋势图表

视频/图片接入：在行程卡中集成景点预览图，提升视觉体验

Docker 容器化部署：提供 docker-compose 一键部署方案（后端 + Nginx）

多语言支持：适配英文、日文等国际化 I18n 配置

多模型切换：支持用户自主选择 DeepSeek、GPT-4、Moonshot 等大模型

离线缓存：将常用目的地行程缓存在本地浏览器，减少重复 API 调用
