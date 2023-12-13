import { primodium } from "@game/api";
import { Scenes } from "@game/constants";
import { useEffect, useRef } from "react";

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
  const input = primodium.api(Scenes.Asteroid).input;
  const input2 = primodium.api(Scenes.Starmap).input;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleEscPress = (event: KeyboardEvent) => {
      if (!inputRef.current || event.key !== "Escape") return;

      inputRef.current.blur();
    };

    window.addEventListener("keydown", handleEscPress);

    return () => {
      window.removeEventListener("keydown", handleEscPress);
    };
  }, []);

  return (
    <div className="form-control w-full max-w-xs">
      <label className="label">
        {topLeftLabel && <span className="label-text opacity-90">{topLeftLabel}</span>}
        {topRightLabel && <span className="label-text-alt opacity-75">{topRightLabel}</span>}
      </label>
      <input
        ref={inputRef}
        type="text"
        onChange={onChange}
        maxLength={maxLength}
        onFocus={() => {
          input.disableInput();
          input2.disableInput();
        }}
        onBlur={() => {
          input.enableInput();
          input2.enableInput();
        }}
        required={!!requirePattern}
        pattern={requirePattern}
        placeholder={placeholder ?? "Type here"}
        className={`${className} input w-full max-w-xs`}
      />
      <label className="label">
        {bottomLeftLabel && <span className="label-text-alt opacity-75">{bottomLeftLabel}</span>}
        {bottomRightLabel && <span className="label-text-alt opacity-75"> {bottomRightLabel} </span>}
      </label>
    </div>
  );
};
