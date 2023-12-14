export const Progress: React.FC<{
  value?: number;
  max?: number;
  className?: string;
}> = ({ value, max, className }) => {
  value = !value || isNaN(value) ? 0 : value;
  max = !max || isNaN(max) ? 0 : max;

  return <progress className={`progress progress-accent ${className}`} value={value} max={max} />;
};
