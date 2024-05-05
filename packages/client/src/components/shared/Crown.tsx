import React from "react";
import { FaCrown } from "react-icons/fa6";

export const Crown = ({ rank, shouldOffset = false }: { rank: number; shouldOffset?: boolean }) => {
  const iconSize = "text-base";
  const verticalAdjustment = `translate-y-[-10%]`;
  const offset = `translate-x-[-45%] translate-y-[-45%] transform rotate-45 scale-75`;

  let crownColor;
  switch (rank) {
    case 1:
      crownColor = "text-yellow-500";
      break;
    case 2:
      crownColor = "text-gray-400";
      break;
    case 3:
      crownColor = "text-yellow-600";
      break;
    default:
      return null;
  }

  return (
    <FaCrown
      className={`${crownColor} 
         ${iconSize}
         ${verticalAdjustment} 
         ${shouldOffset ? offset : ""}`}
    />
  );
};
