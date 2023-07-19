export const GameButton = ({
  id,
  children,
  onClick,
  className,
}: {
  id?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) => {
  return (
    <button
      id={id}
      className={`relative overflow-hidden group active:translate-y-2 outline-none bg-cyan-600 active:border-b-0 ring ring-black/80 border-b-white/30 text-white ${className}`}
      onClick={onClick}
    >
      <div className="relative w-full h-full border-[3px] border-white/50">
        {children}
      </div>
      <div className="w-full h-2 group-active:h-0 bg-black/20" />
      <div className="absolute inset-0 group-active:bg-black/20" />
    </button>
  );
};
