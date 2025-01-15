'use client';
import { motion } from 'framer-motion';
import { IconMicrophone, IconClock, IconUsers } from '@tabler/icons-react';

interface Meeting {
  id: string;
  title: string;
  date: string;
  duration: string;
  participants: number;
}

const recentMeetings: Meeting[] = [
  {
    id: '1',
    title: 'Daily Standup',
    date: '2024-03-20',
    duration: '15m',
    participants: 8
  },
  {
    id: '2',
    title: 'Product Review',
    date: '2024-03-19',
    duration: '45m',
    participants: 12
  },
  {
    id: '3',
    title: 'Sprint Planning',
    date: '2024-03-18',
    duration: '60m',
    participants: 15
  }
];

export default function RecentMeetings() {
  return (
    <div className="bg-white rounded-xl p-6 border border-neutral-200">
      <h2 className="text-xl font-semibold text-neutral-900 mb-6">Recent Meetings</h2>
      <div className="space-y-4">
        {recentMeetings.map((meeting, index) => (
          <motion.div
            key={meeting.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-4 rounded-lg hover:bg-neutral-50 border border-neutral-200"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary-50 rounded-lg">
                <IconMicrophone className="text-primary-500" size={20} />
              </div>
              <div>
                <h3 className="font-medium text-neutral-900">{meeting.title}</h3>
                <p className="text-sm text-neutral-500">{meeting.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <IconClock size={16} className="text-neutral-500" />
                <span className="text-sm text-neutral-700">{meeting.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <IconUsers size={16} className="text-neutral-500" />
                <span className="text-sm text-neutral-700">{meeting.participants}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 