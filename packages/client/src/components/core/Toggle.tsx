export const Toggle: React.FC<{
  className?: string;
  defaultChecked?: boolean;
  onToggle?: () => void;
}> = ({ className, defaultChecked = false, onToggle }) => {
  return (
    <div className="form-control w-52 pointer-events-auto">
      <input
        type="checkbox"
        className={`toggle ${className}`}
        defaultChecked={defaultChecked}
        onClick={() => {
          onToggle?.();
        }}
      />
    </div>
  );
};
