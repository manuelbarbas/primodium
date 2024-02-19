export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div
      className={`${className} card bg-neutral border border-secondary p-2 pointer-events-auto bg-opacity-75 border-dotted`}
    >
      {children}
    </div>
  );
};

export const SecondaryCard: React.FC<{
  children: React.ReactNode | React.ReactNode[];
  className?: string;
}> = ({ children, className }) => {
  return (
    <div className={`card bg-secondary/10 border border-secondary/25 p-2 bg-opacity-30 ${className}`}>{children}</div>
  );
};
