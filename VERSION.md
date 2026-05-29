# 版本记录 (Version History)

## 当前版本

| 字段 | 值 |
|-----|------|
| **版本号** | `v1.0.1-promotion-fix` |
| **创建时间** | 2026-05-29 |
| **描述** | 修复优惠方案无法触发的问题 |
| **主要修改** | 修复 `/api/campaigns/active` 查询不返回活动的问题 |

---

## 版本列表

### v1.0.1-promotion-fix
- **时间**: 2026-05-29
- **Commit ID**: `a086183`
- **描述**: 修复优惠方案无法触发的问题
- **主要修改**:
  - 修复 `app/api/campaigns/active/route.ts` 查询逻辑
  - 将 `$exists: false` 改为 `null`，正确匹配无日期限制的活动
  - 之前查询返回0个活动，现在正确返回3个活动

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
git checkout v1.0.1-promotion-fix
git checkout v1.0.0-pre-promotion-debug
```

### 2. 只回退特定文件
```bash
# 回退 campaignHelper.ts
git checkout v1.0.0-pre-promotion-debug -- lib/campaignHelper.ts

# 回退 campaigns API
git checkout v1.0.0-pre-promotion-debug -- app/api/campaigns/active/route.ts
```

### 3. 查看当前所有版本标签
```bash
git tag -l
```

### 4. 查看版本详情
```bash
git show v1.0.1-promotion-fix
```

---

## 备注

- 当前 HEAD 位于 `main` 分支
- 上游远程仓库 (origin/main) 已断开连接
