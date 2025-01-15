'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  linkText: string;
  linkHref: string;
}

export default function AuthLayout({ children, title, subtitle, linkText, linkHref }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-neutral-50 flex">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          <div className="flex justify-center mb-8">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-500 rounded-md" />
              <span className="font-bold text-2xl text-neutral-900">NAMPACA</span>
            </Link>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white py-8 px-4 shadow-sm rounded-xl sm:px-10 border border-neutral-200"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900">{title}</h2>
              <p className="mt-2 text-neutral-600">{subtitle}</p>
            </div>
            {children}
            <div className="mt-6 text-center">
              <Link href={linkHref} className="text-primary-500 hover:text-primary-600">
                {linkText}
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
} 