'use client';

import React from 'react';
import Modal from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

interface AssessmentStartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AssessmentStartModal: React.FC<AssessmentStartModalProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      alignment="center"
      title="Start Assessment"
      className="w-full p-0"
    >
      <div className="flex flex-col items-center justify-center px-4 py-8 sm:px-8 sm:py-10">
        <h2 className="mb-2 text-center text-lg font-medium text-[#755ae2] sm:text-xl">
          Proceed to start assessment
        </h2>
        <p className="mb-6 text-center text-xs text-[#4a4a68] sm:text-sm">
          Kindly keep to the rules of the assessment and
          <br />
          sit up, stay in front of your camera/webcam and start
          <br />
          your assessment.
        </p>
      </div>
      <Button
        className="h-11 w-full rounded-xl bg-[#755ae2] text-[16px] font-normal hover:bg-[#a18aff] sm:w-40"
        onClick={() => onOpenChange(false)}
      >
        Proceed
      </Button>
    </Modal>
  );
};

export default AssessmentStartModal;