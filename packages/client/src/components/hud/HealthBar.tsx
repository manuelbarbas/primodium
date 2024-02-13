export const HealthBar: React.FC<{ health: number; className?: string }> = ({ health, className }) => {
  const getBarColor = (): string => {
    if (health > 66) return "bg-success";
    if (health > 33) return "bg-warning";
    return "bg-error";
  };

  return (
    <div
      className={`flex flex-col items-center justify-center space-y-1 pointer-events-auto w-full bg-base-100 ${className}`}
    >
      <div className="w-full bg-slate-700 h-2">
        <div
          className={`h-2 ${getBarColor()} animate transition-width duration-300 opacity-80`}
          style={{ width: `${Math.min(100, health)}%` }}
        ></div>
      </div>
    </div>
  );
};
