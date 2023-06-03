import { EntityID } from "@latticexyz/recs";
import { ResourceImage } from "../../util/constants";

export default function StaticResourceLabel({
  // name,
  resourceId,
  count,
}: {
  name: string;
  resourceId: EntityID;
  count: number;
}) {
  const resourceIcon = ResourceImage.get(resourceId);
  return (
    <>
      <img className="inline-block mr-1" src={resourceIcon}></img>
      {count}
    </>
  );
}
