import { EntityID } from "@latticexyz/recs";
import { ResourceImage } from "../../util/constants";

export default function StaticResourceLabel({
  name,
  resourceId,
  count,
}: {
  name: string;
  resourceId: EntityID;
  count: number;
}) {
  const resourceIcon = ResourceImage.get(resourceId);
  return (
    <div className="flex mb-1">
      <p className="w-24">{count}</p>
      <img className="w-4 h-4 my-auto" src={resourceIcon}></img>
      <p className=" ml-2 my-auto">{name}</p>
    </div>
  );
}
