import { useState } from "react";

export const NumberInput: React.FC<{
  startingValue?: number;
  min?: number;
  max?: number;
  toFixed?: number;
  onChange: (val: number) => void;
}> = ({ startingValue, min = 0, max = Infinity, onChange, toFixed }) => {
  const [count, setCount] = useState<number | "">(startingValue || min);

  const handleUpdate = (newCount: string) => {
    const allZeroes = newCount.split("").every((digit) => digit == "0");

    if (isNaN(Number(newCount)) || allZeroes) {
      setCount("");
      onChange(min);
      return;
    }

    newCount = toFixed ? Number(newCount).toFixed(toFixed) : newCount;
    let countNum = Number(newCount);

    if (countNum > max) countNum = max;
    else if (countNum < min) countNum = min;
    setCount(countNum);
    onChange(countNum);
  };

  return (
    <div className={`flex gap-2 mt-4 mb-2 `}>
      <button
        className={`${count == min ? "opacity-50" : ""}`}
        disabled={count == min}
        onClick={() => handleUpdate(Math.max(min, count == "" ? 0 : count - 1).toString())}
      >
        -
      </button>
      <input
        type="number"
        className="bg-transparent text-center w-fit outline-none border-b border-pink-900"
        value={count}
        placeholder={min.toString()}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          e.preventDefault();
          handleUpdate(e.target.value);
        }}
        min={0}
        max={max}
      />
      <button
        className={`${count == max ? "opacity-50" : ""}`}
        disabled={count == max}
        onClick={() => handleUpdate(Math.min(max, count == "" ? min + 1 : count + 1).toString())}
      >
        +
      </button>
    </div>
  );
};
