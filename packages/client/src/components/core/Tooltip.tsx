export const Tooltip: React.FC<{
  children: React.ReactNode;
  text: string;
}> = ({ children, text }) => {
  return (
    <div className="tooltip tooltip-right pointer-events-auto" data-tip={text}>
      {children}
    </div>
  );
};
