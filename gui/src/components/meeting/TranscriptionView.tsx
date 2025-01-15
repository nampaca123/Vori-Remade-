'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconFileText, IconTicket } from '@tabler/icons-react';
import Modal from '../ui/Modal';
import CreateTicketForm from '../tickets/CreateTicketForm';
import Button from '@/components/ui/Button';

interface TranscriptionViewProps {
  transcription: string[];
  isRecording: boolean;
}

export default function TranscriptionView({ transcription, isRecording }: TranscriptionViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex-1 bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <IconFileText className="text-primary-500" />
            <h2 className="text-xl font-semibold text-neutral-900">Live Transcription</h2>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2"
          >
            <IconTicket size={20} />
            Create Ticket
          </Button>
        </div>

        <div className="h-[calc(100%-4rem)] overflow-auto space-y-4">
          <AnimatePresence>
            {transcription.map((line, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-4 rounded-lg bg-neutral-50 border border-neutral-200"
              >
                <p className="text-neutral-700">{line}</p>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isRecording && (
            <motion.div
              animate={{ opacity: [0.5, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="p-4 rounded-lg bg-neutral-50 border border-neutral-200"
            >
              <div className="flex gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-500" />
                <span className="w-2 h-2 rounded-full bg-primary-500" />
                <span className="w-2 h-2 rounded-full bg-primary-500" />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Ticket"
      >
        <CreateTicketForm
          transcriptionText={transcription}
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>
    </>
  );
} 