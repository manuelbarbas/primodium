import { cn } from "@/util/client";
import { FC } from "react";
import { FaCrown } from "react-icons/fa6";

export const CrownRank: FC<{ rank: number; offset?: boolean }> = ({ rank, offset = false }) => {
  if (rank > 3) return null;
  const offsetRotation: string = `absolute -right-2 -top-1 transform rotate-45 scale-75`;

  const crownColors: Record<number, string> = {
    1: "text-yellow-500",
    2: "text-gray-400",
    3: "text-yellow-600",
  };

  return <FaCrown className={cn("translate-y-[-10%]", crownColors[rank] ?? "", offset ? offsetRotation : "")} />;
};
