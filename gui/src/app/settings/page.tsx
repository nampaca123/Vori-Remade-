'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconUser, IconBell, IconMicrophone, IconPalette, 
  IconLock, IconDevices, IconLanguage, IconTicket 
} from '@tabler/icons-react';
import MainLayout from '@/components/layout/MainLayout';
import { useState } from 'react';
import ProfileSettings from '@/components/settings/ProfileSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import MeetingSettings from '@/components/settings/MeetingSettings';
import AppearanceSettings from '@/components/settings/AppearanceSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';
import DeviceSettings from '@/components/settings/DeviceSettings';
import LanguageSettings from '@/components/settings/LanguageSettings';
import TicketSettings from '@/components/settings/TicketSettings';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  const settingsTabs = [
    { id: 'profile', label: 'Profile', icon: IconUser },
    { id: 'notifications', label: 'Notifications', icon: IconBell },
    { id: 'meetings', label: 'Meeting Preferences', icon: IconMicrophone },
    { id: 'appearance', label: 'Appearance', icon: IconPalette },
    { id: 'security', label: 'Security', icon: IconLock },
    { id: 'devices', label: 'Connected Devices', icon: IconDevices },
    { id: 'language', label: 'Language & Region', icon: IconLanguage },
    { id: 'tickets', label: 'Ticket Settings', icon: IconTicket },
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-[#2F2A20] to-[#1a1814] rounded-2xl p-8 text-[#E8E4D9]"
        >
          <div className="relative z-10">
            <h1 className="text-4xl font-bold">Settings</h1>
            <p className="text-[#E8E4D9]/60 mt-2 text-lg">Manage your account preferences</p>
          </div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E8E4D9]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        </motion.div>

        <div className="grid grid-cols-12 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="col-span-3 space-y-2"
          >
            {settingsTabs.map((tab, index) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all ${
                  activeTab === tab.id 
                    ? 'bg-[#2F2A20] text-[#E8E4D9]' 
                    : 'hover:bg-[#2F2A20]/5 text-[#2F2A20]'
                }`}
              >
                <tab.icon size={20} />
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="col-span-9 bg-white rounded-2xl border border-[#E8E4D9] p-8"
            >
              {activeTab === 'profile' && <ProfileSettings />}
              {activeTab === 'notifications' && <NotificationSettings />}
              {activeTab === 'meetings' && <MeetingSettings />}
              {activeTab === 'appearance' && <AppearanceSettings />}
              {activeTab === 'security' && <SecuritySettings />}
              {activeTab === 'devices' && <DeviceSettings />}
              {activeTab === 'language' && <LanguageSettings />}
              {activeTab === 'tickets' && <TicketSettings />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </MainLayout>
  );
} 