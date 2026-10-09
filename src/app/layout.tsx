import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CodeForge — Autonomous Software Engineering',
  description: 'Genuinely autonomous SWE platform: inspects repositories, plans A/B solutions, codes in sandbox, self-repairs, and verifies GitHub PRs with cryptographic evidence.',
  keywords: 'AI, software engineering, autonomous coding, agentic AI, Qwen3, CodeForge',
  openGraph: {
    title: 'CodeForge — Autonomous Software Engineering',
    description: 'The most advanced AI SWE platform. Powered by Qwen3-Coder via OpenRouter.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600;700;800;900&family=Orbitron:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ background: '#03040a', color: '#e8eaf6', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
