export const Badge: React.FC<{
  children?: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return <div className={`badge badge-neutral ${className}`}>{children}</div>;
};
