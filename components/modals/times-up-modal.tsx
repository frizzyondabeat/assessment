'use client';

import React from 'react';
import Modal from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

interface TimesUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestMoreTime?: () => void;
  onSubmitAssessment?: () => void;
}

const TimesUpModal: React.FC<TimesUpModalProps> = ({
  open,
  onOpenChange,
  onRequestMoreTime = () => console.log('Request more time clicked'),
  onSubmitAssessment = () => console.log('Submit assessment clicked'),
}) => {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      alignment="center"
      title="Time's Up!"
      className="max-w-[90%] sm:max-w-md p-0"
    >
      <div className="flex flex-col items-center justify-center px-4 sm:px-8 py-6 sm:py-10">
        <h2 className="mb-2 text-center text-lg sm:text-xl font-medium text-[#755ae2]">
          Your time has expired
        </h2>
        <p className="mb-4 sm:mb-6 text-center text-xs sm:text-sm text-[#4a4a68]">
          You've reached the end of your allocated time.
          Please submit your assessment or request additional time
          if needed.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4 pb-4 sm:pb-6">
        <Button
          className="h-9 sm:h-11 w-full sm:w-auto rounded-xl bg-gray-300 text-sm sm:text-[16px] font-normal hover:bg-gray-400"
          onClick={onRequestMoreTime}
        >
          Request More Time
        </Button>
        <Button
          className="h-9 sm:h-11 w-full sm:w-auto rounded-xl bg-[#755ae2] text-sm sm:text-[16px] font-normal hover:bg-[#a18aff]"
          onClick={onSubmitAssessment}
        >
          Submit Assessment
        </Button>
      </div>
    </Modal>
  );
};

export default TimesUpModal;