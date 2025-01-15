'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
  href?: string;
}

export default function Logo({ className = '', size = 'medium', href = '/' }: LogoProps) {
  const sizes = {
    small: 'text-2xl',
    medium: 'text-4xl',
    large: 'text-6xl'
  };

  const content = (
    <motion.h1 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`font-bold ${sizes[size]} ${className}`}
    >
      VORI
    </motion.h1>
  );

  return href ? (
    <Link href={href} className="hover:opacity-80 transition-opacity">
      {content}
    </Link>
  ) : content;
} 