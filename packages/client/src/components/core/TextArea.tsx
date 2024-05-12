import { cn } from "@/util/client";
import { useEffect, useRef } from "react";
import { usePrimodium } from "src/hooks/usePrimodium";

export const TextArea: React.FC<{
  placeholder?: string;
  className?: string;
  maxLength?: number;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
  requirePattern?: string;
}> = ({ placeholder, className, maxLength, onChange, requirePattern }) => {
  const primodium = usePrimodium();
  const input = primodium.api("UI").input;
  const input2 = primodium.api("ASTEROID").input;
  const input3 = primodium.api("STARMAP").input;
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
    <div className="form-control w-full max-w-xs pointer-events-auto">
      <textarea
        ref={inputRef}
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
        placeholder={placeholder ?? "Type here"}
        className={cn("input w-full max-w-xs py-2 bg-neutral border-secondary/25 resize-none", className)}
      />
    </div>
  );
};
