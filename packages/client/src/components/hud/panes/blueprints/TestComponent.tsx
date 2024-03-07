import React, { useState, createContext, useContext } from "react";
import { Tabs } from 'src/components/core/Tabs';
import { Accordion } from 'src/components/core/Accordion';
import { BuildingBlueprints } from "./BuildingBlueprints";


export const TestComponent = () => {

  const [arePanesExpanded, setArePanesExpanded] = useState(false);

  const togglePanes = () => setArePanesExpanded(!arePanesExpanded);

  return (
    <>
      <Tabs defaultIndex={0} className="flex flex-row-reverse">
        <div className="flex flex-row topographic-background rotate-90 origin-top w-10">
          <Tabs.Button index={0} className="flex flex-row text-xs text-white px-0 justify-normal focus:ring-1 focus:ring-blue-500">
            <img src="Alloy_Resource.png" alt="Resource Icon" className="w-4 h-4" />
            <span>Production</span>
          </Tabs.Button>
          <Tabs.Button index={1} className="flex flex-row text-xs text-white pl-0 pr-0 justify-normal focus:ring-1 focus:ring-blue-500">
            <img src="Alloy_Resource.png" alt="Resource Icon" className="w-4 h-4" />
            <span>Military</span>
          </Tabs.Button>
          <Tabs.Button index={2} className="flex flex-row text-xs text-white pl-0 pr-0 justify-normal focus:ring-1 focus:ring-blue-500">
            <img src="Alloy_Resource.png" alt="Resource Icon" className="w-4 h-4" />
            <span>Storage</span>
          </Tabs.Button>
          <Tabs.Button index={3} className="flex flex-row text-xs text-white pl-0 pr-0 justify-normal focus:ring-1 focus:ring-blue-500">
            <img src="Alloy_Resource.png" alt="Resource Icon" className="w-4 h-4" />
            <span>Infra</span>
          </Tabs.Button>

          <Tabs.Button onClick={togglePanes} className="text-xs">
            {arePanesExpanded ? "Collapse" : "Expand"}
          </Tabs.Button>

        </div>


        <Tabs.Pane index={0} className="w-80 flex-grow">
          <BuildingBlueprints buildingTypeToShow={0} />
        </Tabs.Pane>

        <Tabs.Pane index={1} className="w-80 flex-grow">
          <BuildingBlueprints buildingTypeToShow={1} />
        </Tabs.Pane>
        <Tabs.Pane index={2} className="w-80 flex-grow">
          <BuildingBlueprints buildingTypeToShow={2} />
        </Tabs.Pane>
        <Tabs.Pane index={3} className="w-80 flex-grow">
          <BuildingBlueprints buildingTypeToShow={3} />
        </Tabs.Pane>

      </Tabs>

      {/* <button onClick={togglePanes} className="text-xs">
            {arePanesExpanded ? "Collapse" : "Expand"}
          </button> */}
    </>
  );

};
