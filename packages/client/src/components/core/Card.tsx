export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div
      className={`card bg-neutral border border-secondary p-2 drop-shadow-2xl pointer-events-auto ${className}`}
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
    <div className={`card bg-base-100 border border-neutral p-2 ${className}`}>
      {children}
    </div>
  );
};
