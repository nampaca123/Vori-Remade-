'use client';
import { motion } from 'framer-motion';
import { IconMicrophone, IconWaveSquare, IconUsers } from '@tabler/icons-react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';

export default function QuickMeetingPage() {
  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#2F2A20]">Quick Meeting</h1>
            <p className="text-[#2F2A20]/60 mt-1">Start an instant voice meeting</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-[#2F2A20] text-[#E8E4D9] px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:bg-[#2F2A20]/90 transition-colors"
          >
            <IconMicrophone size={20} />
            Start Recording
          </motion.button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 border border-[#E8E4D9]"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-[#E8E4D9]/20 rounded-xl">
                <IconWaveSquare size={24} className="text-[#2F2A20]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#2F2A20]">Live Transcription</h2>
                <p className="text-[#2F2A20]/60">Real-time voice to text</p>
              </div>
            </div>
            <div className="h-[400px] bg-[#E8E4D9]/5 rounded-xl border border-[#E8E4D9] p-6">
              <p className="text-[#2F2A20]/60 text-center mt-[180px]">
                Start recording to see live transcription
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-8 border border-[#E8E4D9]"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-[#E8E4D9]/20 rounded-xl">
                <IconUsers size={24} className="text-[#2F2A20]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#2F2A20]">Participants</h2>
                <p className="text-[#2F2A20]/60">Meeting attendees</p>
              </div>
            </div>
            <div className="h-[400px] bg-[#E8E4D9]/5 rounded-xl border border-[#E8E4D9] p-6">
              <p className="text-[#2F2A20]/60 text-center mt-[180px]">
                No participants yet
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
} 