import React from "react";
import hotbarContent from "./hotbarContent";

const HotbarPagination: React.FC<{
  index: number;
  className?: string;
  onClick?: () => void;
}> = ({ index, className, onClick }) => {
  return (
    <div
      className={`flex h-full space-x-2 hover:bg-gray-900/50 transition-all cursor-pointer p-2 ${className}`}
      onClick={onClick}
    >
      {hotbarContent.map((_, i) => {
        return (
          <div
            key={i}
            className={`w-2 h-2 transition-all duration-500 shadow-inner  ${
              i === index
                ? "scale-125 bg-gray-200 ring-1 ring-gray-900"
                : "bg-gray-900 scale-100"
            }`}
          />
        );
      })}
    </div>
  );
};

export default HotbarPagination;
