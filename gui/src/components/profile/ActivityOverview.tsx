'use client';
import { motion } from 'framer-motion';
import { IconMicrophone, IconCalendar, IconClock, IconUsers, IconArrowUpRight } from '@tabler/icons-react';
import Link from 'next/link';

export default function ActivityOverview() {
  const stats = [
    { label: 'Total Meetings', value: '47', icon: IconMicrophone },
    { label: 'Meeting Hours', value: '86', icon: IconClock },
    { label: 'Collaborators', value: '23', icon: IconUsers }
  ];

  const recentMeetings = [
    {
      id: 1,
      title: 'Daily Standup',
      time: 'Today, 9:00 AM',
      participants: 8,
      duration: '30min'
    },
    {
      id: 2,
      title: 'Product Review',
      time: 'Yesterday, 2:00 PM',
      participants: 12,
      duration: '1h'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-[#E8E4D9] p-6 md:p-8"
    >
      <h2 className="text-2xl font-semibold text-[#2F2A20] mb-6">Activity Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#F5F2E8] rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-lg shrink-0">
                <stat.icon size={20} className="text-[#2F2A20]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-[#2F2A20]/60 truncate">{stat.label}</p>
                <p className="text-2xl font-bold text-[#2F2A20]">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-[#2F2A20]">Recent Meetings</h3>
            <Link href="/meetings" className="text-sm text-[#2F2A20]/60 hover:text-[#2F2A20] flex items-center gap-1">
              View All <IconArrowUpRight size={16} />
            </Link>
          </div>
          <div className="space-y-3">
            {recentMeetings.map((meeting, index) => (
              <motion.div
                key={meeting.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-[#F9F7F3] rounded-xl hover:bg-[#F5F2E8] transition-colors duration-200"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="p-2.5 bg-white rounded-lg shrink-0">
                    <IconMicrophone size={20} className="text-[#2F2A20]" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-medium text-[#2F2A20] truncate">{meeting.title}</h4>
                    <p className="text-sm text-[#2F2A20]/60 truncate">{meeting.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-[#2F2A20]/60 shrink-0">
                  <div className="flex items-center gap-1">
                    <IconUsers size={16} />
                    <span>{meeting.participants}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <IconClock size={16} />
                    <span>{meeting.duration}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-[#2F2A20]">Upcoming Meetings</h3>
            <Link href="/meetings" className="text-sm text-[#2F2A20]/60 hover:text-[#2F2A20] flex items-center gap-1">
              Schedule <IconCalendar size={16} />
            </Link>
          </div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02 }}
            className="p-4 bg-gradient-to-r from-[#2F2A20] to-[#1a1814] rounded-xl text-[#E8E4D9]"
          >
            <div className="flex justify-between items-center">
              <div className="min-w-0">
                <h4 className="font-medium truncate">Sprint Planning</h4>
                <p className="text-sm text-[#E8E4D9]/60">Tomorrow, 10:00 AM</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="px-4 py-2 bg-[#E8E4D9]/10 rounded-lg border border-[#E8E4D9]/20 backdrop-blur-sm shrink-0"
              >
                Join
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
} 