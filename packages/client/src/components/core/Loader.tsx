export const Loader = ({ className, size = "sm" }: { className?: string; size?: "sm" | "xs" }) => {
  return <span className={`loading loading-dots ${size == "sm" ? "loading-sm" : "loading-xs"} ${className}`}></span>;
};
