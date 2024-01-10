import { AudioKeys, KeybindActions, Scenes } from "@game/constants";
import { useEffect } from "react";
import { usePrimodium } from "src/hooks/usePrimodium";
import { getRandomRange } from "src/util/common";
import { IconLabel } from "./IconLabel";
import { Loader } from "./Loader";
import { Tooltip } from "./Tooltip";

export const Button: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e?: React.MouseEvent | undefined) => void;
  disabled?: boolean;
  selected?: boolean;
  loading?: boolean;
  tooltip?: string;
  tooltipDirection?: "right" | "left" | "top" | "bottom";
  mute?: boolean;
  clickSound?: AudioKeys;
  keybind?: KeybindActions;
}> = ({
  children,
  className,
  style,
  onClick,
  disabled,
  selected = false,
  loading = false,
  tooltip,
  tooltipDirection = "top",
  mute = false,
  clickSound = AudioKeys.Confirm2,
  keybind,
}) => {
  const primodium = usePrimodium();
  const api = primodium.api(Scenes.Asteroid);
  const api2 = primodium.api(Scenes.Starmap);

  useEffect(() => {
    if (!keybind || !api || !api2 || disabled) return;

    const callback = () => {
      onClick && onClick();
      !mute &&
        api.audio.play(clickSound, "ui", {
          detune: getRandomRange(-100, 100),
        });
    };

    const listener = api.input.addListener(keybind, callback);
    const listener2 = api2.input.addListener(keybind, callback);

    return () => {
      listener.dispose();
      listener2.dispose();
    };
  }, [keybind, api, api2, clickSound, mute, disabled, onClick]);

  return (
    <Tooltip text={tooltip} direction={tooltipDirection}>
      <button
        style={style}
        onClick={(e) => {
          !mute &&
            api?.audio.play(clickSound, "ui", {
              detune: getRandomRange(-100, 100),
            });
          onClick && onClick(e);
        }}
        disabled={disabled}
        onPointerEnter={() => {
          !mute &&
            api?.audio.play(AudioKeys.DataPoint2, "ui", {
              volume: 0.1,
              detune: getRandomRange(-200, 200),
            });
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
  clickSound = AudioKeys.Confirm2,
}) => {
  const primodium = usePrimodium();
  const { audio } = primodium.api();
  return (
    <button
      onClick={() => {
        !mute &&
          audio.play(clickSound, "ui", {
            detune: getRandomRange(-100, 100),
          });
        onClick && onClick();
      }}
      disabled={disabled}
      onPointerEnter={() => {
        !mute &&
          audio.play(AudioKeys.DataPoint2, "ui", {
            volume: 0.1,
            detune: getRandomRange(-200, 200),
          });
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
