import React from "react";

interface TooltipProps {
  children: React.ReactNode;
  text?: string;
  direction?: "left" | "right" | "top" | "bottom";
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  text,
  direction = "right",
}) => {
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
      className={`tooltip ${getTooltipClass()} pointer-events-auto`}
      data-tip={text}
    >
      {children}
    </div>
  );
};
