import { cn } from "@/util/client";
import { VariantProps, cva } from "class-variance-authority";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useState } from "react";

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
  center: {
    x: "0",
    y: "0",
  },
};

const tooltipVariants = cva(" pointer-events-auto", {
  variants: {
    direction: {
      top: "left-1/2 -top-12",
      left: "bottom-1/2",
      right: "bottom-1/2 left-full",
      bottom: "left-1/2",
      center: "",
    },
  },
  defaultVariants: {
    direction: "top",
  },
});

interface TooltipProps extends React.ButtonHTMLAttributes<HTMLDivElement>, VariantProps<typeof tooltipVariants> {
  tooltipContent?: React.ReactNode;
  show?: boolean;
  rotate?: boolean;
}

export const Tooltip = ({
  className,
  tooltipContent,
  children,
  direction,
  show = false,
  rotate = true,
}: TooltipProps) => {
  const [visible, setVisible] = useState(false);
  const springConfig = { stiffness: 125, damping: 10 };
  const x = useMotionValue(0); // going to set this value on mouse move
  // rotate the tooltip
  const rotation = useSpring(useTransform(x, [-100, 100], [-10, 10]), springConfig);
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
      {(visible || show) && (
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
            translateX: rotate ? translateX : 0,
            rotate: rotate ? rotation : 0,
          }}
          className={cn(
            tooltipVariants({ direction }),
            "absolute flex text-xs flex-col items-center justify-center bg-neutral heropattern-graphpaper-slate-800/50 z-[1000] shadow-xl px-4 py-2 pixel-border",
            className
          )}
        >
          {tooltipContent}
        </motion.div>
      )}

      {children}
    </div>
  );
};
