import { useEffect, useState } from "react";

function adjustDecimals(num: string, toFixed: number): string {
  const parts = num.split(".");
  if (parts.length > 2) throw new Error("Invalid number");
  if (parts.length === 2 && parts[1].length > toFixed) {
    parts[1] = parts[1].substring(0, toFixed);
  }
  return toFixed == 0 ? parts[0] : parts.join(".");
}

export const NumberInput: React.FC<{
  startingValue?: number;
  min?: number;
  max?: number;
  toFixed?: number;
  reset?: boolean;
  onChange: (val: number) => void;
}> = ({ startingValue, min = 0, max = Infinity, onChange, toFixed = 0, reset }) => {
  const [count, setCount] = useState<string>((startingValue || min).toString());

  const minString = min.toString();
  const maxString = max.toString();

  // this is breaking the rules of react
  useEffect(() => {
    if (reset) {
      setCount((startingValue || min).toString());
    }
  }, [reset, startingValue, min]);

  const handleUpdate = (newCount: string) => {
    newCount = adjustDecimals(newCount, toFixed);
    const allZeroes = newCount.split("").every((digit) => digit == "0");

    if (isNaN(Number(newCount)) || allZeroes) {
      setCount("");
      onChange(min);
      return;
    }

    let countNum = Number(newCount);

    if (countNum > max) {
      countNum = max;
      newCount = maxString;
    } else if (countNum < min) {
      countNum = min;
      newCount = minString;
    }
    setCount(newCount);
    onChange(countNum);
  };

  return (
    <div className={`flex gap-2 my-2`}>
      <button
        className={`${Number(count) <= min ? "opacity-50" : ""}`}
        disabled={Number(count) <= min}
        onClick={() => handleUpdate(Math.max(min, count == "" ? 0 : Number(count) - 1).toString())}
      >
        -
      </button>
      <input
        type="number"
        className={`bg-transparent text-center w-fit outline-none border-b border-pink-900 ${
          Number(count) > max ? "text-error" : ""
        }`}
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
        className={`${Number(count) >= max ? "opacity-50" : ""}`}
        disabled={Number(count) >= max}
        onClick={() => handleUpdate(Math.min(max, count == "" ? min + 1 : Number(count) + 1).toString())}
      >
        +
      </button>
    </div>
  );
};
