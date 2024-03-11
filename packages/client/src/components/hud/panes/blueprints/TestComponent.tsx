import React, { useState } from "react";
import { BuildingBlueprints } from "./BuildingBlueprints";
import { Button } from "src/components/core/Button";

export const TestComponent = () => {
  const [visibleDiv, setVisibleDiv] = useState(0);
  const [arePanesExpanded, setArePanesExpanded] = useState(false);

  // Shows a specific div
  const showDiv = (index) => {
    setVisibleDiv(index);
    setArePanesExpanded(false);
  };

  // Toggles the expand/collapse state
  const togglePanes = () => {
    setArePanesExpanded(!arePanesExpanded);
  };

  const labels = ['Production', 'Military', 'Storage', 'Infrastructure'];

  const imagePaths = [
    "/img/icons/blueprints/Production_Rough.png",
    "/img/icons/blueprints/Military_Rough.png",
    "/img/icons/blueprints/Storage_Rough.png",
    "/img/icons/blueprints/Infra_Rough.png"
  ];

  return (
    <div className="bg-transparent border-none">
      <div className="flex gap-0">

        {/* Pane */}
        <div className={`flex ${arePanesExpanded ? 'flex-row' : 'flex-col'}`}>
          {labels.map((label, index) => (
            // Show only the selected div or all when expanded
            (arePanesExpanded || visibleDiv === index) && (
              <div key={index} className={`flex flex-row card bg-neutral border border-secondary gap-1`}>
                <BuildingBlueprints buildingTypeToShow={index} />

                {/* Show title when expanded */}
                {arePanesExpanded && (
                  <span
                    className={`text-sm mt-2 px-1 ${
                      label === 'Production' ? 'text-yellow-500' :
                      label === 'Military' ? 'text-lime-600' :
                      label === 'Storage' ? 'text-violet-400' :
                      label === 'Infrastructure' ? 'text-sky-500' : ''
                    }`}
                    style={{ writingMode: 'vertical-lr' }}
                  >
                    {label}
                  </span>
                )}
              </div>
            )
          ))}
        </div>

        {/* Menu Buttons (hidden when expanded) */}
        {!arePanesExpanded && <div className="flex flex-col items-end">
          {labels.map((label, index) => (
            <Button key={index} onClick={() => showDiv(index)}
              className={`text-s flex items-center bg-neutral/100 border border-secondary py-2 px-4 ${index === 0 ? "rounded-tr-lg" : ""}`}
              style={{ writingMode: 'vertical-lr' }}>
               <img src={imagePaths[index]} alt={label} className="w-4 h-4" />
              {/* Show title when active */}
              {visibleDiv === index && (
                  <span
                    className={` ${
                      label === 'Production' ? 'text-yellow-500' :
                      label === 'Military' ? 'text-lime-600' :
                      label === 'Storage' ? 'text-violet-400' :
                      label === 'Infrastructure' ? 'text-sky-500' : ''
                    }`}
                  >
                    {label}
                  </span>
                )}
            </Button>
          ))}
        </div>}
      </div>

      {/* Toggle Expand/Collapse button */}
      <div className={`flex justify-end ${arePanesExpanded ? 'mr-0' : 'mr-11'}`}>
        <Button onClick={togglePanes} className="text-[.7rem] px-1 min-h-4 bg-transparent border-none">
          {arePanesExpanded ? "- Collapse" : "+ Expand"}
        </Button>
      </div>
    </div>
  );
};
