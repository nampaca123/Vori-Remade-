'use client';
import { motion } from 'framer-motion';
import { IconBell, IconMail, IconDeviceMobile } from '@tabler/icons-react';

export default function NotificationSettings() {
  const notifications = [
    { id: 'email', label: 'Email Notifications', description: 'Receive meeting invites and updates via email', icon: IconMail },
    { id: 'push', label: 'Push Notifications', description: 'Get notified when meetings start', icon: IconBell },
    { id: 'mobile', label: 'Mobile Notifications', description: 'Receive notifications on your mobile device', icon: IconDeviceMobile },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-[#2F2A20]">Notification Preferences</h2>
      
      <div className="space-y-4">
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-4 bg-[#E8E4D9]/5 rounded-xl"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-[#E8E4D9]/10 rounded-lg">
                <notification.icon size={20} className="text-[#2F2A20]" />
              </div>
              <div>
                <h3 className="font-medium text-[#2F2A20]">{notification.label}</h3>
                <p className="text-sm text-[#2F2A20]/60">{notification.description}</p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="w-12 h-6 bg-[#2F2A20] rounded-full relative"
            >
              <motion.div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5" />
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 