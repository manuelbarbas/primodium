import { useEffect, useState } from "react";

export const NumberInput: React.FC<{
  min?: number;
  max: number;
  onChange: (val: number) => void;
}> = ({ min = 0, max, onChange }) => {
  const [count, setCount] = useState(min);
  useEffect(() => {
    if (isNaN(count)) setCount(min);
    if (count > max) setCount(max);
    if (count < min) setCount(min);
  }, [max, count, min]);

  return (
    <div className="flex gap-2 mt-4 mb-2">
      <button
        onClick={() => {
          setCount(Math.max(min, count - 1));
          onChange(Math.max(min, count - 1));
        }}
      >
        -
      </button>
      <input
        type="number"
        className="bg-transparent text-center w-fit outline-none border-b border-pink-900"
        value={count}
        placeholder="0"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          e.preventDefault();

          const value = parseInt(e.target.value);

          setCount(value);
          onChange(value);
        }}
        min={0}
        max={max}
      />
      {/* add to count */}
      <button
        onClick={() => {
          setCount(Math.min(max, count + 1));
          onChange(Math.min(max, count + 1));
        }}
      >
        +
      </button>
    </div>
  );
};
