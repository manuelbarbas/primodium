export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div className={`card bg-neutral border border-secondary p-2 bg-opacity-90 border-dotted ${className}`}>
      {children}
    </div>
  );
};

export const SecondaryCard: React.FC<{
  children: React.ReactNode | React.ReactNode[];
  className?: string;
}> = ({ children, className }) => {
  return (
    <div className={`card bg-secondary border border-secondary/25 p-2 bg-opacity-10 ${className}`}>{children}</div>
  );
};
