import { useState } from "react";

export const NumberInput: React.FC<{
  min?: number;
  max: number;
  onChange: (val: number) => void;
}> = ({ min = 0, max, onChange }) => {
  const [count, setCount] = useState<number | "">(min);

  const handleUpdate = (newCount: number) => {
    if (isNaN(newCount) || newCount == 0) {
      newCount = min;
      setCount("");
      onChange(newCount);
      return;
    }

    if (newCount > max) newCount = max;
    else if (newCount < min) newCount = min;
    setCount(newCount);
    onChange(newCount);
  };
  const removeLeadingZeroes = (str: string) => {
    str = `${str}`.toString();
    return parseInt(str, 10).toString();
  };
  return (
    <div className={`flex gap-2 mt-4 mb-2 `}>
      <button
        className={`${count == min ? "opacity-50" : ""}`}
        disabled={count == min}
        onClick={() => handleUpdate(Math.max(min, count == "" ? 0 : count - 1))}
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
          const value = removeLeadingZeroes(e.target.value);

          console.log("value:", value);
          handleUpdate(Number(value));
        }}
        min={0}
        max={max}
      />
      <button
        className={`${count == max ? "opacity-50" : ""}`}
        disabled={count == max}
        onClick={() => handleUpdate(Math.min(max, count == "" ? 1 : count + 1))}
      >
        +
      </button>
    </div>
  );
};
