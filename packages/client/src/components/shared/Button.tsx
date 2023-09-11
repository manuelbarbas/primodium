import { Loader } from "./Loader";

export const Button: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick: () => void;
  disabled?: boolean;
  selected?: boolean;
  loading?: boolean;
}> = ({ children, className, onClick, disabled, selected = false, loading = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn ${className} ${disabled ? "opacity-50" : ""
        } ${selected ? "border border-accent" : ""} `}
    >
      {loading && <Loader />}
      {!loading && children}
    </button>
  );
}
