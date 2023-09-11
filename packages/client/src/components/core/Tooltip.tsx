export const Tooltip: React.FC<{
  children: React.ReactNode;
  text: string;
}> = ({ children, text }) => {
  return (
    <div className="tooltip tooltip-right" data-tip={text}>
      {children}
    </div>
  );
};
