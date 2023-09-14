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
      className={`btn btn-md join-item inline gap-1 pointer-events-auto font-bold ${className} ${
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
  onClick: () => void;
  disabled?: boolean;
  selected?: boolean;
  loading?: boolean;
}> = ({
  imageUri,
  text,
  hideText = false,
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
      className={`btn btn-md join-item inline gap-1 pointer-events-auto font-bold ${
        className || ""
      } ${disabled ? "opacity-50" : ""} ${
        selected ? "border-accent z-10 bg-base-100" : ""
      } `}
    >
      {loading && <Loader />}
      {!loading && (
        <IconLabel imageUri={imageUri} text={text} hideText={hideText} />
      )}
    </button>
  );
};
