import { Component, EntityIndex, Type } from "@latticexyz/recs";
import useResourceCount from "../../hooks/useResourceCount";

export default function ResourceLabel({
  icon,
  entityIndex,
  name,
  resourceComponent,
}: {
  icon?: any;
  entityIndex?: EntityIndex;
  name: string;
  resourceComponent: Component<
    { value: Type.Number },
    { contractId: string },
    undefined
  >;
}) {
  const resourceCount = useResourceCount(resourceComponent, entityIndex);

  if (resourceCount > 0) {
    return (
      <div className="flex mb-1">
        <p className="w-24">{resourceCount}</p>
        <img className="w-4 h-4 my-auto" src={icon}></img>
        <p className=" ml-2 my-auto">{name}</p>
      </div>
    );
  } else {
    return <></>;
  }
}
