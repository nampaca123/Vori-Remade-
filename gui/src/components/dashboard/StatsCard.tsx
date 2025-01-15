'use client';
import { motion } from 'framer-motion';
import { IconArrowUpRight, IconArrowDownRight } from '@tabler/icons-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
}

export default function StatsCard({ title, value, change, icon }: StatsCardProps) {
  const isPositive = change && change > 0;
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white p-6 rounded-xl border border-neutral-200"
    >
      <div className="flex items-center justify-between">
        <span className="text-neutral-600">{title}</span>
        {icon}
      </div>
      
      <div className="mt-4">
        <span className="text-3xl font-semibold text-neutral-900">{value}</span>
        
        {change && (
          <div className="flex items-center mt-2">
            {isPositive ? (
              <IconArrowUpRight className="text-success-500" size={20} />
            ) : (
              <IconArrowDownRight className="text-error-500" size={20} />
            )}
            <span className={`ml-1 ${isPositive ? 'text-success-500' : 'text-error-500'}`}>
              {Math.abs(change)}%
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
} 