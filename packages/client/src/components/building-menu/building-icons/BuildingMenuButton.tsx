import { useCallback, ReactNode } from "react";

function BuildingMenuButton({
  icon,
  label,
  menuIndex,
  menuOpenIndex,
  setMenuOpenIndex,
  children,
}: {
  icon: any;
  label: string;
  menuIndex: number;
  menuOpenIndex: number;
  setMenuOpenIndex: React.Dispatch<React.SetStateAction<number>>;
  children?: ReactNode;
}) {
  const setMenuOpenIndexHelper = useCallback(() => {
    if (menuIndex !== menuOpenIndex) {
      setMenuOpenIndex(menuIndex);
    } else {
      setMenuOpenIndex(-1);
    }
  }, [menuIndex, menuOpenIndex]);

  return (
    <>
      <button
        className="w-16 h-18 flex flex-col items-center justify-center text-xs hover:brightness-75"
        onClick={setMenuOpenIndexHelper}
      >
        <img className="w-14 h-14 pixel-images" src={icon} alt="Icon"></img>
        <p className="mt-2">{label}</p>
      </button>
      {menuIndex === menuOpenIndex && children}
    </>
  );
}
export default BuildingMenuButton;
