'use client';
import { motion } from 'framer-motion';
import { IconBrandGoogle } from '@tabler/icons-react';

interface GoogleSignInButtonProps {
  text?: string;
  onClick?: () => void;
}

export default function GoogleSignInButton({ text = 'Sign in with Google', onClick }: GoogleSignInButtonProps) {
  const handleGoogleSignIn = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleGoogleSignIn}
      className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-[#E8E4D9] hover:bg-[#E8E4D9]/5 transition-all"
    >
      <IconBrandGoogle size={20} className="text-[#2F2A20]" />
      <span className="text-[#2F2A20] font-medium">{text}</span>
    </motion.button>
  );
} 