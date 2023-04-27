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
    <div className="flex">
      <p className="ml-2 mr-2">{count}</p>
      <img className="w-4 h-4 my-auto mr-2" src={resourceIcon}></img>
    </div>
  );
}
