'use client';
import { motion } from 'framer-motion';
import { IconEdit, IconUpload, IconUser } from '@tabler/icons-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';

export default function ProfileSettings() {
  const { theme, layout } = useTheme();
  const { userProfile, updateProfile } = useUser();
  const hasProfileImage = false;

  return (
    <div className={`space-y-6 ${
      layout === 'compact' ? 'space-y-4' : layout === 'expanded' ? 'space-y-8' : 'space-y-6'
    }`}>
      <h2 className="text-2xl font-semibold text-[#2F2A20] dark:text-[#E8E4D9]">Profile Settings</h2>
      
      <div className={`flex items-start gap-6 bg-[#E8E4D9]/5 dark:bg-[#E8E4D9]/10 rounded-xl ${
        layout === 'compact' ? 'p-4' : layout === 'expanded' ? 'p-8' : 'p-6'
      }`}>
        <div className="relative">
          {hasProfileImage ? (
            <img 
              src="/avatar.jpg" 
              alt="Profile" 
              className="w-24 h-24 rounded-xl object-cover border-2 border-[#E8E4D9] dark:border-[#2F2A20]"
            />
          ) : (
            <div className="w-24 h-24 rounded-xl bg-[#E8E4D9]/10 dark:bg-[#2F2A20]/20 flex items-center justify-center border-2 border-dashed border-[#2F2A20]/20 dark:border-[#E8E4D9]/20">
              <IconUser size={32} className="text-[#2F2A20]/40 dark:text-[#E8E4D9]/40" />
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute -bottom-2 -right-2 p-2 bg-[#2F2A20] dark:bg-[#E8E4D9] rounded-lg text-[#E8E4D9] dark:text-[#2F2A20] shadow-lg"
          >
            <IconUpload size={16} />
          </motion.button>
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <label className="text-sm text-[#2F2A20]/60 dark:text-[#E8E4D9]/60">Display Name</label>
            <input 
              type="text" 
              value={userProfile.name}
              onChange={(e) => updateProfile({ name: e.target.value })}
              className="w-full mt-1 bg-white dark:bg-[#2F2A20] border border-[#E8E4D9] dark:border-[#E8E4D9]/20 rounded-lg text-[#2F2A20] dark:text-[#E8E4D9] focus:outline-none focus:border-[#2F2A20] dark:focus:border-[#E8E4D9] transition-colors"
              style={{
                padding: layout === 'compact' ? '0.5rem' : layout === 'expanded' ? '1rem' : '0.75rem'
              }}
            />
          </div>
          <div>
            <label className="text-sm text-[#2F2A20]/60 dark:text-[#E8E4D9]/60">Bio</label>
            <textarea 
              value={userProfile.role}
              onChange={(e) => updateProfile({ role: e.target.value })}
              className="w-full mt-1 bg-white dark:bg-[#2F2A20] border border-[#E8E4D9] dark:border-[#E8E4D9]/20 rounded-lg text-[#2F2A20] dark:text-[#E8E4D9] focus:outline-none focus:border-[#2F2A20] dark:focus:border-[#E8E4D9] transition-colors h-24 resize-none"
              style={{
                padding: layout === 'compact' ? '0.5rem' : layout === 'expanded' ? '1rem' : '0.75rem'
              }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className={`flex items-center justify-between rounded-xl bg-[#E8E4D9]/5 dark:bg-[#E8E4D9]/10 ${
          layout === 'compact' ? 'p-3' : layout === 'expanded' ? 'p-6' : 'p-4'
        }`}>
          <div>
            <h3 className="font-medium text-[#2F2A20] dark:text-[#E8E4D9]">Email Visibility</h3>
            <p className="text-sm text-[#2F2A20]/60 dark:text-[#E8E4D9]/60">Show email to other team members</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="w-12 h-6 bg-[#2F2A20] dark:bg-[#E8E4D9] rounded-full relative"
          >
            <motion.div className="w-5 h-5 bg-[#E8E4D9] dark:bg-[#2F2A20] rounded-full absolute top-0.5 right-0.5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
} 