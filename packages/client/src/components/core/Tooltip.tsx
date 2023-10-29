import React from "react";

interface TooltipProps {
  children: React.ReactNode;
  text?: string;
  className?: string;
  direction?: "left" | "right" | "top" | "bottom";
}

export const Tooltip: React.FC<TooltipProps> = ({ children, text, direction = "right", className }) => {
  const getTooltipClass = () => {
    switch (direction) {
      case "left":
        return "tooltip-left";
      case "right":
        return "tooltip-right";
      case "top":
        return "tooltip-top";
      case "bottom":
        return "tooltip-bottom";
      default:
        return "tooltip-right";
    }
  };

  return (
    <div
      className={`before:z-50 before:content-[attr(data-tip)] tooltip ${getTooltipClass()} ${className} pointer-events-auto`}
      data-tip={text}
    >
      {children}
    </div>
  );
};
