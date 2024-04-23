import { cn } from "@/util/client";
import { forwardRef, useRef } from "react";

const lerp = (value: number, inMin: number, inMax: number, outMin: number, outMax: number) => {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  noDecor?: boolean;
  fragment?: boolean;
}> = ({ children, className, noDecor = false, fragment = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();

    const x = lerp(e.clientX - left - width / 2, -width, width, -5, 5);
    const y = lerp(e.clientY - top - height / 2, -height, height, -5, 5);
    containerRef.current.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
  };

  const handleMouseEnter = () => {
    if (!containerRef.current) return;
  };

  const handleMouseLeave = () => {
    if (!containerRef.current) return;
    containerRef.current.style.transform = `rotateY(0deg) rotateX(0deg)`;
  };

  if (fragment)
    return (
      <div
        className={`h-full drop-shadow-hard`}
        style={{
          perspective: "1000px",
          transformStyle: "preserve-3d",
        }}
      >
        <div
          ref={containerRef}
          onMouseEnter={handleMouseEnter}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className={cn(className)}
        >
          {children}
        </div>
      </div>
    );

  return (
    <div
      className={`h-full drop-shadow-hard`}
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d",
      }}
    >
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
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
  { children: React.ReactNode | React.ReactNode[]; className?: string }
>(({ children, className }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "card border border-secondary/25 hover:border-secondary/50 transition-all p-2 hover:translate-y-[-2px] hover:shadow-2xl pointer-events-auto",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/15 to-secondary/5" />
      {children}
    </div>
  );
});

export const NoBorderCard: React.FC<{
  children: React.ReactNode | React.ReactNode[];
  className?: string;
}> = ({ children, className }) => {
  return <div className={`card p-2 ${className}`}>{children}</div>;
};
