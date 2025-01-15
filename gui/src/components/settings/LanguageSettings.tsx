'use client';
import { motion } from 'framer-motion';
import { IconLanguage, IconClock, IconCurrency } from '@tabler/icons-react';

export default function LanguageSettings() {
  const languages = [
    { id: 'en', label: 'English (US)', native: 'English' },
    { id: 'es', label: 'Spanish', native: 'Español' },
    { id: 'fr', label: 'French', native: 'Français' },
    { id: 'de', label: 'German', native: 'Deutsch' },
  ];

  const timezones = [
    { id: 'pt', label: 'Pacific Time', value: '(UTC-07:00)' },
    { id: 'et', label: 'Eastern Time', value: '(UTC-04:00)' },
    { id: 'utc', label: 'UTC', value: '(UTC+00:00)' },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-[#2F2A20]">Language & Region</h2>
      
      <div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-2 bg-[#E8E4D9]/10 rounded-lg">
            <IconLanguage size={20} className="text-[#2F2A20]" />
          </div>
          <h3 className="text-lg font-medium text-[#2F2A20]">Language</h3>
        </div>
        <select className="w-full p-3 bg-[#E8E4D9]/5 rounded-xl border border-[#E8E4D9] text-[#2F2A20]">
          {languages.map(lang => (
            <option key={lang.id} value={lang.id}>
              {lang.label} ({lang.native})
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-2 bg-[#E8E4D9]/10 rounded-lg">
            <IconClock size={20} className="text-[#2F2A20]" />
          </div>
          <h3 className="text-lg font-medium text-[#2F2A20]">Time Zone</h3>
        </div>
        <select className="w-full p-3 bg-[#E8E4D9]/5 rounded-xl border border-[#E8E4D9] text-[#2F2A20]">
          {timezones.map(tz => (
            <option key={tz.id} value={tz.id}>
              {tz.label} {tz.value}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-2 bg-[#E8E4D9]/10 rounded-lg">
            <IconCurrency size={20} className="text-[#2F2A20]" />
          </div>
          <h3 className="text-lg font-medium text-[#2F2A20]">Currency</h3>
        </div>
        <select className="w-full p-3 bg-[#E8E4D9]/5 rounded-xl border border-[#E8E4D9] text-[#2F2A20]">
          <option value="usd">USD ($)</option>
          <option value="eur">EUR (€)</option>
          <option value="gbp">GBP (£)</option>
        </select>
      </div>
    </div>
  );
} 