'use client';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { colors } from '@/styles/tokens';

const data = [
  { date: '2024-03-14', meetings: 4, tickets: 8 },
  { date: '2024-03-15', meetings: 6, tickets: 12 },
  { date: '2024-03-16', meetings: 3, tickets: 6 },
  { date: '2024-03-17', meetings: 5, tickets: 10 },
  { date: '2024-03-18', meetings: 7, tickets: 15 },
  { date: '2024-03-19', meetings: 4, tickets: 9 },
  { date: '2024-03-20', meetings: 6, tickets: 11 }
];

export default function ActivityChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 border border-neutral-200"
    >
      <h2 className="text-xl font-semibold text-neutral-900 mb-6">Activity Overview</h2>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorMeetings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.primary[500]} stopOpacity={0.1}/>
                <stop offset="95%" stopColor={colors.primary[500]} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.success[500]} stopOpacity={0.1}/>
                <stop offset="95%" stopColor={colors.success[500]} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.neutral[200]} />
            <XAxis
              dataKey="date"
              stroke={colors.neutral[700]}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis stroke={colors.neutral[700]} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: `1px solid ${colors.neutral[200]}`,
                borderRadius: '8px',
                padding: '12px'
              }}
            />
            <Area
              type="monotone"
              dataKey="meetings"
              stroke={colors.primary[500]}
              fillOpacity={1}
              fill="url(#colorMeetings)"
            />
            <Area
              type="monotone"
              dataKey="tickets"
              stroke={colors.success[500]}
              fillOpacity={1}
              fill="url(#colorTickets)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
} 