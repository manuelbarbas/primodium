import React from "react";

interface TooltipProps {
  children: React.ReactElement;
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

  return React.cloneElement(children, {
    "data-tip": text,
    className: `${
      children.props.className || ""
    } before:z-100 before:content-[attr(data-tip)] tooltip ${getTooltipClass()} pointer-events-auto ${className}`,
  });
};
