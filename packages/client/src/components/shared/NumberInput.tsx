import { useState } from "react";
import { Badge } from "../core/Badge";

export const NumberInput: React.FC<{
  min: number;
  max: number;
  onChange: (val: number) => void;
}> = ({ min, max, onChange }) => {
  const [count, setCount] = useState<number | "">(min);

  return (
    <Badge className="flex gap-2 mt-4 mb-2 p-5 rounded-box">
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
        className="bg-transparent text-center w-fit outline-none border-b border-secondary"
        value={count}
        placeholder="0"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          e.preventDefault();

          const value = parseInt(e.target.value);

          if (isNaN(value)) {
            setCount("");
            onChange(min);
            return;
          }

          // Check if the input value is a number and within the specified range
          if (value >= min && value <= max) {
            setCount(value);
            onChange(value);
            return;
          }

          if (value > max) {
            setCount(max);
            onChange(max);
          } else {
            setCount(min);
            onChange(min);
          }

          // Else, we don't update count (this makes it a controlled input that does not accept values outside the range)
        }}
        min={min}
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
    </Badge>
  );
};
