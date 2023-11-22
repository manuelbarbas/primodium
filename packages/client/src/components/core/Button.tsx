import { primodium } from "@game/api";
import { IconLabel } from "./IconLabel";
import { Loader } from "./Loader";
import { Tooltip } from "./Tooltip";
import { AudioKeys } from "@game/constants";

export const Button: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent | undefined) => void;
  disabled?: boolean;
  selected?: boolean;
  loading?: boolean;
  tooltip?: string;
  tooltipDirection?: "right" | "left" | "top" | "bottom";
  mute?: boolean;
  clickSound?: AudioKeys;
}> = ({
  children,
  className,
  onClick,
  disabled,
  selected = false,
  loading = false,
  tooltip,
  tooltipDirection = "top",
  mute = false,
  clickSound = AudioKeys.Click2,
}) => {
  const { audio } = primodium.api();

  return (
    <Tooltip text={tooltip} direction={tooltipDirection}>
      <button
        onClick={(e) => {
          !mute && audio.play(clickSound, "ui");
          onClick && onClick(e);
        }}
        disabled={disabled}
        onPointerEnter={() => {
          !mute && audio.play(AudioKeys.Click3, "ui");
        }}
        className={`btn join-item inline pointer-events-auto font-bold outline-none h-fit ${className} ${
          disabled ? "opacity-80" : ""
        } ${selected ? "border-accent z-10 bg-base-100" : ""} `}
      >
        {loading && <Loader />}
        {!loading && children}
      </button>
    </Tooltip>
  );
};

export const IconButton: React.FC<{
  imageUri: string;
  text: string;
  hideText?: boolean;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
  loading?: boolean;
  tooltipText?: string;
  tooltipDirection?: "right" | "left" | "top" | "bottom";
  mute?: boolean;
  clickSound?: AudioKeys;
}> = ({
  imageUri,
  text,
  hideText = false,
  className,
  onClick,
  disabled,
  selected = false,
  loading = false,
  tooltipDirection = "right",
  tooltipText,
  mute = false,
  clickSound = AudioKeys.Click2,
}) => {
  const { audio } = primodium.api();
  return (
    <button
      onClick={() => {
        !mute && audio.play(clickSound, "ui");
        onClick && onClick();
      }}
      disabled={disabled}
      onPointerEnter={() => {
        !mute && audio.play(AudioKeys.Click3, "ui");
      }}
      className={`btn join-item inline gap-1 pointer-events-auto font-bold outline-none ${className} ${
        disabled ? "opacity-80" : ""
      } ${selected ? "border-accent z-10 bg-base-100" : ""} `}
    >
      {loading && <Loader />}
      {!loading && (
        <IconLabel
          imageUri={imageUri}
          text={text}
          hideText={hideText}
          tooltipDirection={tooltipDirection}
          tooltipText={tooltipText}
        />
      )}
    </button>
  );
};
