# GIF 动图搜索引擎

一个基于 Giphy API 的前端网页应用，用于搜索和浏览 GIF 动图。

## 功能特点

- **默认热门 GIF 展示**：页面加载时自动显示当前热门的 GIF 动图
- **关键词搜索**：支持输入关键词搜索特定的 GIF 动图
- **加载更多**：通过"加载更多"按钮获取更多内容，支持分页加载
- **响应式设计**：适配桌面端和移动端设备
- **大图预览**：点击 GIF 可以在模态框中查看大图
- **一键切换**：在搜索结果和热门 GIF 之间快速切换

## 技术栈

- **前端**：HTML5、CSS3、原生 JavaScript (ES6+)
- **API**：Giphy API
- **部署**：Docker + Nginx
- **构建工具**：Docker Compose

## 项目结构

```
GifSearch/
├── index.html          # 主页面
├── styles.css          # 样式文件（响应式设计）
├── script.js           # 核心逻辑（API 调用、搜索、分页）
├── Dockerfile          # Docker 镜像构建文件
├── docker-compose.yml  # Docker Compose 配置文件
├── .gitignore          # Git 忽略文件
└── README.md           # 项目说明文档
```

## 快速开始

### 环境要求

- Docker
- Docker Compose

### 使用 Docker Compose 一键启动

1. 克隆项目到本地：

```bash
git clone <repository-url>
cd GifSearch
```

2. 使用 Docker Compose 启动应用：

```bash
docker-compose up -d
```

3. 访问应用：

打开浏览器，访问 `http://localhost:8080`

### 其他 Docker 命令

**停止应用**：

```bash
docker-compose down
```

**查看日志**：

```bash
docker-compose logs -f
```

**重新构建镜像**：

```bash
docker-compose up -d --build
```

## 手动部署（不使用 Docker）

如果你不想使用 Docker，也可以直接使用任何静态文件服务器来运行这个项目：

### 方式一：使用 Python 内置服务器

```bash
# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

### 方式二：使用 Node.js 的 http-server

```bash
# 安装 http-server（如果尚未安装）
npm install -g http-server

# 启动服务器
http-server -p 8080
```

然后访问 `http://localhost:8080`

### 方式三：直接在浏览器中打开

虽然可以直接在浏览器中打开 `index.html` 文件，但某些浏览器可能会因为跨域安全策略限制 API 请求。建议使用上述服务器方式。

## API 说明

本项目使用 [Giphy API](https://developers.giphy.com/) 来获取 GIF 数据。

- **API 端点**：
  - 热门 GIF：`https://api.giphy.com/v1/gifs/trending`
  - 搜索 GIF：`https://api.giphy.com/v1/gifs/search`

- **API Key**：当前使用的是 Giphy 提供的公共测试 API Key。如果你有更高的请求需求，建议：
  1. 前往 [Giphy Developers](https://developers.giphy.com/) 注册账号
  2. 创建一个新应用获取专属 API Key
  3. 在 `script.js` 文件中替换 `API_KEY` 常量

## 使用指南

### 查看热门 GIF

- 打开应用后，默认会显示当前热门的 GIF 动图
- 点击"热门"按钮可以随时返回热门 GIF 列表

### 搜索 GIF

1. 在搜索框中输入关键词（例如："cat"、"happy"、"funny"）
2. 点击"搜索"按钮或按回车键
3. 搜索结果会实时显示在页面上

### 加载更多

- 当有更多内容时，页面底部会显示"加载更多"按钮
- 点击按钮即可加载下一页的 GIF 内容
- 新内容会追加到当前列表的底部

### 查看大图

- 点击任意 GIF 图片
- 会在模态框中显示 GIF 的原图
- 可以点击"在 GIPHY 上查看"链接跳转到 Giphy 网站
- 点击关闭按钮、按 ESC 键或点击模态框背景可关闭预览

## 自定义配置

### 修改每页加载数量

在 `script.js` 文件中，修改 `LIMIT` 常量：

```javascript
const LIMIT = 20;  // 改为你想要的数量
```

### 修改服务端口

在 `docker-compose.yml` 文件中修改端口映射：

```yaml
ports:
  - "8080:80"  # 将 8080 改为你想要的端口
```

### 使用自己的 API Key

1. 在 [Giphy Developers](https://developers.giphy.com/) 注册并获取 API Key
2. 编辑 `script.js` 文件，替换 `API_KEY`：

```javascript
const API_KEY = 'your_own_api_key_here';
```

## 注意事项

1. **API 速率限制**：Giphy 的公共测试 API Key 有请求速率限制。如果遇到请求失败，可能是达到了限制，建议使用自己的 API Key。
2. **跨域问题**：Giphy API 支持 CORS，所以可以直接从前端调用，无需后端代理。
3. **图片懒加载**：项目中使用了 `loading="lazy"` 属性，支持图片懒加载，提升页面性能。

## 开发者信息

- **开发日期**：2026-04-17
- **项目类型**：前端静态网页应用
- **数据来源**：GIPHY

## 许可证

MIT License

## 致谢

- 感谢 [GIPHY](https://giphy.com) 提供的开放 API
