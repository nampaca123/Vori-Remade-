'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Input from '../ui/Input';
import TextArea from '../ui/TextArea';
import Select from '../ui/Select';
import Button from '../ui/Button';

interface CreateTicketFormProps {
  transcriptionText?: string[];
  onClose: () => void;
}

export default function CreateTicketForm({ transcriptionText = [], onClose }: CreateTicketFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const priorityOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Title"
        placeholder="Enter ticket title"
        required
      />
      
      <Select
        label="Priority"
        options={priorityOptions}
        required
      />
      
      <TextArea
        label="Description"
        placeholder="Enter ticket description"
        defaultValue={transcriptionText.join('\n')}
        required
      />
      
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={onClose}
          type="button"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
        >
          Create Ticket
        </Button>
      </div>
    </form>
  );
} 