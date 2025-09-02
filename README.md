# MDC文件管理器 - VS Code插件

一个专业的VS Code插件，帮助开发者快速管理和复制.mdc模板文件到项目的.cursor/rules目录中，并提供完整的Cursor Rules模板体系和AI工具生态。

## 🎆 亮点特性

- 📦 **Cursor Rules模板体系**: 提供完整的规则模板架构（强制执行、关键字触发、@调用触发）
- 🤖 **AI工具生态**: 内置7个专业AI助手（开发工作流、沟通优化、演示设计、架构可视化、提示词优化、质量校验、分步问题求解）
- 🎯 **分层架构设计**: 实现职责分离和按需调用的现代化规则管理
- 🌍 **免费开源**: 完全免费使用，无需任何许可证或验证
- 🔄 **批量操作**: 支持一键导入、多选、批量复制
- 🌐 **Git集成**: 支持从远程Git仓库直接导入模板

> 🔥 **新手用户**: 请按照下方的"快速开始"部分进行操作！

## 🚀 四大核心功能

### 1️⃣ 浏览内置模板
通过命令面板选择 `MDC Manager: 浏览内置MDC资源`，可以：
- 📋 按分类浏览模板（Cursor Rules、规则模板、AI工具）
- 📝 选择单个或多个模板文件
- 📂 选择整个分类文件夹
- ✨ 自动保持目录结构到.cursor/rules目录

### 2️⃣ 一键导入全部模板 🆕
通过命令面板选择 `MDC Manager: 一键导入全部内置模板`，可以：
- 🚀 **一键导入所有内置模板**（新功能！）
- 📈 **详细统计信息**：显示将导入的文件数量和分类
- ⚠️ **覆盖确认**：如果目标目录存在同名文件，会提示确认后覆盖
- ✅ **结果反馈**：显示每个分类的导入结果

### 3️⃣ 导入外部模板
通过命令面板选择 `MDC Manager: 选择外部MDC文件`，可以：
- 📁 从本地文件系统选择 `.mdc` 文件
- 📂 选择包含 `.mdc` 文件的文件夹
- 🔍 自动提示如何显示隐藏文件（以访问 `.cursor/rules` 目录）
- 💾 保持原有的目录结构到.cursor/rules目录

### 4️⃣ 从Git仓库导入 🆕
通过命令面板选择 `MDC Manager: 从Git仓库导入MDC文件`，可以：
- 🌐 **远程仓库导入**（新功能！）支持HTTPS和SSH格式
- 📊 **智能扫描**：自动扫描仓库中的所有.mdc文件
- 📝 **灵活选择**：支持按文件或文件夹选择导入
- 💹 **临时存储**：自动管理临时文件，无需手动清理
- 🔒 **安全克隆**：使用系统本地Git工具，支持身份验证
- 📁 **正确路径**：自动复制到.cursor/rules目录

## 📁 Cursor Rules 模板体系

插件内置了完整的Cursor Rules模板架构，采用分层设计：

### 🔒 Base层 - 基础规则
- `global-mandatory.mdc` - 全局强制执行规则（中文回复、规则声明）
- `mcp-feedback-enhanced-rule.mdc` - MCP交互反馈增强规则

### 📚 Templates层 - 规则模板库
- `mandatory-rule-template.md` - 强制执行规则模板
- `keyword-trigger-template.md` - 关键字触发规则模板
- `mention-trigger-template.md` - @调用触发规则模板
- `base-rule-template.md` - 基础规则模板

### 🛠️ Tools层 - AI工具生态 🆕
- `ai-6a-workflow.mdc` - 6A工作流AI编程助手
- `communication-strategist.mdc` - 结构化表达战略家
- `presentation-designer.mdc` - AI演示文稿设计师
- `interactive-architecture-generator.mdc` - 交互式架构图生成器
 - `sequential-thinking.mdc` - 智能分步问题解决工具

### 🤖 AI增强工具 (Templates层) 🆕
- `ai-prompt-enhancer.mdc` - 智能AI提示词增强器
- `prompt-validator.mdc` - 提示词质量校验器

### 🎯 架构特点
- **分层架构**: Base → Templates → Tools 三层设计
- **职责分离**: 每层专注特定类型的规则
- **按需调用**: 支持强制执行、关键字触发、@调用触发三种模式
- **模块化管理**: 易于扩展和维护
- **AI工具生态**: 6个专业AI助手，覆盖开发、沟通、设计、可视化等场景

## 🤖 AI工具生态介绍

### 🔄 6A工作流AI编程助手
- **触发方式**: `@6A`
- **功能**: 端到端软件开发流程管理，从需求对齐到质量评估的6阶段工作流
- **特色**: 结构化文档产出、质量门控、自动化执行

### 🎯 结构化表达战略家
- **触发方式**: `@communication-strategist`
- **功能**: 深度理解沟通场景，匹配最佳表达框架
- **特色**: 第一性原理体系、经典框架库、共创优化

### 🎨 AI演示文稿设计师
- **触发方式**: `@presentation-designer`
- **功能**: 将源文档转化为专业SVG演示文稿
- **特色**: 两阶段协作、强制高度规则、自适应布局

### 🏗️ 交互式架构图生成器
- **触发方式**: `@architecture-generator`
- **功能**: 生成基于React Flow 11的交互式架构图
- **特色**: 单HTML文件、CDN引入、开箱即用

### 🚀 智能AI提示词增强器
- **触发方式**: `@prompt-enhancer`
- **功能**: 将简单提示词扩展为专业、结构化的AI指令
- **特色**: 自动化质量校验、MSEC原则验证、智能优化

### ✅ 提示词质量校验器
### 🧩 智能分步问题解决工具
- **触发方式**: `@sequential-thinking`
- **功能**: 将复杂问题拆解为有序的可执行步骤，逐步推理与校验
- **特色**: 明确的阶段输出、可回溯思考链路、支持中途修正与复盘
- **触发方式**: `@prompt-validator`
- **功能**: 基于MSEC四大原则评估和优化AI提示词
- **特色**: 量化评分体系、详细诊断报告、优化建议

## 🚀 快速开始

### 🎆 新手用户（强烈推荐）
MDC文件管理器是一个VS Code插件，专门用于管理和复制.mdc模板文件到项目的.cursor目录中。

主要特点：
- 📖 简单易用的VS Code插件
- 🛠️ 一键安装，无需复杂配置
- 🌎 支持多种导入方式（内置、外部、Git）
- 🔧 完整的Cursor Rules模板体系
- 🤖 丰富的AI工具生态
- 📁 自动复制到正确的.cursor/rules目录

### 🛠️ 安装方法

#### 方法一：命令行安装（推荐）

1. **获取插件文件**：下载 `mdc-file-manager-1.0.0.vsix`
2. **安装插件**：
   ```bash
   code --install-extension mdc-file-manager-1.0.0.vsix
   ```
3. **重启VS Code**

#### 方法二：手动安装（图形界面）

1. **获取插件文件**：下载 `mdc-file-manager-1.0.0.vsix`
2. **打开VS Code/Cursor**
3. **打开命令面板**：按 `Ctrl+Shift+P` (Windows/Linux) 或 `Cmd+Shift+P` (macOS)
4. **输入命令**：`Extensions: Install from VSIX...`
5. **选择文件**：在弹出的文件选择器中选择下载的 `mdc-file-manager-1.0.0.vsix` 文件
6. **确认安装**：点击安装并重启编辑器

#### 方法三：从源码安装（开发者）

1. 克隆或下载项目到本地
2. 进入项目目录：
   ```bash
   cd mdc-file-manager
   ```

3. 安装依赖：
   ```bash
   npm install
   ```

4. 编译项目：
   ```bash
   npm run compile
   ```

5. 在VS Code中按 `F5` 启动调试模式

### 📋 使用步骤

#### 第一步：导入模板
1. 打开VS Code命令面板 (`Ctrl+Shift+P` 或 `Cmd+Shift+P`)
2. 选择 `MDC Manager: 一键导入全部内置模板`
3. 确认导入操作

#### 第二步：使用AI工具
1. 在Cursor中激活相应的AI工具：
   ```
   @6A 开发一个用户管理系统
   @communication-strategist 我要面试产品经理
   @presentation-designer 请为我的报告设计演示文稿
   @architecture-generator 生成微服务架构图
   @prompt-enhancer 优化我的提示词
   @prompt-validator 校验这个提示词的质量
   @sequential-thinking 用分步方式解决这个复杂问题
   ```

#### 第三步：自定义模板
1. 根据需要修改导入的模板
2. 创建自己的.mdc文件
3. 使用插件功能导入到项目中

## 📊 项目统计

- **总文件数**: 12个内置模板文件
- **代码行数**: 3,220+ 行
- **支持功能**: 4个核心功能 + 7个AI工具
- **技术栈**: TypeScript + Webpack + ESLint

## 🤝 贡献指南

### 📁 内置MDC模板贡献

我们欢迎社区贡献高质量的MDC模板！贡献流程：

1. **Fork项目**
2. **创建模板**: 在 `src/resources/` 相应目录下创建模板文件
3. **测试验证**: 确保模板在Cursor中正常工作
4. **提交PR**: 详细说明模板用途和特色
5. **等待审核**: 维护者会及时审核你的贡献

### 🎯 贡献模板类型

我们特别需要以下类型的模板：

#### 💻 编程语言模板
- Python (Django, Flask, FastAPI)
- Java (Spring Boot, Maven)
- JavaScript (React, Vue, Node.js)
- TypeScript (项目配置, 类型定义)
- Go (Web服务, CLI工具)
- Rust (系统编程, Web应用)

#### 🔄 DevOps模板
- Docker & Kubernetes
- CI/CD (GitHub Actions, GitLab CI)
- 云服务配置 (AWS, Azure, GCP)
- 监控工具 (Prometheus, Grafana)

#### 🗄️ 数据库模板
- 关系型数据库 (MySQL, PostgreSQL)
- NoSQL (MongoDB, Redis)
- 云数据库服务

#### 🎨 前端开发模板
- CSS框架 (Tailwind, Bootstrap)
- 构建工具 (Webpack, Vite)
- 移动端开发 (React Native, Flutter)

## 📞 联系我们

- 💬 **问题反馈**: [GitHub Issues](https://github.com/qiang521o/mdc-file-manager/issues)
- 💭 **功能讨论**: [GitHub Issues](https://github.com/qiang521o/mdc-file-manager/issues) (使用"Feature Request"标签)
- 🌟 **给项目点星**: [Star此项目](https://github.com/qiang521o/mdc-file-manager)

## 📄 许可证

本项目采用 [MIT许可证](LICENSE) - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者们！特别感谢：

- [Cursor](https://cursor.sh/) 团队提供的优秀AI编程环境
- [VS Code](https://code.visualstudio.com/) 团队提供的强大扩展平台
- 所有使用和反馈的用户们

---

**让AI编程更简单，让开发更高效！** 🚀