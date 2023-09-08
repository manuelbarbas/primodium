import {
  Component,
  Entity,
  Layers,
  Schema,
  Type,
  World,
} from "@latticexyz/recs";
import { useState } from "react";
import { EntityEditor } from "./EntityEditor";
import { QueryBuilder } from "./QueryBuilder";
import { BrowserContainer, SmallHeadline } from "./StyledComponents";
import { createBrowserDevComponents } from "./createBrowserDevComponents";
import { useClearDevHighlights } from "./hooks";
import { SetContractComponentFunction } from "./types";

/**
 * An Entity Browser for viewing/editiing Component values.
 */
export const Browser = ({
  layers,
  setContractComponentValue,
  world,
  devHighlightComponent,
}: {
  layers: Layers;
  setContractComponentValue?: SetContractComponentFunction<Schema>;
  prototypeComponent?: Component<{ value: Type.StringArray }>;
  nameComponent?: Component<{ value: Type.String }>;
  world: World;
  devHighlightComponent: ReturnType<
    typeof createBrowserDevComponents
  >["devHighlightComponent"];
  hoverHighlightComponent: ReturnType<
    typeof createBrowserDevComponents
  >["hoverHighlightComponent"];
}) => {
  const [filteredEntities, setFilteredEntities] = useState<Entity[]>([]);
  const [overflow, setOverflow] = useState(0);
  const clearDevHighlights = useClearDevHighlights(devHighlightComponent);

  return (
    <BrowserContainer>
      <QueryBuilder
        devHighlightComponent={devHighlightComponent}
        allEntities={[...world.getEntities()]}
        setFilteredEntities={setFilteredEntities}
        layers={layers}
        world={world}
        clearDevHighlights={clearDevHighlights}
        setOverflow={setOverflow}
      />
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
};
