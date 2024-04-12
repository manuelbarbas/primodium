import { useEffect, forwardRef, useCallback } from "react";
import { usePrimodium } from "@/hooks/usePrimodium";
import { getRandomRange } from "@/util/common";
import { Tooltip } from "@/components/core/Tooltip";
import { AudioKeys } from "@game/lib/constants/assets/audio";
import { KeybindActionKeys } from "@game/lib/constants/keybinds";
import { cn } from "@/util/client";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "btn join-item pointer-events-auto inline-flex rounded-box items-center justify-center whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        neutral: "btn-neutral",
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
      variant: "neutral",
      size: "sm",
      shape: "default",
    },
  }
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  mute?: boolean;
  clickSound?: AudioKeys;
  keybind?: KeybindActionKeys;
  tooltip?: string;
  tooltipDirection?: "right" | "left" | "top" | "bottom";
  selected?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      modifier,
      shape,
      mute = false,
      clickSound = "Confirm2",
      keybind,
      tooltip,
      tooltipDirection,
      selected,
      ...props
    },
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

    useEffect(() => {
      if (!keybind || !api || props.disabled) return;

      const listener = api.input.addListener(keybind, () => handleClick(undefined!));

      return () => {
        listener.dispose();
      };
    }, [keybind, api, clickSound, mute, props.disabled, handleClick]);

    return (
      <Tooltip tooltipContent={tooltip} direction={tooltipDirection}>
        <button
          className={cn(
            selected && "ring-1 ring-accent z-10",
            buttonVariants({ variant, size, modifier, shape, className })
          )}
          ref={ref}
          {...props}
          onClick={handleClick}
          onPointerEnter={handleHoverEnter}
        />
      </Tooltip>
    );
  }
);
Button.displayName = "Button";
