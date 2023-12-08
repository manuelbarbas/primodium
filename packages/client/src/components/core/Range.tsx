export const Range: React.FC<{
  min?: number;
  max?: number;
  defaultValue?: number;
  onChange?: (val: number) => void;
  className?: string;
}> = ({ defaultValue, onChange, className, min = 0, max = 100 }) => {
  return (
    <input
      type="range"
      min={min}
      max={max}
      defaultValue={defaultValue}
      className={`range ${className}`}
      onChange={(e) => {
        onChange?.(parseInt(e.target.value));
      }}
    />
  );
};
