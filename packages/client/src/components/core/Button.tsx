import { IconLabel } from "./IconLabel";
import { Loader } from "./Loader";

export const Button: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick: () => void;
  disabled?: boolean;
  selected?: boolean;
  loading?: boolean;
}> = ({
  children,
  className,
  onClick,
  disabled,
  selected = false,
  loading = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn join-item inline gap-1 pointer-events-auto font-bold outline-non ${className} ${
        disabled ? "opacity-50" : ""
      } ${selected ? "border-accent z-10 bg-base-100" : ""} `}
    >
      {loading && <Loader />}
      {!loading && children}
    </button>
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
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn join-item inline gap-1 pointer-events-auto font-bold outline-none ${className} ${
        disabled ? "opacity-50" : ""
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
