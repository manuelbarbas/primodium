export const Indicator: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="indicator">
      <span className="indicator-item badge badge-error" />
      {children}
    </div>
  );
};
