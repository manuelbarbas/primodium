export const Progress: React.FC<{
  value?: number;
  max?: number;
  className?: string;
}> = ({ value, max, className }) => {
  return <progress className={`progress progress-accent ${className}`} value={value} max={max} />;
};
