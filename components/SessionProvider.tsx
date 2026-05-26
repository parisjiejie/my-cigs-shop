"use client";

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

// 这个组件的作用是给 NextAuth 的 hook (如 useSession) 提供上下文
export default function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>
      {children}
    </NextAuthSessionProvider>
  );
}