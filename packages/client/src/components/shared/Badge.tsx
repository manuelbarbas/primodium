export const Bade: React.FC<{
  children?: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return <div className={`badge ${className}`}>{children}</div>;
};
