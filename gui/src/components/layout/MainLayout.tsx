'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconSearch, IconUser, IconBell, IconMicrophone, IconTicket, IconSettings, IconX } from '@tabler/icons-react';
import Sidebar from './Sidebar';
import ProfilePopup from '../profile/ProfilePopup';
import Logo from '@/components/common/Logo';

const mockNotifications = [
  {
    id: 1,
    type: 'meeting',
    title: 'Team Sync Starting Soon',
    description: 'Daily standup meeting in 5 minutes',
    time: '2 min ago',
    icon: IconMicrophone,
    unread: true,
  },
  {
    id: 2,
    type: 'ticket',
    title: 'New Ticket Assigned',
    description: 'UI improvements for dashboard',
    time: '1 hour ago',
    icon: IconTicket,
    unread: true,
  },
  {
    id: 3,
    type: 'system',
    title: 'System Update',
    description: 'New features available',
    time: '2 hours ago',
    icon: IconSettings,
    unread: false,
  },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="flex-1 bg-[#F9F7F3]">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E8E4D9]">
          <div className="max-w-7xl mx-auto px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="relative w-96">
                <IconSearch size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2F2A20]/40" />
                <input 
                  type="text"
                  placeholder="Search anything..."
                  className="w-full pl-10 pr-4 py-2 bg-[#E8E4D9]/10 border border-[#E8E4D9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F2A20]/20"
                />
              </div>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="relative p-2.5 rounded-xl hover:bg-[#F5F2E8] transition-colors duration-200"
                  >
                    <IconBell size={24} className="text-[#2F2A20]" />
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#8B4513] rounded-full ring-2 ring-white" />
                  </motion.button>
                  
                  <AnimatePresence>
                    {isNotificationsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-xl border border-[#E8E4D9] overflow-hidden"
                      >
                        <div className="p-4 border-b border-[#E8E4D9] flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold text-[#2F2A20] text-lg">Notifications</h3>
                            <p className="text-sm text-[#2F2A20]/60">You have 2 unread notifications</p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsNotificationsOpen(false)}
                            className="p-1 hover:bg-[#F5F2E8] rounded-lg"
                          >
                            <IconX size={20} className="text-[#2F2A20]/60" />
                          </motion.button>
                        </div>
                        
                        <div className="max-h-[400px] overflow-y-auto">
                          {mockNotifications.map((notification) => (
                            <motion.div
                              key={notification.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className={`p-4 hover:bg-[#F5F2E8] cursor-pointer transition-colors duration-200 border-b border-[#E8E4D9] ${
                                notification.unread ? 'bg-[#F5F2E8]/50' : ''
                              }`}
                            >
                              <div className="flex gap-3">
                                <div className={`p-2 rounded-xl ${
                                  notification.unread ? 'bg-[#2F2A20] text-white' : 'bg-[#E8E4D9]'
                                }`}>
                                  <notification.icon size={20} />
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                    <h4 className="font-medium text-[#2F2A20]">{notification.title}</h4>
                                    <span className="text-xs text-[#2F2A20]/60">{notification.time}</span>
                                  </div>
                                  <p className="text-sm text-[#2F2A20]/60 mt-1">{notification.description}</p>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                        
                        <div className="p-3 bg-[#F5F2E8]/30 border-t border-[#E8E4D9]">
                          <button className="w-full text-center text-sm text-[#2F2A20]/60 hover:text-[#2F2A20] py-2 rounded-xl hover:bg-white transition-colors duration-200">
                            View all notifications
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-3 p-1.5 hover:bg-[#E8E4D9]/20 rounded-xl"
                  >
                    <div className="w-8 h-8 bg-[#2F2A20] rounded-lg flex items-center justify-center">
                      <IconUser size={20} className="text-[#E8E4D9]" />
                    </div>
                    <Logo size="small" className="text-[#2F2A20]" />
                  </motion.button>
                  <ProfilePopup isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <div className="max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
} 