import { ReactNode } from "react";

function BuildingButton({
  icon,
  backgroundColor,
  text,
  action,
  children,
}: {
  icon?: any;
  backgroundColor?: any;
  text: string;
  action: () => void;
  children?: ReactNode;
}) {
  return (
    <>
      <button
        className="w-16 h-16 text-xs"
        onClick={action}
        style={{ backgroundColor: backgroundColor }}
      >
        <img src={icon}></img>
        <div className="h-2"></div>
        {text}
      </button>
      {children}
    </>
  );
}
export default BuildingButton;
