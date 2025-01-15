'use client';
import { motion } from 'framer-motion';
import { IconMicrophone, IconLayoutKanban, IconUsers, IconPlus, IconWaveSquare } from '@tabler/icons-react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';

export default function KanbanMeetingPage() {
  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#2F2A20]">Kanban Meeting</h1>
            <p className="text-[#2F2A20]/60 mt-1">Collaborative meeting with visual board</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-[#2F2A20] text-[#E8E4D9] px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:bg-[#2F2A20]/90 transition-colors"
          >
            <IconMicrophone size={20} />
            Start Meeting
          </motion.button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {['To Discuss', 'In Progress', 'Completed'].map((column, index) => (
            <motion.div
              key={column}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 border border-[#E8E4D9] min-h-[500px]"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[#2F2A20]">{column}</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 hover:bg-[#E8E4D9]/20 rounded-lg"
                >
                  <IconPlus size={20} className="text-[#2F2A20]" />
                </motion.button>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-[#E8E4D9]/10 rounded-xl border border-[#E8E4D9] cursor-pointer hover:shadow-md transition-all">
                  <h3 className="font-medium text-[#2F2A20]">Discussion Topic</h3>
                  <p className="text-sm text-[#2F2A20]/60 mt-2">Add description here...</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
} 