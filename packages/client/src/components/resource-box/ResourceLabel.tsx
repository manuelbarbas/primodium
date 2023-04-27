import { Component, EntityID, EntityIndex, Type } from "@latticexyz/recs";
import useResourceCount from "../../hooks/useResourceCount";
import { ResourceImage } from "../../util/constants";

export default function ResourceLabel({
  entityIndex,
  name,
  resourceId,
  resourceComponent,
}: {
  icon?: any;
  entityIndex?: EntityIndex;
  name: string;
  resourceId: EntityID;
  resourceComponent: Component<
    { value: Type.Number },
    { contractId: string },
    undefined
  >;
}) {
  const resourceCount = useResourceCount(resourceComponent, entityIndex);
  const resourceIcon = ResourceImage.get(resourceId);

  if (resourceCount > 0) {
    return (
      <div className="flex mb-1">
        <p className="w-16 text-sm">{resourceCount}</p>
        <img className="w-4 h-4 my-auto" src={resourceIcon}></img>
        <p className=" ml-2 my-auto text-sm">{name}</p>
      </div>
    );
  } else {
    return <></>;
  }
}
