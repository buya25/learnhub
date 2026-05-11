import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/auth';
import { ToastProvider } from '@/components/Toast';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'LearnHub — Free Resources for Everyone',
  description: 'Share and discover free learning resources, ask questions, and grow together.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <footer className="bg-white border-t mt-16 py-8 text-center text-sm text-gray-500">
              © {new Date().getFullYear()} LearnHub — Free knowledge for everyone
            </footer>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
