'use client';

import {Button} from '@/components/ui/button';
import {useCountdownTimer} from '@/hooks/use-countdown-timer';
import {Clock, Eye} from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import Modal from '../ui/modal';

const Navbar = () => {
    const {timeLeft, isExpired, formatTime, pause, resume} = useCountdownTimer(
        29,
        10
    );

    return (
        <>
        {
            isExpired &&
            <Modal
                open={isExpired}
                onOpenChange={(open) => {
                    if (!open) {
                        // Reset the timer or handle modal close logic here
                        // For example, you might want to reset the timer
                        // reset(30); // Reset to 30 minutes
                    }
                }}

                // onOpenChange={setShowTimerExpiredModal}
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
                <div
                    className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4 pb-4 sm:pb-6">
                    <Button
                        className="h-9 sm:h-11 w-full sm:w-auto rounded-xl bg-gray-300 text-sm sm:text-[16px] font-normal hover:bg-gray-400"
                        onClick={() => {
                            // Handle request more time logic here
                            console.log('Request more time clicked');
                        }}
                    >
                        Request More Time
                    </Button>
                    <Button
                        className="h-9 sm:h-11 w-full sm:w-auto rounded-xl bg-[#755ae2] text-sm sm:text-[16px] font-normal hover:bg-[#a18aff]"
                        onClick={() => {
                            // Handle submit assessment logic here
                            console.log('Submit assessment clicked');
                        }}
                    >
                        Submit Assessment
                    </Button>
                </div>
            </Modal>
        }
            <header className="mb-6 w-full bg-white py-5">
                <div className="mx-auto flex items-center justify-between px-6 md:px-14 lg:px-20">
                    <div className="flex items-center gap-4">
                        <div
                            className="flex aspect-square size-10 items-center justify-center rounded-xl bg-[#3c1356] md:size-16">
                            <Image
                                src={'/assessment-logo.svg'}
                                alt="logo"
                                width={20}
                                height={20}
                                className="size-6 md:size-10"
                            />
                        </div>
                        <div>
                            <h1 className="text-xl font-medium text-[#0e0e2c]">
                                Frontend developer
                            </h1>
                            <p className="text-sm font-normal text-[#8c8ca1]">
                                Skill assessment test
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div
                            className={`flex items-center gap-1 rounded-lg px-4 py-2 transition-colors ${
                                isExpired
                                    ? 'border border-red-200 bg-red-100'
                                    : timeLeft.minutes < 5
                                        ? 'border border-orange-200 bg-orange-100'
                                        : 'bg-[#ece8ff]'
                            }`}
                        >
                            <Clock
                                className={`h-5 w-5 ${
                                    isExpired
                                        ? 'text-red-500'
                                        : timeLeft.minutes < 5
                                            ? 'text-orange-500'
                                            : 'text-[#755ae2]'
                                }`}
                            />
                            <span
                                className={`font-bold tabular-nums ${
                                    isExpired
                                        ? 'text-red-500'
                                        : timeLeft.minutes < 5
                                            ? 'text-orange-500'
                                            : 'text-[#755ae2]'
                                }`}
                            >
              {formatTime()}
            </span>
                            <span className="hidden font-medium text-[#755AE2] sm:flex">
              time left
            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer rounded-full text-[#8c8ca1] hover:bg-[#ece8ff] hover:text-[#755ae2]"
                        >
                            <Eye className="size-8"/>
                        </Button>
                    </div>
                </div>
            </header>
        </>
    );
};
export default Navbar;
