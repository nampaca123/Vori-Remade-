'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { IconMicrophone, IconPlus, IconUsers, IconCalendar, IconChartBar } from '@tabler/icons-react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import MeetingRoom from '@/components/meeting/MeetingRoom';

export default function MeetingsPage() {
  const meetingStats = [
    { label: 'Active Sessions', value: '3', icon: IconUsers },
    { label: 'Today\'s Meetings', value: '8', icon: IconCalendar },
    { label: 'Meeting Minutes', value: '126', icon: IconChartBar },
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-[#2F2A20] to-[#1a1814] rounded-2xl p-8 text-[#E8E4D9]"
        >
          <div className="flex justify-between items-center relative z-10">
            <div>
              <h1 className="text-4xl font-bold">Voice Meetings</h1>
              <p className="text-[#E8E4D9]/60 mt-2 text-lg">Join or start a new meeting</p>
            </div>
            <div className="flex gap-4">
              <Link href="/meetings/kanban">
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: '#E8E4D9' }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-[#E8E4D9]/10 backdrop-blur-md px-6 py-3 rounded-xl flex items-center gap-2 border border-[#E8E4D9]/20 hover:text-[#2F2A20] transition-all duration-300"
                >
                  <IconPlus size={20} />
                  New Kanban Meeting
                </motion.button>
              </Link>
              <Link href="/meetings/quick">
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: '#E8E4D9' }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-[#E8E4D9]/10 backdrop-blur-md px-6 py-3 rounded-xl flex items-center gap-2 border border-[#E8E4D9]/20 hover:text-[#2F2A20] transition-all duration-300"
                >
                  <IconMicrophone size={20} />
                  Quick Meeting
                </motion.button>
              </Link>
            </div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 grid grid-cols-3 gap-6"
          >
            {meetingStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#E8E4D9]/5 backdrop-blur-md rounded-xl p-4 border border-[#E8E4D9]/10"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#E8E4D9]/10 rounded-lg">
                    <stat.icon size={20} className="text-[#E8E4D9]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#E8E4D9]">{stat.label}</p>
                    <p className="text-2xl font-bold text-[#E8E4D9]">{stat.value}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E8E4D9]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#2F2A20] rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </motion.div>

        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-[#E8E4D9] shadow-xl shadow-[#2F2A20]/5"
          >
            <MeetingRoom />
          </motion.div>
        </AnimatePresence>
      </div>
    </MainLayout>
  );
} 