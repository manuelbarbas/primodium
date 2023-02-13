import { useState, useCallback, ReactNode, useEffect } from "react";

function BuildingButton({
  icon,
  text,
  menuIndex,
  menuOpenIndex,
  setMenuOpenIndex,
  children,
}: {
  icon: any;
  text: string;
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
      <button className="w-16 h-16 text-xs" onClick={setMenuOpenIndexHelper}>
        <img src={icon}></img>
        <div className="h-2"></div>
        {text}
      </button>
      {menuIndex === menuOpenIndex && children}
    </>
  );
}
export default BuildingButton;
