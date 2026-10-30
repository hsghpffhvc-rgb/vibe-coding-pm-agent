import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '产品专家 Agent · Vibe Coding PM',
  description: '把一句话想法收敛成 Cursor 可直接执行的深色系产品文档',
};

export const viewport: Viewport = {
  themeColor: '#09090B',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-40 -top-48 h-[560px] w-[560px] rounded-full bg-violet-600/20 blur-[130px]" />
          <div className="absolute -bottom-48 -right-40 h-[560px] w-[560px] rounded-full bg-cyan-500/15 blur-[130px]" />
        </div>
        {children}
      </body>
    </html>
  );
}
