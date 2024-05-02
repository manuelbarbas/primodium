import { ReactElement } from "react";
import { FaCrown } from "react-icons/fa6";

export const maybeGetCrownIconFromRank = (rank: number, shouldOffset: boolean = false): ReactElement | null => {
  const iconSize: string = "text-base";
  const verticalAdjustment: string = `translate-y-[-10%]`;
  const offset: string = `translate-x-[-45%] translate-y-[-45%] transform rotate-45 scale-75`;

  let crownColor: string;
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
