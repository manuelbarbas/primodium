export const PanelButton = ({
  name,
  icon,
  active = false,
  onClick,
}: {
  name: string;
  icon: string;
  active?: boolean;
  onClick?: () => void;
}) => {
  return (
    <button
      key={name}
      id={name}
      className={`flex pixel-images items-center bg-slate-900/90 py-1 px-2 outline-none crt text-sm border border-cyan-600 ${
        active ? " ring-4 ring-cyan-900 bg-cyan-600 z-10 font-bold" : ""
      }`}
      onClick={onClick}
    >
      <img src={icon} className="w-6 h-6 p-1 pixel-images" /> {name}
    </button>
  );
};
