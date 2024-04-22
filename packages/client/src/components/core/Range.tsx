export const Range: React.FC<{
  min?: number;
  max?: number;
  defaultValue?: number;
  onChange?: (val: number) => void;
  className?: string;
}> = ({ defaultValue, onChange, className, min = 0, max = 100 }) => {
  return (
    <div className="flex items-center p-2 transition-all hover:bg-secondary/10 h-full">
      <input
        type="range"
        min={min}
        max={max}
        defaultValue={defaultValue}
        className={`range pointer-events-auto ${className}`}
        onChange={(e) => {
          onChange?.(parseInt(e.target.value));
        }}
      />
    </div>
  );
};
