/**
 * 将产品名称转换为 URL 友好的 slug 格式
 * 与 app/api/admin/product/route.ts 中的逻辑完全一致
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[\s]+/g, '-')
    .replace(/[^\w-]+/g, '');
}

/**
 * 规范化已有的 slug（处理 CSV 导入等场景中可能含空格、大小写混合的 slug）
 */
export function normalizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .replace(/[\s]+/g, '-')
    .replace(/[^\w-]+/g, '');
}
