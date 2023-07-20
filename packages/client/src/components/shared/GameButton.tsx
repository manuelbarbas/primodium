export const GameButton = ({
  id,
  children,
  onClick,
  className,
  depth = 8,
  color = "bg-cyan-600",
  disable = false,
}: {
  id?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  color?: string;
  depth?: number;
  disable?: boolean;
}) => {
  const handleKeyDown = (e: any) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
    }
  };

  return (
    <button
      id={id}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      className={`relative overflow-hidden group active:translate-y-2 outline-none ${color} active:border-b-0 ring ring-black/80 border-b-white/30 text-white pointer ${className} ${
        disable ? "pointer-events-none opacity-70" : ""
      }`}
      onClick={onClick}
    >
      <div className="relative w-full h-full border-[3px] border-white/50">
        {children}
      </div>
      <div style={{ height: depth }} className="w-full bg-black/20" />
      <div className="absolute inset-0 group-active:bg-black/20 pointer-events-none" />
    </button>
  );
};
