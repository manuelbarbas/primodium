import { ReactNode } from "react";

function PathActionIconButton({
  backgroundColor,
  text,
  action,
}: {
  icon?: any;
  backgroundColor?: any;
  text: string;
  action: () => void;
  children?: ReactNode;
}) {
  return (
    <button
      className="w-16 h-16"
      style={{ backgroundColor: backgroundColor }}
      onClick={action}
    >
      {text}
    </button>
  );
}
export default PathActionIconButton;
