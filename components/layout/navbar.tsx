'use client';

import {Button} from '@/components/ui/button';
import {useCountdownTimer} from '@/hooks/use-countdown-timer';
import {Clock, Eye} from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import TimesUpModal from '@/components/modals/times-up-modal';

const Navbar = () => {
    const {timeLeft, isExpired, formatTime, pause, resume} = useCountdownTimer(
        29,
        10
    );

    return (
        <>
        {
            isExpired &&
            <TimesUpModal
                open={isExpired}
                onOpenChange={(open) => {
                    if (!open) {
                    //     Awaiting logic if further designs
                    }
                }}
                onRequestMoreTime={() => {
                    // Handle request more time logic here
                    console.log('Request more time clicked');
                }}
                onSubmitAssessment={() => {
                    // Handle submit assessment logic here
                    console.log('Submit assessment clicked');
                }}
            />
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
