import { useEffect, forwardRef, useCallback } from "react";
import { usePrimodium } from "@/hooks/usePrimodium";
import { getRandomRange } from "@/util/common";
import { IconLabel } from "@/components/core/IconLabel";
import { Loader } from "@/components/core/Loader";
import { Tooltip } from "@/components/core/Tooltip";
import { AudioKeys } from "@game/lib/constants/assets/audio";
import { KeybindActions } from "@game/lib/constants/keybinds";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/util/client";

const buttonVariants = cva(
  "btn join-item pointer-events-auto inline-flex rounded-box items-center justify-center whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        primary: "btn-primary",
        accent: "btn-accent",
        secondary: "btn-secondary",
        success: "btn-success",
        info: "btn-info",
        warning: "btn-warning",
        error: "btn-error",
      },
      size: {
        xs: "btn-xs",
        sm: "btn-sm",
        md: "btn-md",
        lg: "btn-lg",
      },
      modifier: {
        default: "",
        outline: "btn-outline",
      },
      shape: {
        default: "",
        block: "btn-block",
        wide: "btn-wide",
        circle: "btn-circle",
        square: "btn-square",
      },
    },
    defaultVariants: {
      modifier: "default",
      variant: "secondary",
      size: "sm",
      shape: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  mute?: boolean;
  clickSound?: AudioKeys;
}

export const TestButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, modifier, shape, asChild = false, mute = false, clickSound = "Confirm2", ...props },
    ref
  ) => {
    const primodium = usePrimodium();
    const api = primodium.api("UI");

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        !mute &&
          api?.audio.play(clickSound, "ui", {
            detune: getRandomRange(-100, 100),
          });

        props.onClick?.(e);
      },
      [api?.audio, clickSound, mute, props]
    );

    const handleHoverEnter = useCallback(
      (e: React.PointerEvent<HTMLButtonElement>) => {
        !mute &&
          api?.audio.play("DataPoint2", "ui", {
            volume: 0.1,
            detune: getRandomRange(-200, 200),
          });

        props.onPointerEnter?.(e);
      },
      [api?.audio, mute, props]
    );

    // useEffect(() => {
    //   if (!keybind || !api || disabled) return;

    //   const callback = () => {
    //     onClick && onClick();
    //     !mute &&
    //       api.audio.play(clickSound, "ui", {
    //         detune: getRandomRange(-100, 100),
    //       });
    //   };

    //   const listener = api.input.addListener(keybind, callback);

    //   return () => {
    //     listener.dispose();
    //   };
    // }, [keybind, api, clickSound, mute, disabled, onClick]);

    const Comp = asChild ? "button" : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, modifier, shape, className }))}
        ref={ref}
        {...props}
        onClick={handleClick}
        onPointerEnter={handleHoverEnter}
      />
    );
  }
);
TestButton.displayName = "TestButton";

export const Button: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e?: React.MouseEvent | undefined) => void;
  onPointerEnter?: (e?: React.PointerEvent) => void;
  onPointerLeave?: (e?: React.PointerEvent) => void;
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
  onPointerEnter,
  onPointerLeave,
  disabled,
  selected = false,
  loading = false,
  tooltip,
  tooltipDirection = "top",
  mute = false,
  clickSound = "Confirm2",
  keybind,
}) => {
  const primodium = usePrimodium();
  const api = primodium.api("UI");

  useEffect(() => {
    if (!keybind || !api || disabled) return;

    const callback = () => {
      onClick && onClick();
      !mute &&
        api.audio.play(clickSound, "ui", {
          detune: getRandomRange(-100, 100),
        });
    };

    const listener = api.input.addListener(keybind, callback);

    return () => {
      listener.dispose();
    };
  }, [keybind, api, clickSound, mute, disabled, onClick]);

  return (
    <Tooltip text={tooltip} direction={tooltipDirection}>
      <button
        style={style}
        onClick={(e) => {
          !mute &&
            api?.audio.play(clickSound, "ui", {
              detune: getRandomRange(-100, 100),
            });

          onClick?.(e);
        }}
        disabled={disabled}
        onPointerEnter={() => {
          !mute &&
            api?.audio.play("DataPoint2", "ui", {
              volume: 0.1,
              detune: getRandomRange(-200, 200),
            });

          onPointerEnter?.();
        }}
        onPointerLeave={onPointerLeave}
        className={`btn join-item inline pointer-events-auto font-bold outline-none h-fit bg-opacity-50 ${className} ${
          selected ? "border-accent z-10 bg-base-100" : ""
        }`}
      >
        {loading && <Loader />}
        {!loading && children}
      </button>
    </Tooltip>
  );
};

export const IconButton: React.FC<{
  imageUri: string;
  text?: string;
  hideText?: boolean;
  className?: string;
  onClick?: () => void;
  onDoubleClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
  loading?: boolean;
  tooltipText?: string;
  tooltipDirection?: "right" | "left" | "top" | "bottom";
  mute?: boolean;
  clickSound?: AudioKeys;
}> = ({
  imageUri,
  text = "",
  hideText = false,
  className,
  onClick,
  disabled,
  selected = false,
  loading = false,
  tooltipDirection = "right",
  tooltipText,
  mute = false,
  clickSound = "Confirm2",
  onDoubleClick,
}) => {
  const primodium = usePrimodium();
  const { audio } = primodium.api();
  return (
    <Tooltip text={tooltipText} direction={tooltipDirection}>
      <button
        onClick={() => {
          !mute &&
            audio.play(clickSound, "ui", {
              detune: getRandomRange(-100, 100),
            });
          onClick && onClick();
        }}
        disabled={disabled}
        onDoubleClick={onDoubleClick}
        onPointerEnter={() => {
          !mute &&
            audio.play("DataPoint2", "ui", {
              volume: 0.1,
              detune: getRandomRange(-200, 200),
            });
        }}
        className={`btn join-item inline gap-1 pointer-events-auto font-bold outline-none bg-opacity-50 ${className} ${
          disabled ? "opacity-50 !pointer-events-auto" : ""
        } ${selected ? "border-accent z-10 bg-base-100" : ""} `}
      >
        {loading && <Loader />}
        {!loading && <IconLabel imageUri={imageUri} text={text} hideText={hideText} />}
      </button>
    </Tooltip>
  );
};
