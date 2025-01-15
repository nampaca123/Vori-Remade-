'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { IconMicrophone, IconMicrophoneOff, IconWaveSquare } from '@tabler/icons-react';
import TranscriptionView from './TranscriptionView';

export default function MeetingRoom() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState<string[]>([]);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Simulated transcription updates
    if (!isRecording) {
      const interval = setInterval(() => {
        setTranscription(prev => [...prev, "This is a simulated transcription line " + (prev.length + 1)]);
      }, 3000);
      return () => clearInterval(interval);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Daily Standup Meeting</h1>
            <p className="text-neutral-500">Team Vori • {new Date().toLocaleDateString()}</p>
          </div>
          <motion.button
            onClick={toggleRecording}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white ${
              isRecording ? 'bg-error-500' : 'bg-primary-500'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            {isRecording ? (
              <>
                <IconMicrophoneOff size={20} />
                Stop Recording
              </>
            ) : (
              <>
                <IconMicrophone size={20} />
                Start Recording
              </>
            )}
          </motion.button>
        </div>
        
        {isRecording && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 p-3 bg-error-50 rounded-lg"
          >
            <IconWaveSquare className="text-error-500" />
            <span className="text-error-500 font-medium">Recording in progress...</span>
          </motion.div>
        )}
      </div>

      <TranscriptionView transcription={transcription} isRecording={isRecording} />
    </div>
  );
} 