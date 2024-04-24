import { useEffect, forwardRef, useCallback } from "react";
import { usePrimodium } from "@/hooks/usePrimodium";
import { getRandomRange } from "@/util/common";
import { Tooltip } from "@/components/core/Tooltip";
import { AudioKeys } from "@game/lib/constants/assets/audio";
import { cn } from "@/util/client";
import { cva, type VariantProps } from "class-variance-authority";
import { KeybindActionKeys } from "@/game/lib/constants/keybinds";

const buttonVariants = cva(
  "btn min-h-fit join-item items-center justify-center whitespace-nowrap ring-offset-background focus-visible:outline-none relative hover:translate-y-[-2px] hover:shadow-xl transition-all",
  {
    variants: {
      variant: {
        neutral: "btn-neutral border-2 border-secondary/50",
        primary: "btn-primary",
        accent: "btn-accent",
        secondary: "btn-secondary",
        success: "btn-success",
        info: "btn-info",
        warning: "btn-warning",
        error: "btn-error",
        ghost: "btn-ghost",
      },
      size: {
        xs: "btn-xs",
        sm: "btn-sm",
        md: "btn-md",
        lg: "btn-lg",
        content: "h-fit p-2",
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
      size: "xs",
      shape: "default",
    },
  }
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  mute?: boolean;
  clickSound?: AudioKeys;
  keybind?: KeybindActionKeys;
  tooltip?: React.ReactNode;
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
            buttonVariants({ variant, size, modifier, shape, className }),
            selected && "border-1 border-accent z-10"
          )}
          ref={ref}
          tabIndex={-1}
          {...props}
          onClick={handleClick}
          onPointerEnter={handleHoverEnter}
        >
          {props.children}
        </button>
      </Tooltip>
    );
  }
);
Button.displayName = "Button";
