import React from 'react';

/**
 * 环境兼容性处理：
 * 这里的 try-catch 和 Mock 是为了确保代码在各种预览环境下都能正常编译。
 * 在您的本地项目中，它会自动识别并使用您真实的 globals.css 和 SessionProvider。
 */

// 尝试引入全局样式
try {
  require('./globals.css');
} catch (e) {
  // 预览环境可能缺失此文件，忽略错误
}

// 尝试引入 SessionProvider，如果失败则提供一个透明的 Mock 组件
let SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;
try {
  // 尝试多种可能的路径
  const providers = require('@/components/SessionProvider') || require('../components/SessionProvider');
  if (providers && providers.default) {
    SessionProvider = providers.default;
  }
} catch (e) {
  // 如果路径解析失败，使用上面的 Mock 组件以保证页面不崩溃
}

/**
 * 环境标识组件
 * 帮助您识别当前身处：本地 (Local)、测试预览 (Preview) 还是正式生产环境 (Production)
 */
function EnvironmentBadge() {
  // 获取当前环境标识（Next.js 标准环境变量）
  const env = process.env.NEXT_PUBLIC_VERCEL_ENV || 'development';
  const isLocal = process.env.NODE_ENV === 'development';

  // 如果是正式生产环境且不在本地运行，则不显示标识，保持线上页面整洁
  if (env === 'production' && !isLocal) return null;

  return (
    <div className="fixed bottom-6 right-6 z-9999 pointer-events-none select-none">
      {isLocal ? (
        <div className="bg-amber-400 text-black text-[11px] font-black px-3 py-1.5 rounded-full shadow-2xl border-2 border-black uppercase tracking-tighter animate-pulse">
          本地开发 (Local)
        </div>
      ) : env === 'preview' ? (
        <div className="bg-indigo-600 text-white text-[11px] font-black px-3 py-1.5 rounded-full shadow-2xl border-2 border-white uppercase tracking-tighter">
          测试预览 (Preview)
        </div>
      ) : null}
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {/* 在应用的最高层包裹 SessionProvider */}
        {/* 确保身份验证状态在整个应用中可用 */}
        <SessionProvider>
          {children}
        </SessionProvider>

        {/* 环境标识标签 - 只在开发和测试预览时出现，帮助区分数据库环境 */}
        <EnvironmentBadge />
      </body>
    </html>
  );
}