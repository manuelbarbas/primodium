import React from "react";
import { Tabs } from 'src/components/core/Tabs'; 
import { Accordion } from 'src/components/core/Accordion';
import { ProductionBlueprints } from "./ProductionBlueprints"; 

export const TestComponent = () => {
  return (
    // Tabs
    <Tabs defaultIndex={0} onChange={() => console.log("Tab changed")} className="flex flex-row-reverse">
      <div className="flex flex-col topographic-background">
        <Tabs.Button index={0} className="flex flex-col text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500">
          <img src="ProductionIcon.png" alt="Production Icon" className="w-4 h-4" />
          <span className=" ">Production</span>
          </Tabs.Button>
        <Tabs.Button index={1} className="flex flex-col text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <img src="MilitaryIcon.png" alt="Military Icon" className="w-4 h-4" />
          <span className=" ">Military</span>
        </Tabs.Button>
        <Tabs.Button index={2} className="flex flex-col text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500">
          <img src="StorageIcon.png" alt="Production Icon" className="w-4 h-4" />
          <span className=" ">Storage</span>
          </Tabs.Button>
        <Tabs.Button index={3} className="flex flex-col text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <img src="InfrastructureIcon.png" alt="Infrastructure Icon" className="w-4 h-4" />
          <span className=" ">Infrastructure</span>
        </Tabs.Button>

      </div>

      <Tabs.Pane index={0} className="w-80 flex-grow">
        <ProductionBlueprints />
      </Tabs.Pane>
      <Tabs.Pane index={1} className="w-80 flex-grow">
        <div>This is the content of Tab 2</div>
      </Tabs.Pane>
      <Tabs.Pane index={2} className="w-80 flex-grow">
        <ProductionBlueprints />
      </Tabs.Pane>
      <Tabs.Pane index={3} className="w-80 flex-grow">
        <div>This is the content of Tab 4</div>
      </Tabs.Pane>

      <span className=" ">Production</span>
    </Tabs>


  );
};

