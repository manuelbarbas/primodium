import { Entity, Layers, Schema, World } from "@latticexyz/recs";
import { useState } from "react";
import { EntityEditor } from "./EntityEditor";
import { QueryBuilder } from "./QueryBuilder";
import {
  BrowserContainer,
  ComponentBrowserInput,
  ComponentTitle,
  SmallHeadline,
} from "./StyledComponents";
import { createBrowserDevComponents } from "./createBrowserDevComponents";
import { useClearDevHighlights } from "./hooks";
import { SetContractComponentFunction } from "./types";

/**
 * An Entity Browser for viewing/editing Component values.
 */
export const Browser = ({
  layers,
  setContractComponentValue,
  world,
  devHighlightComponent,
  tabs = [],
}: {
  layers: Layers;
  setContractComponentValue?: SetContractComponentFunction<Schema>;
  world: World;
  devHighlightComponent: ReturnType<
    typeof createBrowserDevComponents
  >["devHighlightComponent"];
  tabs?: { name: string; component: React.ReactNode }[];
}) => {
  const [filteredEntities, setFilteredEntities] = useState<Entity[]>([]);
  const [overflow, setOverflow] = useState(0);
  const [isVisible, setIsVisible] = useState<number>();
  const clearDevHighlights = useClearDevHighlights(devHighlightComponent);
  const TopBar = () => (
    <div className="flex justify-between bg-gray-400 p-2">
      <div className="flex gap-1">
        <button
          className={`px-1 ${isVisible === 0 ? "bg-blue-500 text-white" : ""}`}
          onClick={() => setIsVisible(0)}
        >
          Browser
        </button>
        {tabs.map(({ name }, i) => (
          <button
            className={`p-1 ${
              isVisible === i + 1 ? "bg-blue-500 text-white" : ""
            }`}
            onClick={() => setIsVisible(i + 1)}
          >
            {name}
          </button>
        ))}
      </div>
      <button className="px-4 py-2" onClick={() => setIsVisible(undefined)}>
        X
      </button>
    </div>
  );

  const Browser = () => (
    <BrowserContainer>
      <QueryBuilder
        devHighlightComponent={devHighlightComponent}
        allEntities={[...world.getEntities()]}
        setFilteredEntities={setFilteredEntities}
        layers={layers}
        clearDevHighlights={clearDevHighlights}
        setOverflow={setOverflow}
      />

      <div className="p-2">
        <ComponentTitle>Entity Select</ComponentTitle>
        <ComponentBrowserInput
          className="w-full"
          type="text"
          onChange={(e) => setFilteredEntities([e.target.value as Entity])}
        />
      </div>

      <SmallHeadline>
        Showing {filteredEntities.length} of{" "}
        {filteredEntities.length + overflow} entities
      </SmallHeadline>
      {filteredEntities.map((entity) => (
        <EntityEditor
          world={world}
          key={`entity-editor-${entity}`}
          entityId={entity}
          layers={layers}
          setContractComponentValue={setContractComponentValue}
          devHighlightComponent={devHighlightComponent}
          clearDevHighlights={clearDevHighlights}
        />
      ))}
    </BrowserContainer>
  );
  return (
    <div
      className={`z-[1002] fixed bottom-0 right-0 ${
        isVisible != undefined ? "w-96" : "w-0"
      } h-screen text-xs flex flex-col bg-gray-400`}
      style={{
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(5px)",
        color: "white",
      }}
    >
      {isVisible !== undefined && <TopBar />}
      {isVisible === 0 && <Browser />}
      {tabs.map(({ component }, i) => (isVisible === i + 1 ? component : null))}

      {!isVisible && (
        <button
          className="absolute bottom-0 right-0 bg-blue-500 w-32 text-white text-xs px-2 py-1 rounded"
          onClick={() => setIsVisible(0)}
        >
          Show Browser
        </button>
      )}
    </div>
  );
};
