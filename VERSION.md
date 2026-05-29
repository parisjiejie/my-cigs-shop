# 版本记录 (Version History)

## 当前版本

| 字段 | 值 |
|-----|------|
| **版本号** | `v1.0.0-pre-promotion-debug` |
| **创建时间** | 2026-05-29 |
| **描述** | 优惠方案调试前的版本 |
| **主要修改** | 修复 `campaignHelper.ts` 中 `tiered_discount` 的 `uniqueItemCount >= 2` 改为 `>= 1`，支持单商品满减 |

---

## 版本列表

### v1.0.0-pre-promotion-debug
- **时间**: 2026-05-29
- **Commit ID**: `2b2364e`
- **描述**: 优惠方案调试前的稳定版本
- **主要修改**:
  - 修复 `lib/campaignHelper.ts` 第100行：`uniqueItemCount >= 2` → `>= 1`
  - 此修改使单商品购物车也能触发满减活动

---

## 回退命令

### 1. 回退整个项目到指定版本
```bash
git checkout v1.0.0-pre-promotion-debug
```

### 2. 只回退 campaignHelper.ts 文件
```bash
git checkout v1.0.0-pre-promotion-debug -- lib/campaignHelper.ts
```

### 3. 查看当前所有版本标签
```bash
git tag -l
```

### 4. 查看版本详情
```bash
git show v1.0.0-pre-promotion-debug
```

---

## 备注

- 当前 HEAD 位于 `main` 分支
- 上游远程仓库 (origin/main) 已断开连接，如需推送请联系开发者
