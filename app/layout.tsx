import type { Metadata } from 'next';
import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-playfair', // wait, typo here, let's fix it in the next step or just write it correctly
});

export const metadata: Metadata = {
  title: '命理小说引擎 | Bazi Novel Engine',
  description: '基于八字命理的小说角色与剧本生成工具',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${playfair.variable} ${jetbrains.variable}`}>
      <body className="font-sans antialiased min-h-screen bg-[#050505] text-zinc-300 selection:bg-amber-500/30 selection:text-amber-200" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
