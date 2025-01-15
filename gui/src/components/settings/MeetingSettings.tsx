'use client';
import { motion } from 'framer-motion';
import { IconMicrophone, IconVideo, IconVolume, IconScreenShare } from '@tabler/icons-react';

export default function MeetingSettings() {
  const settings = [
    { id: 'audio', label: 'Default Audio Device', value: 'Built-in Microphone', icon: IconMicrophone },
    { id: 'video', label: 'Default Video Device', value: 'Built-in Camera', icon: IconVideo },
    { id: 'speaker', label: 'Default Speaker', value: 'Built-in Speakers', icon: IconVolume },
  ];

  const preferences = [
    { id: 'autoMute', label: 'Auto-mute on Join', description: 'Automatically mute microphone when joining meetings' },
    { id: 'autoVideo', label: 'Auto-enable Video', description: 'Automatically enable video when joining meetings' },
    { id: 'autoRecord', label: 'Auto-record Meetings', description: 'Automatically start recording when joining meetings' },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-[#2F2A20]">Meeting Settings</h2>
      
      <div className="space-y-4">
        {settings.map((setting) => (
          <motion.div
            key={setting.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-4 bg-[#E8E4D9]/5 rounded-xl"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-[#E8E4D9]/10 rounded-lg">
                <setting.icon size={20} className="text-[#2F2A20]" />
              </div>
              <div>
                <h3 className="font-medium text-[#2F2A20]">{setting.label}</h3>
                <p className="text-sm text-[#2F2A20]/60">{setting.value}</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 bg-[#E8E4D9]/10 rounded-lg border border-[#E8E4D9] text-sm"
            >
              Change
            </motion.button>
          </motion.div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-[#2F2A20]">Meeting Preferences</h3>
        {preferences.map((pref) => (
          <motion.div
            key={pref.id}
            className="flex items-center justify-between p-4 bg-[#E8E4D9]/5 rounded-xl"
          >
            <div>
              <h3 className="font-medium text-[#2F2A20]">{pref.label}</h3>
              <p className="text-sm text-[#2F2A20]/60">{pref.description}</p>
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
    </div>
  );
} 