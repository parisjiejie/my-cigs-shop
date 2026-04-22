import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // 0. 静态资源和图片直接放行
  if (path.match(/\.(jpg|jpeg|gif|png|svg|ico|webp)$/)) {
    return NextResponse.next();
  }

  // 🛑 核心修复：强制放行所有 NextAuth 相关请求
  // 无论白名单怎么写，这里直接通过，防止 Session 获取被拦截导致 401/Client Fetch Error
  if (path.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // 1. 定义完全公开的路径
  const PUBLIC_PATHS = [
    '/', 
    '/login', 
    '/register', 
    '/forgot-password', 
    '/reset-password',
    '/product', 
    '/checkout',
    '/api/seed', 
    '/api/order',
    '/api/shipping-methods',
    '/api/campaigns', 
    '/_next',
    '/public'
  ];
  
  // 检查是否是公共路径
  const isPublicPath = PUBLIC_PATHS.some(p => path === p || path.startsWith(p + '/'));

  if (isPublicPath) {
    return NextResponse.next();
  }

  // 2. 获取用户 Token
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  // 3. 处理受保护路径
  if (!token) {
    // API 请求返回 JSON 401
    if (path.startsWith('/api/')) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Authentication failed' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }

    // 页面请求重定向到登录页
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(url);
  }

  // 4. 管理员权限检查
  if (path.startsWith('/admin') && token.role !== 'admin') {
    const url = req.nextUrl.clone();
    url.pathname = '/profile';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};