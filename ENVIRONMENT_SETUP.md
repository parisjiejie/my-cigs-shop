# ==========================================
# 环境配置说明 (Environment Configuration)
# ==========================================

## 数据库分离策略

本项目使用两个独立的数据库环境：

### 1. 本地测试环境 (Local Development)
- 配置文件：`.env.local`
- 数据库：`mycigsdb_dev`
- 用途：本地开发、测试、调试
- 特点：不影响正式数据，可随意修改

### 2. 正式环境 (Production)
- 配置文件：`.env.production` (需从模板创建)
- 数据库：`mycigsdb_prod`
- 用途：正式运营环境
- 特点：真实用户数据，需谨慎操作

## 文件说明

- `.env.local` - 本地开发配置 (已存在，指向测试库)
- `.env.production.template` - 正式环境配置模板
- `.env.production` - 正式环境配置 (需手动创建)
- `.gitignore` - 确保环境文件不被提交

## 使用方法

### 本地开发
```bash
# 默认使用 .env.local (测试数据库)
npm run dev
```

### 部署到正式环境
1. 复制模板文件：`cp .env.production.template .env.production`
2. 编辑 `.env.production`，填入正式配置
3. 在部署平台设置环境变量
4. 运行数据迁移：`npx tsx migrate-products.ts`

## 安全注意事项

- 永远不要在代码中硬编码数据库密码
- 正式环境密钥必须使用强密码
- 定期更换 NEXTAUTH_SECRET
- 不要将 `.env.local` 或 `.env.production` 提交到 git
