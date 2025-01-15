'use client';
import { motion } from 'framer-motion';
import { IconDeviceLaptop, IconDeviceMobile, IconDeviceTablet, IconTrash } from '@tabler/icons-react';

export default function DeviceSettings() {
  const devices = [
    { 
      id: 1, 
      name: 'MacBook Pro', 
      type: 'laptop',
      lastActive: 'Currently active',
      location: 'San Francisco, CA',
      icon: IconDeviceLaptop 
    },
    { 
      id: 2, 
      name: 'iPhone 13', 
      type: 'mobile',
      lastActive: 'Last active 2 hours ago',
      location: 'San Francisco, CA',
      icon: IconDeviceMobile 
    },
    { 
      id: 3, 
      name: 'iPad Pro', 
      type: 'tablet',
      lastActive: 'Last active 2 days ago',
      location: 'San Francisco, CA',
      icon: IconDeviceTablet 
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-[#2F2A20]">Connected Devices</h2>
      
      <div className="space-y-4">
        {devices.map((device) => (
          <motion.div
            key={device.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-[#E8E4D9]/5 rounded-xl border border-[#E8E4D9]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-[#E8E4D9]/10 rounded-lg">
                  <device.icon size={24} className="text-[#2F2A20]" />
                </div>
                <div>
                  <h3 className="font-medium text-[#2F2A20]">{device.name}</h3>
                  <p className="text-sm text-[#2F2A20]/60">{device.lastActive}</p>
                  <p className="text-sm text-[#2F2A20]/60">{device.location}</p>
                </div>
              </div>
              {device.lastActive !== 'Currently active' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 hover:bg-[#E8E4D9]/20 rounded-lg text-red-500"
                >
                  <IconTrash size={20} />
                </motion.button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 