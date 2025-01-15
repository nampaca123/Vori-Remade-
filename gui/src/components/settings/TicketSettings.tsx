'use client';
import { motion } from 'framer-motion';
import { IconTicket, IconMail, IconBell, IconClock } from '@tabler/icons-react';

export default function TicketSettings() {
  const notificationPreferences = [
    { 
      id: 'email', 
      label: 'Email Notifications', 
      description: 'Receive ticket updates via email',
      icon: IconMail 
    },
    { 
      id: 'push', 
      label: 'Push Notifications', 
      description: 'Get notified when tickets are updated',
      icon: IconBell 
    },
    { 
      id: 'reminders', 
      label: 'Due Date Reminders', 
      description: 'Receive reminders before ticket deadlines',
      icon: IconClock 
    }
  ];

  const defaultStatuses = [
    { id: 'new', label: 'New' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'review', label: 'Under Review' },
    { id: 'completed', label: 'Completed' }
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-[#2F2A20]">Ticket Settings</h2>

      <div className="p-6 bg-[#E8E4D9]/5 rounded-xl border border-[#E8E4D9]">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-[#E8E4D9]/10 rounded-xl">
            <IconTicket size={24} className="text-[#2F2A20]" />
          </div>
          <div>
            <h3 className="font-medium text-[#2F2A20]">Default Ticket View</h3>
            <p className="text-sm text-[#2F2A20]/60">Choose your preferred ticket view</p>
          </div>
        </div>
        <select className="w-full p-3 bg-white rounded-xl border border-[#E8E4D9] text-[#2F2A20]">
          <option value="list">List View</option>
          <option value="board">Board View</option>
          <option value="calendar">Calendar View</option>
        </select>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-[#2F2A20]">Notification Preferences</h3>
        {notificationPreferences.map((pref) => (
          <motion.div
            key={pref.id}
            className="flex items-center justify-between p-4 bg-[#E8E4D9]/5 rounded-xl"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-[#E8E4D9]/10 rounded-lg">
                <pref.icon size={20} className="text-[#2F2A20]" />
              </div>
              <div>
                <h4 className="font-medium text-[#2F2A20]">{pref.label}</h4>
                <p className="text-sm text-[#2F2A20]/60">{pref.description}</p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="w-12 h-6 bg-[#2F2A20] rounded-full relative"
            >
              <motion.div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5" />
            </motion.button>
          </motion.div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-[#2F2A20]">Default Statuses</h3>
        <div className="grid grid-cols-2 gap-4">
          {defaultStatuses.map((status) => (
            <motion.div
              key={status.id}
              className="p-4 bg-[#E8E4D9]/5 rounded-xl border border-[#E8E4D9] flex items-center justify-between"
            >
              <span className="font-medium text-[#2F2A20]">{status.label}</span>
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 accent-[#2F2A20]"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 