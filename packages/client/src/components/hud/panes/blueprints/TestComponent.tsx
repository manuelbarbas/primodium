// import React, { useState } from "react";
// import { BuildingBlueprints } from "./BuildingBlueprints";
// import { Button } from "src/components/core/Button";


// export const TestComponent = () => {

//   const [arePanesExpanded, setArePanesExpanded] = useState(false);

//   const togglePanes = () => setArePanesExpanded(!arePanesExpanded);

//   return (

//     <div className="bg-none border-none">
//       <div className="flex flex-row">
//         <div className="flex flex-row card bg-neutral border border-secondary">
//           <BuildingBlueprints buildingTypeToShow={0} />
//           {arePanesExpanded && <span className="text-xs">Production</span>}
//         </div>
//         {arePanesExpanded && (
//           <>
//             <div className="flex flex-row card bg-neutral border border-secondary">
//               <BuildingBlueprints buildingTypeToShow={1} />
//               <span className="text-xs">Military</span>
//             </div>
//             <div className="flex flex-row card bg-neutral border border-secondary">
//               <BuildingBlueprints buildingTypeToShow={2} />
//               <p className="text-xs">Storage</p>
//             </div>
//             <div className="flex flex-row card bg-neutral border border-secondary">
//               <BuildingBlueprints buildingTypeToShow={3} />
//               <p className="text-xs">Infrastructure</p>
//             </div>
//           </>
//         )}
//       </div>
//       <Button onClick={togglePanes} className="text-xs float-right p-0">
//         {arePanesExpanded ? "- Collapse" : "+ Expand"}
//       </Button>
//     </div>



//   );

// };
import React, { useState } from "react";
import { BuildingBlueprints } from "./BuildingBlueprints";
import { Button } from "src/components/core/Button";


const Icon = ({ name }) => <span>{name}</span>;

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

  const icons = ["🏭", "🪖", "📦", "🌉"];
  const labels = ['Production', 'Military', 'Storage', 'Infrastructure'];

  return (
    <div className="bg-transparent border-none">
      <div className="flex gap-0">

        {/* Pane */}
        <div className={`flex ${arePanesExpanded ? 'flex-row' : 'flex-col'}`}>
          {labels.map((label, index) => (
            // Show only the selected div or all when expanded
            (arePanesExpanded || visibleDiv === index) && (
              <div key={index} className={`flex flex-row card bg-neutral ${arePanesExpanded ? 'border border-secondary gap-1' : 'border-none gap-0'}`}>
                <BuildingBlueprints buildingTypeToShow={index} />
                {/* Show title when expanded */}
                {arePanesExpanded && <span className="text-xs mt-2 px-1" style={{ writingMode: 'vertical-lr' }}>{label}</span>}
              </div>
            )
          ))}
        </div>

        {/* Menu Buttons (hidden when expanded) */}
        {!arePanesExpanded && <div className="flex flex-col items-end">
          {labels.map((label, index) => (
            <Button key={index} onClick={() => showDiv(index)} className="text-xs flex items-center border border-secondary py-2 px-4" style={{ writingMode: 'vertical-lr' }}>
              <Icon name={icons[index]} />
              {/* Show title when active */}
              {visibleDiv === index && <span>{label}</span>}
            </Button>
          ))}
        </div>}
      </div>

      {/* Toggle Expand/Collapse button */}
      <div className="flex justify-end mt-2">
        <Button onClick={togglePanes} className="text-[.7rem] px-1 min-h-4 bg-transparent">
          {arePanesExpanded ? "- Collapse" : "+ Expand"}
        </Button>
      </div>
    </div>
  );
};
