import { cn } from "@/util/client";
import { useEffect, useRef } from "react";
import { usePrimodium } from "src/hooks/usePrimodium";

export const TextInput: React.FC<{
  topLeftLabel?: string;
  bottomLeftLabel?: string;
  topRightLabel?: string;
  bottomRightLabel?: string;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  requirePattern?: string;
}> = ({
  placeholder,
  topLeftLabel,
  topRightLabel,
  bottomLeftLabel,
  bottomRightLabel,
  className,
  maxLength,
  onChange,
  requirePattern,
}) => {
  const primodium = usePrimodium();
  const input = primodium.api("UI").input;
  const input2 = primodium.api("ASTEROID").input;
  const input3 = primodium.api("STARMAP").input;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleEscPress = (event: KeyboardEvent) => {
      if (!inputRef.current || event.key !== "Escape") return;

      inputRef.current.blur();
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (!inputRef.current || inputRef.current.contains(event.target as Node)) return;

      inputRef.current.blur();
    };

    document.addEventListener("keydown", handleEscPress);
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleEscPress);
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div
      className={cn(
        "form-control w-full max-w-xs pointer-events-auto",
        // if className includes a custom width, extract it and pass it to the form-control
        className && className.includes("w-") && className.split(" ").find((c) => c.includes("w-"))
      )}
    >
      {topLeftLabel || topRightLabel ? (
        <label className="label">
          {topLeftLabel && <span className="label-text opacity-90">{topLeftLabel}</span>}
          {topRightLabel && <span className="label-text-alt opacity-75">{topRightLabel}</span>}
        </label>
      ) : null}
      <input
        ref={inputRef}
        type="text"
        tabIndex={-1}
        onChange={onChange}
        maxLength={maxLength}
        onFocus={() => {
          input.disableInput();
          input2.disableInput();
          input3.disableInput();
        }}
        onBlur={() => {
          input.enableInput();
          input2.enableInput();
          input3.enableInput();
        }}
        required={!!requirePattern}
        pattern={requirePattern}
        placeholder={placeholder ?? "Type here"}
        className={cn("input w-full max-w-xs bg-neutral border-secondary/25", className)}
      />
      {bottomLeftLabel || bottomRightLabel ? (
        <label className="label">
          {bottomLeftLabel && <span className="label-text-alt opacity-75">{bottomLeftLabel}</span>}
          {bottomRightLabel && <span className="label-text-alt opacity-75"> {bottomRightLabel} </span>}
        </label>
      ) : null}
    </div>
  );
};
