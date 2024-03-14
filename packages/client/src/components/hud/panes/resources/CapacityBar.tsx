import React, { FC, useEffect, useState } from 'react';

type CapacityBarProps = {
  current: number;
  max: number;
};

export const CapacityBar: FC<CapacityBarProps> = ({ current, max }) => {
  const [percentage, setPercentage] = useState<number>(0);

  useEffect(() => {
    // Ensure the percentage does not exceed 100
    setPercentage(Math.min(100, (current / max) * 100));
  }, [current, max]);

  return (
    <div className="relative w-full bg-gray-200 rounded overflow-hidden h-6 text-xs flex items-center">
      <div
        style={{ width: `${percentage}%` }}
        className={`transition-all ease-out duration-500 h-6 ${percentage < 100 ? 'bg-green-500' : 'bg-red-500'}`}
      ></div>
      <div className="absolute inset-0 flex justify-center items-center">
        <span className="text-white text-sm font-bold">{current}/{max} P</span>
      </div>
    </div>
  );
};

