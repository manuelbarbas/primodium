export const Progress: React.FC<{ value?: number; max?: number }> = ({
  value,
  max,
}) => {
  return (
    <progress
      className="progress progress-accent w-56"
      value={value}
      max={max}
    />
  );
};
