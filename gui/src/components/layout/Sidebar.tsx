'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { IconMicrophone, IconDashboard, IconTicket, IconSettings, IconUser } from '@tabler/icons-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  const menuItems = [
    { icon: IconDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: IconMicrophone, label: 'Voice Meetings', href: '/meetings' },
    { icon: IconTicket, label: 'Tickets', href: '/tickets' },
    { icon: IconUser, label: 'Profile', href: '/profile' },
    { icon: IconSettings, label: 'Settings', href: '/settings' },
  ];

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <motion.aside
      initial={{ width: isOpen ? 280 : 80 }}
      animate={{ width: isOpen ? 280 : 80 }}
      className="bg-[#E8E4D9] h-screen py-6 px-4 shadow-xl relative"
    >
      <div className="flex items-center h-12 mb-12 px-2">
        <button onClick={() => handleNavigation('/')} className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#2F2A20] rounded-xl shadow-lg flex items-center justify-center">
            <span className="text-[#E8E4D9] font-bold text-lg">V</span>
          </div>
          {isOpen && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-2xl text-[#2F2A20]"
            >
              VORI
            </motion.span>
          )}
        </button>
      </div>
      
      <nav className="space-y-3">
        {menuItems.map((item) => (
          <motion.button
            key={item.href}
            onClick={() => handleNavigation(item.href)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-[#D8D0BC] text-[#2F2A20]/80 hover:text-[#2F2A20] transition-all duration-200 group relative ${
              pathname === item.href ? 'bg-[#D8D0BC] text-[#2F2A20]' : ''
            }`}
          >
            <item.icon 
              size={24} 
              className="transition-transform group-hover:scale-110 stroke-[1.5]" 
            />
            {isOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-medium text-base"
              >
                {item.label}
              </motion.span>
            )}
            {pathname === item.href && (
              <motion.div 
                layoutId="activeIndicator"
                className="absolute left-0 w-1 h-8 bg-[#2F2A20] rounded-r-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </motion.button>
        ))}
      </nav>
    </motion.aside>
  );
} 