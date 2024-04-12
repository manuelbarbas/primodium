import { useState } from "react";
import { motion, useTransform, useMotionValue, useSpring } from "framer-motion";
import { VariantProps, cva } from "class-variance-authority";
import { cn } from "@/util/client";

const tooltipTranslation = {
  top: {
    x: "-50%",
    y: 0,
  },
  left: {
    x: "-100%",
    y: "50%",
  },
  right: {
    x: "0%",
    y: "50%",
  },
  bottom: {
    x: "-50%",
    y: "100%",
  },
};

const tooltipVariants = cva(" pointer-events-auto", {
  variants: {
    direction: {
      top: "left-1/2 -top-12",
      left: "bottom-1/2",
      right: "bottom-1/2 left-full",
      bottom: "left-1/2",
    },
  },
  defaultVariants: {
    direction: "top",
  },
});

interface TooltipProps extends React.ButtonHTMLAttributes<HTMLDivElement>, VariantProps<typeof tooltipVariants> {
  tooltipContent?: React.ReactNode;
}

export const Tooltip = ({ className, tooltipContent, children, direction }: TooltipProps) => {
  const [visible, setVisible] = useState(false);
  const springConfig = { stiffness: 100, damping: 5 };
  const x = useMotionValue(0); // going to set this value on mouse move
  // rotate the tooltip
  const rotate = useSpring(useTransform(x, [-100, 100], [-10, 10]), springConfig);
  // translate the tooltip
  const translateX = useSpring(
    useTransform(x, [-100, 100], direction === "bottom" ? [15, -15] : [-15, 15]),
    springConfig
  );
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const halfWidth = event.target?.offsetWidth / 2;
    x.set(event.nativeEvent.offsetX - halfWidth); // set the x value, which is then used in transform and rotate
  };

  if (!tooltipContent) return children;

  return (
    <div
      onMouseMove={handleMouseMove}
      onPointerEnter={() => setVisible(true)}
      onPointerLeave={() => setVisible(false)}
      className="relative"
    >
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.6, x: tooltipTranslation[direction ?? "top"].x }}
          animate={{
            opacity: 1,
            y: tooltipTranslation[direction ?? "top"].y,
            scale: 1,
            transition: {
              type: "spring",
              stiffness: 300,
              damping: 30,
            },
          }}
          exit={{ opacity: 0, y: 20, scale: 0.6 }}
          style={{
            translateX: translateX,
            rotate: rotate,
            whiteSpace: "nowrap",
          }}
          className={cn(
            tooltipVariants({ direction }),
            "absolute flex text-xs flex-col items-center justify-center bg-neutral grid-background z-50 shadow-xl px-4 py-2 pixel-border2 ",
            className
          )}
        >
          <div className="text-xs">{tooltipContent}</div>
        </motion.div>
      )}

      {children}
    </div>
  );
};
