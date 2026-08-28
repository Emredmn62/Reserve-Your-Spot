import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Change APP_NAME here to rename the entire web admin
export const APP_NAME = 'BookLocal';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: `${APP_NAME} Admin`,
  description: `${APP_NAME} — Business Booking Platform Admin Panel`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0A0A0A] text-white min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
