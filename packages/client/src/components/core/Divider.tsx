export const Divider: React.FC<{
  className?: string;
  children?: React.ReactNode;
  direction?: "horizontal" | "vertical";
}> = ({ className, children, direction = "horizontal" }) => {
  return (
    <div
      className={`divider ${className} ${
        direction === "horizontal" ? "divider-horizontal" : "divider-vertical"
        }`}
    >
      {children}
    </div>
  );
};
