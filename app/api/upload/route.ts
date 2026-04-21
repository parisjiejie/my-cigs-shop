import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "没有上传文件" }, { status: 400 });
    }

    // 读取文件内容
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 生成唯一文件名 (防止同名覆盖)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = file.name.split('.').pop();
    const filename = `product-${uniqueSuffix}.${extension}`;

    // 确定保存路径 (保存到 public/products)
    const uploadDir = path.join(process.cwd(), 'public/products');
    const filepath = path.join(uploadDir, filename);

    // 写入文件
    await writeFile(filepath, buffer);

    // 返回图片的访问路径
    return NextResponse.json({ url: `/products/${filename}` });

  } catch (error) {
    console.error('上传失败:', error);
    return NextResponse.json({ error: "上传出错" }, { status: 500 });
  }
}