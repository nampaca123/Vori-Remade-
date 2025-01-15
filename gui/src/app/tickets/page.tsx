'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { IconTicket, IconFilter, IconSearch, IconPlus, IconCalendar, IconClock, IconUser } from '@tabler/icons-react';
import MainLayout from '@/components/layout/MainLayout';

export default function TicketsPage() {
  const ticketCategories = [
    { label: 'All Tickets', count: 24 },
    { label: 'In Progress', count: 8 },
    { label: 'Under Review', count: 6 },
    { label: 'Completed', count: 10 }
  ];

  const tickets = [
    {
      id: 1,
      title: 'Implement New Feature',
      meeting: 'Sprint Planning',
      date: '2024-03-25',
      priority: 'High',
      assignee: 'John Doe',
      status: 'In Progress'
    },
    // Add more ticket data as needed
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
              <h1 className="text-4xl font-bold">Tickets</h1>
              <p className="text-[#E8E4D9]/60 mt-2 text-lg">Manage your meeting tickets</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: '#E8E4D9' }}
              whileTap={{ scale: 0.98 }}
              className="bg-[#E8E4D9]/10 backdrop-blur-md px-6 py-3 rounded-xl flex items-center gap-2 border border-[#E8E4D9]/20 hover:text-[#2F2A20] transition-all duration-300"
            >
              <IconPlus size={20} />
              Create Ticket
            </motion.button>
          </div>

          <div className="mt-8 flex gap-4">
            {ticketCategories.map((category, index) => (
              <motion.div
                key={category.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#E8E4D9]/5 backdrop-blur-md rounded-xl p-4 flex-1 border border-[#E8E4D9]/10 cursor-pointer hover:bg-[#E8E4D9]/10 transition-all"
              >
                <h3 className="text-lg font-medium">{category.label}</h3>
                <p className="text-3xl font-bold mt-2">{category.count}</p>
              </motion.div>
            ))}
          </div>

          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E8E4D9]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        </motion.div>

        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2F2A20]/40" size={20} />
            <input 
              type="text"
              placeholder="Search tickets..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#2F2A20]/10 focus:border-[#2F2A20]/20 focus:ring-2 focus:ring-[#2F2A20]/10 outline-none transition-all"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-[#2F2A20]/5 p-3 rounded-xl hover:bg-[#2F2A20]/10 transition-all"
          >
            <IconFilter size={20} className="text-[#2F2A20]" />
          </motion.button>
        </div>

        <AnimatePresence>
          <div className="grid grid-cols-1 gap-4">
            {tickets.map((ticket, index) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl p-6 border border-[#E8E4D9] hover:border-[#2F2A20]/20 hover:shadow-lg transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-[#2F2A20] group-hover:text-[#2F2A20] transition-colors">
                      {ticket.title}
                    </h3>
                    <p className="text-[#2F2A20]/60 mt-1">From meeting: {ticket.meeting}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <IconCalendar size={16} className="text-[#2F2A20]/40" />
                      <span className="text-sm text-[#2F2A20]/60">{ticket.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IconUser size={16} className="text-[#2F2A20]/40" />
                      <span className="text-sm text-[#2F2A20]/60">{ticket.assignee}</span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm ${
                      ticket.status === 'In Progress' ? 'bg-blue-50 text-blue-600' :
                      ticket.status === 'Completed' ? 'bg-green-50 text-green-600' :
                      'bg-yellow-50 text-yellow-600'
                    }`}>
                      {ticket.status}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </div>
    </MainLayout>
  );
} 