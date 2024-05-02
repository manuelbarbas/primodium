import { cn } from "@/util/client";
import { VariantProps, cva } from "class-variance-authority";
import { forwardRef, useCallback, useRef } from "react";

const lerp = (value: number, inMin: number, inMax: number, outMin: number, outMax: number) => {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  noDecor?: boolean;
  fragment?: boolean;
  noMotion?: boolean;
}> = ({ children, className, noDecor = false, fragment = false, noMotion = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const isInBoundingBox = mouseX >= left && mouseX <= left + width && mouseY >= top && mouseY <= top + height;

    if (!isInBoundingBox) {
      containerRef.current.style.transform = `rotateY(0deg) rotateX(0deg)`;
      return;
    }

    const x = lerp(e.clientX - left - width / 2, -width, width, -1000 / width, 1000 / width);
    const y = lerp(e.clientY - top - height / 2, -height, height, -1000 / height, 1000 / height);
    containerRef.current.style.transform = `rotateY(${-x}deg) rotateX(${y}deg)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!containerRef.current) return;
    containerRef.current.style.transform = `rotateY(0deg) rotateX(0deg)`;
  }, []);

  if (fragment)
    return (
      <div
        className={`h-full`}
        style={{
          perspective: "1000px",
          transformStyle: "preserve-3d",
        }}
      >
        <div
          ref={containerRef}
          {...(!noMotion
            ? {
                onMouseMove: handleMouseMove,
                onMouseLeave: handleMouseLeave,
              }
            : {})}
          className={cn(className)}
        >
          {children}
        </div>
      </div>
    );

  return (
    <div
      className={`h-full`}
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d",
      }}
    >
      <div
        ref={containerRef}
        {...(!noMotion
          ? {
              onMouseMove: handleMouseMove,
              onMouseLeave: handleMouseLeave,
            }
          : {})}
        className={`card bg-neutral pixel-border p-3 bg-opacity-90 relative pointer-events-auto transition-all duration-100 ease-linear ${className} `}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-neutral" />
        <div className="absolute inset-0 pixel-border" />
        <div className="absolute inset-0 pixel-border blur-[2px] opacity-50 bg-blend-screen" />
        <div className="z-50 w-full h-full">{children}</div>
        {!noDecor && (
          <div className="opacity-30 pointer-events-none">
            <img src="img/ui/decor1.png" className="absolute bottom-0 -right-6" />
            <img src="img/ui/decor2.png" className="absolute -bottom-4" />
            <div className="absolute top-0 -right-6">
              <img src="img/ui/decor1.png" />
              <img src="img/ui/decor3.png" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const SecondaryCard = forwardRef<
  HTMLDivElement,
  { children: React.ReactNode | React.ReactNode[]; className?: string; noDecor?: boolean }
>(({ children, className, noDecor }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "card bg-gradient-to-br from-secondary/15 to-secondary/5 border border-secondary/25 transition-all p-2 pointer-events-auto",
        noDecor ? "" : "hover:shadow-2xl hover:border-secondary/50",
        className
      )}
    >
      {children}
    </div>
  );
});

const glassProps = cva(
  "card border border-secondary/50 heropattern-topography-slate-500/10 backdrop-blur-md p-3 pointer-events-auto drop-shadow-hard",
  {
    variants: {
      direction: {
        left: "rounded-l-xl border-l-accent",
        right: "rounded-r-xl border-r-accent",
        top: "rounded-t-xl border-t-accent",
        bottom: "rounded-b-xl border-b-accent",
      },
    },
  }
);
interface GlassProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof glassProps> {}

export const GlassCard = forwardRef<HTMLDivElement, GlassProps>(({ children, className, direction }, ref) => {
  return (
    <div ref={ref} className={cn(glassProps({ direction, className }))}>
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/25 to-secondary/15" />
      {children}
    </div>
  );
});
