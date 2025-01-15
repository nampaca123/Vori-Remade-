'use client';
import { motion } from 'framer-motion';
import { IconSun, IconMoon, IconPalette, IconLayoutGrid } from '@tabler/icons-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function AppearanceSettings() {
  const { theme, layout, setTheme, setLayout } = useTheme();

  const themes = [
    { id: 'light', label: 'Light Mode', icon: IconSun },
    { id: 'dark', label: 'Dark Mode', icon: IconMoon },
    { id: 'system', label: 'System Default', icon: IconPalette },
  ];

  const layouts = [
    { id: 'compact', label: 'Compact View', description: 'Dense layout with smaller elements' },
    { id: 'comfortable', label: 'Comfortable View', description: 'Default spacing between elements' },
    { id: 'expanded', label: 'Expanded View', description: 'More spacious layout' },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-[#2F2A20] dark:text-[#E8E4D9]">Appearance</h2>
      
      <div>
        <h3 className="text-lg font-medium text-[#2F2A20] dark:text-[#E8E4D9] mb-4">Theme</h3>
        <div className="grid grid-cols-3 gap-4">
          {themes.map((t) => (
            <motion.button
              key={t.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setTheme(t.id as 'light' | 'dark' | 'system')}
              className={`p-4 rounded-xl border transition-all ${
                theme === t.id 
                  ? 'bg-[#2F2A20] text-[#E8E4D9] border-[#2F2A20]' 
                  : 'bg-[#E8E4D9]/5 border-[#E8E4D9] hover:border-[#2F2A20]/20'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <t.icon size={24} />
                <span className="text-sm font-medium">{t.label}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-[#2F2A20] dark:text-[#E8E4D9] mb-4">Layout Density</h3>
        <div className="space-y-4">
          {layouts.map((l) => (
            <motion.div
              key={l.id}
              className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                layout === l.id 
                  ? 'bg-[#2F2A20] text-[#E8E4D9]' 
                  : 'bg-[#E8E4D9]/5'
              }`}
              onClick={() => setLayout(l.id as 'compact' | 'comfortable' | 'expanded')}
            >
              <div>
                <h4 className="font-medium">{l.label}</h4>
                <p className="text-sm opacity-60">{l.description}</p>
              </div>
              <input
                type="radio"
                name="layout"
                value={l.id}
                checked={layout === l.id}
                onChange={() => setLayout(l.id as 'compact' | 'comfortable' | 'expanded')}
                className="w-4 h-4 accent-[#2F2A20]"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 