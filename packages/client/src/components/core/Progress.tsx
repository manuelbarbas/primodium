export const Progress: React.FC<{
  value?: number;
  max?: number;
  className?: string;
}> = ({ value, max, className }) => {
  return (
    <progress
      className={`progress progress-accent w-56 ${className}`}
      value={value}
      max={max}
    />
  );
};
