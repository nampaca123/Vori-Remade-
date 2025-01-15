'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { IconBell, IconX, IconTicket, IconMicrophone, IconUser } from '@tabler/icons-react';
import { useState } from 'react';

export default function NotificationsPopup() {
  const [isOpen, setIsOpen] = useState(false);

  const notifications = [
    {
      id: 1,
      type: 'meeting',
      title: 'New Meeting Started',
      description: 'Daily Standup is starting now',
      time: '2 minutes ago',
      icon: IconMicrophone
    },
    {
      id: 2,
      type: 'ticket',
      title: 'Ticket Assigned',
      description: 'You have been assigned a new ticket',
      time: '1 hour ago',
      icon: IconTicket
    }
  ];

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-[#E8E4D9]/20 rounded-lg"
      >
        <IconBell size={20} className="text-[#2F2A20]" />
        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-96 bg-white rounded-xl border border-[#E8E4D9] shadow-xl z-50"
            >
              <div className="flex items-center justify-between p-4 border-b border-[#E8E4D9]">
                <h3 className="text-lg font-semibold text-[#2F2A20]">Notifications</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-[#E8E4D9]/20 rounded-lg"
                >
                  <IconX size={16} className="text-[#2F2A20]" />
                </motion.button>
              </div>
              
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 hover:bg-[#E8E4D9]/5 cursor-pointer border-b border-[#E8E4D9] last:border-b-0"
                  >
                    <div className="flex gap-3">
                      <div className="p-2 bg-[#E8E4D9]/10 rounded-lg h-fit">
                        <notification.icon size={16} className="text-[#2F2A20]" />
                      </div>
                      <div>
                        <h4 className="font-medium text-[#2F2A20]">{notification.title}</h4>
                        <p className="text-sm text-[#2F2A20]/60">{notification.description}</p>
                        <p className="text-xs text-[#2F2A20]/40 mt-1">{notification.time}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
} 