'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { IconUser, IconMail, IconPhone, IconMapPin, IconBriefcase, IconCalendar, IconX, IconLogout } from '@tabler/icons-react';
import { useUser } from '@/contexts/UserContext';
import Link from 'next/link';

interface ProfilePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfilePopup({ isOpen, onClose }: ProfilePopupProps) {
  const { userProfile, signOut } = useUser();

  const profileSections = [
    { icon: IconMail, label: 'Email', value: userProfile.email },
    { icon: IconPhone, label: 'Phone', value: userProfile.phone },
    { icon: IconMapPin, label: 'Location', value: userProfile.location },
    { icon: IconBriefcase, label: 'Role', value: userProfile.role },
    { icon: IconCalendar, label: 'Member Since', value: userProfile.joinDate },
  ];

  const initials = userProfile.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#E8E4D9] overflow-hidden"
        >
          <div className="relative p-6 text-center border-b border-[#E8E4D9]">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute right-4 top-4 p-1 hover:bg-[#F5F2E8] rounded-lg"
            >
              <IconX size={20} className="text-[#2F2A20]/60" />
            </motion.button>
            
            <div className="flex justify-center mb-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-20 h-20 bg-[#2F2A20] rounded-2xl flex items-center justify-center text-[#E8E4D9] text-2xl font-semibold"
              >
                {initials}
              </motion.div>
            </div>
            <h3 className="text-xl font-semibold text-[#2F2A20]">{userProfile.name}</h3>
            <p className="text-sm text-[#2F2A20]/60 mt-1">{userProfile.role}</p>
          </div>

          <div className="p-4">
            {profileSections.map((section, index) => (
              <div 
                key={section.label}
                className={`flex items-center gap-3 p-3 rounded-xl hover:bg-[#F5F2E8] transition-colors ${
                  index !== profileSections.length - 1 ? 'mb-2' : ''
                }`}
              >
                <section.icon size={20} className="text-[#2F2A20]/60" />
                <div className="flex-1">
                  <p className="text-sm text-[#2F2A20]/60">{section.label}</p>
                  <p className="text-[#2F2A20]">{section.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-[#E8E4D9]">
            <Link
              href="/profile"
              className="block w-full p-3 text-center bg-[#2F2A20] text-[#E8E4D9] rounded-xl hover:bg-[#2F2A20]/90 transition-colors"
              onClick={onClose}
            >
              View Profile
            </Link>
            <Link
              href="/settings"
              className="block w-full p-3 text-center text-[#2F2A20] hover:bg-[#F5F2E8] rounded-xl mt-2 transition-colors"
              onClick={onClose}
            >
              Settings
            </Link>
            <button
              onClick={() => {
                signOut();
                onClose();
              }}
              className="block w-full p-3 text-center text-red-600 hover:bg-red-50 rounded-xl mt-2 transition-colors"
            >
              <div className="flex items-center justify-center gap-2">
                <IconLogout size={18} />
                <span>Sign Out</span>
              </div>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 