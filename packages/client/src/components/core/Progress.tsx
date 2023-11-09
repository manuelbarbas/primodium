export const Progress: React.FC<{
  value?: number;
  max?: number;
  animatePulse?: boolean;
  className?: string;
}> = ({ value, max, animatePulse, className }) => {
  return (
    <progress
      className={`progress progress-accent w-56 ${animatePulse && "animate-pulse"} ${className}`}
      value={value}
      max={max}
    />
  );
};
