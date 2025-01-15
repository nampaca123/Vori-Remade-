'use client';
import { motion } from 'framer-motion';
import { IconLock, IconFingerprint, IconDeviceMobile, IconKey } from '@tabler/icons-react';

export default function SecuritySettings() {
  const securityOptions = [
    { 
      id: '2fa', 
      label: 'Two-Factor Authentication', 
      description: 'Add an extra layer of security to your account',
      icon: IconFingerprint,
      enabled: true
    },
    { 
      id: 'devices', 
      label: 'Trusted Devices', 
      description: 'Manage devices that can access your account',
      icon: IconDeviceMobile,
      enabled: false
    },
    { 
      id: 'sessions', 
      label: 'Active Sessions', 
      description: 'View and manage your active sessions',
      icon: IconKey,
      enabled: true
    }
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-[#2F2A20]">Security Settings</h2>

      <div className="p-6 bg-[#E8E4D9]/5 rounded-xl border border-[#E8E4D9]">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-[#E8E4D9]/10 rounded-xl">
            <IconLock size={24} className="text-[#2F2A20]" />
          </div>
          <div>
            <h3 className="font-medium text-[#2F2A20]">Password</h3>
            <p className="text-sm text-[#2F2A20]/60">Last changed 3 months ago</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full p-3 bg-[#2F2A20] text-[#E8E4D9] rounded-xl font-medium"
        >
          Change Password
        </motion.button>
      </div>

      <div className="space-y-4">
        {securityOptions.map((option) => (
          <motion.div
            key={option.id}
            className="flex items-center justify-between p-4 bg-[#E8E4D9]/5 rounded-xl"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-[#E8E4D9]/10 rounded-lg">
                <option.icon size={20} className="text-[#2F2A20]" />
              </div>
              <div>
                <h3 className="font-medium text-[#2F2A20]">{option.label}</h3>
                <p className="text-sm text-[#2F2A20]/60">{option.description}</p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className={`w-12 h-6 rounded-full relative ${
                option.enabled ? 'bg-[#2F2A20]' : 'bg-[#E8E4D9]/20'
              }`}
            >
              <motion.div 
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 ${
                  option.enabled ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 