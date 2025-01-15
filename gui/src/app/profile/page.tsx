'use client';
import { motion } from 'framer-motion';
import { IconUser, IconEdit, IconCamera, IconMail, IconPhone, IconBrandGithub, IconLogout } from '@tabler/icons-react';
import MainLayout from '@/components/layout/MainLayout';
import ActivityOverview from '@/components/profile/ActivityOverview';
import { useUser } from '@/contexts/UserContext';

interface InfoItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

function InfoItem({ icon: Icon, label, value }: InfoItemProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-[#E8E4D9]/5 rounded-xl">
      <Icon className="text-[#2F2A20]/60" size={20} />
      <div>
        <p className="text-sm text-[#2F2A20]/60">{label}</p>
        <p className="text-[#2F2A20]">{value}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { userProfile, signOut } = useUser();

  return (
    <MainLayout>
      <div className="space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-[#2F2A20] to-[#1a1814] rounded-2xl p-8 text-[#E8E4D9]"
        >
          <div className="relative z-10 flex items-center gap-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-[#E8E4D9]/10 flex items-center justify-center">
                <IconUser size={40} className="text-[#E8E4D9]/60" />
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute bottom-0 right-0 p-2 bg-[#E8E4D9]/10 rounded-full backdrop-blur-md border border-[#E8E4D9]/20"
              >
                <IconCamera size={16} />
              </motion.button>
            </div>
            <div>
              <h1 className="text-4xl font-bold">{userProfile.name}</h1>
              <p className="text-[#E8E4D9]/60 mt-2 text-lg">{userProfile.role}</p>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E8E4D9]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        </motion.div>

        <div className="grid grid-cols-12 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="col-span-4 bg-white rounded-2xl border border-[#E8E4D9] p-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-[#2F2A20]">Personal Information</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-[#E8E4D9]/20 rounded-lg"
              >
                <IconEdit size={20} className="text-[#2F2A20]" />
              </motion.button>
            </div>
            <div className="space-y-6">
              <InfoItem icon={IconMail} label="Email" value={userProfile.email} />
              <InfoItem icon={IconPhone} label="Phone" value={userProfile.phone} />
              <InfoItem icon={IconBrandGithub} label="GitHub" value={userProfile.github} />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="col-span-8"
          >
            <ActivityOverview />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-4 bg-white rounded-2xl border border-[#E8E4D9] p-8 mt-6"
        >
          <button
            onClick={() => signOut()}
            className="w-full p-4 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <IconLogout size={20} />
            <span>Sign Out</span>
          </button>
        </motion.div>
      </div>
    </MainLayout>
  );
} 