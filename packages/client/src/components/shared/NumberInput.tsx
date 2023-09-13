import { useState } from "react";

export const NumberInput: React.FC<{
  min: number;
  max: number;
  onChange: (val: number) => void;
}> = ({ min, max, onChange }) => {
  const [count, setCount] = useState<number | "">(0);

  return (
    <div className="flex gap-2 mt-4 mb-2">
      <button
        onClick={() => {
          if (count !== "") {
            setCount(Math.max(min, count - 1));
            onChange(Math.max(min, count - 1));
          }
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

          if (isNaN(value)) {
            setCount("");
            onChange(0);
            return;
          }

          // Check if the input value is a number and within the specified range
          if (value >= 0 && value <= max) {
            setCount(value);
            onChange(value);
            return;
          }

          if (value > max) {
            setCount(max);
            onChange(max);
          } else {
            setCount(0);
            onChange(0);
          }

          // Else, we don't update count (this makes it a controlled input that does not accept values outside the range)
        }}
        min={0}
        max={max}
      />
      {/* add to count */}
      <button
        onClick={() => {
          setCount(Math.min(max, count === "" ? 1 : count + 1));
          onChange(Math.min(max, count === "" ? 1 : count + 1));
        }}
      >
        +
      </button>
    </div>
  );
};
