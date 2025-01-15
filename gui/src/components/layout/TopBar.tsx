'use client';
import { motion } from 'framer-motion';
import { IconBell, IconSearch, IconMenu2 } from '@tabler/icons-react';
import Button from '@/components/ui/Button';

interface TopBarProps {
  onMenuClick?: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  return (
    <div className="h-20 bg-white/90 backdrop-blur-xl border-b border-[#E8E4D9]/30 px-8 flex items-center justify-between sticky top-0 shadow-sm">
      <div className="flex items-center gap-6">
        <Button
          variant="ghost"
          onClick={onMenuClick}
          className="lg:hidden hover:bg-[#E8E4D9]/10 rounded-xl p-2"
        >
          <IconMenu2 size={24} className="text-[#2F2A20]" />
        </Button>
        
        <div className="relative hidden md:block">
          <IconSearch size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2F2A20]/40" />
          <input
            type="text"
            placeholder="Search anything..."
            className="pl-12 pr-4 py-3 rounded-xl bg-[#F5F2E8] border-0 w-80 focus:outline-none focus:ring-2 focus:ring-[#E8E4D9] focus:bg-white transition-all duration-200 placeholder-[#2F2A20]/30 text-[#2F2A20]"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2.5 rounded-xl hover:bg-[#F5F2E8] transition-colors duration-200"
        >
          <IconBell size={24} className="text-[#2F2A20]" />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#8B4513] rounded-full ring-2 ring-white" />
        </motion.button>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-xl bg-[#2F2A20] cursor-pointer shadow-lg flex items-center justify-center"
        >
          <span className="text-[#E8E4D9] font-medium">JD</span>
        </motion.div>
      </div>
    </div>
  );
} 