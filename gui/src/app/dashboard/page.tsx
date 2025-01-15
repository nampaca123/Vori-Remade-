'use client';
import { motion } from 'framer-motion';
import { IconMicrophone, IconTicket, IconClock, IconUsers, IconPlus } from '@tabler/icons-react';
import StatsCard from '@/components/dashboard/StatsCard';
import RecentMeetings from '@/components/dashboard/RecentMeetings';
import ActivityChart from '@/components/dashboard/ActivityChart';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';

export default function DashboardPage() {
  const stats = [
    {
      title: 'Total Meetings',
      value: '24',
      change: 12,
      icon: <IconMicrophone className="text-primary-500" size={24} />
    },
    {
      title: 'Tickets Created',
      value: '156',
      change: 8,
      icon: <IconTicket className="text-primary-500" size={24} />
    },
    {
      title: 'Avg. Meeting Duration',
      value: '32m',
      change: -5,
      icon: <IconClock className="text-primary-500" size={24} />
    },
    {
      title: 'Active Participants',
      value: '18',
      change: 15,
      icon: <IconUsers className="text-primary-500" size={24} />
    }
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#2F2A20]">Dashboard</h1>
            <p className="text-[#2F2A20]/60 mt-1">Overview of your meeting analytics</p>
          </div>
          <div className="flex gap-4">
            <Link href="/meetings/kanban">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-[#2F2A20] text-[#E8E4D9] px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:bg-[#2F2A20]/90 transition-colors"
              >
                <IconPlus size={20} />
                New Kanban Meeting
              </motion.button>
            </Link>
            <Link href="/meetings/quick">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-[#2F2A20] text-[#E8E4D9] px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:bg-[#2F2A20]/90 transition-colors"
              >
                <IconMicrophone size={20} />
                Quick Meeting
              </motion.button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 border border-neutral-200 hover:border-primary-500/20 hover:shadow-lg hover:shadow-primary-500/10 transition-all duration-300"
            >
              <StatsCard {...stat} />
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-neutral-200 hover:border-primary-500/20 hover:shadow-lg hover:shadow-primary-500/10 transition-all duration-300"
          >
            <RecentMeetings />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-neutral-200 hover:border-primary-500/20 hover:shadow-lg hover:shadow-primary-500/10 transition-all duration-300"
          >
            <ActivityChart />
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
} 