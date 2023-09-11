export const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => {
  return (
    <div className={`card bg-neutral-100 border border-accent ${className}`}>{children}</div>
  );
}
