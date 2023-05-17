import React from "react";

function BuildingContentBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="z-[1000] viewport-container fixed bottom-4 left-20 h-72 w-96 flex flex-col bg-gray-700 text-white drop-shadow-xl font-mono rounded">
      <div className="mt-4 ml-5 flex flex-col h-72">{children}</div>
    </div>
  );
}

export default BuildingContentBox;
