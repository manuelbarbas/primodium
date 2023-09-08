import { ReactNode } from "react";

interface HUDProps {
  children: ReactNode;
}

export function HUD({ children }: HUDProps) {
  return (
    <div className="screen-container relative pointer-events-none">
      {children}
    </div>
  );
}

function TopRight({ children }: HUDProps) {
  return <div className="absolute top-0 right-0">{children}</div>;
}

function TopLeft({ children }: HUDProps) {
  return <div className="absolute top-0 left-0">{children}</div>; // I also corrected the positioning here from right-0 to left-0
}

function BottomRight({ children }: HUDProps) {
  return <div className="absolute bottom-0 right-0">{children}</div>;
}

function BottomLeft({ children }: HUDProps) {
  return <div className="absolute bottom-0 left-0">{children}</div>;
}

function TopMiddle({ children }: HUDProps) {
  return (
    <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
      {children}
    </div>
  );
}

function BottomMiddle({ children }: HUDProps) {
  return (
    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
      {children}
    </div>
  );
}

HUD.TopRight = TopRight;
HUD.TopLeft = TopLeft;
HUD.BottomRight = BottomRight;
HUD.BottomLeft = BottomLeft;
HUD.TopMiddle = TopMiddle;
HUD.BottomMiddle = BottomMiddle;
