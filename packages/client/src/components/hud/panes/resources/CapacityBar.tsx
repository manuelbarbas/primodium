import React, { FC } from 'react';

type SegmentedCapacityBarProps = {
    current: number;
    max: number | null;
    segments: number;
    name: string;
};

export const CapacityBar: FC<SegmentedCapacityBarProps> = ({ current, max, segments, name }) => {

    // Calculate the number of filled segments
    const filledSegments = max !== null && max > 0 ? Math.round((current / max) * segments) : 0;

    const segmentColor = (index: number) => {
        if (current === max && index === segments - 1) return 'bg-error';
        if (name === 'Electricity') {
            if (index < 4) return 'bg-amber-200/80';
            if (index < 7) return 'bg-amber-300/90';
            return 'bg-yellow-500';
        } else {
            // Default color scheme
            if (index < 4) return 'bg-emerald-400';
            if (index < 7) return 'bg-emerald-600';
            return 'bg-emerald-900';
        }
    };

    return (
        <div className="relative w-full bg-transparent overflow-hidden h-6 flex p-0.5 gap-0.5">
            {[...Array(segments)].map((_, index) => (
                <div
                    key={index}
                    className={`flex-1 h-full transition-all duration-500 ${index < filledSegments ? segmentColor(index) : 'bg-gray-400/20'
                        }`}
                />
            ))}
        </div>
    );
};


