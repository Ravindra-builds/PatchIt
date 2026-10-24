import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PatchPath — Start with an issue. Leave with a plan.',
  description:
    'Orient yourself in an unfamiliar open-source GitHub repository with a source-linked first-contribution plan powered by Gemma 4.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#0B111B] text-[#E6EDF5]">
        {children}
      </body>
    </html>
  );
}
